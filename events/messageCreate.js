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

            // Delay processing for 5 seconds. Sometimes links won't resolve to an embed immediately.
            DEBUG && console.log("Waiting 5 seconds...");
            await new Promise(resolve => setTimeout(resolve, 5000));

            const hasAttachment = message.attachments.size > 0;
            const hasEmbed = message.embeds && message.embeds.length > 0;
            const inThread = message.channel.isThread();

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

            let allEmbedsAreMedia = true;
            if (hasEmbed) {
                const fileExtensionsPattern = /\.(jpg|jpeg|png|gif|gifv|webm|mp4|wav|mp3|ogg)$/i;
                message.embeds.forEach((embed) => {
                    const url = embed.url;
                    const fileType = embed.contentType || url.split('.').pop();
                    DEBUG && console.log(fileType);
                    if (!fileExtensionsPattern.test(url)) {
                        allEmbedsAreMedia = false;
                    }
                });
            }

            DEBUG && console.log(`Attachment: ${hasAttachment}, Embed: ${hasEmbed}, Thread: ${inThread}, Media_OK: ${allAttachmentsAreMedia}, Ext: ${fileType}`);
            if (!hasAttachment && !hasEmbed && !inThread || (!allAttachmentsAreMedia || !allEmbedsAreMedia)) {
                await message.delete().catch(error => {
                    console.error('Failed to delete message:', error);
                });
            }
        } catch (error) {
            console.error('An error occurred in the message create event handler:', error);
        }
    },
};
