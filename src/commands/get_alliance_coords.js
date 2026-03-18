const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_alliance_coords')
        .setDescription('Obtiene coordenadas de todos los jugadores de una alianza')
        .addStringOption(option => 
            option.setName('alianza')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const allianceName = interaction.options.getString('alianza');
        await interaction.deferReply();
        
        const alliance = await api.getAlliance(allianceName);
        if (!alliance || !alliance.Members) {
            return interaction.editReply(`No se pudo obtener información de la alianza.`);
        }

        const members = alliance.Members.map(m => m.Name);
        let coordsOutput = '';

        for (const name of members) {
            const coords = await db.getPlayerCoords(name);
            if (coords) {
                coordsOutput += `**${name}**: ${coords}\n`;
            }
        }

        if (!coordsOutput) {
            return interaction.editReply(`No hay coordenadas registradas para los miembros de **${allianceName}**.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`📍 Coordenadas de Alianza: ${allianceName}`)
            .setColor('#f4a460')
            .setDescription(coordsOutput.slice(0, 4000)); // Discord limit check

        await interaction.editReply({ embeds: [embed] });
    }
};
