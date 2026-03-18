const axios = require('axios');
require('dotenv').config();

const API_BASE = process.env.API_URL || 'https://api.galaxylifegame.net';

const api = {
    async getAlliance(name) {
        try {
            const response = await axios.get(`${API_BASE}/Alliances/get`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching alliance ${name}:`, error.message);
            return null;
        }
    },

    async getUser(id) {
        try {
            const response = await axios.get(`${API_BASE}/Users/get`, { params: { id } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error.message);
            return null;
        }
    },

    async getUserByName(name) {
        try {
            const response = await axios.get(`${API_BASE}/Users/name`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching user by name ${name}:`, error.message);
            return null;
        }
    },

    async getUserStats(id) {
        try {
            const response = await axios.get(`${API_BASE}/Users/stats`, { params: { id } });
            return response.data;
        } catch (error) {
            console.error(`Error fetching stats for user ${id}:`, error.message);
            return null;
        }
    },

    async searchUser(name) {
        try {
            const response = await axios.get(`${API_BASE}/Users/search`, { params: { name } });
            return response.data;
        } catch (error) {
            console.error(`Error searching user ${name}:`, error.message);
            return [];
        }
    },

    async getStatus() {
        try {
            const response = await axios.get(`${API_BASE}/status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching API status:', error.message);
            return null;
        }
    }
};

module.exports = api;
