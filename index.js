import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType, REST, Routes, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

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

client.on('clientReady', async () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`🎫 Support ticket system is ready!`);
  
  const commands = [
    {
      name: 'ticket',
      description: 'Create the ticket panel with category buttons',
    },
    {
      name: 'service',
      description: 'Access our website and services',
    }
  ];

  const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

  try {
    console.log('📝 Registering slash commands to all servers...');
    
    for (const guild of client.guilds.cache.values()) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guild.id),
        { body: commands }
      );
      console.log(`✅ Commands registered to: ${guild.name}`);
    }
    
    console.log('✅ All slash commands registered! Commands should appear instantly.');
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
            .setLabel('General Support')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('ticket_bug')
            .setLabel('Bug Report')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('ticket_partnership')
            .setLabel('Partnership Request')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === 'service') {
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Click on the Menu Button Below ▼:')
        .setDescription('Select your issue type e.g\n\nmigration issues, transaction error e.t.c.')
        .setTimestamp();

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('service_select')
        .setPlaceholder('Select a service...')
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel('Migration Issues')
            .setDescription('Issues with wallet migration')
            .setValue('migration_issues')
            .setEmoji('🔄'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Transaction Error')
            .setDescription('Problems with transactions')
            .setValue('transaction_error')
            .setEmoji('⚠️'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Connection Issues')
            .setDescription('Wallet connection problems')
            .setValue('connection_issues')
            .setEmoji('🔌'),
          new StringSelectMenuOptionBuilder()
            .setLabel('Other Issues')
            .setDescription('Any other problems')
            .setValue('other_issues')
            .setEmoji('❓')
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ embeds: [embed], components: [row] });
    }
    return;
  }

  if (interaction.isButton()) {
    const { customId, user, guild } = interaction;

    if (customId.startsWith('ticket_')) {
      const userTickets = Array.from(activeTickets.values()).filter(t => t.userId === user.id);
      if (userTickets.length >= 3) {
        return interaction.reply({ 
          content: '❌ You already have 3 open tickets. Please close one before opening a new ticket.', 
          ephemeral: true 
        });
      }

      const ticketTypes = {
        'ticket_general': 'General Support',
        'ticket_bug': 'Bug Report',
        'ticket_partnership': 'Partnership Request'
      };

      const ticketType = ticketTypes[customId];

      const modal = new ModalBuilder()
        .setCustomId(`modal_${customId}`)
        .setTitle(`Submit ${ticketType} Ticket`);

      const inquiryInput = new TextInputBuilder()
        .setCustomId('inquiry_input')
        .setLabel('Please provide info regarding your inquiry')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Describe your issue or request...')
        .setRequired(true)
        .setMaxLength(1000);

      const firstActionRow = new ActionRowBuilder().addComponents(inquiryInput);
      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);
      return;
    }

    if (customId === 'close_ticket') {
      const channel = interaction.channel;
      
      if (!channel.name.startsWith('ticket-')) {
        return interaction.reply({ 
          content: '❌ This can only be used in ticket channels!', 
          ephemeral: true 
        });
      }

      const ticketInfo = activeTickets.get(channel.id);
      if (ticketInfo) {
        activeTickets.delete(channel.id);
      }

      await interaction.reply('🔒 Closing ticket in 3 seconds...');
      setTimeout(async () => {
        await channel.delete().catch(console.error);
      }, 3000);
      return;
    }

    if (customId === 'show_info') {
      const channel = interaction.channel;
      const ticketInfo = activeTickets.get(channel.id);
      
      if (ticketInfo) {
        const infoText = `**Ticket Information**\n` +
          `Ticket Type: ${ticketInfo.ticketType}\n` +
          `Created By: <@${ticketInfo.userId}>\n` +
          `Created At: <t:${Math.floor(ticketInfo.createdAt / 1000)}:F>\n` +
          `Channel ID: ${channel.id}\n` +
          (ticketInfo.inquiry ? `\n**User Inquiry:**\n${ticketInfo.inquiry}` : '');
        
        await interaction.reply({ content: infoText, ephemeral: true });
      } else {
        await interaction.reply({ 
          content: '❌ Could not find ticket information.', 
          ephemeral: true 
        });
      }
      return;
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('modal_ticket_')) {
      const { user, guild } = interaction;
      
      const inquiry = interaction.fields.getTextInputValue('inquiry_input');
      
      const ticketTypes = {
        'modal_ticket_general': 'General',
        'modal_ticket_bug': 'Bug Report',
        'modal_ticket_partnership': 'Partnership Request'
      };

      const ticketType = ticketTypes[interaction.customId];
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

      let ticketCategory = guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory && 
        channel.name.toLowerCase().includes('support') && 
        channel.name.toLowerCase().includes('ticket')
      );

      if (!ticketCategory) {
        ticketCategory = await guild.channels.create({
          name: 'Support Tickets',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: client.user.id,
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels]
            }
          ]
        });
        console.log(`📁 Created Support Tickets category`);
      }

      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: ticketCategory.id,
        topic: `${ticketType} ticket for ${user.tag}`,
        permissionOverwrites: permissionOverwrites
      });

      activeTickets.set(ticketChannel.id, {
        userId: user.id,
        ticketType: ticketType,
        createdAt: Date.now(),
        inquiry: inquiry
      });

      const welcomeEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`${ticketType} Ticket`)
        .setDescription(`Hello ${user}, welcome to your support ticket!\n\n**Your Inquiry:**\n${inquiry}\n\nA staff member will assist you shortly.`)
        .setTimestamp()
        .setFooter({ text: `Ticket created by ${user.tag}` });

      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close Ticket')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('show_info')
            .setLabel('Show Copyable Info')
            .setStyle(ButtonStyle.Primary)
        );

      await ticketChannel.send({ 
        content: `${user}`, 
        embeds: [welcomeEmbed],
        components: [buttonRow]
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
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'service_select') {
      const selectedService = interaction.values[0];
      
      const serviceLabels = {
        'migration_issues': 'Migration Issues',
        'transaction_error': 'Transaction Error',
        'connection_issues': 'Connection Issues',
        'other_issues': 'Other Issues'
      };

      const serviceLabel = serviceLabels[selectedService];

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle(`🌐 ${serviceLabel}`)
        .setDescription(`You selected: **${serviceLabel}**\n\nPlease visit our website to resolve your issue:`)
        .addFields(
          { name: '🔗 Website Link', value: 'https://defiportfinance.org/', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'DeFi Port Finance Support' });

      await interaction.reply({ embeds: [embed], ephemeral: true });
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
