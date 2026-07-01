/* tts.mjs — generate Pip's Playground voice clips with Gemini TTS.
   Reads GOOGLE_API_KEY from the ai-video-pipeline .env.local (or env).
   Usage:
     node tools/tts.mjs --samples              # audition voices
     node tools/tts.mjs --voice Leda --all     # generate the full clip set
*/
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function apiKeys() {
  // Provide one or many keys (comma/space/newline separated) via GOOGLE_API_KEYS;
  // round-robin lets several free projects' daily quotas add up.
  const env = process.env.GOOGLE_API_KEYS || process.env.GOOGLE_API_KEY;
  if (env) return env.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean);
  try {
    const m = readFileSync("/Users/jeffrey/ai-video-pipeline/.env.local", "utf8").match(/GOOGLE_API_KEY=(.+)/);
    if (m) return [m[1].trim()];
  } catch (_) {}
  throw new Error("No API key (set GOOGLE_API_KEYS)");
}
const KEYS = apiKeys();
console.log(`using ${KEYS.length} API key(s)`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STYLE = "Read aloud in a warm, friendly, gentle and cheerful voice for a happy three-year-old: ";
const STYLE_ZH = "用溫暖、親切、開心又清楚的聲音，念給三歲小朋友聽：";
const isZh = (t) => /[㐀-鿿]/.test(t);
// phrases the model refuses to voice (single char + ！) — skip, use device voice
const NO_AUDIO = new Set(["6!", "7!", "一！", "二！", "三！", "四！", "五！", "六！", "七！", "八！", "九！", "十！"]);

async function ttsOnce(text, voiceName, key, style = STYLE) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: style + text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok || data.error) {
    const msg = data.error?.message || "TTS failed";
    const quota = /quota|exceeded|rate|429/i.test(msg);
    const err = new Error(msg); err.quota = quota; throw err;
  }
  const part = (data.candidates?.[0]?.content?.parts ?? []).find((p) => p.inlineData);
  if (!part) throw new Error("No audio in response");
  return Buffer.from(part.inlineData.data, "base64"); // raw PCM 24kHz mono 16-bit
}

/** Resilient synth: rotate keys + back off through transient rate/"expired"
   blips (free-project keys have a low per-minute limit). Throws only after many
   attempts across all keys — which we treat as the daily quota being gone. */
let rr = 0;
export async function tts(text, voiceName, style = STYLE) {
  const maxAttempts = Math.max(8, KEYS.length * 4);
  const start = rr++; // rotate which key leads, so successes spread across keys
  let lastErr;
  for (let a = 0; a < maxAttempts; a++) {
    const key = KEYS[(start + a) % KEYS.length];
    try {
      return await ttsOnce(text, voiceName, key, style);
    } catch (e) {
      lastErr = e;
      // "No audio in response" is a deterministic content refusal (ultra-short
      // lines like "一！"/"6!") — retrying just burns quota, so give up at once.
      if (/no audio/i.test(e.message)) throw e;
      if (a === maxAttempts - 1) break;
      await sleep(/quota|rate|429|exhausted/i.test(e.message) ? 18000 : 6000);
    }
  }
  throw lastErr || new Error("TTS failed");
}

