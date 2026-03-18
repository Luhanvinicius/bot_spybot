const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        // Restriction: Only respond in 'spybot' channel
        if (interaction.channel.name !== 'spybot') {
            return interaction.reply({ 
                content: '❌ Este bot solo se puede usar en el canal <#spybot> ou um canal chamado `spybot`.', 
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
