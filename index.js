import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, REST, Routes } from 'discord.js';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!DISCORD_BOT_TOKEN) {
  console.error('❌ ERROR: DISCORD_BOT_TOKEN is not set!');
  console.error('📝 Please add your Discord bot token to Replit Secrets:');
  console.error('   1. Go to Discord Developer Portal: https://discord.com/developers/applications');
  console.error('   2. Create a bot and copy the token');
  console.error('   3. Add it to Replit Secrets as DISCORD_BOT_TOKEN');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

const activeTickets = new Map();

const SUPPORT_ROLE_IDS = process.env.SUPPORT_ROLE_IDS ? process.env.SUPPORT_ROLE_IDS.split(',') : [];

client.on('ready', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`🎫 Support ticket system is ready!`);
  
  const commands = [
    {
      name: 'ticket',
      description: 'Create the ticket panel with category buttons',
    }
  ];

  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

  try {
    console.log('📝 Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('✅ Slash commands registered! Use /ticket to create the ticket panel');
  } catch (error) {
    console.error('❌ Error registering commands:', error);
  }

  if (SUPPORT_ROLE_IDS.length > 0) {
    console.log(`👥 Support roles configured: ${SUPPORT_ROLE_IDS.length} role(s)`);
  } else {
    console.log(`⚠️  No support roles set - all members with Manage Channels permission can view tickets`);
    console.log(`💡 Add SUPPORT_ROLE_IDS to Secrets (comma-separated) to restrict access`);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!close') {
    const channel = message.channel;
    
    if (!channel.name.startsWith('ticket-')) {
      return message.reply('❌ This command can only be used in ticket channels!');
    }

    const ticketInfo = activeTickets.get(channel.id);
    if (ticketInfo) {
      activeTickets.delete(channel.id);
    }

    await message.channel.send('🔒 Closing ticket in 3 seconds...');
    setTimeout(async () => {
      await channel.delete().catch(console.error);
    }, 3000);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === 'ticket') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Start A Chat')
        .setDescription('If you want to speak to a member of the team, please press the start button below.')
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('ticket_general')
            .setLabel('General')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_bug')
            .setLabel('Bug Report')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_partnership')
            .setLabel('Partnership Request')
            .setStyle(ButtonStyle.Primary)
        );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
    return;
  }

  if (!interaction.isButton()) return;

  const { customId, user, guild, member } = interaction;

  if (customId.startsWith('ticket_')) {
    const userTickets = Array.from(activeTickets.values()).filter(t => t.userId === user.id);
    if (userTickets.length >= 3) {
      return interaction.reply({ 
        content: '❌ You already have 3 open tickets. Please close one before opening a new ticket.', 
        ephemeral: true 
      });
    }

    const ticketTypes = {
      'ticket_general': 'General',
      'ticket_bug': 'Bug Report',
      'ticket_partnership': 'Partnership Request'
    };

    const ticketType = ticketTypes[customId];
    const channelName = `ticket-${user.username}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

    await interaction.deferReply({ ephemeral: true });

    try {
      const permissionOverwrites = [
        {
          id: guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
            PermissionFlagsBits.EmbedLinks
          ]
        },
        {
          id: client.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        }
      ];

      if (SUPPORT_ROLE_IDS.length > 0) {
        for (const roleId of SUPPORT_ROLE_IDS) {
          permissionOverwrites.push({
            id: roleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AttachFiles,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.ManageMessages
            ]
          });
        }
      } else {
        const adminRoles = guild.roles.cache.filter(role => 
          role.permissions.has(PermissionFlagsBits.ManageChannels)
        );
        for (const [roleId, role] of adminRoles) {
          if (roleId !== guild.id) {
            permissionOverwrites.push({
              id: roleId,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ManageMessages
              ]
            });
          }
        }
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `${ticketType} ticket for ${user.tag}`,
        permissionOverwrites: permissionOverwrites
      });

      activeTickets.set(ticketChannel.id, {
        userId: user.id,
        ticketType: ticketType,
        createdAt: Date.now()
      });

      const welcomeEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`${ticketType} Ticket`)
        .setDescription(`Hello ${user}, welcome to your support ticket!\n\nPlease describe your issue and a staff member will assist you shortly.\n\nTo close this ticket, use the command: \`!close\``)
        .setTimestamp()
        .setFooter({ text: `Ticket created by ${user.tag}` });

      await ticketChannel.send({ 
        content: `${user}`, 
        embeds: [welcomeEmbed] 
      });

      await interaction.editReply({ 
        content: `✅ Your ticket has been created: ${ticketChannel}` 
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      await interaction.editReply({ 
        content: '❌ There was an error creating your ticket. Please contact an administrator.' 
      });
    }
  }
});

client.on('channelDelete', (channel) => {
  if (activeTickets.has(channel.id)) {
    console.log(`🗑️ Ticket channel deleted: ${channel.name}`);
    activeTickets.delete(channel.id);
  }
});

client.on('error', console.error);
client.on('warn', console.warn);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.login(DISCORD_BOT_TOKEN).catch(error => {
  console.error('❌ Failed to login to Discord:', error.message);
  console.error('📝 Please check that your DISCORD_BOT_TOKEN is correct');
  process.exit(1);
});
