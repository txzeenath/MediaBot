const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { MediaChannels } = require('../../database.js');
const DEBUG = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('media-cleanup')
        .setDescription('Scans the entire channel and deletes all non-media posts.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .setDMPermission(false),
    async execute(interaction) {
        const channel = interaction.channel;
        const guild = interaction.guild;
        const channelID = channel.id;
        const mc = await MediaChannels.findOne({ where: { channelID } });
        if (!mc) {
            await interaction.reply({
                content: "This channel is not a media-only channel.",
                ephemeral: true
            });
            return;
        }

        DEBUG && console.log('Executing media-cleanup command...');

        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "This command can only be used in a text channel.",
                ephemeral: true
            });
            return;
        }

        const botMember = await guild.members.fetch(interaction.client.user.id);
        const botPermissions = channel.permissionsFor(botMember);

        if (!botPermissions.has([
            PermissionsBitField.Flags.ManageMessages,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.ViewChannel
        ])) {
            await interaction.reply({
                content: "The bot does not have the necessary permissions to manage messages in this channel. Please ensure the bot has View Channel, Send Messages, and Manage Messages permissions. You may need to add the bot to the channel.",
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: "Scanning the channel for non-media posts. This may take a while...",
            ephemeral: true
        });

        try {
            let lastMessageId = null;
            let totalDeleted = 0;

            while (true) {
                const options = { limit: 100 };
                if (lastMessageId) {
                    options.before = lastMessageId;
                }

                const messages = await channel.messages.fetch(options);
                if (messages.size === 0) {
                    break;
                }

                for (const message of messages.values()) {
                    if (message.author.bot) {
                        DEBUG && console.log("Message was sent by the bot. Ignore.");
                        continue;
                    }
                    //if (hasManageMessagesPermission(message)) {
                    //    DEBUG && console.log("Message was sent by a mod/admin. Ignore.");
                    //    continue;
                    //}
                    const hasAttachment = message.attachments.size > 0;
                    const hasEmbed = message.embeds && message.embeds.length > 0;
                    const inThread = message.channel.isThread();

                    let allAttachmentsAreMedia = true;
                    if (hasAttachment) {
                        for (const attachment of message.attachments.values()) {
                            const fileType = attachment.contentType || attachment.url.split('.').pop();
                            DEBUG && console.log(fileType);
                            if (!fileType.startsWith('image/') && !fileType.startsWith('video/')) {
                                allAttachmentsAreMedia = false;
                                break;
                            }
                        }
                    }

                    let allEmbedsAreMedia = true;
                    if (hasEmbed) {
                        for (const embed of message.embeds) {
                            const embedData = embed.data;
                            if (embedData) {
                                const embedType = embedData.type;
                                if (embedType !== "image" && embedType !== "video" && embedType != "gifv") {
                                    allEmbedsAreMedia = false;
                                    break;
                                }
                            }
                        }
                    }

                    DEBUG && console.log(`Attachment: ${hasAttachment}, Embed: ${hasEmbed}, Thread: ${inThread}, Media_OK: ${allAttachmentsAreMedia}, Embed_OK: ${allEmbedsAreMedia}`);
                    if ((!hasAttachment && !hasEmbed && !inThread) || (!allAttachmentsAreMedia || !allEmbedsAreMedia)) {
                        try {
                            await message.delete();
                            totalDeleted++;
                        } catch (error) {
                            if (error.code !== 10008) {
                                console.error('Failed to delete message:', error);
                            }
                        }
                    }
                }

                if (messages.size < 100) {
                    break;
                }

                lastMessageId = messages.last().id;
            }

            await interaction.followUp({
                content: `Scan complete. Deleted ${totalDeleted} non-media messages.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('An error occurred while scanning the channel:', error);
            await interaction.followUp({
                content: "An error occurred while scanning the channel.",
                ephemeral: true
            });
        }
    }
};

//function hasManageMessagesPermission(message) {
//    return message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);
//}
