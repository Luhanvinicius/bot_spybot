const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eliminar_alianza_escudos')
        .setDescription('Elimina una alianza del sistema de monitoreo automático')
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nombre de la alianza')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const originalName = interaction.options.getString('nombre');
        const name = originalName.toLowerCase();
        
        await interaction.deferReply();
        
        try {
            await db.removeShieldAlliance(name);
            await interaction.editReply(`🗑️ Alianza **${originalName}** ha sido eliminada del monitoreo.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al eliminar la alianza.');
        }
    }
};
