require('dotenv').config();
const http = require('http');
const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder
} = require('discord.js');

// ==========================================
// 🛠️ BOT CONFIGURATION DATA (ENVIRONMENT-MAPPED SETTINGS)
// ==========================================
const CONFIG = {
    WHITELIST_STAFF_ROLE_ID: process.env.WHITELIST_STAFF_ROLE_ID || "1532932367461781584",
    WHITELIST_CATEGORY_ID: process.env.WHITELIST_CATEGORY_ID || "1532903192596058243",
    WHITELIST_LOG_CHANNEL_ID: process.env.WHITELIST_LOG_CHANNEL_ID || "1533789189412229291",
    BETA_TESTER_ROLE_ID: process.env.BETA_TESTER_ROLE_ID || "1533724387625402479",
    BETA_WHITELIST_ENABLED: false, // 👈 flip this to false to disable Beta Whitelisting

    SUPPORT_STAFF_ROLE_ID: process.env.SUPPORT_STAFF_ROLE_ID || "1532932367461781584",
    SUPPORT_CATEGORY_ID: process.env.SUPPORT_CATEGORY_ID || "1259533239689810053",
    SUPPORT_LOG_CHANNEL_ID: process.env.SUPPORT_LOG_CHANNEL_ID || "1533547092470005981",

    FACTION_STAFF_ROLE_ID: process.env.FACTION_STAFF_ROLE_ID || "1532932367461781584",
    FACTION_APP_CATEGORY_ID: process.env.FACTION_APP_CATEGORY_ID || "1534277229083885698",
    FACTION_LOG_CHANNEL_ID: process.env.FACTION_LOG_CHANNEL_ID || "1534292895643861073",
    FACTION_JOIN_TICKETS_CATEGORY_ID: process.env.FACTION_JOIN_TICKETS_CATEGORY_ID || "1534277229083885698",
    FACTION_LIST_FORUM_ID: process.env.FACTION_LIST_FORUM_ID || "1534357448800862320",
    FACTION_LEADERS_HUB_CHANNEL_ID: process.env.FACTION_LEADERS_HUB_CHANNEL_ID || "1536548935848562779",

    DONATION_STAFF_ROLE_ID: process.env.DONATION_STAFF_ROLE_ID || "1532932367461781584",
    DONATION_LOG_CHANNEL_ID: process.env.DONATION_LOG_CHANNEL_ID || "1537290315839569980"
};

// Dummy web server for Render
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running safely online!\n');
}).listen(process.env.PORT || 3000, () => {
    console.log("🌐 Web server initialized to satisfy cloud hosting ports.");
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences
    ]
});

client.on('error', console.error);
process.on('unhandledRejection', error => console.error('Unhandled promise rejection:', error));

client.once('ready', () => {
    console.log("🚀 Bot is connected and online!");
});

// ==========================================
// 1. TEXT COMMANDS HANDLER
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    if (message.content === '!setup-tickets') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return;

        const embed = new EmbedBuilder()
            .setTitle('📝 OB Whitelist Application')
            .setDescription(`Click the button below to open your whitelist form application.`)
            .setColor(0x00FF00);

        const button = new ButtonBuilder().setCustomId('open_whitelist_modal').setLabel('Apply for Whitelisting').setStyle(ButtonStyle.Success);
        const row = new ActionRowBuilder().addComponents(button);
        await message.channel.send({ embeds: [embed], components: [row] });
        try { await message.delete(); } catch (e) { }
        return;
    }

    if (message.content === '!close') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply({ content: '❌ Only Administrators can close or delete application channels.' });
        }
        await message.channel.send({ content: '🔒 **Application Process Finished.** Permanent channel deletion in 5 seconds...' });
        setTimeout(() => message.channel.delete().catch(() => { }), 5000);
    }
});

