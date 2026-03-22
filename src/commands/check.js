const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('check')
        .setDescription('Revisa si una alianza está en guerra')
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('nombre');
        await interaction.deferReply();
        
        const alliance = await api.getAlliance(name);
        
        if (!alliance) {
            return interaction.editReply(`No se encontró la alianza: **${name}**`);
        }

        if (!alliance.InWar) {
            return interaction.editReply(`La alianza **${alliance.Name}** no está en guerra actualmente.`);
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚔️ Estado de Guerra: ${alliance.Name}`)
            .setColor('#ff4500')
            .addFields(
                { name: '🥊 Rival ID', value: `${alliance.OpponentAllianceId}`, inline: false }
            );

        // Fetch active war points from DB
        const db = require('../database/db');
        const activeWar = await db.getActiveWar(alliance.Id);
        
        if (activeWar) {
            const startAlliancePoints = activeWar.start_points_alliance || 0;
            const currentAlliancePoints = alliance.WarPoints || 0;
            const alliancePointsGained = Math.max(0, currentAlliancePoints - startAlliancePoints);
        
            let opponentPointsGained = 0;
            let opponentNameStr = alliance.OpponentAllianceId || activeWar.opponent_name;
            
            // Identify if it is an active war from both sides
            let isMutualWar = false;
            if (opponentNameStr && opponentNameStr !== 'Unknown') {
                const opponent = await api.getAlliance(opponentNameStr);
                if (opponent) {
                    const startOpponentPoints = activeWar.start_points_opponent || 0;
                    const currentOpponentPoints = opponent.WarPoints || 0;
                    opponentPointsGained = Math.max(0, currentOpponentPoints - startOpponentPoints);
                    opponentNameStr = opponent.Name; // Use nicer name
                    
                    if (opponent.InWar && opponent.OpponentAllianceId && opponent.OpponentAllianceId.toLowerCase() === alliance.Name.toLowerCase()) {
                        isMutualWar = true;
                    }
                }
            }
        
            // Calculate time left
            // 3 days if both alliances fight back (points > 0), 14 hours otherwise
            let durationMs = 14 * 60 * 60 * 1000;
            if (alliancePointsGained > 0 && opponentPointsGained > 0) {
                durationMs = 3 * 24 * 60 * 60 * 1000;
            }
                
            const startDate = new Date(activeWar.start_date);
            const endDate = new Date(startDate.getTime() + durationMs);
            const now = new Date();
            const timeLeftMs = Math.max(0, endDate - now);
            
            const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        
            embed.setDescription(`**${alliance.Name}** vs **${opponentNameStr}**`)
            embed.addFields(
                { name: 'Puntos ganados:', value: `**${alliance.Name}**: ${alliancePointsGained.toLocaleString()}\n**${opponentNameStr}**: ${opponentPointsGained.toLocaleString()}`, inline: false },
                { name: 'Tiempo restante:', value: `${days}d ${hours}h ${minutes}m`, inline: false }
            );
        } else {
            // Fallback if not tracked yet
            if (alliance.WarPoints) {
                embed.addFields({ name: '📈 War Points actuales', value: `${alliance.WarPoints.toLocaleString()}`, inline: true });
            }
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
