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

const LETTER = /\p{L}/u;
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
            { label: "Each word separately", value: "word", default: true },
            { label: "The whole message at once", value: "message" }
        ]
    },
    chance: {
        type: OptionType.SLIDER,
        description: "Chance of catification (%)",
        markers: [0, 10, 25, 50, 75, 90, 100],
        default: 50
    },
    stretch: {
        type: OptionType.BOOLEAN,
        description: "Randomly stretch sounds (meow -> meeeeooow)",
        default: true
    },
    keepFormatting: {
        type: OptionType.BOOLEAN,
        description: "Keep capitalisation and punctuation of the original words",
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

function makeSound(): string {
    if (settings.store.actions && Math.random() < 0.12)
        return `*${ACTIONS[randInt(ACTIONS.length)]}*`;

    const sounds = getSounds();
    let s = sounds[randInt(sounds.length)];

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
    return s;
}

function catifyWord(token: string): string {
    if (token.startsWith("<") && token.endsWith(">")) return token;
    if (LINK.test(token) || DOMAIN.test(token)) return token;
    if (PING.test(token)) return token;

    const prefix = /^[^\p{L}]*/u.exec(token)?.[0] ?? "";
    if (prefix.length === token.length) return token;

    let end = token.length;
    while (end > prefix.length && !LETTER.test(token.charAt(end - 1))) end--;

    const core = token.slice(prefix.length, end);
    const suffix = token.slice(end);
    const sound = makeSound();

    if (!settings.store.keepFormatting)
        return prefix + sound + suffix;

    let cased = sound;
    if (core === core.toUpperCase() && core !== core.toLowerCase())
        cased = sound.toUpperCase();
    else if (core.charAt(0) !== core.charAt(0).toLowerCase())
        cased = sound.charAt(0).toUpperCase() + sound.slice(1);

    return prefix + cased + suffix;
}

function roll() {
    return Math.random() * 100 < settings.store.chance;
}

function catifyContent(content: string): string {
    const wholeMessage = settings.store.mode === "message";
    const catify = wholeMessage ? roll() : true;

    return content
        .split(CODE)
        .map((segment, i) =>
            i % 2
                ? segment
                : segment.replace(/\S+/g, t =>
                    catify && (wholeMessage || roll()) ? catifyWord(t) : t
                )
        )
        .join("");
}

export default definePlugin({
    name: "AutoCatify",
    description: "Randomly catifies your messages - words may turn into meow, mrrp, purr, nya and friends",
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
