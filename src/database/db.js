const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    // For local dev without SSL certificates setup, if you are deploying to a cloud database you might need to change this
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res.rows;
    } catch (err) {
        console.error('Database query error:', err.stack);
        throw err;
    }
};

const run = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res; // PG returns a result object
    } catch (err) {
        console.error('Database command error:', err.stack);
        throw err;
    }
};

// Initialize tables for PostgreSQL
const init = async () => {
    try {
        await run(`CREATE TABLE IF NOT EXISTS alliances_to_shield (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            guild_id VARCHAR(50)
        )`);

        await run(`CREATE TABLE IF NOT EXISTS war_history (
            id SERIAL PRIMARY KEY,
            alliance_name VARCHAR(255),
            opponent_name VARCHAR(255),
            points_alliance INTEGER,
            points_opponent INTEGER,
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            result VARCHAR(50)
        )`);

        await run(`CREATE TABLE IF NOT EXISTS player_movements (
            id SERIAL PRIMARY KEY,
            player_name VARCHAR(255),
            alliance_name VARCHAR(255),
            type VARCHAR(50),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS player_coords (
            id SERIAL PRIMARY KEY,
            player_name VARCHAR(255) UNIQUE NOT NULL,
            coords TEXT,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS active_wars (
            id SERIAL PRIMARY KEY,
            alliance_name VARCHAR(255) UNIQUE NOT NULL,
            opponent_name VARCHAR(255) NOT NULL,
            start_points_alliance BIGINT,
            start_points_opponent BIGINT,
            start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await run(`CREATE TABLE IF NOT EXISTS allowed_channels (
            id SERIAL PRIMARY KEY,
            channel_id VARCHAR(50) UNIQUE NOT NULL
        )`);

        try {
            await run('ALTER TABLE active_wars ADD COLUMN IF NOT EXISTS members_start_data JSONB DEFAULT \'{}\'::jsonb');
        } catch (e) {
            console.log('Column members_start_data already exists or error:', e.message);
        }

        console.log('✅ PostgreSQL Database Initialized');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

// Auto-run initialization on load
init();

const db = {
    async query(sql, params) {
        return query(sql, params);
    },

    async addShieldAlliance(name, guildId) {
        return run('INSERT INTO alliances_to_shield (name, guild_id) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET guild_id = $2', [name, guildId]);
    },

    async removeShieldAlliance(name) {
        return run('DELETE FROM alliances_to_shield WHERE name = $1', [name]);
    },

    async getShieldAlliances() {
        return query('SELECT * FROM alliances_to_shield', []); // PG requires array for empty params generally if query handles it
    },

    async addWarHistory(alliance, opponent, p1, p2, start, end, result) {
        return run('INSERT INTO war_history (alliance_name, opponent_name, points_alliance, points_opponent, start_date, end_date, result) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [alliance, opponent, p1, p2, start, end, result]);
    },

    async getWarHistory(alliance, limit = 10) {
        return query('SELECT * FROM war_history WHERE alliance_name = $1 ORDER BY start_date DESC LIMIT $2', [alliance, limit]);
    },

    async addPlayerMovement(player, alliance, type) {
        return run('INSERT INTO player_movements (player_name, alliance_name, type) VALUES ($1, $2, $3)', [player, alliance, type]);
    },

    async getPlayerHistory(player, limit = 20) {
        return query('SELECT * FROM player_movements WHERE player_name = $1 ORDER BY timestamp DESC LIMIT $2', [player, limit]);
    },

    async savePlayerCoords(player, coords) {
        return run('INSERT INTO player_coords (player_name, coords) VALUES ($1, $2) ON CONFLICT (player_name) DO UPDATE SET coords = $2', [player, coords]);
    },

    async getPlayerCoords(player) {
        const rows = await query('SELECT coords FROM player_coords WHERE player_name = $1', [player]);
        return rows.length ? rows[0].coords : null;
    },

    async deletePlayerCoords(player) {
        return run('DELETE FROM player_coords WHERE player_name = $1', [player]);
    },

    async addActiveWar(alliance, opponent, startPointsAlliance, startPointsOpponent, membersStartData = {}) {
        const jsonStr = JSON.stringify(membersStartData);
        return run('INSERT INTO active_wars (alliance_name, opponent_name, start_points_alliance, start_points_opponent, members_start_data) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (alliance_name) DO UPDATE SET start_points_alliance = $3, start_points_opponent = $4, opponent_name = $2, members_start_data = $5, start_date = CURRENT_TIMESTAMP', [alliance, opponent, startPointsAlliance, startPointsOpponent, jsonStr]);
    },

    async getActiveWar(alliance) {
        const rows = await query('SELECT * FROM active_wars WHERE alliance_name = $1', [alliance]);
        return rows.length ? rows[0] : null;
    },

    async removeActiveWar(alliance) {
        return run('DELETE FROM active_wars WHERE alliance_name = $1', [alliance]);
    },

    async addAllowedChannel(channelId) {
        return run('INSERT INTO allowed_channels (channel_id) VALUES ($1) ON CONFLICT (channel_id) DO NOTHING', [channelId]);
    },

    async removeAllowedChannel(channelId) {
        return run('DELETE FROM allowed_channels WHERE channel_id = $1', [channelId]);
    },

    async getAllowedChannels() {
        const rows = await query('SELECT channel_id FROM allowed_channels', []);
        return rows.map(r => r.channel_id);
    }
};

module.exports = db;

