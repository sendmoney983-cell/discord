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
2. The bot will create an embed with three buttons: General, Bug Report, and Partnership Request

### Creating a Ticket

Users click one of the three buttons, and the bot will:
- Create a private ticket channel
- Only the user and staff can see it
- Send a welcome message explaining the ticket

### Closing a Ticket

Inside any ticket channel, type:
```
!close
```
The bot will close and delete the channel after 3 seconds.

## Commands

| Command | Description | Where to Use |
|---------|-------------|--------------|
| `/ticket` | Creates the ticket panel with buttons | Any channel |
| `!close` | Closes the current ticket | Inside ticket channels only |

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
