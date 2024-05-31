const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const DEBUG = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('media-restart')
        .setDescription('Restarts the bot. (Admin only)')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction) {
        DEBUG && console.log('Executing restart command...');

        const user = interaction.user;
        const guild = interaction.guild;

        if (!guild) {
            await interaction.reply({
                content: "This command can only be used within a server.",
                ephemeral: true
            });
            return;
        }

        const member = await guild.members.fetch(user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await interaction.reply({
                content: "You do not have permission to use this command.",
                ephemeral: true
            });
            return;
        }

        await interaction.reply({
            content: "Shutting down the bot...",
            ephemeral: true
        });

        DEBUG && console.log('Bot is shutting down...');
        process.exit(0);
    },
};
