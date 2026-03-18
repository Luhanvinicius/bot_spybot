const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('war_history')
        .setDescription('Muestra las últimas 10 guerras de una alianza')
        .addStringOption(option => 
            option.setName('alianza')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const allianceName = interaction.options.getString('alianza');
        await interaction.deferReply();
        
        try {
            const history = await db.getWarHistory(allianceName, 10);
            
            if (!history || history.length === 0) {
                return interaction.editReply(`No hay historial registrado para la alianza: **${allianceName}**`);
            }

            const embed = new EmbedBuilder()
                .setTitle(`📜 Historial de Guerras: ${allianceName}`)
                .setColor('#ffd700');

            let historyStr = history.map(w => {
                const date = new Date(w.end_date).toLocaleDateString('es-ES');
                const resultEmoji = w.result === 'Win' ? '✅' : (w.result === 'Loss' ? '❌' : '🤝');
                return `${resultEmoji} **vs ${w.opponent_name}**\n   ${w.points_alliance} - ${w.points_opponent} | ${date}`;
            }).join('\n\n');

            embed.setDescription(historyStr);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('Hubo un error al obtener el historial.');
        }
    }
};
