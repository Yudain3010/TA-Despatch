// api/fetch/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

const API_KEY = "AIzaSyCEsWUXlwJMjAoQOlTaGD7pB0Ob293I-kU";
const DB_URL = "https://tatemp3006-default-rtdb.asia-southeast1.firebasedatabase.app/";

const fetchData = async () => {
    try {
        const logsUrl = `${DB_URL}/Logs.json?auth=${API_KEY}`;
        const dataUrl = `${DB_URL}/Data.json?auth=${API_KEY}`;

        const [logsResponse, dataResponse] = await Promise.all([
            axios.get(logsUrl),
            axios.get(dataUrl),
        ]);

        return {
            logsData: logsResponse.data,
            realtimeData: dataResponse.data,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { logsData: {}, realtimeData: {} };
    }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const data = await fetchData();
        res.status(200).json(data);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

const SocketHandler = (req: any, res: any) => {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.io server...');
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            cors: {
                origin: '*',
            },
        });

        io.on('connection', (socket) => {
            console.log('Client connected');

            const emitData = async () => {
                const data = await fetchData();
                socket.emit('data', data);
            };

            emitData();

            socket.on('get_data', async () => {
                await emitData();
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        res.socket.server.io = io;
    }
    res.end();
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export { handler as fetchHandler, SocketHandler };
