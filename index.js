const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const functions = require('./functions.js');

let mainWindow;

// Getting window ready
const loadWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 500,
        icon: path.join(__dirname, "OPENAI_Logo_White.png"),
        webPreferences: {
            sandbox: true,
            preload: path.join(__dirname, "preload.js")
        }
    });

    mainWindow.loadFile(path.join(__dirname, "index.html"));
    mainWindow.removeMenu();

    // Quit app if the main screen is closed
    mainWindow.on('closed', () => {
        app.quit();
    });

    return mainWindow;
}

// Loading API Key Receipt Window
const loadInputWindow = () => {
    inputWindow = new BrowserWindow({
        width: 800,
        height: 350,
        icon: path.join(__dirname, "OPENAI_Logo_White.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js")
        },
    });

    inputWindow.loadFile(path.join(__dirname, 'apiGet.html'));
    inputWindow.removeMenu();

    inputWindow.on('closed', () => {
        inputWindow = null;
    });

    // Make window open happen in browser
    inputWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return {action: 'deny'};
});
}

// When app is ready, load main window.
app.on('ready', () => {
    loadWindow();
});

// Ensure it turns off when all windows are closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin"){
        app.quit();
    }
});

// Ensure only one window can be opened at a time
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadWindow();
    }
});

// When app is ready, setup beginning processes
ipcMain.on('ready', (event, message) => {
    event.reply('Thank you, we will get your API key ASAP');
    getAPIKeySetup();
});

// When given new api key, write it to data file and continue process
ipcMain.on('api-key-new', (event, key) => {
    const filePath = path.join(__dirname, 'data.json');
    const apiKeyName = 'api-key'
    functions.writeAPIKey(filePath, apiKeyName, key, (err) => {
        if (err) {
            getNewKey();
            return;
        }
        getAPIKeySetup();
    });
});

let finalApiKey;
let finalAnswer;

// When question is asked, get answer and send it to renderer
ipcMain.on('questionAsked', (event, question) => {
    let apiKeyExists = finalApiKey !== undefined;
    if (!(apiKeyExists)) {
        getNewKey();
        return;
    }
    functions.askGPT(question, finalApiKey, answer => {
        // Checking for bad API key
        if (answer === 'badAPIKey') {
            mainWindow.webContents.send('wrongAPIKey', 'wrong API key');
            return;
        }
        finalAnswer = answer;
        mainWindow.webContents.send('display-answer', answer);
    });
});

ipcMain.on('APIButton', (event, message) => {
    getNewKey();
});

// Function to make getting API key easier
function getAPIKeySetup() {
    finalApiKey = undefined;
    const filePath = path.join(__dirname, 'data.json');
    const apiKeyName = 'api-key';
    functions.getAPIKey(filePath, apiKeyName, (err, apiKey) => {
        if (err) {
            getNewKey();
            return;
        }
        finalApiKey = apiKey;
    });
}

// Function to load input window
function getNewKey() {
    loadInputWindow();
}
