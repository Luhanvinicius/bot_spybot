const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('player_history')
        .setDescription('Muestra el historial de movimientos de un jugador')
        .addStringOption(option => 
            option.setName('jugador')
                .setDescription('Nombre del jugador')
                .setRequired(true)),
    async execute(interaction) {
        const playerName = interaction.options.getString('jugador');
        await interaction.deferReply();
        
        // Try to get exact user first to normalize name
        const user = await api.getUserByName(playerName);
        const searchName = user ? user.name : playerName;
        
        try {
            const history = await db.getPlayerHistory(playerName, 20);
            
            if (!history || history.length === 0) {
                return interaction.editReply(`No hay movimientos registrados para el jugador: **${playerName}**`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`👤 Historial de Jugador: ${playerName}`)
                .setColor('#9400d3');

            let historyStr = history.map(m => {
                const date = new Date(m.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                const typeEmoji = m.type === 'Join' ? '📥 Entró' : '📤 Salió';
                return `${typeEmoji} a **${m.alliance_name}**\n   _${date}_`;
            }).join('\n');

            embed.setDescription(historyStr);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Hubo un error al obtener el historial del jugador.');
        }
    }
};
