const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_player_coords')
        .setDescription('Obtiene las coordenadas guardadas de un jugador')
        .addStringOption(option => 
            option.setName('jugador')
                .setDescription('Nombre del jugador')
                .setRequired(true)),
    async execute(interaction) {
        const player = interaction.options.getString('jugador');
        
        await interaction.deferReply();
        
        try {
            const coords = await db.getPlayerCoords(player);
            if (!coords) {
                return interaction.editReply(`❌ No hay coordenadas guardadas para **${player}**.`);
            }
            await interaction.editReply(`📍 Coordenadas de **${player}**:\n\`\`\`${coords}\`\`\``);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al obtener coordenadas.');
        }
    }
};