export function pcmToWav(pcm, sampleRate = 24000, channels = 1, bitDepth = 16) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * (bitDepth / 8), 28);
  header.writeUInt16LE(channels * (bitDepth / 8), 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function samples() {
  const dir = join(ROOT, "tools", "samples");
  mkdirSync(dir, { recursive: true });
  const phrase = "Hi! Let's play! Find the red one! Yay, you did it! Three in a row!";
  const voices = ["Leda", "Puck", "Aoede", "Sulafat"]; // youthful / upbeat / breezy / warm
  for (const v of voices) {
    process.stdout.write(`  ${v}… `);
    const pcm = await tts(phrase, v);
    writeFileSync(join(dir, `${v}.wav`), pcmToWav(pcm));
    console.log("ok");
  }
  console.log(`samples in ${dir}`);
}

/* ---------- full clip set (mirrors the game phrasing exactly) ---------- */
import { createHash } from "crypto";
import { execFileSync } from "child_process";
import { rmSync } from "fs";
import { ZH_PHRASES } from "../src/i18n.js";

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const COLORS = ["red", "orange", "yellow", "green", "blue", "purple", "pink"];
const SHAPES = ["circle", "square", "triangle", "star", "heart"];
const ANIMALS = [["cow","Moo"],["dog","Woof"],["cat","Meow"],["duck","Quack"],["sheep","Baa"],["frog","Ribbit"],["lion","Roar"],["pig","Oink"]];
const OBJECTS = ["apple","ball","car","sun","cup","fish","hat","flower","balloon","kite","moon"];
const WORD_FOR = {A:"Apple",B:"Ball",C:"Cat",D:"Dog",E:"Egg",F:"Fish",G:"Goat",H:"Hat",I:"Igloo",J:"Jam",K:"Kite",L:"Lion",M:"Moon",N:"Nest",O:"Orange",P:"Pig",Q:"Queen",R:"Rabbit",S:"Sun",T:"Tree",U:"Umbrella",V:"Van",W:"Whale",X:"Fox",Y:"Yo-yo",Z:"Zebra"};
const STICKERS = [...ANIMALS.map(([n]) => n), ...OBJECTS]; // ids; names are cap()
const PRAISE = ["Great job!","Wonderful!","You did it!","Awesome!","Nice!","Yay!","Perfect!","Well done!","Hooray!","So good!","You got it!","Brilliant!","Super!","Way to go!","Lovely!","Great!","Clever!","Smart!","Amazing!"];

function buildPhrases() {
  const s = new Set();
  // instructions
  COLORS.forEach((c) => s.add(`Find the ${c} one!`));
  SHAPES.forEach((x) => s.add(`Find the ${x}!`));
  s.add("How many? Tap them to count!");
  ANIMALS.forEach(([n, snd]) => s.add(`Who says ${snd}? Find the ${n}!`));
  Object.entries(WORD_FOR).forEach(([L, w]) => s.add(`Find the letter ${L}. ${L} is for ${w}.`));
  OBJECTS.forEach((o) => s.add(`Find the ${o}!`));
  s.add("What comes next?");
  // correct labels
  COLORS.forEach((c) => s.add(`${cap(c)}!`));
  SHAPES.forEach((x) => s.add(`${cap(x)}!`));
  [1,2,3,4,5].forEach((n) => { s.add(`${n}!`); s.add(`${n}`); });
  ANIMALS.forEach(([, snd]) => s.add(`${snd}!`));
  Object.entries(WORD_FOR).forEach(([L, w]) => s.add(`${L} is for ${w}!`));
  OBJECTS.forEach((o) => s.add(`${cap(o)}!`));
  s.add("Yes!");
  // wrong (gentle, non-combinatorial)
  ["Try again!","Try again! Count them.","Try again! Look at the pattern."].forEach((x) => s.add(x));
  // combos
  [2,3,4,5].forEach((n) => s.add(`${n} in a row!`));
  // system
  ["Pick a game!","Sound on!","Your sticker book!","Win lessons to collect stickers!"].forEach((x) => s.add(x));
  // lesson complete
  PRAISE.forEach((p) => s.add(`Lesson complete! ${p}`));
  STICKERS.forEach((n) => s.add(`Lesson complete! You got a new sticker, the ${cap(n)}!`));
  // sticker book taps
  STICKERS.forEach((n) => s.add(cap(n)));

  /* ---- new content: ABC Match, Sight Words, Count to 10, Fruits, Subjects ---- */
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  LETTERS.forEach((L) => {
    s.add(`Find the little ${L.toLowerCase()}.`);
    s.add(`Find the big letter ${L}.`);
    s.add(`${L} and ${L.toLowerCase()}!`);
  });
  const SIGHT = ["the","I","see","we","can","go","is","it","a","at","in","no","up","my","to","do","he","she","me","and","for","on","run","big","red","you","one","two","play","help"];
  SIGHT.forEach((w) => { s.add(`Find the word ${w}!`); s.add(`${w}!`); });
  [1,2,3].forEach((n) => s.add(`Take away ${n}. How many are left?`));
  [6,7,8,9,10].forEach((n) => { s.add(`${n}!`); s.add(`${n}`); });
  const FRUITS = ["banana","orange","strawberry","grape","watermelon","cherry","pear"];
  FRUITS.forEach((f) => { s.add(`Find the ${f}!`); s.add(`${cap(f)}!`); });
  // subject shelf prompts
  s.add("Pick a subject!");
  ["English","Numbers","Colors & Shapes","Animals & Fruits"].forEach((sub) => s.add(`${sub}! Pick a game!`));
  // new fruit stickers (reveal line + book taps)
  FRUITS.forEach((f) => { s.add(`Lesson complete! You got a new sticker, the ${cap(f)}!`); s.add(cap(f)); });

  // Chinese guidance lines (bilingual mode)
  ZH_PHRASES.forEach((z) => s.add(z));

  return [...s];
}

const hash = (t) => createHash("md5").update(t).digest("hex").slice(0, 12);

async function generateAll(voice) {
  const outDir = join(ROOT, "audio");
  mkdirSync(outDir, { recursive: true });
  const manPath = join(outDir, "manifest.json");
  const manifest = existsSync(manPath) ? JSON.parse(readFileSync(manPath, "utf8")) : { voice, clips: {} };
  manifest.voice = voice;

  const phrases = buildPhrases();
  console.log(`${phrases.length} phrases → audio/ (voice ${voice})`);
  let made = 0, skipped = 0, failed = 0, consec = 0;
  for (const text of phrases) {
    // The TTS model deterministically returns no audio for ultra-short
    // "<one char>！" lines, so never spend a request on them — they fall back
    // to the device voice in-app. (English "6!"/"7!" alias the "6"/"7" clips.)
    if (NO_AUDIO.has(text)) { skipped++; continue; }
    const h = hash(text);
    const file = `${h}.m4a`;
    // skip if already mapped to an existing file — honour the manifest's actual
    // target (which may be an alias to a different hash, e.g. "6!" → "6"), not
    // the recomputed hash, so aliased entries aren't pointlessly regenerated.
    const have = manifest.clips[text];
    if (have && existsSync(join(outDir, have))) { skipped++; continue; }

    // 1) synthesize (tts() already rotates keys + backs off through transient limits)
    let pcm;
    try {
      pcm = await tts(text, voice, isZh(text) ? STYLE_ZH : STYLE);
      consec = 0;
    } catch (e) {
      console.error(`  TTS FAILED ${JSON.stringify(text)}: ${e.message.slice(0, 60)}`);
      failed++;
      // Only quota/rate errors mean "come back later" — a content failure like
      // "No audio in response" (the model refuses ultra-short "一！"/"6!" lines)
      // must NOT trip the daily-quota stop, or a run of them halts the batch
      // before the good clips are reached.
      const quotaErr = /quota|rate|429|exhausted|exceeded/i.test(e.message);
      if (quotaErr) {
        consec++;
        if (consec >= 6) { console.log(`\n⛔ persistent quota failures — stopping. ${made} made, ${phrases.length - made - skipped} left. Re-run later to resume.`); break; }
      }
      continue;
    }

    // 2) convert PCM→m4a (retry conversion only — never re-calls the API)
    const wav = join(outDir, `${h}.wav`);
    writeFileSync(wav, pcmToWav(pcm));
    let converted = false;
    for (let a = 1; a <= 3 && !converted; a++) {
      try { execFileSync("afconvert", ["-f", "m4af", "-d", "aac", wav, join(outDir, file)]); converted = true; }
      catch (e) { if (a === 3) console.error(`  afconvert FAILED ${JSON.stringify(text)}: ${e.message}`); }
    }
    rmSync(wav, { force: true });
    if (!converted) { failed++; continue; }

    manifest.clips[text] = file;
    writeFileSync(manPath, JSON.stringify(manifest, null, 0));
    made++;
    console.log(`  [${made + skipped}/${phrases.length}] ${JSON.stringify(text)}`);
    await sleep(7000); // pace below the free per-minute TTS limit (≈3/min/key)
  }
  console.log(`done: ${made} new, ${skipped} cached, ${failed} failed, ${Object.keys(manifest.clips).length} total`);
}

if (process.argv.includes("--samples")) samples().catch((e) => { console.error(e.message); process.exit(1); });
else if (process.argv.includes("--all")) {
  const vi = process.argv.indexOf("--voice");
  const voice = vi >= 0 ? process.argv[vi + 1] : "Leda";
  generateAll(voice).catch((e) => { console.error(e.message); process.exit(1); });
}
