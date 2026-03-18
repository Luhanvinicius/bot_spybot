const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('matchmaking')
        .setDescription('Evalúa si dos alianzas pueden tener una guerra balanceada')
        .addStringOption(option => option.setName('alianza1').setDescription('Primera alianza').setRequired(true))
        .addStringOption(option => option.setName('alianza2').setDescription('Segunda alianza').setRequired(true)),
    async execute(interaction) {
        const a1Name = interaction.options.getString('alianza1');
        const a2Name = interaction.options.getString('alianza2');
        
        await interaction.deferReply();
        
        const a1 = await api.getAlliance(a1Name);
        const a2 = await api.getAlliance(a2Name);
        
        if (!a1 || !a2) {
            return interaction.editReply(`No se pudo encontrar una o ambas alianzas: **${a1Name}**, **${a2Name}**`);
        }

        const levelDiff = Math.abs((a1.AllianceLevel || 0) - (a2.AllianceLevel || 0));
        const wpDiff = Math.abs((a1.WarPoints || 0) - (a2.WarPoints || 0));
        
        let difficulty = 'Media';
        let color = '#ffa500';

        if (levelDiff < 20 && wpDiff < 1000000) {
            difficulty = 'Fácil / Muy Balanceada';
            color = '#00ff00';
        } else if (levelDiff > 50 || wpDiff > 10000000) {
            difficulty = 'Difícil / Desbalanceada';
            color = '#ff0000';
        }

        const embed = new EmbedBuilder()
            .setTitle(`⚖️ Evaluación de Matchmaking`)
            .setColor(color)
            .addFields(
                { name: `🏰 ${a1.Name}`, value: `Nivel: ${a1.AllianceLevel}\nWP: ${(a1.WarPoints || 0).toLocaleString()}`, inline: true },
                { name: `🏰 ${a2.Name}`, value: `Nivel: ${a2.AllianceLevel}\nWP: ${(a2.WarPoints || 0).toLocaleString()}`, inline: true },
                { name: '📊 Diagnóstico', value: `Dificultad: **${difficulty}**\nDiferencia Nivel: ${levelDiff}\nDiferencia WP: ${wpDiff.toLocaleString()}`, inline: false }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};
