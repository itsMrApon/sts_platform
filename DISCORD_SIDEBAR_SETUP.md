# Discord Sidebar Links Setup

## 🎯 Overview

Discord integration has been simplified to sidebar links that open the appropriate Discord channel for each tenant. This provides quick access to tenant-specific Discord channels without cluttering the dashboards.

## 🚀 Setup Instructions

### 1. Create Discord Channels

Create these channels in your Discord server:

- `#switchtoswag` - For SwitchToSwag e-commerce team
- `#sudotechserve` - For SudoTechServe SaaS/agency team
- `#strongtermstrategy` - For StrongTermStrategy manufacturing team
- `#general` - For general discussions (used by superuser)

### 2. Get Discord Channel URLs

To get the Discord channel URLs:

1. **Enable Developer Mode in Discord:**

   - Go to User Settings → Advanced → Enable Developer Mode

2. **Get Channel IDs:**

   - Right-click on each channel → "Copy Channel Link"
   - The URL format will be: `https://discord.com/channels/SERVER_ID/CHANNEL_ID`

3. **Update Sidebar Configuration:**
   - Open `client/src/components/layout/sidebar.tsx`
   - Replace the placeholder URLs in the `discordUrls` object (lines 178-181)

### 3. Update Sidebar Configuration

Edit the Discord URLs in the sidebar component:

```typescript
const discordUrls = {
  switchtoswag:
    "https://discord.com/channels/YOUR_SERVER_ID/YOUR_SWITCHTOSWAG_CHANNEL_ID",
  sudotechserve:
    "https://discord.com/channels/YOUR_SERVER_ID/YOUR_SUDOTECHSERVE_CHANNEL_ID",
  strongtermstrategy:
    "https://discord.com/channels/YOUR_SERVER_ID/YOUR_STRONGTERMSTRATEGY_CHANNEL_ID",
  superuser:
    "https://discord.com/channels/YOUR_SERVER_ID/YOUR_GENERAL_CHANNEL_ID",
};
```

Replace the placeholder values with your actual Discord server and channel IDs.

## 📱 How It Works

- **Tenant-Specific Discord Button**: Each tenant has its own Discord module in their sidebar
- **Tenant-Specific Links**: Clicking the Discord button opens the appropriate channel for that tenant
- **New Tab**: Discord opens in a new browser tab/window
- **Tenant-Specific**: Each tenant only sees their own Discord channel link

## 🎨 Features

- **Tenant-Aware**: Automatically opens the correct Discord channel for the current tenant
- **Fallback**: If tenant-specific channel is not configured, opens the general channel
- **External Link**: Opens Discord in a new tab without leaving the dashboard
- **Consistent UI**: Uses the same styling as other sidebar navigation items

## 🔧 Customization

### Adding More Discord Links

To add more Discord-related links to the sidebar:

1. **Add to Tenant Modules**: Add Discord links to individual tenant modules in `use-tenant.tsx`
2. **Create Separate Section**: Create a dedicated "Communication" or "External Links" section
3. **Multiple Discord Channels**: Add multiple Discord channels per tenant if needed

### Styling

The Discord button uses the same styling as other sidebar navigation items:

- Ghost variant button
- MessageSquare icon
- Consistent spacing and hover effects

## 📊 Channel Recommendations

### SwitchToSwag (E-commerce)

- Order notifications
- Customer support discussions
- Product updates
- Inventory management

### SudoTechServe (SaaS/Agency)

- Client communication
- Project updates
- Development discussions
- Support tickets

### StrongTermStrategy (Manufacturing)

- Production updates
- Quality control discussions
- Supply chain management
- Manufacturing schedules

### Superuser (General)

- System-wide announcements
- Administrative discussions
- Cross-tenant coordination

## 🚀 Benefits

- **Simple Integration**: No complex API setup required
- **Direct Access**: One-click access to relevant Discord channels
- **Tenant-Specific**: Each team gets their dedicated channel and only sees their own Discord link
- **No Dashboard Clutter**: Keeps dashboards focused on business data
- **Easy Maintenance**: Simple URL configuration in one file
- **Proper Separation**: Discord links are properly separated by tenant, not shared
