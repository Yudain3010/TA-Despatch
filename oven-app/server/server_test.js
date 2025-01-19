const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');
require('dotenv').config(); 

const API_KEY = 'AIzaSyCEsWUXlwJMjAoQOlTaGD7pB0Ob293I-kU';
const DB_URL = 'https://tatemp3006-default-rtdb.asia-southeast1.firebasedatabase.app/';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const fetchDataFromFirebase = async () => {
    try {
        const logsUrl = `${DB_URL}/Logs.json?auth=${API_KEY}`;
        const dataUrl = `${DB_URL}/Data.json?auth=${API_KEY}`;

        const logsResponse = await axios.get(logsUrl);
        if (logsResponse.status === 200) {
            console.log("Logs fetched successfully:");
            const logsData = logsResponse.data;
            if (logsData) {
                Object.entries(logsData).forEach(([recordId, record]) => {
                    console.log(`Record ID: ${recordId}, Data:`, record);
                });
            } else {
                console.log("No logs available.");
            }
        } else {
            console.error(`Failed to fetch logs. Status code: ${logsResponse.status}`);
        }

        const dataResponse = await axios.get(dataUrl);
        if (dataResponse.status === 200) {
            console.log("Realtime data fetched successfully:", dataResponse.data);
        } else {
            console.error(`Failed to fetch realtime data. Status code: ${dataResponse.status}`);
        }
    } catch (error) {
        console.error("An error occurred while fetching data:", error);
    }
};

const logDoorCondition = async (condition, temperature) => {
    try {
        const recordId = uuidv4();
        const logsUrl = `${DB_URL}/Logs/${recordId}.json?auth=${API_KEY}`;
        const dataUrl = `${DB_URL}/Data.json?auth=${API_KEY}`;

        const timestamp = new Date().toISOString();

        const payload = {
            "Door Condition": condition,
            "Timestamp": timestamp,
            "Temperature": temperature,
        };

        const logsResponse = await axios.put(logsUrl, payload);
        if (logsResponse.status === 200) {
            console.log(`Logged door condition in Logs: ${condition} with ID ${recordId}`);
        } else {
            console.error(`Failed to log condition in Logs. Status code: ${logsResponse.status}`);
        }

        const dataResponse = await axios.patch(dataUrl, payload);
        if (dataResponse.status === 200) {
            console.log(`Realtime data updated to: ${condition} at ${timestamp} with Temperature: ${temperature}`);
        } else {
            console.error(`Failed to update realtime data. Status code: ${dataResponse.status}`);
        }

        await fetchDataFromFirebase();
    } catch (error) {
        console.error("An error occurred while logging door condition:", error);
    }
};

const mainMenu = () => {
    rl.question("Enter command (fetch/open/close/exit): ", async (command) => {
        switch (command.trim().toLowerCase()) {
            case "fetch":
                await fetchDataFromFirebase();
                break;
            case "open":
                rl.question("Enter temperature: ", async (temperature) => {
                    await logDoorCondition("Open", temperature.trim());
                    mainMenu();
                });
                return;
            case "close":
                rl.question("Enter temperature: ", async (temperature) => {
                    await logDoorCondition("Close", temperature.trim());
                    mainMenu();
                });
                return;
            case "exit":
                console.log("Exiting program.");
                rl.close();
                return;
            default:
                console.log("Invalid command. Please enter 'fetch', 'open', 'close', or 'exit'.");
        }
        mainMenu();
    });
};

mainMenu();
