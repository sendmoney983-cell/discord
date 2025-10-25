# Discord Support Ticket Bot

## Overview
A Discord bot that creates a professional support ticket system with interactive category buttons. When users click a button (General, Bug Report, or Partnership Request), the bot automatically creates a private ticket channel for them to communicate with support staff.

## Current State
- ✅ Bot code implemented with Discord.js v14
- ✅ Interactive button-based ticket creation
- ✅ Three ticket categories with custom handlers
- ✅ Automatic permission management for private channels
- ✅ Ticket closing functionality
- ✅ Spam prevention (max 3 tickets per user)
- ⚠️ **Waiting for user to add DISCORD_BOT_TOKEN secret**

## Recent Changes (October 25, 2025)
- Created Discord ticket bot with button interactions
- Implemented ticket panel with embed and three category buttons
- Added private channel creation with proper permissions
- Created !setup and !close commands
- Added comprehensive README with setup instructions
- **Fixed critical permission issue**: Added support role access to ticket channels
- Implemented configurable SUPPORT_ROLE_IDS for staff access control
- Added fallback: roles with Manage Channels permission can view tickets
- Added channelDelete listener to prevent memory leaks in ticket tracking
- Enhanced error messages and setup logging

## Project Architecture

### Main Components
- `index.js` - Main bot file with all functionality
  - Discord client initialization
  - Event handlers (ready, messageCreate, interactionCreate)
  - Ticket creation and management logic
  - Permission handling

### Key Features
1. **Ticket Panel** - Created via `!setup` command
   - Embed message with description
   - Three buttons: General, Bug Report, Partnership Request
   
2. **Ticket Creation** - Triggered by button clicks
   - Creates private text channel
   - Sets permissions (only user + staff can view)
   - Sends welcome message with instructions
   
3. **Ticket Management**
   - `!close` command to delete ticket channels
   - Tracking active tickets via Map
   - 3-ticket limit per user

### Dependencies
- discord.js: ^14.24.0
- Node.js 20

## Setup Required

### User Must Complete:
1. Create Discord Application at https://discord.com/developers/applications
2. Create a bot and enable these intents:
   - Server Members Intent
   - Message Content Intent
3. Copy bot token and add to Replit Secrets as `DISCORD_BOT_TOKEN`
4. Invite bot to their Discord server with proper permissions
5. Run `!setup` in a channel to create the ticket panel

## Commands
- `/ticket` - Creates the ticket panel with buttons (slash command)
- `!close` - Closes and deletes a ticket channel (use inside tickets only)

## File Structure
```
.
├── index.js          # Main bot code
├── package.json      # Dependencies and scripts
├── README.md         # Setup and usage instructions
├── replit.md         # Project documentation (this file)
└── .gitignore        # Git ignore patterns
```

## Workflow Configuration
- Name: Discord Bot
- Command: `npm start`
- Output: Console
- Status: Will run once DISCORD_BOT_TOKEN is added

## Next Steps for User
1. Follow README.md instructions to get Discord bot token
2. Add token to Replit Secrets
3. Bot will automatically start and be ready to use
