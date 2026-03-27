const { Events, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const db = require('../database/db');
        const dbChannels = await db.getAllowedChannels();
        const fallbackAllowed = ['1481853111520985101', '1483714865863593984'];
        const allAllowed = [...dbChannels, ...fallbackAllowed];

        // Restriction: Only respond in specific channel IDs
        // EXCEPTION: The command is 'gestionar_canales' OR the user is an Administrator
        const isControlCommand = interaction.commandName === 'gestionar_canales';
        const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!isControlCommand && !isAdmin && !allAllowed.includes(interaction.channelId)) {
            return interaction.reply({ 
                content: '❌ Este bot no se pode usar aqui. Requer permiso dinâmico via `/gestionar_canales`.', 
                ephemeral: true 
            });
        }

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No se encontró el comando ${interaction.commandName}.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true });
            } else {
                await interaction.reply({ content: '❌ Hubo un error al ejecutar este comando.', ephemeral: true });
            }
        }
    }
};
