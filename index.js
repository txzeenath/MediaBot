const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { registerCommands } = require('./deploy-commands.js');
const DEBUG = false;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

DEBUG && console.log('Loading commands...');
for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                DEBUG && console.log(`Loaded command: ${command.data.name}`);
            } else {
                console.error(`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        } catch (error) {
            console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

DEBUG && console.log('Loading events...');
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    try {
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => {
                DEBUG && console.log(`Event (once) triggered: ${event.name}`);
                try {
                    event.execute(...args);
                } catch (error) {
                    console.error(`[ERROR] Error executing event (once) ${event.name}:`, error);
                }
            });
            DEBUG && console.log(`Loaded event (once): ${event.name}`);
        } else {
            client.on(event.name, (...args) => {
                DEBUG && console.log(`Event triggered: ${event.name}`);
                try {
                    event.execute(...args);
                } catch (error) {
                    console.error(`[ERROR] Error executing event ${event.name}:`, error);
                }
            });
            DEBUG && console.log(`Loaded event: ${event.name}`);
        }
    } catch (error) {
        console.error(`[ERROR] Failed to load event at ${filePath}:`, error);
    }
}

client.login(token).then(() => {
    DEBUG && console.log('Bot logged in successfully.');
    registerCommands().catch(error => {
        console.error('[ERROR] Failed to register commands:', error);
    });
}).catch(err => {
    console.error('Login error:', err);
});
