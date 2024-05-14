const { Events, PermissionsBitField } = require('discord.js');
const { syncDatabase, MediaChannels } = require('../database.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        try {
            await syncDatabase();
            console.log('Database sync complete.');
        } catch (error) {
            console.error('Error during startup:', error);
        }
    },
};