// ==========================================
// 2. UNIFIED INTERACTION HANDLER
// ==========================================
client.on('interactionCreate', async (interaction) => {

    // --- A. SUPPORT TICKET SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-tickets') {
        const buttonRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_bug_report').setLabel('🐛 Bug Report').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('btn_server_issue').setLabel('💻 Server Issue').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('btn_player_report').setLabel('🚫 Player Report').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('btn_char_retrieval').setLabel('🛡️ Character Retrieval').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('btn_general_help').setLabel('❓ General Help').setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setTitle('🎟️ Helpdesk Support Center')
            .setDescription(
                `Need assistance? Please select the correct ticket category, provide clear details, and be patient while waiting for a response. The Once Bitten Staff Team will assist you as soon as possible.\n\n` +
                `🐛 **Bug Report**\n*Report bugs, glitches, exploits, or technical issues.*\n\n` +
                `💻 **Server Issue**\n*Get help with connection problems, server errors, or gameplay-related issues.*\n\n` +
                `🚫 **Player Report**\n*Report players who violate the server rules. Please include evidence whenever possible.*\n\n` +
                `🛡️ **Character Retrieval**\n*Request assistance with character recovery or other eligible character-related issues after server incidents.*\n\n` +
                `❓ **General Help**\n*Ask questions about the server, gameplay, whitelist, factions, donation inquiries, supporter perks, donation-related topics, or community features.*`
            )
            .setColor(0x5865F2);

        await interaction.reply({ embeds: [embed], components: [buttonRow] });
        return;
    }

    // --- B. WHITELIST SELECTION SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-whitelist') {
        const buttons = [
            new ButtonBuilder().setCustomId('open_standard_whitelist').setLabel('📝 Apply for Whitelisting').setStyle(ButtonStyle.Success)
        ];

        if (CONFIG.BETA_WHITELIST_ENABLED) {
            buttons.push(
                new ButtonBuilder().setCustomId('open_beta_whitelist').setLabel('🧪 Beta Test Whitelist').setStyle(ButtonStyle.Primary)
            );
        }

        const row = new ActionRowBuilder().addComponents(buttons);

        const embed = new EmbedBuilder()
            .setTitle('📋 Application Center')
            .setDescription(
                `⚠️ **Please read before applying:**\n` +
                `Please rename your Discord display name to match your exact in-game name.\n\n` +
                `Our Patient Zero bot requires your Discord name and in-game name to be the same in order to properly recognize and sync your account. This is required for features such as player tracking, rewards, achievements, and other server systems.\n\n` +
                `Once approved use \`/link\` command to link your In-Game Character to your Discord to fully utilize the shop. Failure to do so might affect your privileges for other features of our economy.\n\n` +
                `Select the type of whitelist application form you wish to open below.` +
                (CONFIG.BETA_WHITELIST_ENABLED ? '' : '\n\n🔒 *Beta Test Whitelisting is currently closed.*')
            )
            .setColor(0x00FF00);

        await interaction.reply({ embeds: [embed], components: [row] });
        return;
    }

    // --- C. FACTION REGISTRATION SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-factions') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_faction_modal').setLabel('🛡️ Register Faction').setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Faction Registration Application')
            .setDescription(
                `Faction leaders may use this application to officially register their faction within Once Bitten.\n\n` +
                `Please provide the following:\n` +
                `🏷️ Faction Name\n` +
                `🎮 In-Game Faction Tag (Maximum of 4 characters)\n` +
                `👑 Faction Leader In-Game Name\n` +
                `💬 Faction Leader Discord Username\n` +
                `🎨 Preferred Discord Role Color (Hex Code or Color Name)\n\n` +
                `Once submitted, the Once Bitten Staff Team will review your application. Approved factions will be officially registered, and the faction leader will receive the corresponding Discord faction role and access to a private faction channel.`
            )
            .setColor(0x34495E);

        await interaction.reply({ embeds: [embed], components: [row] });
        return;
    }

    // --- D. PUBLIC FACTION RECRUITMENT DYNAMIC LIVE ROLE SCANNER (BUG-FREE RESILIENT MATRIX) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-faction-apps') {
        const embed = new EmbedBuilder()
            .setTitle('👥 Apply to a Faction')
            .setDescription(
                `Looking for a group to survive with? Apply to join one of the officially registered factions in Once Bitten.\n\n` +
                `Before submitting your application:\n\n` +
                `🏴 **Choose the faction you wish to join.**\n` +
                `👤 **Provide your In-Game Name and Discord Username.**\n` +
                `🤝 **Wait for the faction leader to review your application.**\n\n` +
                `Once approved, you'll receive the corresponding Discord faction role and access to your faction's private channel.\n\n` +
                `*Good luck, Survivor!*`
            )
            .setColor(0x2ECC71);

        const selectionMenu = new StringSelectMenuBuilder()
            .setCustomId('join_faction_select')
            .setPlaceholder('Select a faction to join...');

        try {
            // Step 1: Initialize local server roles structure collection
            let serverRoles = interaction.guild.roles.cache;
            const serverChannels = interaction.guild.channels.cache;

            // Step 2: Fetch and sync roles if the cache is empty on Render startup
            if (!serverRoles || serverRoles.size <= 1) {
                const fetchedRolesCollection = await interaction.guild.roles.fetch().catch(() => null);
                if (fetchedRolesCollection) {
                    serverRoles = fetchedRolesCollection.cache;
                }
            }

            if (!serverRoles || serverRoles.size === 0) {
                return interaction.reply({ content: '❌ **System Error:** Internal gateway failed to initialize server memory maps.', ephemeral: true });
            }

            // Filter for factions matching the prefix string rule
            const activeLeaderRoles = serverRoles.filter(role => role.name && role.name.startsWith('Faction Leader_'));

            if (activeLeaderRoles.size === 0) {
                selectionMenu.addOptions([{ label: 'No Factions Registered Yet', value: 'none', description: 'Check back later!' }]);
            } else {
                const options = [];

                // 🌟 THE ULTIMATE FIX: Safely parse each role and skip errors instead of crashing the bot
                activeLeaderRoles.forEach(role => {
                    try {
                        const cleanFactionName = role.name.replace('Faction Leader_', '').trim();
                        if (!cleanFactionName) return; // Skip if the faction name is empty

                        // Skip factions that are closed for recruitment or invitation
                        const factionCategory = serverChannels.find(c => c.type === ChannelType.GuildCategory && c.name === `FACTION: ${cleanFactionName.toUpperCase()}`);
                        if (factionCategory) {
                            const factionTextChannel = serverChannels.find(c => c.parentId === factionCategory.id && c.type === ChannelType.GuildText);
                            if (factionTextChannel && factionTextChannel.topic && factionTextChannel.topic.startsWith('FACTION_STATUS::')) {
                                const currentStatus = factionTextChannel.topic.replace('FACTION_STATUS::', '').trim();
                                if (currentStatus === 'CLOSED_RECRUITMENT' || currentStatus === 'CLOSED_INVITATION') return;
                            }
                        }

                        // Find the matching member role tag by verifying the prefix and color match
                        const matchingMemberRole = serverRoles.find(r =>
                            r.name &&
                            r.name.startsWith('[') &&
                            r.name.endsWith('] Member') &&
                            r.color === role.color
                        );

                        let extractedTag = 'OB'; // Secure default fallback tag configuration
                        if (matchingMemberRole && matchingMemberRole.name.includes(']')) {
                            const rawTag = matchingMemberRole.name.split(']')[0];
                            extractedTag = rawTag.replace('[', '').trim();
                        }

                        // Generate a safe string value completely free of broken special characters
                        const cleanValueString = `join_${extractedTag}_${cleanFactionName.replace(/[^a-zA-Z0-9]/g, '-')}`;

                        options.push({
                            label: `${cleanFactionName} [${extractedTag}]`,
                            value: cleanValueString.substring(0, 100), // Enforce Discord's maximum character limit constraint rule
                            description: `Apply to join ${cleanFactionName}`
                        });
                    } catch (loopError) {
                        console.error(`Skipped malformed faction role definition [${role.name}]:`, loopError);
                    }
                });

                if (options.length === 0) {
                    selectionMenu.addOptions([{ label: 'No Factions Registered Yet', value: 'none', description: 'Check back later!' }]);
                } else {
                    selectionMenu.addOptions(options);
                }
            }

            const menuRow = new ActionRowBuilder().addComponents(selectionMenu);
            await interaction.reply({ embeds: [embed], components: [menuRow] });
        } catch (error) {
            console.error("Dynamic layout scanner mapping failure:", error);
            await interaction.reply({ content: '❌ System error processing faction dropdown list.', ephemeral: true });
        }
        return;
    }

    // --- E. SETUP ORIGIN STORIES SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-origin-stories') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_story_modal').setLabel('📜 Publish Faction Origin').setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle('📖 Faction Chronicles & Origin Stories')
            .setDescription(
                `Attention **Faction Leaders**!\n\n` +
                `Use this hub terminal to officially publish or update your faction's background history, lore, custom media, and current status.\n\n` +
                `🛡️ **Restriction Note:** This submission portal performs an automated profile analysis. Only verified Faction Leaders holding a registered \`Faction Leader_[Name]\` role can successfully access the publishing form.`
            )
            .setColor(0xD35400);

        await interaction.reply({ embeds: [embed], components: [row] });
        return;
    }

    // --- F. VERIFY ROLE AND DISPATCH STORY MODAL ---
    if (interaction.isButton() && interaction.customId === 'open_story_modal') {
        const leaderRoleObject = interaction.member.roles.cache.find(role => role.name.startsWith('Faction Leader_'));
        if (!leaderRoleObject) {
            return interaction.reply({ content: '❌ **Access Denied:** Only verified Faction Leaders holding an active `Faction Leader_[FactionName]` role can use this form.', ephemeral: true });
        }

        const extractedFactionName = leaderRoleObject.name.replace('Faction Leader_', '');
        const modal = new ModalBuilder().setCustomId(`storyform_${extractedFactionName}`).setTitle('Faction Origin & Recruitment Form');

        const titleInput = new TextInputBuilder().setCustomId('story_title').setLabel('Story Title / Post Headline').setStyle(TextInputStyle.Short).setPlaceholder('The Rise of...').setRequired(true);
        const loreInput = new TextInputBuilder().setCustomId('story_lore').setLabel('Faction History, Lore & Background').setStyle(TextInputStyle.Paragraph).setPlaceholder('Write your faction story here...').setRequired(true);

        // 🏷️ EXPLICIT THREE-WAY RECRUITMENT STATUS SELECTOR FIELD
        const recruitInput = new TextInputBuilder().setCustomId('story_recruit').setLabel('Status (OPEN / CLOSED / INVITE)').setStyle(TextInputStyle.Short).setMaxLength(10).setValue('OPEN').setPlaceholder('Type exactly: OPEN, CLOSED, or INVITE').setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(loreInput),
            new ActionRowBuilder().addComponents(recruitInput)
        );

        return interaction.showModal(modal).catch(console.error);
    }


    // --- G. PROCESS STORY FORM SUBMISSION & FORUM PUBLISH ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('storyform_')) {
        await interaction.deferReply({ ephemeral: true });
        const factionName = interaction.customId.replace('storyform_', '');
        const storyTitle = interaction.fields.getTextInputValue('story_title');
        const storyLore = interaction.fields.getTextInputValue('story_lore');

        // Convert input parsing checks to handle three distinct states: OPEN, CLOSED, or INVITE
        const recruitStatus = interaction.fields.getTextInputValue('story_recruit').toUpperCase().trim();

        let statusTagLabel = 'open for recruitment';
        let statusEmojiText = '🟢 **OPEN FOR RECRUITMENT**';

        if (recruitStatus === 'CLOSED') {
            statusTagLabel = 'closed';
            statusEmojiText = '🔴 **CLOSED TO APPLICANTS**';
        } else if (recruitStatus === 'INVITE' || recruitStatus === 'INVITATION') {
            statusTagLabel = 'invite only'; // Make sure this matches your exact Discord Forum tag bubble name layout text
            statusEmojiText = '🟡 **INVITE ONLY**';
        }

        try {
            const forumChannel = await interaction.guild.channels.fetch(CONFIG.FACTION_LIST_FORUM_ID).catch(() => null);
            if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) {
                return interaction.editReply({ content: '❌ System Error: Target Forum configuration ID mismatch.' });
            }

            // Dynamically scan for your three distinct tag structures in your forum channel settings
            const targetTag = forumChannel.availableTags.find(tag => tag.name.toLowerCase() === statusTagLabel) || null;
            const appliedTags = targetTag ? [targetTag.id] : [];

            const postContent = `## 📜 ${storyTitle}\n\n**Faction Name:** ${factionName}\n**Published By:** <@${interaction.user.id}>\n**Status:** ${statusEmojiText}\n\n### 📖 Faction History & Lore:\n${storyLore}\n\n🚨 **Interested?**\nHead over straight to the <#1534350906576076841> channel to select our faction and log your enlisting details officially!`;

            const forumPostThread = await forumChannel.threads.create({
                name: `${factionName} | ${storyTitle}`,
                message: { content: postContent },
                appliedTags: appliedTags,
                reason: 'Automated Chronicle Entry with Three-Way Recruitment Parse'
            });

            // 👑 PERMISSIONS ENGINE: Dynamic Edit Allocation Workspace
            try {
                // Fetch the dynamic faction leader role associated with this specific group
                const associatedLeaderRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === `faction leader_${factionName.toLowerCase()}`);

                // Construct permission override maps granting explicit editorial visibility rights
                await forumPostThread.permissionOverwrites.set([
                    {
                        id: interaction.guild.roles.everyone.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                        deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] // Keeps the forum read-only for public server lookers
                    },
                    {
                        // Grants full message modifications, chat, and attachment management permissions to your Server Staff
                        id: CONFIG.FACTION_STAFF_ROLE_ID,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ManageThreads,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    },
                    ...(associatedLeaderRole ? [{
                        // 🌟 THE FIX: Grants direct message sending, content editing, and file upload attachments to the faction's leader role profile
                        id: associatedLeaderRole.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    }] : []),
                    {
                        // Absolute fallback lock: Ensures the specific user account who posted retains active profile modification keys and upload privileges
                        id: interaction.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ManageMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.AttachFiles
                        ]
                    }
                ], `Editorial Access Provision for ${factionName} Chronicles Management`);

            } catch (permError) {
                console.warn("⚠️ Non-fatal boundary limitation: Unable to bind standalone thread-isolated permission overwrites.", permError);
            }

            await interaction.editReply({ content: `🎉 **Success!** Your Faction Origin Story has been published safely to the Forum! View here: ${forumPostThread}` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ System exception error while processing forum thread publishing.' });
        }
        return;
    }

    // --- H. DISPATCH SPLIT FACTION REGISTRATION FORM MODAL ---
    if (interaction.isButton() && interaction.customId === 'open_faction_modal') {
        const modal = new ModalBuilder().setCustomId('fac_form_submit').setTitle('Faction Registration Form');
        const nameInput = new TextInputBuilder().setCustomId('fac_name').setLabel('Faction Name').setStyle(TextInputStyle.Short).setRequired(true);
        const tagInput = new TextInputBuilder().setCustomId('fac_tag').setLabel('In-Game Faction Tag (Max 4 Characters)').setStyle(TextInputStyle.Short).setMaxLength(4).setRequired(true);
        const leaderIgnInput = new TextInputBuilder().setCustomId('fac_leader_ign').setLabel('Faction Leader In-Game Name').setStyle(TextInputStyle.Short).setRequired(true);
        const leaderDiscordInput = new TextInputBuilder().setCustomId('fac_leader_discord').setLabel('Faction Leader Discord Username').setStyle(TextInputStyle.Short).setPlaceholder('example_user').setRequired(true);
        const colorInput = new TextInputBuilder().setCustomId('fac_color').setLabel('Preferred Discord Role Color (Hex/Name)').setStyle(TextInputStyle.Short).setPlaceholder('#E74C3C or Red').setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(tagInput),
            new ActionRowBuilder().addComponents(leaderIgnInput),
            new ActionRowBuilder().addComponents(leaderDiscordInput),
            new ActionRowBuilder().addComponents(colorInput)
        );
        return interaction.showModal(modal).catch(console.error);
    }

    // --- I. PROCESS FACTION REGISTRATION FORM ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'fac_form_submit') {
        await interaction.deferReply({ ephemeral: true });
        try {
            const guild = interaction.guild;
            const member = interaction.user;
            const facName = interaction.fields.getTextInputValue('fac_name');
            const facTag = interaction.fields.getTextInputValue('fac_tag').toUpperCase();
            const facLeaderIgn = interaction.fields.getTextInputValue('fac_leader_ign');
            const facLeaderDiscord = interaction.fields.getTextInputValue('fac_leader_discord');
            const facColor = interaction.fields.getTextInputValue('fac_color');
            const randomNumber = Math.floor(1000 + Math.random() * 9000);

            let ticketChannel = await guild.channels.create({
                name: `faction-${facTag.toLowerCase()}-${randomNumber}`,
                type: ChannelType.GuildText,
                parent: CONFIG.FACTION_APP_CATEGORY_ID || null,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: CONFIG.FACTION_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ],
            });

            const dataEmbed = new EmbedBuilder()
                .setTitle('🛡️ Faction Registration Submitted')
                .setDescription(`Submitted by Faction Applicant: <@${member.id}>`)
                .addFields(
                    { name: '🏷️ Faction Name', value: facName, inline: true },
                    { name: '🎮 Faction Tag', value: `[${facTag}]`, inline: true },
                    { name: '👑 Leader IGN', value: facLeaderIgn, inline: true },
                    { name: '💬 Leader Discord ID', value: `${facLeaderDiscord}`, inline: true },
                    { name: '🎨 Requested Color', value: facColor, inline: true }
                )
                .setColor(0xE67E22)
                .setTimestamp();

            const cleanColor = facColor.replace('#', '');
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`fac_approve_${member.id}_${facTag}_${facName.replace(/[^a-zA-Z0-9 ]/g, '')}_${cleanColor}`).setLabel('✅ Approve Faction').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`fac_reject_${member.id}`).setLabel('❌ Reject').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('fac_close_channel').setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({
                content: `🔔 **Attention <@&${CONFIG.FACTION_STAFF_ROLE_ID}>:** Verify this faction registration request.`,
                embeds: [dataEmbed],
                components: [actionRow]
            });

            await interaction.editReply({ content: `✅ **Faction Form Logged!** Ticket created: ${ticketChannel}` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ System error processing registration channel.' });
        }
        return;
    }
    // --- J. HANDLE STAFF FACTION APPROVAL & INFRASTRUCTURE AUTOMATION ---
    if (interaction.isButton() && interaction.customId.startsWith('fac_')) {
        const isStaff = interaction.member.roles.cache.has(CONFIG.FACTION_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can process faction registrations.', ephemeral: true });

        const logChannel = await interaction.guild.channels.fetch(CONFIG.FACTION_LOG_CHANNEL_ID).catch(() => null);

        if (interaction.customId.startsWith('fac_approve_')) {
            const parts = interaction.customId.split('_');
            const targetUserId = parts[2];
            const tag = parts[3].toUpperCase();
            const factionName = parts[4];
            let colorHex = parts[5];

            if (!colorHex.startsWith('#') && colorHex.length === 6 && !isNaN(parseInt(colorHex, 16))) {
                colorHex = `#${colorHex}`;
            }

            await interaction.reply({ content: '⚙️ Spawning Faction Category Workspace...' });

            try {
                const guild = interaction.guild;
                const leaderRole = await guild.roles.create({
                    name: `Faction Leader_${factionName}`,
                    color: colorHex || '#95A5A6',
                    reason: 'Faction Auto-Setup'
                });

                const generalRole = await guild.roles.create({
                    name: `[${tag}] Member`,
                    color: colorHex || '#95A5A6',
                    reason: 'Faction Auto-Setup'
                });

                const leaderMember = await guild.members.fetch(targetUserId).catch(() => null);
                if (leaderMember) {
                    await leaderMember.roles.add(leaderRole);
                    await leaderMember.roles.add(generalRole);
                }

                // Grant this new Faction Leader role access to the Faction Leaders Hub channel
                try {
                    const hubChannel = await guild.channels.fetch(CONFIG.FACTION_LEADERS_HUB_CHANNEL_ID).catch(() => null);
                    if (hubChannel) {
                        await hubChannel.permissionOverwrites.create(leaderRole.id, {
                            ViewChannel: true,
                            SendMessages: true,
                            ReadMessageHistory: true,
                            UseApplicationCommands: true
                        });
                    }
                } catch (hubErr) {
                    console.warn('⚠️ Could not grant new leader role access to Faction Leaders Hub:', hubErr);
                }

                // Grant this new Faction Leader role access to post and attach media in the Faction Origin Story forum
                try {
                    const originForum = await guild.channels.fetch(CONFIG.FACTION_LIST_FORUM_ID).catch(() => null);
                    if (originForum) {
                        await originForum.permissionOverwrites.create(leaderRole.id, {
                            ViewChannel: true,
                            ReadMessageHistory: true,
                            CreatePublicThreads: true,
                            SendMessagesInThreads: true,
                            AttachFiles: true,
                            EmbedLinks: true
                        });
                    }
                } catch (forumErr) {
                    console.warn('⚠️ Could not grant new leader role access to Faction Origin Story forum:', forumErr);
                }

                const factionCategory = await guild.channels.create({
                    name: `FACTION: ${factionName.toUpperCase()}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                        {
                            id: leaderRole.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.Speak,
                                PermissionFlagsBits.UseVAD
                            ]
                        },
                        {
                            id: generalRole.id,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.Speak,
                                PermissionFlagsBits.UseVAD
                            ]
                        },
                        {
                            id: CONFIG.FACTION_STAFF_ROLE_ID,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.AttachFiles,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.Connect,
                                PermissionFlagsBits.Speak,
                                PermissionFlagsBits.UseVAD
                            ]
                        }
                    ]
                });

                await guild.channels.create({ name: `${tag.toLowerCase()}-chatbox`, type: ChannelType.GuildText, parent: factionCategory.id });
                await guild.channels.create({ name: `🔊 ${tag}`, type: ChannelType.GuildVoice, parent: factionCategory.id });

                await interaction.editReply({ content: `✅ **Faction Completed Deployed!** Standalone parent workspace generated: ${factionCategory}` });

                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('🟢 Faction Registration Approved')
                        .setDescription(`The faction **${factionName}** [${tag}] has been approved.`)
                        .setColor(0x2ECC71)
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }

                setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            } catch (err) {
                console.error(err);
                await interaction.editReply({ content: '❌ System error during building role/channel nodes.' });
            }
            return;
        }

        if (interaction.customId.startsWith('fac_reject_')) {
            await interaction.reply({ content: '❌ Faction request rejected.' });
            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }

        if (interaction.customId === 'fac_close_channel') {
            await interaction.reply({ content: '🔒 Closing registration workspace thread...' });
            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }
    }

    // --- K. PROCESS DROPDOWN TO JOIN EXISTING FACTION ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'join_faction_select') {
        const val = interaction.values[0];
        if (val === 'none') return interaction.reply({ content: '❌ There are no active factions to join yet.', ephemeral: true });

        // Extract parameters safely from selection menu values
        const parts = val.split('_');
        const tag = parts[1];
        const factionName = parts[2].replace(/-/g, ' ');

        // Open the dynamic user application form modal
        const modal = new ModalBuilder().setCustomId(`joinform_${tag}_${parts[2]}`).setTitle(`Apply to ${factionName}`);
        const ignInput = new TextInputBuilder().setCustomId('join_ign').setLabel('Your In-Game Survivor Name').setStyle(TextInputStyle.Short).setRequired(true);
        const dcInput = new TextInputBuilder().setCustomId('join_discord').setLabel('Your Discord Username').setStyle(TextInputStyle.Short).setValue(interaction.user.username).setRequired(true);
        const reasonInput = new TextInputBuilder().setCustomId('join_reason').setLabel('Why do you want to join us?').setStyle(TextInputStyle.Paragraph).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(ignInput),
            new ActionRowBuilder().addComponents(dcInput),
            new ActionRowBuilder().addComponents(reasonInput)
        );
        await interaction.showModal(modal);
        return;
    }

    // --- L. HANDLE COMPLETED RECRUITMENT FORM SUBMISSION ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('joinform_')) {
        await interaction.deferReply({ ephemeral: true });

        const parts = interaction.customId.split('_');
        const tag = parts[1];
        const factionName = parts[2].replace(/-/g, ' ');

        const joinIgn = interaction.fields.getTextInputValue('join_ign');
        const joinDiscord = interaction.fields.getTextInputValue('join_discord');
        const joinReason = interaction.fields.getTextInputValue('join_reason');

        try {
            const guild = interaction.guild;
            const applicantUser = interaction.user;

            // Target the specific Faction Leader role for this selected group
            const targetLeaderRole = guild.roles.cache.find(r => r.name.toLowerCase() === `faction leader_${factionName.toLowerCase()}`);
            const leaderPing = targetLeaderRole ? `<@&${targetLeaderRole.id}>` : 'Faction Leaders';

            const randomNumber = Math.floor(1000 + Math.random() * 9000);

            // Build a private isolation thread ticket inside your recruitment category workspace
            let joinTicket = await guild.channels.create({
                name: `join-${tag.toLowerCase()}-${randomNumber}`,
                type: ChannelType.GuildText,
                parent: CONFIG.FACTION_JOIN_TICKETS_CATEGORY_ID || null,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: applicantUser.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    // Secure Channel Access Isolation: Only the exact leader role can view this ticket
                    ...(targetLeaderRole ? [{ id: targetLeaderRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }] : [])
                ]
            });

            const embed = new EmbedBuilder()
                .setTitle(`👥 New Faction Application: ${factionName}`)
                .setDescription(
                    `A new survivor wants to join your ranks. Faction Leaders can review the details below:\n\n` +
                    `🎮 **In-Game Name:** ${joinIgn}\n` +
                    `💬 **Discord Username:** \`${joinDiscord}\`\n\n` +
                    `📋 **Reason for Enlistment:**\n${joinReason}`
                )
                .setColor(0x3498DB)
                .setTimestamp();

            // Secure action buttons mapping the specific applicant ID and Faction Tag properties
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`rec_approve_${applicantUser.id}_${tag}`).setLabel('✅ Accept Member').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`rec_reject_${applicantUser.id}_${tag}`).setLabel('❌ Reject Applicant').setStyle(ButtonStyle.Danger)
            );

            await joinTicket.send({
                content: `🔔 **Attention ${leaderPing}:** A new membership request requires your evaluation.`,
                embeds: [embed],
                components: [actionRow]
            });

            await interaction.editReply({ content: `✅ **Application Submitted!** Your private review ticket channel has been opened: ${joinTicket}` });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ System error processing your recruitment entry ticket layout.' });
        }
        return;
    }

    // --- M. HANDLE FACTION LEADER ADMISSION ACTION BUTTONS ---
    if (interaction.isButton() && interaction.customId.startsWith('rec_')) {
        const parts = interaction.customId.split('_');
        const action = parts[1];        // 'approve' or 'reject'
        const targetUserId = parts[2];  // Applicant User ID
        const tag = parts[3];           // Faction Tag uppercase

        // Secure Audit Check: Ensure the user clicking holds the required Leader Role or Administrator permission
        const leaderRoleCheck = interaction.member.roles.cache.find(role => role.name.startsWith('Faction Leader_'));
        const isServerAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

        if (!leaderRoleCheck && !isServerAdmin) {
            return interaction.reply({ content: '❌ **Access Denied:** Only the designated Faction Leader or Server Staff can handle this application.', ephemeral: true });
        }

        const teamRole = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === `[${tag.toLowerCase()}] member`);
        const applicant = await interaction.guild.members.fetch(targetUserId).catch(() => null);

        if (action === 'approve') {
            await interaction.reply({ content: '⚙️ **Application Approved!** Enrolling survivor and setting up memberships...' });

            try {
                if (applicant && teamRole) {
                    // Automatically add the verified general membership role tag to the applicant profile
                    await applicant.roles.add(teamRole);
                    await applicant.send(`🎉 **Great news, Survivor!** Your application to enlist with **[${tag}]** has been officially approved by the Faction Leader! You now have access to your group's private workspace.`).catch(() => { });
                }

                await interaction.editReply({ content: '✅ **Success!** Survivor role assigned. Closing workspace channel...' });
                setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            } catch (roleErr) {
                console.error(roleErr);
                await interaction.editReply({ content: '❌ **System Error:** Failed to grant role. Check bot hierarchy placement.' });
            }
            return;
        }

        if (action === 'reject') {
            await interaction.reply({ content: '❌ **Applicant Rejected.** Cleaning up workspace thread...' });
            if (applicant) {
                await applicant.send(`🛑 **Notice:** Your application request to enlist with the faction **[${tag}]** has been declined by their leadership.`).catch(() => { });
            }
            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }
    }
    // --- N. WHITELIST AGREEMENT LOGIC ENGINES ---
    if (interaction.isButton() && (interaction.customId === 'open_standard_whitelist' || interaction.customId === 'open_beta_whitelist')) {
        const isBeta = interaction.customId === 'open_beta_whitelist';

        if (isBeta && !CONFIG.BETA_WHITELIST_ENABLED) {
            return interaction.reply({ content: '🔒 Beta Test Whitelisting is currently closed. Please check back later.', ephemeral: true });
        }

        const agreementEmbed = new EmbedBuilder();

        if (isBeta) {
            agreementEmbed.setTitle('🧪 Beta Server Test Whitelist Agreement')
                .setDescription(`By submitting your whitelist application, you confirm that you accept these terms:\n\n• You are joining a beta testing environment that is still under development.\n• Character progress, inventories, bases, vehicles, factions, and world data may be reset or wiped at any time during beta testing.`)
                .setColor(0x9B59B6);
        } else {
            agreementEmbed.setTitle('⚠️ Whitelist Agreement')
                .setDescription(`By submitting a whitelist application to Once Bitten, you agree to abide by all server Rules and community moderation standards.\n\nBy continuing, you confirm that you are ready to become a responsible member of the Once Bitten community.`)
                .setColor(0xF1C40F);
        }

        const agreementRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`agree_wl_${isBeta ? 'beta' : 'std'}`).setLabel('I Agree & Continue').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('disagree_wl').setLabel('I Disagree').setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({ embeds: [agreementEmbed], components: [agreementRow], ephemeral: true });
        return;
    }

    if (interaction.isButton() && interaction.customId === 'disagree_wl') {
        await interaction.reply({ content: '❌ You must accept the rules to apply.', ephemeral: true });
        return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('agree_wl_')) {
        const isBeta = interaction.customId.endsWith('beta');
        const modal = new ModalBuilder().setCustomId(isBeta ? 'wl_form_beta' : 'wl_form_standard').setTitle('Identity Whitelist Form');

        const steamIdInput = new TextInputBuilder().setCustomId('wl_steamid').setLabel('SteamID').setStyle(TextInputStyle.Short).setRequired(true);
        const usernameInput = new TextInputBuilder().setCustomId('wl_username').setLabel('In-Game Username (must match Discord)').setStyle(TextInputStyle.Short).setPlaceholder('Must be exactly the same as your Discord name').setRequired(true);
        const passwordInput = new TextInputBuilder().setCustomId('wl_password').setLabel('Server Password (Once Bitten only!)').setStyle(TextInputStyle.Short).setPlaceholder('Do NOT reuse your Steam/social media password').setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(steamIdInput),
            new ActionRowBuilder().addComponents(usernameInput),
            new ActionRowBuilder().addComponents(passwordInput)
        );

        return interaction.showModal(modal).catch(console.error);
    }

    // --- O. PROCESSING MODAL MATRIX PASS-THROUGH LOGS FOR WHITELIST SUBMISSIONS ---
    if (interaction.type === InteractionType.ModalSubmit && (interaction.customId === 'wl_form_standard' || interaction.customId === 'wl_form_beta')) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const guild = interaction.guild;
            const member = interaction.user;
            const isBeta = interaction.customId === 'wl_form_beta';
            const steamId = interaction.fields.getTextInputValue('wl_steamid');
            const username = interaction.fields.getTextInputValue('wl_username');
            const password = interaction.fields.getTextInputValue('wl_password');
            const randomNumber = Math.floor(1000 + Math.random() * 9000);

            let ticketChannel = await guild.channels.create({
                name: `${isBeta ? 'beta' : 'apply'}-${randomNumber}`,
                type: ChannelType.GuildText,
                parent: CONFIG.WHITELIST_CATEGORY_ID || null,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: CONFIG.WHITELIST_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
                ],
            });

            const dataEmbed = new EmbedBuilder()
                .setTitle(isBeta ? '🧪 Beta Application Submitted' : '📋 Whitelist Application Submitted')
                .addFields(
                    { name: 'SteamID', value: steamId },
                    { name: 'Username', value: username },
                    { name: 'Password', value: password }
                )
                .setColor(0x3498DB)
                .setTimestamp();

            await member.send({ embeds: [dataEmbed] }).catch(() => { });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`wl_approve_${member.id}_${isBeta ? 'beta' : 'std'}`).setLabel('✅ Approve').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`wl_reject_${member.id}`).setLabel('❌ Reject').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('wl_close_channel').setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({
                content: `🔔 **Attention <@&${CONFIG.WHITELIST_STAFF_ROLE_ID}>:** New ${isBeta ? 'Beta' : 'Standard'} Whitelist application submitted by <@${member.id}>.\n\n📌 <@${member.id}>, please wait for **Hamlet** or **Yuuko** to review your application. Thank you for your patience!`,
                embeds: [dataEmbed],
                components: [actionRow]
            });

            // DM every staff member holding the Whitelist Staff role
            try {
                await guild.members.fetch();
                const staffMembers = guild.members.cache.filter(m => m.roles.cache.has(CONFIG.WHITELIST_STAFF_ROLE_ID));
                for (const [, staffMember] of staffMembers) {
                    await staffMember.send(`🔔 **New ${isBeta ? 'Beta' : 'Standard'} Whitelist Application**\nSubmitted by: ${member.tag}\nTicket: ${ticketChannel}`).catch(() => { });
                }
            } catch (dmErr) {
                console.warn('⚠️ Could not DM staff role members:', dmErr);
            }

            await interaction.editReply({ content: `✅ Application sent! Channel opened: ${ticketChannel}` });
        } catch (err) {
            console.error(err);
        }
        return;
    }

    // --- P. HANDLE STAFF WHITELIST ACTION BUTTONS ---
    if (interaction.isButton() && interaction.customId.startsWith('wl_')) {
        const isStaff = interaction.member.roles.cache.has(CONFIG.WHITELIST_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can process applications.', ephemeral: true });

        const logChannel = await interaction.guild.channels.fetch(CONFIG.WHITELIST_LOG_CHANNEL_ID).catch(() => null);

        if (interaction.customId.startsWith('wl_approve_')) {
            const parts = interaction.customId.split('_');
            const targetUserId = parts[2];
            const type = parts[3];

            await interaction.reply({ content: '✅ Application Approved. Processing permissions and closing thread...' });
            const targetUser = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            let roleStatusText = "";

            if (type === 'beta') {
                if (targetUser) {
                    try {
                        await targetUser.roles.add(CONFIG.BETA_TESTER_ROLE_ID);
                        roleStatusText = "\n⚡ Beta Server Tester role automatically granted.";
                    } catch (roleError) {
                        console.error("Failed to assign beta role:", roleError);
                        roleStatusText = "\n⚠️ Failed to grant Beta role. Check bot role hierarchy ranking.";
                    }
                }
            }

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🟢 Whitelist Approved')
                    .setDescription(`User <@${targetUserId}> has been **Approved** for **${type === 'beta' ? 'Beta Access' : 'Standard Whitelist'}**.${roleStatusText}`)
                    .addFields({ name: 'Processed By', value: `<@${interaction.user.id}>` })
                    .setColor(0x2ECC71)
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            if (targetUser) {
                const dmMessage = type === 'beta'
                    ? `🎉 **Congratulations!** Your Beta Test application on **${interaction.guild.name}** has been approved!`
                    : `🎉 **Congratulations!** Your whitelist application on **${interaction.guild.name}** has been approved by our staff team!`;
                await targetUser.send(dmMessage).catch(() => { });
            }

            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }

        if (interaction.customId.startsWith('wl_reject_')) {
            const targetUserId = interaction.customId.split('_')[2];
            await interaction.reply({ content: '❌ Application Rejected. Channel will close shortly.' });

            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔴 Whitelist Denied')
                    .setDescription(`User <@${targetUserId}> has been **Rejected**.`)
                    .addFields({ name: 'Processed By', value: `<@${interaction.user.id}>` })
                    .setColor(0xE74C3C)
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }

            const targetUser = await interaction.guild.members.fetch(targetUserId).catch(() => null);
            if (targetUser) {
                await targetUser.send(`🛑 **Notice:** Your recent whitelist application on **${interaction.guild.name}** has been denied by our staff team.`).catch(() => { });
            }

            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }

        if (interaction.customId === 'wl_close_channel') {
            await interaction.reply({ content: '🔒 Closing application workspace. Permanent deletion in 5 seconds...' });
            setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
            return;
        }
    }
    // --- Q. GENERAL SUPPORT SYSTEM: BUTTON DETECTOR ---
    if (interaction.isButton() && interaction.customId.startsWith('btn_')) {
        const choice = interaction.customId.replace('btn_', '');
        const modal = new ModalBuilder().setCustomId(`modal_${choice}`).setTitle('Support Helpdesk Form');
        const input1 = new TextInputBuilder().setCustomId('general_desc').setLabel('Provide full description').setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input1));
        await interaction.showModal(modal);
        return;
    }

    // --- R. GENERAL SUPPORT SYSTEM: HANDLE FORM SUBMISSIONS ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId.startsWith('modal_')) {
        if (interaction.customId === 'close_reason_modal') return;
        await interaction.deferReply({ ephemeral: true });
        const ticketType = interaction.customId.replace('modal_', '');
        const usernameId = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, '');

        const channel = await interaction.guild.channels.create({
            name: `${ticketType}-${usernameId}`,
            type: ChannelType.GuildText,
            parent: CONFIG.SUPPORT_CATEGORY_ID || null,
            permissionOverwrites: [
                { id: interaction.guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                },
                {
                    id: CONFIG.SUPPORT_STAFF_ROLE_ID,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.EmbedLinks
                    ]
                }
            ]
        });

        const infoEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket Form: ${ticketType.toUpperCase()}`)
            .setDescription(`Created by <@${interaction.user.id}>\n\n**Details Provided:**\n${interaction.fields.getTextInputValue('general_desc')}\n\n📎 *You can attach screenshots, video clips, or other files directly in this channel to help staff assist you.*`)
            .setColor(0xE74C3C)
            .setTimestamp();

        const closeBtnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('init_close').setLabel('🔒 Close Ticket').setStyle(ButtonStyle.Danger)
        );

        await channel.send({
            content: `Welcome <@${interaction.user.id}> | Support Staff <@&${CONFIG.SUPPORT_STAFF_ROLE_ID}> have been pinged.`,
            embeds: [infoEmbed],
            components: [closeBtnRow]
        });

        await interaction.editReply({ content: `Your support ticket has been opened here: ${channel}` });
        return;
    }

    // --- S. GENERAL SUPPORT SYSTEM: BUTTON OVERRIDE CLOSE SYSTEM ---
    if (interaction.isButton() && interaction.customId === 'init_close') {
        const isAdmin = interaction.member.roles.cache.has(CONFIG.SUPPORT_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (isAdmin) {
            await interaction.reply({ content: '⚠️ Staff Override Active: Archiving historical messages and deleting...' });
            await compileTranscript(interaction.channel, interaction.user.tag, 'Staff Managed Force-Close Override');
            setTimeout(() => interaction.channel.delete().catch(() => { }), 4000);
        } else {
            const modal = new ModalBuilder().setCustomId('close_reason_modal').setTitle('Reason for Closing');
            const reasonInput = new TextInputBuilder().setCustomId('close_reason').setLabel('Why are you closing this ticket?').setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
            await interaction.showModal(modal);
        }
        return;
    }

    // --- T. GENERAL SUPPORT SYSTEM: PROCESS USER CLOSING SUBMISSION ---
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'close_reason_modal') {
        const reason = interaction.fields.getTextInputValue('close_reason');
        await interaction.reply({ content: `🛑 Close logged by member. \n**Reason:** ${reason}\nChannel disappearing in 5 seconds...` });
        await compileTranscript(interaction.channel, interaction.user.tag, reason);
        setTimeout(() => interaction.channel.delete().catch(() => { }), 5000);
        return;
    }

    // --- U. MANAGE FACTIONS SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'manage-factions') {
        const isStaff = interaction.member.roles.cache.has(CONFIG.FACTION_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can manage factions.', ephemeral: true });

        let serverRoles = interaction.guild.roles.cache;
        if (!serverRoles || serverRoles.size <= 1) {
            const fetched = await interaction.guild.roles.fetch().catch(() => null);
            if (fetched) serverRoles = fetched.cache;
        }

        const leaderRoles = serverRoles.filter(r => r.name && r.name.startsWith('Faction Leader_'));

        if (leaderRoles.size === 0) {
            return interaction.reply({ content: '❌ No registered factions found.', ephemeral: true });
        }

        const options = leaderRoles.map(role => ({
            label: role.name.replace('Faction Leader_', '').substring(0, 100),
            value: role.id,
            description: 'Manage this faction'
        })).slice(0, 25);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('mf_select_faction')
            .setPlaceholder('Select a faction to manage...')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: '🛠️ **Faction Management Panel** — select a faction below:', components: [row], ephemeral: true });
        return;
    }

    // --- V. MANAGE FACTIONS: FACTION SELECTED, SHOW ACTIONS ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'mf_select_faction') {
        const roleId = interaction.values[0];
        const leaderRole = interaction.guild.roles.cache.get(roleId);
        if (!leaderRole) return interaction.update({ content: '❌ That faction role no longer exists.', components: [] });

        const factionName = leaderRole.name.replace('Faction Leader_', '');

        const embed = new EmbedBuilder()
            .setTitle(`🛠️ Managing: ${factionName}`)
            .setDescription('Choose an action below. Destructive actions will ask for confirmation.')
            .setColor(0xE67E22);

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mf_delroles_${roleId}`).setLabel('🗑️ Delete Roles Only').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`mf_delchan_${roleId}`).setLabel('🗑️ Delete Channels Only').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`mf_delall_${roleId}`).setLabel('🗑️ Delete Everything').setStyle(ButtonStyle.Danger)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mf_transfer_${roleId}`).setLabel('🔄 Transfer Leadership').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({ content: '', embeds: [embed], components: [row1, row2] });
        return;
    }

    // --- W. MANAGE FACTIONS: ASK FOR CONFIRMATION ---
    if (interaction.isButton() && (interaction.customId.startsWith('mf_delroles_') || interaction.customId.startsWith('mf_delchan_') || interaction.customId.startsWith('mf_delall_'))) {
        const [, actionRaw, roleId] = interaction.customId.split('_');
        const action = actionRaw.replace('del', '');
        const leaderRole = interaction.guild.roles.cache.get(roleId);
        const factionName = leaderRole ? leaderRole.name.replace('Faction Leader_', '') : 'Unknown';

        const warnings = {
            roles: 'This will permanently delete the **Faction Leader** and **Member** roles. Members will lose access immediately.',
            chan: 'This will permanently delete the faction **category, text channel, and voice channel**.',
            all: 'This will permanently delete the **roles, category, and all channels** for this faction. This cannot be undone.'
        };

        const embed = new EmbedBuilder()
            .setTitle(`⚠️ Confirm: ${factionName}`)
            .setDescription(warnings[action] || 'Are you sure?')
            .setColor(0xE74C3C);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mf_confirm_${action}_${roleId}`).setLabel('✅ Yes, Proceed').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('mf_cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({ embeds: [embed], components: [row] });
        return;
    }

    if (interaction.isButton() && interaction.customId === 'mf_cancel') {
        await interaction.update({ content: '❌ Action cancelled.', embeds: [], components: [] });
        return;
    }

    // --- X. MANAGE FACTIONS: EXECUTE DELETION ---
    if (interaction.isButton() && interaction.customId.startsWith('mf_confirm_')) {
        const parts = interaction.customId.split('_');
        const action = parts[2];
        const roleId = parts[3];
        const guild = interaction.guild;

        const leaderRole = guild.roles.cache.get(roleId);
        if (!leaderRole) return interaction.update({ content: '❌ That faction role no longer exists.', embeds: [], components: [] });

        const factionName = leaderRole.name.replace('Faction Leader_', '');
        const memberRole = guild.roles.cache.find(r => r.name && r.name.endsWith('] Member') && r.color === leaderRole.color);
        const category = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === `FACTION: ${factionName.toUpperCase()}`);

        await interaction.update({ content: `⚙️ Processing deletion for **${factionName}**...`, embeds: [], components: [] });

        let logLines = [];

        try {
            if (action === 'roles' || action === 'all') {
                if (leaderRole) { await leaderRole.delete('Faction management: deleted by staff').catch(() => { }); logLines.push('Leader role deleted.'); }
                if (memberRole) { await memberRole.delete('Faction management: deleted by staff').catch(() => { }); logLines.push('Member role deleted.'); }
            }

            if (action === 'chan' || action === 'all') {
                if (category) {
                    const children = guild.channels.cache.filter(c => c.parentId === category.id);
                    for (const [, ch] of children) await ch.delete().catch(() => { });
                    await category.delete().catch(() => { });
                    logLines.push('Category and channels deleted.');
                } else {
                    logLines.push('⚠️ No matching category found to delete.');
                }
            }

            await interaction.editReply({ content: `✅ **Done.**\n${logLines.join('\n')}` });

            const logChannel = await guild.channels.fetch(CONFIG.FACTION_LOG_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🗑️ Faction Removed')
                    .setDescription(`**${factionName}** was modified by <@${interaction.user.id}>.\n${logLines.join('\n')}`)
                    .setColor(0xE74C3C)
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Error occurred during deletion. Some items may not have been removed.' });
        }
        return;
    }

    // --- Y. MANAGE FACTIONS: TRANSFER LEADERSHIP - OPEN USER PICKER ---
    if (interaction.isButton() && interaction.customId.startsWith('mf_transfer_') && !interaction.customId.startsWith('mf_transfer_select')) {
        const roleId = interaction.customId.replace('mf_transfer_', '');
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId(`mf_transferselect_${roleId}`)
            .setPlaceholder('Select the new Faction Leader...');

        const row = new ActionRowBuilder().addComponents(userSelect);
        await interaction.update({ content: '🔄 **Select the new Faction Leader:**', embeds: [], components: [row] });
        return;
    }

    // --- Z. MANAGE FACTIONS: PROCESS LEADERSHIP TRANSFER ---
    if (interaction.isUserSelectMenu() && interaction.customId.startsWith('mf_transferselect_')) {
        const roleId = interaction.customId.replace('mf_transferselect_', '');
        const guild = interaction.guild;
        const leaderRole = guild.roles.cache.get(roleId);
        if (!leaderRole) return interaction.update({ content: '❌ That faction role no longer exists.', components: [] });

        const factionName = leaderRole.name.replace('Faction Leader_', '');
        const memberRole = guild.roles.cache.find(r => r.name && r.name.endsWith('] Member') && r.color === leaderRole.color);
        const newLeaderId = interaction.values[0];
        const newLeader = await guild.members.fetch(newLeaderId).catch(() => null);

        if (!newLeader) return interaction.update({ content: '❌ Could not find that member in the server.', components: [] });

        try {
            const oldLeaders = leaderRole.members;
            for (const [, oldLeader] of oldLeaders) {
                if (oldLeader.id !== newLeaderId) await oldLeader.roles.remove(leaderRole).catch(() => { });
            }

            await newLeader.roles.add(leaderRole);
            if (memberRole && !newLeader.roles.cache.has(memberRole.id)) await newLeader.roles.add(memberRole);

            await interaction.update({ content: `✅ **${factionName}** leadership transferred to <@${newLeaderId}>.`, components: [] });

            const logChannel = await guild.channels.fetch(CONFIG.FACTION_LOG_CHANNEL_ID).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('🔄 Faction Leadership Transferred')
                    .setDescription(`**${factionName}** leadership transferred to <@${newLeaderId}> by <@${interaction.user.id}>.`)
                    .setColor(0x3498DB)
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
            await newLeader.send(`👑 You have been made the new Faction Leader of **${factionName}**!`).catch(() => { });
        } catch (err) {
            console.error(err);
            await interaction.update({ content: '❌ Error transferring leadership. Check bot role hierarchy.', components: [] });
        }
        return;
    }

    // --- AA. FACTION STATUS SLASH COMMAND (LEADER ONLY) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'faction-status') {
        if (interaction.channel.id !== CONFIG.FACTION_LEADERS_HUB_CHANNEL_ID) {
            return interaction.reply({ content: `❌ This command can only be used in <#${CONFIG.FACTION_LEADERS_HUB_CHANNEL_ID}>.`, ephemeral: true });
        }

        const leaderRole = interaction.member.roles.cache.find(role => role.name.startsWith('Faction Leader_'));
        if (!leaderRole) {
            return interaction.reply({ content: '❌ **Access Denied:** Only a Faction Leader can change faction status.', ephemeral: true });
        }

        const factionName = leaderRole.name.replace('Faction Leader_', '');

        const statusMenu = new StringSelectMenuBuilder()
            .setCustomId(`fstatus_set_${leaderRole.id}`)
            .setPlaceholder('Select new faction status...')
            .addOptions([
                { label: 'Open for Recruitment', value: 'OPEN_RECRUITMENT', description: 'Visible in the public faction dropdown', emoji: '🟢' },
                { label: 'Open for Invitation', value: 'OPEN_INVITATION', description: 'Visible in the public faction dropdown', emoji: '🟡' },
                { label: 'Closed for Recruitment', value: 'CLOSED_RECRUITMENT', description: 'Hidden from the public faction dropdown', emoji: '🔴' },
                { label: 'Closed for Invitation', value: 'CLOSED_INVITATION', description: 'Hidden from the public faction dropdown', emoji: '⚫' }
            ]);

        const row = new ActionRowBuilder().addComponents(statusMenu);
        await interaction.reply({ content: `🛠️ **Set status for ${factionName}:**`, components: [row], ephemeral: true });
        return;
    }

    // --- AB. FACTION STATUS: APPLY SELECTED STATUS ---
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('fstatus_set_')) {
        const roleId = interaction.customId.replace('fstatus_set_', '');
        const leaderRole = interaction.guild.roles.cache.get(roleId);

        if (!leaderRole || !interaction.member.roles.cache.has(roleId)) {
            return interaction.update({ content: '❌ You no longer hold this Faction Leader role.', components: [] });
        }

        const factionName = leaderRole.name.replace('Faction Leader_', '');
        const selectedStatus = interaction.values[0];

        const statusLabels = {
            OPEN_RECRUITMENT: '🟢 Open for Recruitment',
            OPEN_INVITATION: '🟡 Open for Invitation',
            CLOSED_RECRUITMENT: '🔴 Closed for Recruitment',
            CLOSED_INVITATION: '⚫ Closed for Invitation'
        };

        try {
            const category = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === `FACTION: ${factionName.toUpperCase()}`);
            if (!category) {
                return interaction.update({ content: '❌ Could not find your faction\'s category channel.', components: [] });
            }

            const textChannel = interaction.guild.channels.cache.find(c => c.parentId === category.id && c.type === ChannelType.GuildText);
            if (!textChannel) {
                return interaction.update({ content: '❌ Could not find your faction\'s text channel.', components: [] });
            }

            await textChannel.setTopic(`FACTION_STATUS::${selectedStatus}`);

            const isClosed = selectedStatus === 'CLOSED_RECRUITMENT' || selectedStatus === 'CLOSED_INVITATION';
            const visibilityNote = isClosed
                ? 'Your faction is now hidden from the public "Apply to a Faction" dropdown.'
                : 'Your faction is now visible in the public "Apply to a Faction" dropdown.';

            await interaction.update({ content: `✅ **${factionName}** status set to ${statusLabels[selectedStatus]}.\n${visibilityNote}`, components: [] });
        } catch (err) {
            console.error(err);
            await interaction.update({ content: '❌ System error updating faction status.', components: [] });
        }
        return;
    }

    // --- AD. LOG DONATION SLASH COMMAND (STAFF ONLY) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'log-donation') {
        const isStaff = interaction.member.roles.cache.has(CONFIG.DONATION_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can log entries.', ephemeral: true });

        const targetMember = interaction.options.getUser('member');
        const amount = interaction.options.getNumber('amount');
        const proofAttachment = interaction.options.getAttachment('proof');
        const dateInput = interaction.options.getString('date');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Amount must be greater than 0.', ephemeral: true });
        }

        const entryDate = dateInput || new Date().toISOString().split('T')[0];

        try {
            const logChannel = await interaction.guild.channels.fetch(CONFIG.DONATION_LOG_CHANNEL_ID).catch(() => null);
            if (!logChannel) {
                return interaction.reply({ content: '❌ Log channel not found. Check CONFIG.DONATION_LOG_CHANNEL_ID.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('📝 Entry Logged')
                .addFields(
                    { name: 'Member', value: `<@${targetMember.id}>`, inline: true },
                    { name: 'Member ID', value: targetMember.id, inline: true },
                    { name: 'Amount (PHP)', value: `${amount}`, inline: true },
                    { name: 'Date', value: entryDate, inline: true },
                    { name: 'Logged By', value: `<@${interaction.user.id}>`, inline: true }
                )
                .setImage(proofAttachment.url)
                .setColor(0x2ECC71)
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
            await interaction.reply({ content: `✅ Logged ₱${amount} entry for <@${targetMember.id}> on ${entryDate}.`, ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Error logging entry.', ephemeral: true });
        }
        return;
    }

    // --- AD-2. LOG EXPENSE SLASH COMMAND (STAFF ONLY) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'log-expense') {
        const isStaff = interaction.member.roles.cache.has(CONFIG.DONATION_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can log entries.', ephemeral: true });

        const amount = interaction.options.getNumber('amount');
        const note = interaction.options.getString('note');
        const proofAttachment = interaction.options.getAttachment('proof');
        const dateInput = interaction.options.getString('date');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Amount must be greater than 0.', ephemeral: true });
        }

        const entryDate = dateInput || new Date().toISOString().split('T')[0];

        try {
            const logChannel = await interaction.guild.channels.fetch(CONFIG.DONATION_LOG_CHANNEL_ID).catch(() => null);
            if (!logChannel) {
                return interaction.reply({ content: '❌ Log channel not found. Check CONFIG.DONATION_LOG_CHANNEL_ID.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('💸 Expense Logged')
                .addFields(
                    { name: 'Amount (PHP)', value: `${amount}`, inline: true },
                    { name: 'Date', value: entryDate, inline: true },
                    { name: 'Logged By', value: `<@${interaction.user.id}>`, inline: true },
                    { name: 'Used For', value: note, inline: false }
                )
                .setColor(0xE74C3C)
                .setTimestamp();

            if (proofAttachment) embed.setImage(proofAttachment.url);

            await logChannel.send({ embeds: [embed] });
            await interaction.reply({ content: `✅ Logged ₱${amount} expense — deducted from the donation total.`, ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: '❌ Error logging entry.', ephemeral: true });
        }
        return;
    }

    // --- AE. DONATION SUMMARY SLASH COMMAND (STAFF ONLY) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'donation-summary') {
        const isStaff = interaction.member.roles.cache.has(CONFIG.DONATION_STAFF_ROLE_ID) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);
        if (!isStaff) return interaction.reply({ content: '❌ Only authorized Staff can view summaries.', ephemeral: true });

        await interaction.deferReply({ ephemeral: true });

        try {
            const logChannel = await interaction.guild.channels.fetch(CONFIG.DONATION_LOG_CHANNEL_ID).catch(() => null);
            if (!logChannel) {
                return interaction.editReply({ content: '❌ Log channel not found.' });
            }

            const filterMember = interaction.options.getUser('member');

            let allMessages = [];
            let lastId = null;
            while (true) {
                const fetchOptions = { limit: 100 };
                if (lastId) fetchOptions.before = lastId;
                const batch = await logChannel.messages.fetch(fetchOptions);
                if (batch.size === 0) break;
                allMessages = allMessages.concat(Array.from(batch.values()));
                lastId = batch.last().id;
                if (batch.size < 100) break;
            }

            const entries = [];
            const expenses = [];
            for (const msg of allMessages) {
                if (!msg.embeds || msg.embeds.length === 0) continue;
                const embed = msg.embeds[0];
                const fields = embed.fields || [];

                if (embed.title === '📝 Entry Logged') {
                    const memberIdField = fields.find(f => f.name === 'Member ID');
                    const amountField = fields.find(f => f.name === 'Amount (PHP)');
                    const dateField = fields.find(f => f.name === 'Date');

                    if (!memberIdField || !amountField) continue;

                    entries.push({
                        memberId: memberIdField.value,
                        amount: parseFloat(amountField.value) || 0,
                        date: dateField ? dateField.value : 'Unknown'
                    });
                } else if (embed.title === '💸 Expense Logged') {
                    const amountField = fields.find(f => f.name === 'Amount (PHP)');
                    const dateField = fields.find(f => f.name === 'Date');
                    const noteField = fields.find(f => f.name === 'Used For');

                    if (!amountField) continue;

                    expenses.push({
                        amount: parseFloat(amountField.value) || 0,
                        date: dateField ? dateField.value : 'Unknown',
                        note: noteField ? noteField.value : 'No note provided'
                    });
                }
            }

            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

            if (filterMember) {
                const memberEntries = entries.filter(r => r.memberId === filterMember.id);
                if (memberEntries.length === 0) {
                    return interaction.editReply({ content: `📊 <@${filterMember.id}> has no logged entries.` });
                }

                const total = memberEntries.reduce((sum, r) => sum + r.amount, 0);
                const historyLines = memberEntries
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(r => `• ₱${r.amount} — ${r.date}`)
                    .join('\n');

                const summaryEmbed = new EmbedBuilder()
                    .setTitle(`📊 Summary — ${filterMember.username}`)
                    .setDescription(`**Total Donated:** ₱${total}\n**Entries:** ${memberEntries.length}\n\n**History:**\n${historyLines}\n\n*Note: Expenses are deducted from the overall pool total, not per-member.*`)
                    .setColor(0x3498DB);

                return interaction.editReply({ embeds: [summaryEmbed] });
            }

            const totals = {};
            for (const r of entries) {
                if (!totals[r.memberId]) totals[r.memberId] = 0;
                totals[r.memberId] += r.amount;
            }

            const grandDonated = entries.reduce((sum, r) => sum + r.amount, 0);
            const netTotal = grandDonated - totalExpenses;
            const sortedMembers = Object.entries(totals).sort((a, b) => b[1] - a[1]);

            const breakdownLines = sortedMembers
                .slice(0, 20)
                .map(([memberId, amount]) => `<@${memberId}> — ₱${amount}`)
                .join('\n') || 'No entries logged yet.';

            const recentExpenseLines = expenses
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map(e => `• ₱${e.amount} — ${e.date} — ${e.note}`)
                .join('\n') || 'No expenses logged yet.';

            const summaryEmbed = new EmbedBuilder()
                .setTitle('📊 Summary — All Members')
                .setDescription(
                    `**Total Donated:** ₱${grandDonated}\n` +
                    `**Total Expenses:** ₱${totalExpenses}\n` +
                    `**Net Available:** ₱${netTotal}\n` +
                    `**Total Entries:** ${entries.length}\n**Unique Members:** ${sortedMembers.length}\n\n` +
                    `**Top Donors:**\n${breakdownLines}\n\n` +
                    `**Recent Expenses:**\n${recentExpenseLines}`
                )
                .setColor(0x3498DB);

            return interaction.editReply({ embeds: [summaryEmbed] });
        } catch (err) {
            console.error(err);
            await interaction.editReply({ content: '❌ Error generating summary.' });
        }
        return;
    }

    // 🌟 THE FIX: This safely closes the master client.on('interactionCreate') event listener block FIRST!
});

// ==========================================
// 3. LOG ARCHIVER TRANSCRIPT HELPER
// ==========================================
async function compileTranscript(channel, closedBy, reason) {
    try {
        const logChannel = await channel.guild.channels.fetch(CONFIG.SUPPORT_LOG_CHANNEL_ID);
        if (!logChannel) return console.error("Could not trace destination logging node channel structure.");

        const msgs = await channel.messages.fetch({ limit: 100 });
        let text = `=== LOG TRANSCRIPT: ${channel.name} ===\nClosed By: ${closedBy}\nReason: ${reason}\n\n`;

        Array.from(msgs.values()).reverse().forEach(m => {
            text += `[${m.createdAt.toUTCString()}] ${m.author.tag}: ${m.content}\n`;
        });

        await logChannel.send({
            content: `📦 Log File Generated for support ticket instance: \`${channel.name}\``,
            files: [{ attachment: Buffer.from(text, 'utf-8'), name: `transcript-${channel.name}.txt` }]
        });
    } catch (err) {
        console.error('Transcript logging execution bypass error:', err);
    }
}

client.login(process.env.DISCORD_TOKEN);