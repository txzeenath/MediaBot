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
        let allAttachmentsAreMedia = true;
        if(hasAttachment){
            message.attachments.forEach(attachment => {
            const fileType = attachment.contentType || attachment.url.split('.').pop();
            console.log(fileType);
            if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
            allAttachmentsAreMedia = false;
            }
            });
        }

		console.log(`Attachment: ${hasAttachment}, Embed:${hasEmbed}, Thread:${isThread}, Media_OK:${allAttachmentsAreMedia}`);
        if(!hasAttachment && !hasEmbed && !isThread ||(!allAttachmentsAreMedia))
            message.delete()
	},
};