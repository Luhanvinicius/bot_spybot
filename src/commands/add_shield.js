const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('añadir_alianza_escudos')
        .setDescription('Añade una alianza al sistema de monitoreo automático')
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nombre de la alianza')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const name = interaction.options.getString('nombre');
        
        await interaction.deferReply();
        
        try {
            await db.addShieldAlliance(name, interaction.guildId);
            await interaction.editReply(`🛡️ Alianza **${name}** añadida al monitoreo con éxito.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ Error al añadir la alianza.');
        }
    }
};
