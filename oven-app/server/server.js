const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const axios = require('axios');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config(); 
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

const API_KEY = 'AIzaSyCEsWUXlwJMjAoQOlTaGD7pB0Ob293I-kU';
const DB_URL = 'https://tatemp3006-default-rtdb.asia-southeast1.firebasedatabase.app/';

app.use(cors());
app.use(express.json());

const fetchData = async () => {
    try {
        const logsUrl = `${DB_URL}/Logs.json?auth=${API_KEY}`;
        const dataUrl = `${DB_URL}/Data.json?auth=${API_KEY}`;

        const logsResponse = await axios.get(logsUrl);
        const dataResponse = await axios.get(dataUrl);

        return {
            logsData: logsResponse.data || {},
            realtimeData: dataResponse.data || {}
        };
    } catch (error) {
        console.error(`Error fetching data: ${error}`);
        return { logsData: {}, realtimeData: {} };
    }
};

app.get('/fetch-data', async (req, res) => {
    const data = await fetchData();
    res.json(data);
});

io.on('connection', (socket) => {
    console.log("Client connected");

    const sendData = async () => {
        const data = await fetchData();
        socket.emit('data', data);
    };

    sendData();

    socket.on('get_data', () => {
        sendData();
    });

    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

app.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Please provide username, password, and confirm password.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            username: username,
            password: hashedPassword,
        };

        const userRef = `${DB_URL}/res_users.json?auth=${API_KEY}`;
        const response = await axios.post(userRef, user);

        res.status(200).json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Error registering user.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Please provide username and password.' });
    }

    try {
        const userRef = `${DB_URL}/res_users.json?auth=${API_KEY}`;
        const usersResponse = await axios.get(userRef);
        const users = usersResponse.data;

        const user = Object.values(users).find(user => user.username === username);

        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // const token = jwt.sign({ username: user.username, id: user.id }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Login successful',
                // token: token
            });
        } else {
            res.status(400).json({ error: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'This is a protected route.', user: req.user });
});

app.patch('/write-data', async (req, res) => {
    const {PM} = req.body; // Get the lastPM value from the request body

    if (!PM) {
        return res.status(400).json({ error: 'No lastPM data provided.' });
    }

    try {
        const writeUrl = `${DB_URL}/Data.json?auth=${API_KEY}`; // Adjust the path as needed to store the lastPM value
        const response = await axios.patch(writeUrl, {PM}); // Write data to Firebase

        res.status(200).json({ message: 'Last PM written successfully!', data: response.data });
    } catch (error) {
        console.error('Error writing lastPM to Firebase:', error);
        res.status(500).json({ error: 'Error writing data to Firebase.' });
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
