require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const HUB_CHANNEL_ID = "1536548935848562779";
const GUILD_ID = process.env.GUILD_ID || "1259387162655199332"; // Right-click your server icon in Discord > Copy Server ID

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
    console.log(`🚀 Logged in as ${client.user.tag}. Starting sync...`);

    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        await guild.roles.fetch();
        await guild.channels.fetch();

        const hubChannel = guild.channels.cache.get(HUB_CHANNEL_ID);
        if (!hubChannel) {
            console.error('❌ Could not find the Faction Leaders Hub channel. Check the channel ID.');
            process.exit(1);
        }

        const leaderRoles = guild.roles.cache.filter(r => r.name && r.name.startsWith('Faction Leader_'));

        if (leaderRoles.size === 0) {
            console.log('⚠️ No Faction Leader roles found on this server.');
            process.exit(0);
        }

        console.log(`🔎 Found ${leaderRoles.size} Faction Leader role(s). Applying permissions...`);

        for (const [, role] of leaderRoles) {
            try {
                await hubChannel.permissionOverwrites.create(role.id, {
                    ViewChannel: true,
                    SendMessages: true,
                    ReadMessageHistory: true,
                    UseApplicationCommands: true
                });
                console.log(`✅ Granted access: ${role.name}`);
            } catch (err) {
                console.error(`❌ Failed for role ${role.name}:`, err.message);
            }
        }

        console.log('🎉 Sync complete!');
        process.exit(0);
    } catch (err) {
        console.error('Fatal error during sync:', err);
        process.exit(1);
    }
});

client.login(process.env.DISCORD_TOKEN);