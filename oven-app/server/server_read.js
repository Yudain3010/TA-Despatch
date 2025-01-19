const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
require('dotenv').config(); 

const API_KEY = process.env.API_KEY;
const DB_URL = process.env.DB_URL;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const fetchDataFromFirebase = async () => {
    try {
        const usersUrl = `${DB_URL}/res_users.json?auth=${API_KEY}`;

        const usersResponse = await axios.get(usersUrl);
        if (usersResponse.status === 200) {
            console.log("Users fetched successfully:");
            const usersData = usersResponse.data;
            if (usersData) {
                Object.entries(usersData).forEach(([userId, user]) => {
                    console.log(`User ID: ${userId}, User Data:`, user);
                });
            } else {
                console.log("No users available.");
            }
        } else {
            console.error(`Failed to fetch users. Status code: ${usersResponse.status}`);
        }
    } catch (error) {
        console.error("An error occurred while fetching data:", error);
    }
};

const logUserActivity = async (username, activity) => {
    try {
        const recordId = uuidv4();
        const activityUrl = `${DB_URL}/user_activities/${recordId}.json?auth=${API_KEY}`;

        const timestamp = new Date().toISOString();

        const payload = {
            "Username": username,
            "Activity": activity,
            "Timestamp": timestamp,
        };

        const activityResponse = await axios.put(activityUrl, payload);
        if (activityResponse.status === 200) {
            console.log(`Logged activity for user: ${username} with activity: ${activity} and ID: ${recordId}`);
        } else {
            console.error(`Failed to log activity. Status code: ${activityResponse.status}`);
        }

        await fetchDataFromFirebase();
    } catch (error) {
        console.error("An error occurred while logging user activity:", error);
    }
};

const mainMenu = () => {
    rl.question("Enter command (fetch/log/exit): ", async (command) => {
        switch (command.trim().toLowerCase()) {
            case "fetch":
                await fetchDataFromFirebase();
                break;
            case "log":
                rl.question("Enter username: ", async (username) => {
                    rl.question("Enter activity: ", async (activity) => {
                        await logUserActivity(username, activity);
                        mainMenu();
                    });
                });
                return;
            case "exit":
                console.log("Exiting program.");
                rl.close();
                return;
            default:
                console.log("Invalid command. Please enter 'fetch', 'log', or 'exit'.");
        }
        mainMenu();
    });
};

mainMenu();
