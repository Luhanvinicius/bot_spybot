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
            const playTimeHours = Math.floor((stats.TotalPlayTimeInMs || 0) / (1000 * 60 * 60));
            embed.addFields(
                { name: '⚔️ Ataques Realizados', value: `${stats.PlayersAttacked || 0}`, inline: true },
                { name: '🛡️ Veces Atacado', value: `${stats.TimesAttacked || 0}`, inline: true },
                { name: '⏳ Tiempo Jugado', value: `${playTimeHours} horas`, inline: true },
                
                { name: '💰 Monedas Robadas', value: `${(stats.CoinsFromAttacks || 0).toLocaleString()}`, inline: true },
                { name: '💎 Minerales Robados', value: `${(stats.MineralsFromAttacks || 0).toLocaleString()}`, inline: true },
                { name: '💣 Starbases Destruidas', value: `${stats.StarbasesDestroyed || 0}`, inline: true },

                { name: '🪖 Tropas Entrenadas', value: `${(stats.TroopsTrained || 0).toLocaleString()}`, inline: true },
                { name: '🤝 Tropas Donadas', value: `${(stats.TroopSizesDonated || 0).toLocaleString()}`, inline: true },
                { name: '🏆 Rivales Ganados', value: `${stats.RivalsWon || 0}`, inline: true }
            );
        }

        embed.addFields({ name: '🌟 Nivel de XP', value: `${(userBasic.Experience || 0).toLocaleString()} XP`, inline: false });

        if (userBasic.AllianceId) {
            embed.addFields({ name: '🏰 Alianza ID', value: userBasic.AllianceId, inline: false });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
