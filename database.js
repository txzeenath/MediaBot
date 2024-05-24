const Sequelize = require('sequelize');
const { dbpassword } = require('./config.json');
const DEBUG = false;

const sequelize = new Sequelize('database', 'DerpBot', dbpassword, {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const FlashChannels = sequelize.define('FlashChannels', {
    channelID: {
        type: Sequelize.STRING,
        unique: true,
    }
});

const MediaChannels = sequelize.define('MediaChannels', {
    channelID: {
        type: Sequelize.STRING,
        unique: true,
    }
});

// Synchronize the model with the database
async function syncDatabase() {
    try {
        await sequelize.sync();
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to synchronize the database:', error);
    }
}

module.exports = { sequelize, MediaChannels, FlashChannels, syncDatabase };
