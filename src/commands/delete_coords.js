const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete_player_coords')
        .setDescription('Elimina las coordenadas guardadas de un jugador')
        .addStringOption(option => 
            option.setName('jugador')
                .setDescription('Nombre del jugador')
                .setRequired(true)),
    async execute(interaction) {
        const player = interaction.options.getString('jugador');
        
        await interaction.deferReply();
        
        try {
            await db.deletePlayerCoords(player);
            await interaction.editReply(`🗑️ Coordenadas de **${player}** eliminadas.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al eliminar coordenadas.');
        }
    }
};
