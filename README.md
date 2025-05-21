<div align="center">

# `Keyword Bot`

A Discord bot to search a term on YouTube and scan through video metadata and video tags to find keywords.

Originally made for [Timepass](https://x.com/ignTimepass) (aka Mia or 2imepass) as a commision, but she has since given me permission to open source it. Initially created on May 21, 2023 and rewritten on Jan 4, 2024.

Built with [`Discord Interactions API`](https://discord.com/developers/docs/interactions/receiving-and-responding), [`Cloudflare Workers`](https://workers.cloudflare.com), [`Hono`](https://hono.dev), and [`discord-interactions`](https://www.npmjs.com/package/discord-interactions).

</div>

## Disclaimer

**This code is not plug and play!** This project wasn't written with the goal of 'open sourcing' it, and so the code might be super messy. This was my first time working with Discord's HTTP interaction API & Cloudflare Workers along with the YouTube API itself, and so things might not be written or named the best way. Additionally, some things are hardcoded, such as emoji IDs. I plan to eventually relook into this project and update some parts, but I wanted to release it in its current state for 'educational purposes.'

## Development

### Requirements

- [`Node.js`](https://nodejs.org/en): For running the bot (`v18 or higher`)
- [`Yarn`](https://yarnpkg.com): For installing dependencies (`corepack enable`)
- [`Discord Bot Token`](https://discord.com/developers/applications): For running the bot.
- [`YouTube Data API v3 Key`](https://console.cloud.google.com/apis/credentials): For searching YouTube videos.
- [`Cloudflare Worker`](https://workers.cloudflare.com): For hosting the bot.

### Running

I recommend following [Discord's own guide](https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers) on hosting an app on Cloudflare Workers, up until the "Deployment" section, to setup both the Discord bot and the Cloudflare Worker.

> [!IMPORTANT]
> Make sure to set `DISCORD_TOKEN`, `DISCORD_PUBLIC_KEY`, `DISCORD_APPLICATION_ID`, and `YOUTUBE_API_KEY` in your Cloudflare Worker through either the dashboard or the CLI (`wrangler secret put <secret>`). As well, make sure to create a KV namespace and set it in your `wrangler.toml` file.

```bash
# Install dependencies
$ yarn install

# Rename example.dev.vars to .dev.vars and fill in the values
$ mv example.dev.vars .dev.vars
$ nano .dev.vars # or your favorite text editor

# Rename example.wrangler.toml to wrangler.toml and fill in the values
$ mv example.wrangler.toml wrangler.toml
$ nano wrangler.toml # or your favorite text editor

# Run the bot locally in development mode
# Make sure to run these commands in separate terminals
$ yarn dev
$ yarn ngrok

# Deploy the bot to Cloudflare Workers
$ yarn deploy
```

### Other Commands

```bash
# Register slash commands
$ yarn register

# Lint the code or fix linting errors
$ yarn lint
$ yarn lint:fix

# Format the code or fix formatting errors
$ yarn format
$ yarn format:fix
```
