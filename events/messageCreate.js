const { Events } = require('discord.js');
const { MediaChannels } = require('../database.js');

module.exports = {
	name: Events.MessageCreate,
    once: false,
	async execute(message) {
        const channelID = message.channel.id;
        const mc = await MediaChannels.findOne({ where: { channelID } });
        if(!mc)
            return;
        hasAttachment = message.attachments.size > 0;
        hasEmbed = !message.embeds || message.embeds.length > 0;
        inThread = !message.thread;
        isThread = message.channel.isThread();
		console.log(`Attachment: ${hasAttachment}, Embed:${hasEmbed}, Thread:${isThread}`);
        if(!hasAttachment && !hasEmbed && !isThread)
            message.delete()
	},
};