require('dotenv').config();
const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('setup-tickets')
    .setDescription('Spawns the colorful button panel for the general support ticket system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('setup-whitelist')
    .setDescription('Spawns the application selection panel for Standard and Beta Whitelisting.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('setup-factions')
    .setDescription('Spawns the application gateway panel for Once Bitten Faction Registration.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('setup-faction-apps')
    .setDescription('Spawns the public auto-updating recruitment panel for joining an existing faction.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('setup-origin-stories')
    .setDescription('Spawns the panel for Faction Leaders to post their Faction Origin Story.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('manage-factions')
    .setDescription('Open the faction management panel: delete or transfer factions.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('faction-status')
    .setDescription('Faction Leaders: set your faction\'s recruitment/invitation status.'),

  new SlashCommandBuilder()
    .setName('log-donation')
    .setDescription('Staff: log a donation entry for tracking purposes.')
    .addUserOption(option => option.setName('member').setDescription('The member the donation is from').setRequired(true))
    .addNumberOption(option => option.setName('amount').setDescription('Amount (PHP)').setRequired(true))
    .addAttachmentOption(option => option.setName('proof').setDescription('Screenshot or receipt of payment').setRequired(true))
    .addStringOption(option => option.setName('reference').setDescription('Reference number').setRequired(false))
    .addStringOption(option => option.setName('date').setDescription('Date (e.g. 2026-08-13). Defaults to today.').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName('donation-summary')
    .setDescription('Staff: view logged totals, or a specific member\'s history.')
    .addUserOption(option => option.setName('member').setDescription('View totals for a specific member only').setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Sending slash command configurations to Discord...');
    await rest.put(
      Routes.applicationCommands("1532893336921182339"),
      { body: commands }
    );
    console.log('✅ All 9 slash commands registered successfully!');
  } catch (error) {
    console.error('Registration Failure:', error);
  }
})();