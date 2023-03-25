const { contextBridge, ipcRenderer } = require('electron');

// Expose functions to renderer process
contextBridge.exposeInMainWorld('myAPI', {
    
    // Setup IPC channels
    setupIPC: () => {
        ipcRenderer.on('display-answer', (event, ans) => {
            showMessage(ans, true);
        });

        ipcRenderer.on('wrongAPIKey', (event, message) => {
            APIKeyWarning = "There is an incorrect API key stored, please click the API Key button to save a new key.";
            showMessage(APIKeyWarning, false);
        });
    },

    // When ready, let server process know
    ready: (message) => {
        ipcRenderer.send('ready', message);
    },
    
    // When api key is obtained, send to server process
    apiKeyNew: (key) => {
        ipcRenderer.send('api-key-new', key);
        window.close();
    },

    // Send question to server process
    sendQuestion: (question) => {
        ipcRenderer.send('questionAsked', question);
    },

    APIButtonPushed: (message) => {
        ipcRenderer.send('APIButton', message);
    },
});

function showMessage(message, worked) {
    let answerBox = document.querySelector("#answer");
    let chatLogo = document.querySelector("#openLogoChat");
    answerBox.innerHTML = message;
    if (worked) {
        answerBox.classList.add('lGreenBack');
        answerBox.classList.remove('warning');
    } else {
        answerBox.classList.remove('lGreenBack');
        answerBox.classList.add('warning');
    }
    answerBox.classList.remove('d-none');
    chatLogo.classList.remove('d-none');
}