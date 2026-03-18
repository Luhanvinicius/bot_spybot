const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ranking')
        .setDescription('Muestra el Top 10 de jugadores')
        .addStringOption(option => 
            option.setName('tipo')
                .setDescription('Tipo de ranking')
                .setRequired(true)
                .addChoices(
                    { name: 'XP', value: 'xp' },
                    { name: 'Warpoints', value: 'warpoints' }
                )),
    async execute(interaction) {
        const tipo = interaction.options.getString('tipo');
        await interaction.deferReply();
        
        let data;
        let title = '';
        
        try {
            if (tipo === 'xp') {
                const response = await require('axios').get('https://api.galaxylifegame.net/Leaderboard/xp');
                data = response.data;
                title = '🏆 Ranking XP (Top 10)';
            } else {
                const response = await require('axios').get('https://api.galaxylifegame.net/Leaderboard/warpoints');
                data = response.data;
                title = '⚔️ Ranking Warpoints (Top 10)';
            }

            if (!data || data.length === 0) {
                return interaction.editReply('No se puduram obter os dados do ranking agora.');
            }

            const top10 = data.slice(0, 10);
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setColor('#f39c12')
                .setDescription(top10.map((u, i) => `${i + 1}. **${u.Name || u.name}** - ${tipo === 'xp' ? (u.Xp || u.xp || 0).toLocaleString() : (u.WarPoints || u.warPoints || 0).toLocaleString()}`).join('\n'))
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al conectar con la API de Rankings.');
        }
    }
};
