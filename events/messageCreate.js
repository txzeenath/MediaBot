const { Events } = require('discord.js');
const { MediaChannels, FlashChannels } = require('../database.js');
const DEBUG = false;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) {
            DEBUG && console.log("Message was sent by the bot. Ignore.");
            return;
        }

        const channelID = message.channel.id;
        const [mc, fc] = await Promise.all([
            MediaChannels.findOne({ where: { channelID } }),
            FlashChannels.findOne({ where: { channelID } })
        ]);

        let deleteDelay = fc ? 120000 : 5000;

        DEBUG && console.log(`Waiting ${deleteDelay / 1000} seconds...`);

        await new Promise(resolve => setTimeout(resolve, deleteDelay));

        // Run both handlers concurrently and wait for both to complete
        await Promise.all([
            handleFlashChannel(message, fc),
            handleMediaChannel(message, mc)
        ]);
    },
};

async function handleFlashChannel(message, fc) {
    if (!fc) return;

    const hasAttachment = message.attachments.size > 0;
    const hasEmbed = message.embeds.length > 0;
    const inThread = message.channel.isThread();

    if ((hasAttachment || hasEmbed) && !inThread) {
        await message.channel.send(`...and like that :face_exhaling:, ${message.author}'s post is gone.`);
        await deleteMessage(message);
    }
}

async function handleMediaChannel(message, mc) {
    if (!mc) return;

    const hasAttachment = message.attachments.size > 0;
    const hasEmbed = message.embeds.length > 0;
    const inThread = message.channel.isThread();

    if (!hasAttachment && !hasEmbed && !inThread) {
        return await deleteMessage(message);
    }

    if (hasAttachment) {
        const allAttachmentsAreMedia = [...message.attachments.values()].every(attachment => {
            const fileType = attachment.contentType || attachment.url.split('.').pop();
            return fileType.startsWith('image/') || fileType.startsWith('video/');
        });

        if (!allAttachmentsAreMedia) {
            return await deleteMessage(message);
        }
    }

    if (hasEmbed) {
        const allEmbedsAreMedia = message.embeds.every(embed => {
            const embedType = embed.data?.type;
            DEBUG && console.log("Embed type: " + embedType);
            return embedType === "image" || embedType === "video" || embedType == "gifv";
        });

        if (!allEmbedsAreMedia) {
            return await deleteMessage(message);
        }
    }
}

async function deleteMessage(message) {
    try {
        await message.delete();
    } catch (error) {
        if (error.code !== 10008) {
            console.error('Failed to delete message:', error);
        }
    }
}
