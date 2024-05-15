const { Events } = require('discord.js');
const { MediaChannels } = require('../database.js');
const DEBUG = false;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        try {
            const channelID = message.channel.id;
            const mc = await MediaChannels.findOne({ where: { channelID } });
            if (!mc) return;

            const hasAttachment = message.attachments.size > 0;
            const hasEmbed = message.embeds && message.embeds.length > 0;
            const inThread = message.thread !== null;
            const isThread = message.channel.isThread();

            let allAttachmentsAreMedia = true;
            if (hasAttachment) {
                message.attachments.forEach(attachment => {
                    const fileType = attachment.contentType || attachment.url.split('.').pop();
                    DEBUG && console.log(fileType);
                    if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
                        allAttachmentsAreMedia = false;
                    }
                });
            }

            DEBUG && console.log(`Attachment: ${hasAttachment}, Embed: ${hasEmbed}, Thread: ${isThread}, Media_OK: ${allAttachmentsAreMedia}`);
            if (!hasAttachment && !hasEmbed && !isThread || (!allAttachmentsAreMedia)) {
                await message.delete().catch(error => {
                    console.error('Failed to delete message:', error);
                });
            }
        } catch (error) {
            console.error('An error occurred in the message create event handler:', error);
        }
    },
};
