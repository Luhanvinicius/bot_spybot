CREATE DATABASE IF NOT EXISTS spy_bot;
USE spy_bot;

CREATE TABLE IF NOT EXISTS alliances_to_shield (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    guild_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS war_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alliance_name VARCHAR(255),
    opponent_name VARCHAR(255),
    points_alliance INT,
    points_opponent INT,
    start_date DATETIME,
    end_date DATETIME,
    result ENUM('Win', 'Loss', 'Draw')
);

CREATE TABLE IF NOT EXISTS player_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(255),
    alliance_name VARCHAR(255),
    type ENUM('Join', 'Leave'),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_coords (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(255) UNIQUE NOT NULL,
    coords TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
