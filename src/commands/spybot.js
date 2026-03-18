const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('spybot')
        .setDescription('Verifica si el bot está activo y muestra el estado del sistema'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: '🕵️ Conectando con la API de Galaxy Life...', fetchReply: true, ephemeral: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        
        const glStatus = await api.getStatus();
        const apiStatus = glStatus ? '✅ Operativa' : '❌ Offline/Error';

        const embed = new EmbedBuilder()
            .setTitle('📡 Spy Bot System Status')
            .setColor('#00ff00')
            .addFields(
                { name: '🤖 Bot Latencia', value: `${latency}ms`, inline: true },
                { name: '🌐 API Discord', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true },
                { name: '🎮 Galaxy Life API', value: apiStatus, inline: false },
                { name: '📍 Canal Autorizado', value: `✅ <#${interaction.channelId}>`, inline: false }
            )
            .setTimestamp();

        await interaction.editReply({ content: '', embeds: [embed] });
    }
};
