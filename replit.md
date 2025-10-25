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
- Changed from !setup to /ticket slash command
- Added comprehensive README with setup instructions
- **Fixed critical permission issue**: Added support role access to ticket channels
- Implemented configurable SUPPORT_ROLE_IDS for staff access control
- Added fallback: roles with Manage Channels permission can view tickets
- Added channelDelete listener to prevent memory leaks in ticket tracking
- Enhanced error messages and setup logging
- **NEW**: Implemented modal forms for ticket creation (users fill out inquiry before channel creation)
- **NEW**: Added Close Ticket button (red) in ticket channels
- **NEW**: Added Show Copyable Info button (blue) to display ticket details
- Ticket data now includes user's inquiry text from the form
- **NEW**: Tickets are now created under a "Support Tickets" category (auto-created if doesn't exist)
- **UPDATED**: Removed minimum character requirement for ticket inquiries (users can now type anything)
- **UPDATED**: Button colors - General Support (Red/Danger), Bug Report (Blue/Primary), Partnership Request (Green/Success)
- **NEW**: Added `/service` command with service dropdown menu containing 12 most common services
- **NEW**: Website link (https://defiportfinance.org/) displayed as plain text when users select a service from dropdown
- **NEW**: Services in dropdown: Transaction Delay, Locked Account, Migration Issues, Validate Wallet, Assets Recovery, Transaction Error, Staking Issues, Swap/Exchange, Deposits & Withdrawals, High Gas Fees, Security Breach, and Other Issues
- **NEW**: Automatic language translation in ticket channels using @vitalets/google-translate-api
  - Staff messages in English are auto-translated to member's detected language
  - Member messages in their language are auto-translated to English for staff
  - Automatic language detection with intelligent translation
  - No additional configuration required

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
- `/ticket` - Creates the ticket panel with buttons (slash command) - **Team members only**
- `/service` - Shows website services dropdown menu (slash command) - **Team members only**
- `!close` - Closes and deletes a ticket channel (use inside tickets only)

## Permissions
- `/ticket` and `/service` commands require **Manage Channels** permission
- Only team members with Manage Channels permission can use these commands
- Regular members can interact with ticket buttons and use tickets once created

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
