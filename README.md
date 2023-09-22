## This bot is no longer being maintained or updated.

Methods of scraping update data have become progressively more difficult, and it's no longer worth it to find every possible solution when much better options exist now.

The #news webhook on the [Mojira Discord server](https://discord.gg/rpCyfKV) has both relevant links and a small message footprint, which should work for most cases.

---

<img src="https://cdn.discordapp.com/avatars/1006537692047220828/c89a88d23112238d97abcf0dc89e8e9f.png?size=128" alt="Bot image" align="right">
<div align="center">
  <h1>Minecraft Update Tracker Bot</h1>
  <h3>tracks Minecraft Java and Bedrock edition updates on Discord servers</h3>
</div>

<br>

## Example Screenshots
![image](https://user-images.githubusercontent.com/57044042/184725570-72930a00-cae4-401f-833a-f989d4ad7d66.png)
![image](https://user-images.githubusercontent.com/57044042/184725593-795540f4-bf27-4fa9-b831-c366a94a7b96.png)


<br>

## How does it work?
Various minecraft site APIs from the feedback site, issue tracker and launcher assets are used to track new updates being released and to get article links of those versions.

<br>

## How to set it up yourself
### Requiremments:
- Node.js 18+ https://nodejs.org
- pnpm (`corepack enable` + `corepack prepare pnpm@latest --activate`)

### Running:
1. Copy the `.env.example` file, rename it to `.env` and fill out all values.

2. Deploy the bot commands to your application
```bash
node deploy-commands.js
```

3. Install all necessary dependencies and start the bot
```bash
pnpm install
node .
```

<br><br>

If anyone offers to rewrite this in TypeScript, no, just no.
