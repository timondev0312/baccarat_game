"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = exports.setAuthToken = exports.axios = void 0;
exports.weightedRandomChoice = weightedRandomChoice;
const axios_1 = require("axios");
const API_URL = process.env.API_URL;
// Create Axios instance with base URL  
exports.axios = axios_1.default.create({
    baseURL: API_URL,
    headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace YOUR_TOKEN_HERE with your actual token  
    }
});
// Function to set authorization token  
const setAuthToken = (token) => {
    if (token) {
        exports.axios.defaults.headers['Authorization'] = `Bearer ${token}`;
    }
    else {
        delete exports.axios.defaults.headers['Authorization']; // Remove token if not present  
    }
};
exports.setAuthToken = setAuthToken;
const getUserId = (uid) => {
    return String(uid);
};
exports.getUserId = getUserId;
function weightedRandomChoice(choices) {
    // Step 1: Calculate cumulative odds  
    const cumulativeOdds = [];
    let totalOdds = 0;
    choices.forEach(choice => {
        totalOdds += choice.odds;
        cumulativeOdds.push(totalOdds);
    });
    // Step 2: Generate a random number  
    const randValue = Math.random() * totalOdds;
    // Step 3: Select the item based on the random number  
    for (let i = 0; i < cumulativeOdds.length; i++) {
        if (randValue < cumulativeOdds[i]) {
            return choices[i].place;
        }
    }
    // Fallback (shouldn't generally hit this case)  
    return null;
}
