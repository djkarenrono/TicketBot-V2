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
    console.log('✅ All 5 slash commands registered successfully!');
  } catch (error) {
    console.error('Registration Failure:', error);
  }
})();