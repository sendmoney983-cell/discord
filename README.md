# Discord Support Ticket Bot

A Discord bot that creates a professional support ticket system with category buttons for General, Bug Report, and Partnership Request.

## Features

✅ Interactive button-based ticket creation
✅ Three ticket categories: General, Bug Report, Partnership Request
✅ Private ticket channels for each user
✅ Automatic permission management
✅ Clean, modern Discord-style embeds
✅ Easy ticket closing with `!close` command
✅ Prevents ticket spam (max 3 tickets per user)
✅ **Automatic language translation** in ticket channels:
  - Staff messages in English are auto-translated to member's detected language
  - Member messages are auto-translated to English for staff
  - Intelligent language detection and seamless communication

## Setup Instructions

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" tab on the left
4. Click "Add Bot" and confirm
5. **Important:** Enable these Privileged Gateway Intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
6. Click "Reset Token" and copy your bot token (keep this secret!)

### 2. Add Bot Token to Replit

1. In your Replit project, click the **Secrets** tool (lock icon) in the left sidebar
2. Create a new secret:
   - Key: `DISCORD_BOT_TOKEN`
   - Value: (paste your bot token from step 1.6)

### 2b. Configure Support Roles (Optional but Recommended)

To control which staff members can view and respond to tickets:

1. In Discord, go to Server Settings → Roles
2. Right-click on your support role(s) and click "Copy ID" 
   - You must enable Developer Mode first: User Settings → Advanced → Developer Mode
3. In Replit Secrets, add a new secret:
   - Key: `SUPPORT_ROLE_IDS`
   - Value: Paste the role ID(s), comma-separated if multiple (e.g., `123456789,987654321`)

**Note:** If you don't set support roles, the bot will automatically grant access to all roles with "Manage Channels" permission.

### 3. Invite the Bot to Your Server

1. In Discord Developer Portal, go to "OAuth2" → "URL Generator"
2. Select these scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select these bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Channels
   - ✅ Read Message History
   - ✅ Embed Links
   - ✅ Attach Files
4. Copy the generated URL and open it in your browser
5. Select your server and click "Authorize"

### 4. Run the Bot

The bot will automatically start when you run the project. You should see:
```
✅ Bot logged in as YourBotName#1234
🎫 Support ticket system is ready!
✅ Slash commands registered! Use /ticket to create the ticket panel
```

## Usage

### Setting Up the Ticket Panel

1. In any text channel where you want the ticket panel, type:
   ```
   /ticket
   ```
2. The bot will create an embed with three buttons:
   - **General Support** (Red) - For general inquiries
   - **Bug Report** (Blue) - For reporting bugs
   - **Partnership Request** (Green) - For partnership opportunities

### Creating a Ticket

When users click one of the three buttons:
1. A form (modal) appears asking them to describe their inquiry (they can type anything, no minimum length!)
2. After submitting the form, a private ticket channel is created **under the "Support Tickets" category**
3. Only the user and staff can see the channel
4. The welcome message shows their inquiry and two buttons:
   - **Close Ticket** (red) - Closes and deletes the channel
   - **Show Copyable Info** (blue) - Shows ticket details privately

**Note:** The bot will automatically find or create a "Support Tickets" category in your server. If you already have a category with "support" and "ticket" in the name, it will use that one.

### Accessing Website Services

1. Run the `/service` command in any channel
2. A dropdown menu will appear with 12 service options:
   - Transaction Delay
   - Locked Account
   - Migration Issues
   - Validate Wallet
   - Assets Recovery
   - Transaction Error
   - Staking Issues
   - Swap/Exchange
   - Deposits & Withdrawals
   - High Gas Fees
   - Security Breach
   - Other Issues
3. Select your issue type from the dropdown
4. The bot will display the website link: https://defiportfinance.org/

### Automatic Translation

The bot automatically translates messages in ticket channels:

**For Staff (Team Members):**
- When you type in English, the bot detects the member's language and translates your message
- Example: "How can I help you?" → "¿Cómo puedo ayudarte?" (if member uses Spanish)

**For Members:**
- When members type in their native language, the bot automatically translates to English for staff
- Example: "Tengo un problema" → "I have a problem" (for staff to read)

**How it works:**
- Automatic language detection
- Real-time translation appears as a reply to each message
- No setup required - works automatically in all ticket channels

### Closing a Ticket

**Option 1:** Click the red "Close Ticket" button in the ticket channel

**Option 2:** Type the command:
```
!close
```
The ticket will close and delete after 3 seconds.

## Commands

| Command | Description | Who Can Use | Where to Use |
|---------|-------------|-------------|--------------|
| `/ticket` | Creates the ticket panel with buttons | Team members only (Manage Channels permission) | Any channel |
| `/service` | Shows website services dropdown menu | Team members only (Manage Channels permission) | Any channel |
| `!close` | Closes the current ticket | Anyone in the ticket | Inside ticket channels only |

## Ticket Limits

- Users can have a maximum of 3 open tickets at once
- This prevents spam and ensures support quality

## Customization

You can customize the bot by editing `index.js`:
- Change embed colors (currently Discord blurple: `#5865F2`)
- Modify button labels or add new categories
- Adjust ticket limits
- Change welcome messages
- Add support role permissions

## Troubleshooting

### Bot doesn't respond
- Check that the bot is online in your server
- Verify you've enabled Message Content Intent in Discord Developer Portal
- Make sure the bot has proper permissions in your server

### "Token Invalid" error
- Double-check your `DISCORD_BOT_TOKEN` secret is correct
- Generate a new token in Discord Developer Portal if needed

### Can't create channels
- Ensure the bot has "Manage Channels" permission
- Check that the bot's role is higher than the channels it's trying to manage

### Support staff can't see tickets
- Add your support role IDs to the `SUPPORT_ROLE_IDS` secret
- Or ensure support staff have the "Manage Channels" permission
- Verify role IDs are correct (enable Developer Mode to copy IDs)

## Tech Stack

- Node.js
- Discord.js v14
- Replit for hosting

## License

ISC
