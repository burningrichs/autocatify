# AutoCatify - Vencord userplugin

Randomly adds cat sounds between the words of your Discord messages. Your
words are never changed - meow, mrrp, purr, nya and friends get inserted in
the gaps between words (never before the first or after the last word, max
one sound per gap), with random stretching (meeeooow), ~ decorations, !
punctuation and the occasional roleplay action (*purrs*). Added sounds match
the capitalisation of the word that follows (SPARTA -> MRRRP).

Never touches: code blocks, inline code, links, mentions, custom emoji,
`@everyone` / `@here`.

## Settings (Discord > Settings > Vencord > Plugins > AutoCatify)

| Setting | Default | What it does |
|---|---|---|
| Mode | Each gap between words | Dice roll applies per gap, or once for the whole message |
| Chance | 50% | Chance of a sound being added in a gap between words |
| Stretch | on | Randomly stretch sounds (meow -> meeeeooow) |
| Actions | on | ~12% of additions are roleplay actions like *purrs* |
| Catify edits | off | Also roll when editing an already sent message |
| Extra sounds | empty | Comma separated sounds added to the pool |

Example output (per gap, 50%): `one mewl two three brrp four five mow! six seven eight nine ten`

## Install

Prerequisites: Git, Node.js 22+, pnpm. If you don't have pnpm, run
`corepack enable` (Node ships with corepack; on Node 25+ use `npm install -g pnpm`).

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

Change `autocatify\index.ts`, then from the repo root run

```powershell
.\build.ps1
```

It copies the plugin into the Vencord clone (`Vencord\src\userplugins`) and
rebuilds, so the copy can never go stale. Restart Discord / reload the
extension to see changes.

## Note

Client mods technically violate Discord's ToS. Vencord is widely used and
tolerated, but use at your own discretion.
