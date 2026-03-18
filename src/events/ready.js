const { Events } = require('discord.js');
const Monitor = require('../utils/monitors');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ ¡Listo! Conectado como ${client.user.tag}`);
        
        const monitor = new Monitor(client);
        monitor.start();

        // Optional: Auto deploy/refresh commands set for dev
        console.log('🤖 Monitores de guerra y alianzas activados.');
    }
};
