const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('maxfarm')
        .setDescription('Muestra el farm máximo posible según niveles de Starbase')
        .addStringOption(option => 
            option.setName('alianza')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const allianceName = interaction.options.getString('alianza');
        await interaction.deferReply();
        
        const alliance = await api.getAlliance(allianceName);
        if (!alliance || !alliance.Members) {
            return interaction.editReply(`No se pudo obtener información de la alianza: **${allianceName}**`);
        }

        const sbLevels = {};
        let totalResources = 0;

        // Approximate storage by SB level (Example values for GL)
        const storagePerLevel = {
            1: 20000, 2: 50000, 3: 150000, 4: 400000, 
            5: 1000000, 6: 2500000, 7: 6000000, 8: 12000000, 9: 25000000
        };

        alliance.Members.forEach(m => {
            // Heuristic: Starbase Level is roughly Account Level / 40 or capped at 9
            const lvl = Math.min(9, Math.max(1, Math.floor((m.Level || 1) / 40)));
            sbLevels[lvl] = (sbLevels[lvl] || 0) + 1;
            totalResources += storagePerLevel[lvl] || 0;
        });

        const embed = new EmbedBuilder()
            .setTitle(`💰 Max Farm (Estimado): ${alliance.Name}`)
            .setColor('#32cd32')
            .setDescription('Estimación de recursos disponibles basada en el nivel de los jugadores.')
            .addFields({ name: '📊 Recuento de Starbases (Estimado)', value: Object.entries(sbLevels).map(([lvl, count]) => `Lvl ${lvl}: **${count}**`).join('\n') || 'N/A', inline: false })
            .addFields({ name: '💎 Recursos Totales Estimados', value: `${totalResources.toLocaleString()} unidades`, inline: false });

        await interaction.editReply({ embeds: [embed] });
    }
};
