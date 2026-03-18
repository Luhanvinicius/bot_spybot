const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mains')
        .setDescription('Calcula los puntos de guerra totales de las cuentas principales (excluye farms)')
        .addStringOption(option => 
            option.setName('alianza')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const allianceName = interaction.options.getString('alianza');
        await interaction.deferReply();
        
        const alliance = await api.getAlliance(allianceName);
        if (!alliance || !alliance.Members) {
            return interaction.editReply(`No se pudo obtener información de la alianza.`);
        }

        // Heuristic: Mains are those with Level >= 70 or without "farm" in name
        const mainAccounts = alliance.Members.filter(m => {
            const name = m.Name.toLowerCase();
            const level = m.Level || 0;
            return !name.includes('farm') && !name.includes('recurso') && level >= 70;
        });

        const totalWP = mainAccounts.reduce((sum, m) => sum + (m.TotalWarPoints || 0), 0);

        const embed = new EmbedBuilder()
            .setTitle(`🛡️ Cuentas Principales: ${alliance.Name}`)
            .setColor('#4169e1')
            .addFields(
                { name: '👤 Cantidad de Mains', value: `${mainAccounts.length}`, inline: true },
                { name: '🚜 Cantidad de Farms (Estimado)', value: `${alliance.Members.length - mainAccounts.length}`, inline: true },
                { name: '🏆 WP de Mains', value: `${totalWP.toLocaleString()}`, inline: false }
            );

        await interaction.editReply({ embeds: [embed] });
    }
};
