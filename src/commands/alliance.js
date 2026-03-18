const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const api = require('../utils/api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('alianza')
        .setDescription('Muestra información completa de una alianza')
        .addStringOption(option => 
            option.setName('nombre')
                .setDescription('Nombre de la alianza')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('nombre');
        
        await interaction.deferReply();
        
        let alliance = await api.getAlliance(name);
        
        if (!alliance) {
            // Fallback: search for alliances with similar names
            const response = await require('axios').get(`https://api.galaxylifegame.net/Alliances/search`, { params: { name } });
            const searchResults = response.data;
            if (searchResults && searchResults.length > 0) {
                const names = searchResults.slice(0, 5).map(a => a.name).join(', ');
                return interaction.editReply(`❌ No encontré el exacto: **${name}**.\nTal vez quisiste decir: ${names}`);
            }
            return interaction.editReply(`No se encontró a la alianzas: **${name}**`);
        }

        const membersCount = alliance.Members ? alliance.Members.length : 0;
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 Alianza: ${alliance.Name}`)
            .setColor('#0099ff')
            .setDescription(alliance.Description || 'Sin descripción')
            .addFields(
                { name: '🏰 Nivel de Alianza', value: `${alliance.AllianceLevel || 0}`, inline: true },
                { name: '👥 Miembros', value: `${membersCount}/50`, inline: true },
                { name: '⚔️ Wars Ganadas', value: `${alliance.WarsWon || 0}`, inline: true },
                { name: '💀 Wars Perdidas', value: `${alliance.WarsLost || 0}`, inline: true },
                { name: '🏆 War Points', value: `${(alliance.WarPoints || 0).toLocaleString()}`, inline: true },
                { name: '⚔️ En Guerra', value: alliance.InWar ? '✅ SÍ' : '❌ NO', inline: true }
            )
            .setFooter({ text: 'Spy Bot - Galaxy Life' })
            .setTimestamp();

        if (alliance.Emblem) {
            // Optional: Logic to show emblem info or icons
        }

        await interaction.editReply({ embeds: [embed] });
    }
};
