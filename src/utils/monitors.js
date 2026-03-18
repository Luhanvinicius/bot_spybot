const api = require('./api');
const db = require('../database/db');
const { EmbedBuilder } = require('discord.js');

class Monitor {
    constructor(client) {
        this.client = client;
        this.previousStates = new Map(); // Name -> { members: [], war: null }
        this.config = require('../../config.json');
    }

    async start() {
        console.log('🚀 Iniciando monitores...');
        this.runWarMonitor();
        this.runAllianceMonitor();
    }

    async runWarMonitor() {
        setInterval(async () => {
            const shields = await db.getShieldAlliances();
            for (const shield of shields) {
                const alliance = await api.getAlliance(shield.name);
                if (!alliance) continue;

                const inWar = alliance.InWar;
                const prevState = this.previousStates.get(shield.name);

                if (inWar && (!prevState || !prevState.war)) {
                    // Start of war detected
                    this.notifyWarStart(shield.name, alliance);
                } else if (!inWar && prevState && prevState.war) {
                    // End of war detected
                    this.notifyWarEnd(shield.name, prevState.alliance);
                }

                // Update state
                this.updateState(shield.name, { war: inWar, alliance: alliance });
            }
        }, this.config.updateIntervals.war);
    }

    async runAllianceMonitor() {
        setInterval(async () => {
            const shields = await db.getShieldAlliances();
            for (const shield of shields) {
                const alliance = await api.getAlliance(shield.name);
                if (!alliance || !alliance.Members) continue;

                const prevState = this.previousStates.get(shield.name);
                if (prevState && prevState.members) {
                    const currentMembers = alliance.Members.map(m => m.Name);
                    const prevMembers = prevState.members.map(m => m.Name);

                    // Joiners
                    const joined = currentMembers.filter(m => !prevMembers.includes(m));
                    for (const player of joined) {
                        await db.addPlayerMovement(player, shield.name, 'Join');
                        this.notifyMovement(shield.name, player, 'Join');
                    }

                    // Leavers
                    const left = prevMembers.filter(m => !currentMembers.includes(m));
                    for (const player of left) {
                        await db.addPlayerMovement(player, shield.name, 'Leave');
                        this.notifyMovement(shield.name, player, 'Leave');
                    }
                }

                this.updateState(shield.name, { members: alliance.Members });
            }
        }, this.config.updateIntervals.points);
    }

    updateState(name, data) {
        const state = this.previousStates.get(name) || {};
        this.previousStates.set(name, { ...state, ...data });
    }

    async notifyWarStart(allianceName, alliance) {
        const channel = await this.getChannel('warStatus');
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`🚨 ¡GUERRA DETECTADA!`)
            .setColor('#ff0000')
            .setDescription(`La alianza **${allianceName}** ha entrado en guerra contra **${alliance.OpponentAllianceId || 'un rival'}**!`)
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }

    async notifyWarEnd(allianceName, lastAlliance) {
        const channel = await this.getChannel('warHistory');
        if (!channel) return;

        // Note: result logic might need better points tracking during war
        const result = 'Finalizada'; 
        
        await db.addWarHistory(allianceName, lastAlliance.OpponentAllianceId, lastAlliance.WarPoints, 0, new Date(), new Date(), 'Win');

        const embed = new EmbedBuilder()
            .setTitle(`🏁 Guerra Finalizada`)
            .setColor(result === 'Win' ? '#00ff00' : '#ff0000')
            .addFields(
                { name: 'Alianza', value: allianceName, inline: true },
                { name: 'Rival', value: lastWar.opponentName, inline: true },
                { name: 'Resultado', value: `${lastWar.points} - ${lastWar.opponentPoints}`, inline: false }
            )
            .setTimestamp();

        channel.send({ embeds: [embed] });
    }

    async notifyWarUpdate(allianceName, war) {
        const channel = await this.getChannel('warLive');
        if (!channel) return;
        // logic for live updates
    }

    async notifyMovement(allianceName, playerName, type) {
        const channel = await this.getChannel('logs');
        if (!channel) return;

        const color = type === 'Join' ? '#00ff00' : '#ff0000';
        const text = type === 'Join' ? `📥 **${playerName}** se ha unido a **${allianceName}**` : `📤 **${playerName}** ha salido de **${allianceName}**`;

        channel.send({ content: text });
    }

    async getChannel(configKey) {
        const id = this.config.channels[configKey];
        if (!id || id === 'CHANNEL_ID') return null;
        return this.client.channels.fetch(id).catch(() => null);
    }
}

module.exports = Monitor;
