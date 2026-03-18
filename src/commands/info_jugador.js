const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info_jugador')
        .setDescription('Muestra información detallada y estadísticas de um jugador')
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nombre del jugador')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('nombre');
        await interaction.deferReply();
        
        // 1. Get user basic info by name
        const userBasic = await api.getUserByName(name);
        
        if (!userBasic) {
            // Try searching if exact name not found
            const searchResults = await api.searchUser(name);
            if (searchResults && searchResults.length > 0) {
                const names = searchResults.slice(0, 5).map(u => u.name).join(', ');
                return interaction.editReply(`❌ No encontré un jugador exacto llamado **${name}**.\nTal vez quisiste decir: ${names}`);
            }
            return interaction.editReply(`❌ No se encontró ningún jugador con el nombre: **${name}**`);
        }

        // 2. Get user stats by ID
        const stats = await api.getUserStats(userBasic.Id);

        // Calculate Starbase Level (max HQLevel in Planets)
        let maxSB = 0;
        if (userBasic.Planets && userBasic.Planets.length > 0) {
            maxSB = Math.max(...userBasic.Planets.map(p => p.HQLevel || 0));
        }

        const embed = new EmbedBuilder()
            .setTitle(`👤 Perfil de Jugador: ${userBasic.Name}`)
            .setColor('#f1c40f')
            .setThumbnail(userBasic.Avatar || null)
            .addFields(
                { name: '🆔 ID', value: `${userBasic.Id}`, inline: true },
                { name: '🏰 Starbase Max', value: `Nivel ${maxSB}`, inline: true },
                { name: '⭐ Nivel', value: `${userBasic.Level || '?' }`, inline: true }
            );

        if (stats) {
            embed.addFields(
                { name: '⚔️ Victorias ataque', value: `${stats.attacksWon || 0}`, inline: true },
                { name: '🛡️ Defensas ganadas', value: `${stats.defensesWon || 0}`, inline: true },
                { name: '🏆 XP', value: `${(userBasic.Experience || 0).toLocaleString()}`, inline: true }
            );
        }

        if (userBasic.AllianceId) {
            embed.addFields({ name: '🏰 Alianza ID', value: userBasic.AllianceId, inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
