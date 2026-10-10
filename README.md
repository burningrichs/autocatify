# AutoCatify - Vencord userplugin

Randomly catifies your Discord messages. Each word (or the whole message, your
choice) has a configurable chance of turning into meow, mrrp, purr, nya and
friends - with random stretching (meeeeooow), ~ decorations, ! punctuation and
the occasional roleplay action (*purrs*).

Never touches: code blocks, inline code, links, mentions, custom emoji,
`@everyone` / `@here`.

## Settings (Discord > Settings > Vencord > Plugins > AutoCatify)

| Setting | Default | What it does |
|---|---|---|
| Mode | Each word separately | Dice roll applies per word, or once for the whole message |
| Chance | 50% | Catification chance |
| Stretch | on | Randomly stretch sounds (meow -> meeeeooow) |
| Keep formatting | on | Preserves case & punctuation (Hello! -> Meow!) |
| Actions | on | ~12% of replacements are roleplay actions like *purrs* |
| Catify edits | off | Also roll when editing an already sent message |
| Extra sounds | empty | Comma separated sounds added to the pool |

Example output (per word, 50%): `can someone MRRP me with the meoooow please`
Whole message mode: either `Meow mew purrr Mrrow!` or the original text.

## Install

Prerequisites: Git, Node.js 22+, pnpm. If you don't have pnpm, run
`corepack enable` (Node ships with corepack).

### Automated (PowerShell)

```powershell
.\install.ps1
```

Clones Vencord into `.\Vencord`, copies the plugin into its userplugins folder,
installs dependencies and builds.

### Manual

```powershell
git clone https://github.com/Vendicated/Vencord
Copy-Item -Recurse .\autocatify .\Vencord\src\userplugins\autocatify
cd Vencord
pnpm install
pnpm build
```

### Then load it

- **Discord desktop:** close Discord, run `pnpm inject` inside the Vencord
  folder, start Discord (undo later with `pnpm uninject`)
- **Chromium browser:** chrome://extensions > Developer mode > Load unpacked >
  select `Vencord\dist\chromium`

Finally, enable **AutoCatify** in Discord under Settings > Vencord > Plugins.

## Editing the plugin

Change `autocatify\index.ts`, then from the Vencord folder run `pnpm build`
(or `pnpm watch` while iterating) and restart Discord / reload the extension.

## Note

Client mods technically violate Discord's ToS. Vencord is widely used and
tolerated, but use at your own discretion.
