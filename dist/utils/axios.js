"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = exports.setAuthToken = exports.axios = void 0;
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
