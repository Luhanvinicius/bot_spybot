const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add_player_coords')
        .setDescription('Guarda las coordenadas de las colonias d e un jugador')
        .addStringOption(option => 
            option.setName('jugador')
                .setDescription('Nombre del jugador')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('coords')
                .setDescription('Formato: c2 100 100 c3 200 200...')
                .setRequired(true)),
    async execute(interaction) {
        const player = interaction.options.getString('jugador');
        const coords = interaction.options.getString('coords');
        
        await interaction.deferReply();
        
        try {
            await db.savePlayerCoords(player, coords);
            await interaction.editReply(`✅ Coordenadas guardadas para **${player}**.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al guardar coordenadas.');
        }
    }
};
