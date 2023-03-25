const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Get API key
function getAPIKey(filePath, apiKeyName, callback) {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            callback(err, false);
            return;
        }
        // Getting API Key information
        const jsonData = JSON.parse(data);
        const apiKey = jsonData[apiKeyName];
        const apiKeyExists = apiKey !== undefined;
        
        // If key exists, return, if not, then return error
        if (apiKeyExists) {
            callback(null, apiKey);
        } else {
            callback(new Error(`API key ${apiKeyName} not found`), null);
        }
    });
}

// Write API key to file
function writeAPIKey(filePath, apiKeyName, apiKey, callback) {
    // Open file to ensure no errors
    fs.readFile(filePath, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        // Parse key into JSON
        let json = JSON.parse(data);
        json[apiKeyName] = apiKey;
        
        // Open and write to file
        fs.writeFile(filePath, JSON.stringify(json), (err) => {
            if (err) {
                callback(err);
                return;
            } 
            callback(null);
        });
    });
}


// Function that being given question and API key, asks chatGPT a question and prints.
function askGPT(question, key, callback) {
    // Get API call you
    const endpointUrl = "https://api.openai.com/v1/chat/completions";

    const request = {
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": `${question}`}]
    };

    const requestHeader = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
    };

    // Sending API call
    axios.post(endpointUrl, request, { headers: requestHeader })
        .then(response => {
             callback(response.data.choices[0].message.content.trim());
        })
        .catch(error => {
            if (error.response && error.response.status === 401) {
                // Let main know that there was an API key error
                callback('badAPIKey');
            }
            console.log(error);
        });
}

// Export functions
module.exports = {
    getAPIKey,
    writeAPIKey,
    askGPT,
};