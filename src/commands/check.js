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

        // If the API provides more details when in war (like Points), we add them here
        if (alliance.WarPoints) {
            embed.addFields({ name: '📈 War Points actuales', value: `${alliance.WarPoints.toLocaleString()}`, inline: true });
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
