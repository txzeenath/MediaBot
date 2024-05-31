const { Events } = require('discord.js');
const { MediaChannels, FlashChannels } = require('../database.js');
const DEBUG = true;

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) {
            DEBUG && console.log("Message was sent by the bot. Ignore.");
            return;
        }
        //if (hasManageMessagesPermission(message)) {
        //    DEBUG && console.log("Message was sent by a mod/admin. Ignore.");
        //    return;
        //}

        const channelID = message.channel.id;
        const mc = await MediaChannels.findOne({ where: { channelID } });
        const fc = await FlashChannels.findOne({ where: { channelID } });
        let deleteDelay = fc ? 120000 : 5000;

        if (fc) {
            DEBUG && console.log(`Flash: Waiting ${deleteDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, deleteDelay));
            await handleFlashChannel(message);
        }

        if (mc) {
            DEBUG && console.log(`Media: Waiting ${deleteDelay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, deleteDelay));
            await handleMediaChannel(message);
        }
    },
};

//function hasManageMessagesPermission(message) {
//    return message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
//}

async function handleFlashChannel(message) {
    const hasAttachment = message.attachments.size > 0;
    const hasEmbed = message.embeds.length > 0;
    const inThread = message.channel.isThread();

    if ((hasAttachment || hasEmbed) && !inThread) {
        await message.channel.send(`...and like that :face_exhaling:, ${message.author}'s post is gone.`);
        await deleteMessage(message);
    }
}

async function handleMediaChannel(message) {
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
            return embedType === "image" || embedType === "video";
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
