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
    StringSelectMenuBuilder
} = require('discord.js');

// ==========================================
// 🛠️ BOT CONFIGURATION DATA (ENVIRONMENT-MAPPED SETTINGS)
// ==========================================
const CONFIG = {
    WHITELIST_STAFF_ROLE_ID: process.env.WHITELIST_STAFF_ROLE_ID || "1532932367461781584",
    WHITELIST_CATEGORY_ID: process.env.WHITELIST_CATEGORY_ID || "1532903192596058243",
    WHITELIST_LOG_CHANNEL_ID: process.env.WHITELIST_LOG_CHANNEL_ID || "1533789189412229291",
    BETA_TESTER_ROLE_ID: process.env.BETA_TESTER_ROLE_ID || "1533724387625402479",

    SUPPORT_STAFF_ROLE_ID: process.env.SUPPORT_STAFF_ROLE_ID || "1532932367461781584",
    SUPPORT_CATEGORY_ID: process.env.SUPPORT_CATEGORY_ID || "1259533239689810053",
    SUPPORT_LOG_CHANNEL_ID: process.env.SUPPORT_LOG_CHANNEL_ID || "1533547092470005981",

    FACTION_STAFF_ROLE_ID: process.env.FACTION_STAFF_ROLE_ID || "1532932367461781584",
    FACTION_APP_CATEGORY_ID: process.env.FACTION_APP_CATEGORY_ID || "1534277229083885698",
    FACTION_LOG_CHANNEL_ID: process.env.FACTION_LOG_CHANNEL_ID || "1534292895643861073",
    FACTION_JOIN_TICKETS_CATEGORY_ID: process.env.FACTION_JOIN_TICKETS_CATEGORY_ID || "1534277229083885698",
    FACTION_LIST_FORUM_ID: process.env.FACTION_LIST_FORUM_ID || "1534357448800862320"
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
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_standard_whitelist').setLabel('📝 Apply for Whitelisting').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('open_beta_whitelist').setLabel('🧪 Beta Test Whitelist').setStyle(ButtonStyle.Primary)
        );

        const embed = new EmbedBuilder()
            .setTitle('📋 Application Center')
            .setDescription('Select the type of whitelist application form you wish to open below.')
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

    // --- D. PUBLIC FACTION RECRUITMENT DYNAMIC LIVE ROLE SCANNER (CACHE BYPASS) ---
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
            // Direct memory fallback prevents fetch authorization crashes
            const serverRoles = interaction.guild.roles.cache;
            const activeLeaderRoles = serverRoles.filter(role => role.name.startsWith('Faction Leader_'));

            if (activeLeaderRoles.size === 0) {
                selectionMenu.addOptions([{ label: 'No Factions Registered Yet', value: 'none', description: 'Check back later!' }]);
            } else {
                const options = activeLeaderRoles.map(role => {
                    const cleanFactionName = role.name.replace('Faction Leader_', '');
                    const matchingMemberRole = serverRoles.find(r => r.name.startsWith('[') && r.name.endsWith('] Member') && r.color === role.color);
                    const extractedTag = matchingMemberRole ? matchingMemberRole.name.split(']')[0].replace('[', '') : 'OB';

                    return {
                        label: `${cleanFactionName} [${extractedTag}]`,
                        value: `join_${extractedTag}_${cleanFactionName.replace(/ /g, '-')}`,
                        description: `Apply to join ${cleanFactionName}`
                    };
                });
                selectionMenu.addOptions(options);
            }
            const menuRow = new ActionRowBuilder().addComponents(selectionMenu);
            await interaction.reply({ embeds: [embed], components: [menuRow] });
        } catch (error) {
            console.error('Dynamic layout scanner mapping failure:', error);
            await interaction.reply({ content: '❌ System error processing role mapping filters layer arrays.', ephemeral: true });
        }
        return;
    }
    // --- E. SETUP ORIGIN STORIES SLASH COMMAND ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'setup-origin-stories') {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('start_story_upload').setLabel('📜 Publish Faction Origin').setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle('📖 Faction Chronicles & Origin Stories')
            .setDescription(
                `Attention **Faction Leaders**!\n\n` +
                `Click the button below to launch the **Chronicle Publishing Wizard**.\n\n` +
                `🛡️ **Restriction Note:** You must hold a registered \`Faction Leader_[Name]\` role to initiate the layout engine. You will be prompted to supply your story title, background history lore, tag parameters, and a direct image upload straight from your device.`
            )
            .setColor(0xD35400);

        await interaction.reply({ embeds: [embed], components: [row] });
        return;
    }

    // --- F. INITIATE INTERACTIVE CHRONICLE COLLECTOR LOOP ---
    if (interaction.isButton() && interaction.customId === 'start_story_upload') {
        const leaderRoleObject = interaction.member.roles.cache.find(role => role.name.startsWith('Faction Leader_'));
        if (!leaderRoleObject) {
            return interaction.reply({ content: '❌ **Access Denied:** Only verified Faction Leaders holding an active `Faction Leader_[FactionName]` role can use this system.', ephemeral: true });
        }

        const extractedFactionName = leaderRoleObject.name.replace('Faction Leader_', '');
        
        // Acknowledge ephemerally to start a clean interactive stream session
        await interaction.reply({ 
            content: `⏳ **Chronicle Wizard Initialized for [${extractedFactionName}]!**\n\nPlease type your message below following this exact template structure (you can copy-paste and edit this text):\n\n` +
                     `\`\`\`text\n` +
                     `TITLE: The Rise of ${extractedFactionName}\n` +
                     `STATUS: OPEN\n` +
                     `LORE: Write your faction's background history and timeline updates here...\n` +
                     `\`\`\`\n` +
                     `📎 **CRUCIAL:** Make sure you **attach a photo or banner file from your device** to the same message before pressing Send!\n` +
                     `*(Status options must be exactly: **OPEN**, **CLOSED**, or **INVITATION**)*`, 
            ephemeral: true 
        });

        // Open a target message collector filtering strictly for this specific Faction Leader
        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 300000 }); // 5 minutes timeout

        collector.on('collect', async (msg) => {
            await interaction.followUp({ content: '⚙️ Processing message extraction layers...', ephemeral: true });

            const text = msg.content;
            const attachment = msg.attachments.first();

            // Validation Checks
            if (!attachment || !attachment.contentType?.startsWith('image/')) {
                try { await msg.delete(); } catch(e) {}
                return interaction.followUp({ content: '❌ **Submission Canceled:** You must attach a valid image/photo file straight from your device. Run the command wizard again.', ephemeral: true });
            }

            // Extract template tokens using regular expressions
            const titleMatch = text.match(/TITLE:\s*(.+)/i);
            const statusMatch = text.match(/STATUS:\s*(OPEN|CLOSED|INVITATION)/i);
            const loreMatch = text.match(/LORE:\s*([\s\S]+)/i);

            if (!titleMatch || !statusMatch || !loreMatch) {
                try { await msg.delete(); } catch(e) {}
                return interaction.followUp({ content: '❌ **Submission Canceled:** Template parsing error. Ensure you include `TITLE:`, `STATUS:`, and `LORE:` keyword blocks precisely. Run the command wizard again.', ephemeral: true });
            }

            const storyTitle = titleMatch[1].trim();
            const recruitStatus = statusMatch[1].toUpperCase().trim();
            const storyLore = loreMatch[1].trim();

            // Clean up the formatting layout to hide raw text inputs from regular users
            try { await msg.delete(); } catch(e) {}

            // Process status tag identifiers 
            let statusTagLabel = 'open for recruitment';
            let statusEmojiText = '🟢 **OPEN FOR RECRUITMENT**';

            if (recruitStatus === 'CLOSED') {
                statusTagLabel = 'closed';
                statusEmojiText = '🔴 **CLOSED TO APPLICANTS**';
            } else if (recruitStatus === 'INVITATION') {
                statusTagLabel = 'invitations only';
                statusEmojiText = '🟡 **INVITATIONS ONLY**';
            }

            try {
                const forumChannel = await interaction.guild.channels.fetch(CONFIG.FACTION_LIST_FORUM_ID).catch(() => null);
                if (!forumChannel || forumChannel.type !== ChannelType.GuildForum) {
                    return interaction.followUp({ content: '❌ **System Error:** Target Forum configuration ID mismatch.', ephemeral: true });
                }

                const targetTag = forumChannel.availableTags.find(tag => tag.name.toLowerCase() === statusTagLabel) || null;
                const appliedTags = targetTag ? [targetTag.id] : [];

                const postContent = 
                    `## 📜 ${storyTitle}\n\n` +
                    `**Faction Name:** ${extractedFactionName}\n` +
                    `**Published By:** <@${interaction.user.id}>\n` +
                    `**Status:** ${statusEmojiText}\n\n` +
                    `### 📖 Faction History & Lore:\n${storyLore}\n\n` +
                    `🚨 **Interested in joining our ranks?**\n` +
                    `If you want to survive with us, head over straight to the <#1534277229083885698> application channel to select our group from the menu dropdown block and log your enlisting details officially!`;

                // Build forum thread thread directly hosting the device photo attachment as its primary message anchor
                const forumPostThread = await forumChannel.threads.create({
                    name: `${extractedFactionName} | ${storyTitle}`,
                    message: { 
                        content: postContent,
                        files: [{ attachment: attachment.url, name: attachment.name }] // Re-hosts the direct device image
                    },
                    appliedTags: appliedTags,
                    reason: `Automated Device Media Upload Submission Chronicle Entry`
                });

                await interaction.followUp({ content: `🎉 **Success!** Your Faction Origin Story and custom device image have been published safely to the Forum! View here: ${forumPostThread}`, ephemeral: true });
            } catch (err) {
                console.error(err);
                await interaction.followUp({ content: '❌ System exception error while handling final forum output matrix hooks.', ephemeral: true });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time' && collected.size === 0) {
                interaction.followUp({ content: '⏱️ **Wizard Timeout:** 5 minutes expired with no text entry. Submission sequence cleared.', ephemeral: true });
            }
        });
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

                const factionCategory = await guild.channels.create({
                    name: `FACTION: ${factionName.toUpperCase()}`,
                    type: ChannelType.GuildCategory,
                    permissionOverwrites: [
                        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
                        { id: generalRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.Connect, PermissionFlagsBits.Speak] },
                        { id: CONFIG.FACTION_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
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
                    await applicant.send(`🎉 **Great news, Survivor!** Your application to enlist with **[${tag}]** has been officially approved by the Faction Leader! You now have access to your group's private workspace.`).catch(() => {});
                }
                
                await interaction.editReply({ content: '✅ **Success!** Survivor role assigned. Closing workspace channel...' });
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            } catch (roleErr) {
                console.error(roleErr);
                await interaction.editReply({ content: '❌ **System Error:** Failed to grant role. Check bot hierarchy placement.' });
            }
            return;
        }

        if (action === 'reject') {
            await interaction.reply({ content: '❌ **Applicant Rejected.** Cleaning up workspace thread...' });
            if (applicant) {
                await applicant.send(`🛑 **Notice:** Your application request to enlist with the faction **[${tag}]** has been declined by their leadership.`).catch(() => {});
            }
            setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            return;
        }
    }
    // --- N. WHITELIST AGREEMENT LOGIC ENGINES ---
    if (interaction.isButton() && (interaction.customId === 'open_standard_whitelist' || interaction.customId === 'open_beta_whitelist')) {
        const isBeta = interaction.customId === 'open_beta_whitelist';
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
        const usernameInput = new TextInputBuilder().setCustomId('wl_username').setLabel('Username').setStyle(TextInputStyle.Short).setRequired(true);
        const passwordInput = new TextInputBuilder().setCustomId('wl_password').setLabel('Password').setStyle(TextInputStyle.Short).setRequired(true);

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

            await ticketChannel.send({ embeds: [dataEmbed], components: [actionRow] });
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
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                { id: CONFIG.SUPPORT_STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] }
            ]
        });

        const infoEmbed = new EmbedBuilder()
            .setTitle(`🎫 Ticket Form: ${ticketType.toUpperCase()}`)
            .setDescription(`Created by <@${interaction.user.id}>\n\n**Details Provided:**\n${interaction.fields.getTextInputValue('general_desc')}`)
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