import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } from 'discord.js';

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=discord',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Discord not connected');
  }
  return accessToken;
}

async function getDiscordClient() {
  const token = await getAccessToken();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
    ]
  });

  await client.login(token);
  return client;
}

const client = await getDiscordClient();

const activeTickets = new Map();

client.on('ready', () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`🎫 Support ticket system is ready!`);
  console.log(`📝 Use !setup command in a channel to create the ticket panel`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content === '!setup') {
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

    await message.channel.send({ embeds: [embed], components: [row] });
    await message.delete().catch(() => {});
  }

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
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        topic: `${ticketType} ticket for ${user.tag}`,
        permissionOverwrites: [
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
        ]
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

client.on('error', console.error);
client.on('warn', console.warn);

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});
