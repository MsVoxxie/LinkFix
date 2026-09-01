# LinkFix

A Discord bot that rewrites social media links so they embed cleanly in chat.
When someone posts a link from a supported platform, the bot replies with a
fixed version (e.g. `x.com` → `fixupx.com`) that Discord can embed.

Supported platforms: Bluesky, FurAffinity, Instagram, Pixiv, Reddit, TikTok,
Tumblr, Twitter/X.

## How it works

- If the original message **does not** embed, the bot fixes it automatically.
- If it **does** already embed, the bot adds a reaction; the author can click it
  to swap in the fixed version.
- Sent fixes get a 🚮 reaction for ~30s so the author can remove the batch.
- Users can opt out per-user with `/preference`.

## Setup

1. `yarn install`
2. Copy `.env_example` to `.env` and fill it in:

   | Var | Purpose |
   | --- | --- |
   | `DISCORD_TOKEN` | Bot token |
   | `CLIENT_ID` | Application ID (for command registration) |
   | `DATABASE_TOKEN` | MongoDB connection string |
   | `DEVELOPERS` | Comma-separated user IDs allowed to run dev-only commands |
   | `DEV_ID` | Guild ID for local command testing (optional) |

3. Register slash commands with Discord: `yarn deploy`
4. Start the bot: `yarn start` (or `pm2 start ecosystem.config.cjs`)

Optional: `LOG_LEVEL` (`debug` in dev, `info` in prod by default),
`NODE_ENV=production` for JSON logs.

## Scripts

| Script | Does |
| --- | --- |
| `yarn start` | Run the bot |
| `yarn deploy` | Register all local slash commands globally |
| `yarn deploy:clear` | Remove all global slash commands |
| `yarn test` | Run the vitest suite |
| `yarn test:watch` | Run tests in watch mode |
| `yarn migrate:linksfixed-key` | One-off DB migration, see below |

## Commands

| Command | Who | Does |
| --- | --- | --- |
| `/fx <url>` | anyone | Fix a single URL on demand |
| `/preference` | anyone | Opt in or out of automatic link fixing |
| `/fix-here` | Manage Server | Check the bot's permissions in the current channel |
| `/setup-audit` | Manage Server | Scan every channel for permission problems |

## Layout

```
noNameLinks.js          entry point: builds the client, runs loaders, logs in
core/loaders/           command / event / mongo loaders
events/                 gateway event handlers (bot/, linkfix/, executors/)
commands/               slash commands, grouped by category
functions/helpers/      link extraction, fixing, permission checks, deploy
functions/logging/      pino-backed Logger
config/                 services (regex + rebuild rules), constants
models/                 mongoose schemas
scripts/                one-off maintenance scripts
```

Adding a platform: add an entry to `config/services.js` (regex + emoji) and a
matching rebuild rule in `functions/helpers/fixedLinkMapper.js`.

## Database migration

The `linksFixed` counter document is now pinned with `key: "global"`. Before
deploying a build that includes this change, run once against the production DB:

```
yarn migrate:linksfixed-key
```

It is idempotent. Without it, the first counter update after deploy starts a
fresh document and the lifetime count is lost.
