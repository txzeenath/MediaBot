const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const { FlashChannels } = require('../../database.js');
const DEBUG = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('media-flash')
        .setDescription('Toggles the current channel for flash media.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
        .setDMPermission(false),
    async execute(interaction) {
        const channel = interaction.channel;
        const guild = interaction.guild;

        DEBUG && console.log('Executing media-flash command...');

        if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({
                content: "This command can only be used in a text channel.",
                ephemeral: true
            });
            return;
        }

        if (channel.isThread()) {
            await interaction.reply({
                content: "Please use this command within the main channel, not a thread.",
                ephemeral: true
            });
            return;
        }

        const botMember = await guild.members.fetch(interaction.client.user.id);
        const botPermissions = channel.permissionsFor(botMember);

        if (
            !botPermissions.has([
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ViewChannel
            ])
        ) {
            await interaction.reply({
                content: "The bot does not have the necessary permissions to manage messages in this channel. Please ensure the bot has View Channel, Send Messages, and Manage Messages permissions. You may need to add the bot to the channel.",
                ephemeral: true
            });
            return;
        }

        try {
            const mc = await FlashChannels.findOne({ where: { channelID: channel.id } });
            let replyMessage;

            if (!mc) {
                await FlashChannels.create({ channelID: channel.id });
                replyMessage = "This channel is now set to flash media.";
            } else {
                await FlashChannels.destroy({ where: { channelID: channel.id } });
                replyMessage = "This channel is no longer set to flash media.";
            }

            await interaction.reply({
                content: replyMessage,
                ephemeral: true
            });
        } catch (error) {
            console.error('Database error:', error);
            await interaction.reply({
                content: "An error occurred while toggling the flash media setting.",
                ephemeral: true
            });
        }
    },
};
