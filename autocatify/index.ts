import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";

const SOUNDS = [
    "meow", "mrrp", "mrrrp", "mrow", "mrrow", "mrrrow", "purr", "prrr", "purrr",
    "mew", "meww", "nya", "nyaa", "nyaaa", "nya~", "miau", "miaow", "brrp",
    "mrr", "prr", "hiss", "chirp", "mewl", "mow"
];

const ACTIONS = [
    "purrs", "tail flicks", "ear twitches", "rolls over", "pounces",
    "curls up", "stretches", "slow blinks", "headbutts", "loafs", "kneads"
];

const VOWEL = /[aeiou]/;
const CODE = /(```[\s\S]*?```|`[^`\n]*`)/g;
const LINK = /^<?(https?:\/\/|www\.)|:\/\//i;
const DOMAIN = /[\w-]+\.(com|net|org|gg|io|dev|tv|xyz|me|app|edu|gov|co|us|uk)(\/|$)/i;
const PING = /^@(everyone|here)$/i;

const settings = definePluginSettings({
    mode: {
        type: OptionType.SELECT,
        description: "What the dice roll applies to",
        options: [
            { label: "Each gap between words", value: "word", default: true },
            { label: "The whole message at once", value: "message" }
        ]
    },
    chance: {
        type: OptionType.SLIDER,
        description: "Chance of a cat sound being added between words (%)",
        markers: [0, 10, 25, 50, 75, 90, 100],
        default: 50
    },
    stretch: {
        type: OptionType.BOOLEAN,
        description: "Randomly stretch sounds (meow -> meeeeooow)",
        default: true
    },
    actions: {
        type: OptionType.BOOLEAN,
        description: "Occasionally use roleplay actions (*purrs*) instead of sounds",
        default: true
    },
    catifyEdits: {
        type: OptionType.BOOLEAN,
        description: "Also catify messages when you edit them",
        default: false
    },
    extraSounds: {
        type: OptionType.STRING,
        description: "Extra cat sounds, comma separated (e.g. blep, mrowdy)",
        default: ""
    }
});

function randInt(max: number) {
    return Math.floor(Math.random() * max);
}

function getSounds(): string[] {
    const extra = settings.store.extraSounds
        .split(",")
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);
    return [...SOUNDS, ...extra];
}

function matchCase(sound: string, anchor: string): string {
    if (anchor === anchor.toUpperCase() && anchor !== anchor.toLowerCase())
        return sound.toUpperCase();
    if (anchor.charAt(0) !== anchor.charAt(0).toLowerCase())
        return sound.charAt(0).toUpperCase() + sound.slice(1);
    return sound;
}

function makeSound(nextWord: string): string {
    let s: string;
    if (settings.store.actions && Math.random() < 0.12) {
        s = `*${ACTIONS[randInt(ACTIONS.length)]}*`;
    } else {
        const sounds = getSounds();
        s = sounds[randInt(sounds.length)];

        if (settings.store.stretch && Math.random() < 0.45) {
            const vowels: number[] = [];
            for (let i = 0; i < s.length; i++)
                if (VOWEL.test(s.charAt(i))) vowels.push(i);

            if (vowels.length) {
                const i = vowels[randInt(vowels.length)];
                s = s.slice(0, i) + s.charAt(i).repeat(2 + randInt(4)) + s.slice(i + 1);
            }
        }

        const r = Math.random();
        if (r < 0.07) s += "~";
        else if (r < 0.12) s += "!";
    }
    return matchCase(s, nextWord);
}

function isEligibleWord(token: string): boolean {
    if (token.startsWith("<") && token.endsWith(">")) return false;
    if (LINK.test(token) || DOMAIN.test(token)) return false;
    if (PING.test(token)) return false;

    const prefix = /^[^\p{L}]*/u.exec(token)?.[0] ?? "";
    return prefix.length !== token.length;
}

function roll() {
    return Math.random() * 100 < settings.store.chance;
}

function catifySegment(segment: string, everyGap: boolean): string {
    const parts = segment.split(/(\s+)/);
    let out = "";

    for (let i = 0; i < parts.length; i += 2) {
        const word = parts[i];
        const sep = parts[i + 1];
        const next = parts[i + 2];

        out += word;
        if (word && next !== undefined && isEligibleWord(word) && isEligibleWord(next) && (everyGap || roll()))
            out += " " + makeSound(next);
        if (sep !== undefined) out += sep;
    }

    return out;
}

function catifyContent(content: string): string {
    const wholeMessage = settings.store.mode === "message";
    if (wholeMessage && !roll()) return content;

    return content
        .split(CODE)
        .map((segment, i) => (i % 2 ? segment : catifySegment(segment, wholeMessage)))
        .join("");
}

export default definePlugin({
    name: "AutoCatify",
    description: "Randomly adds cat sounds between your words - meow, mrrp, purr, nya and friends",
    authors: [{ name: "Harle", id: 0n }],

    settings,

    onBeforeMessageSend(_, message) {
        message.content = catifyContent(message.content);
    },

    onBeforeMessageEdit(_, _messageId, message) {
        if (!settings.store.catifyEdits) return;
        message.content = catifyContent(message.content);
    }
});
