const { SlashCommandBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Fuerza una actualización inmediata del monitor de alianzas')
        .addStringOption(option => 
            option.setName('alianza')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('alianza');
        await interaction.deferReply();
        
        // Simulating immediate refresh by fetching now
        const alliance = await api.getAlliance(name);
        
        if (alliance) {
            await interaction.editReply(`✅ Datos de **${name}** actualizados correctamente.`);
        } else {
            await interaction.editReply(`❌ No se pudo actualizar los datos de **${name}**.`);
        }
    }
};
