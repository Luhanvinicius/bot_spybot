const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('show_shield_alliances')
        .setDescription('Muestra todas las alianzas que están siendo monitoreadas'),
    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const shields = await db.getShieldAlliances();
            
            if (!shields || shields.length === 0) {
                return interaction.editReply('No hay alianzas siendo monitoreadas actualmente.');
            }

            const embed = new EmbedBuilder()
                .setTitle('🛡️ Alianzas Monitoreadas')
                .setColor('#00ff00')
                .setDescription(shields.map(s => `• **${s.name}**`).join('\n'));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al obtener las alianzas.');
        }
    }
};
