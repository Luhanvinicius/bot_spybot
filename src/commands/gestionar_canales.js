const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gestionar_canales')
        .setDescription('Administra los canales donde el bot está permitido')
        .addSubcommand(subcommand =>
            subcommand
                .setName('permitir')
                .setDescription('Permite al bot responder en un canal')
                .addChannelOption(option => 
                    option.setName('canal')
                        .setDescription('Canal a permitir (si se deja vacío, se usa el actual)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remover')
                .setDescription('Quita el permiso de un canal')
                .addChannelOption(option => 
                    option.setName('canal')
                        .setDescription('Canal a remover (si se deixa vacío, se usa el atual)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('listar')
                .setDescription('Muestra todos os canales permitidos'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const targetChannel = interaction.options.getChannel('canal') || interaction.channel;
        
        await interaction.deferReply({ ephemeral: true });

        if (subcommand === 'permitir') {
            await db.addAllowedChannel(targetChannel.id);
            return interaction.editReply(`✅ Canal **#${targetChannel.name}** (${targetChannel.id}) agora está permitido.`);
        } else if (subcommand === 'remover') {
            await db.removeAllowedChannel(targetChannel.id);
            return interaction.editReply(`🗑️ Canal **#${targetChannel.name}** (${targetChannel.id}) ya não está na lista de permitidos.`);
        } else if (subcommand === 'listar') {
            const channels = await db.getAllowedChannels();
            if (channels.length === 0) {
                return interaction.editReply('⚠️ Não hay canales permitidos registrados. El bot funcionará solo como fallback en los IDs antiguos.');
            }
            const list = channels.map(id => `<#${id}> (\`${id}\`)`).join('\n');
            return interaction.editReply(`📌 **Canales Permitidos:**\n${list}`);
        }
    }
};
