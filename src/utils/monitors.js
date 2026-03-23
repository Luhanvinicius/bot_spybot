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
                const activeWar = await db.getActiveWar(alliance.Id);

                if (inWar && !activeWar) {
                    // NEW WAR detected
                    let opponentPoints = 0;
                    if (alliance.OpponentAllianceId) {
                        const opponent = await api.getAlliance(alliance.OpponentAllianceId);
                        if (opponent) opponentPoints = opponent.WarPoints || 0;
                    }
                    
                    // Collect starting points for members
                    const membersStartData = {};
                    if (alliance.Members) {
                        for (const member of alliance.Members) {
                            membersStartData[member.Name] = member.TotalWarPoints || 0;
                        }
                    }

                    await db.addActiveWar(alliance.Id, alliance.OpponentAllianceId || 'Unknown', alliance.WarPoints || 0, opponentPoints, membersStartData);
                    this.notifyWarStart(shield.name, alliance);
                } else if (!inWar && activeWar) {
                    // War ended
                    this.notifyWarEnd(shield.name, activeWar, alliance);
                    await db.removeActiveWar(alliance.Id);
                }

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

    async notifyWarEnd(allianceName, activeWar, currentAlliance) {
        const channel = await this.getChannel('warHistory');
        
        // Calculate points gained during the war
        const currentAlliancePoints = currentAlliance.WarPoints || 0;
        const startAlliancePoints = activeWar.start_points_alliance || 0;
        const alliancePointsGained = Math.max(0, currentAlliancePoints - startAlliancePoints);
        
        let opponentPointsGained = 0;
        if (activeWar.opponent_name && activeWar.opponent_name !== 'Unknown') {
            const opponent = await api.getAlliance(activeWar.opponent_name);
            if (opponent) {
                const currentOpponentPoints = opponent.WarPoints || 0;
                const startOpponentPoints = activeWar.start_points_opponent || 0;
                opponentPointsGained = Math.max(0, currentOpponentPoints - startOpponentPoints);
            }
        }

        const result = alliancePointsGained > opponentPointsGained ? 'Win' : 'Loss';
        await db.addWarHistory(allianceName, activeWar.opponent_name, alliancePointsGained, opponentPointsGained, activeWar.start_date, new Date(), result);

        if (!channel) return;

        const embed = new EmbedBuilder()
            .setTitle(`🏁 Guerra Finalizada: ${result === 'Win' ? 'VICTORIA' : 'DERROTA'}`)
            .setColor(result === 'Win' ? '#00ff00' : '#ff0000')
            .addFields(
                { name: 'Alianza', value: allianceName, inline: true },
                { name: 'Rival', value: activeWar.opponent_name, inline: true },
                { name: 'Resultado (Puntos ganados)', value: `${alliancePointsGained} vs ${opponentPointsGained}`, inline: false }
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
