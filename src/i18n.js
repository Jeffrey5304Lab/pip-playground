/* ============================================================
   i18n.js — Chinese guidance for the bilingual voice mode.
   Maps each English phrase a 3-year-old hears to a warm, natural
   Traditional-Chinese line. In bilingual mode the app speaks the
   Chinese first (so the child understands the task) then the English
   (the word being learned). Text & pictures stay English — a 3yo
   can't read either language, so only the *spoken* line is bilingual.

   Scope: the picture+audio rooms that suit a 3yo (Colors, Shapes,
   Numbers, Animals, Fruits) + system prompts. The reading rooms
   (ABC, Words, Sight Words, Patterns, ABC Match) stay English-only —
   they're for ages 4–6.
   ============================================================ */

export const ZH = {
  /* ---- system ---- */
  "Pick a game!": "選一個遊戲吧！",
  "Pick a subject!": "選一個吧！",
  "Try again!": "再試一次！",
  "Try again! Count them.": "再試一次，數數看！",

  /* ---- Colors ---- */
  "Find the red one!": "找紅色的！",
  "Find the orange one!": "找橘色的！",
  "Find the yellow one!": "找黃色的！",
  "Find the green one!": "找綠色的！",
  "Find the blue one!": "找藍色的！",
  "Find the purple one!": "找紫色的！",
  "Find the pink one!": "找粉紅色的！",
  "Red!": "紅色！",
  "Orange!": "橘色！",
  "Yellow!": "黃色！",
  "Green!": "綠色！",
  "Blue!": "藍色！",
  "Purple!": "紫色！",
  "Pink!": "粉紅色！",

  /* ---- Shapes ---- */
  "Find the circle!": "找圓形！",
  "Find the square!": "找正方形！",
  "Find the triangle!": "找三角形！",
  "Find the star!": "找星星！",
  "Find the heart!": "找愛心！",
  "Circle!": "圓形！",
  "Square!": "正方形！",
  "Triangle!": "三角形！",
  "Star!": "星星！",
  "Heart!": "愛心！",

  /* ---- Numbers (counting + take-away) ---- */
  "How many? Tap them to count!": "有幾個呀？點點看，一起數！",
  "Take away 1. How many are left?": "拿走一個，剩下幾個？",
  "Take away 2. How many are left?": "拿走兩個，剩下幾個？",
  "Take away 3. How many are left?": "拿走三個，剩下幾個？",
  "1!": "一！",
  "2!": "二！",
  "3!": "三！",
  "4!": "四！",
  "5!": "五！",
  "6!": "六！",
  "7!": "七！",
  "8!": "八！",
  "9!": "九！",
  "10!": "十！",

  /* ---- Animals (prompt asks the sound; reward reinforces the name) ---- */
  "Who says Moo? Find the cow!": "誰會哞哞叫？找牛牛！",
  "Who says Woof? Find the dog!": "誰會汪汪叫？找狗狗！",
  "Who says Meow? Find the cat!": "誰會喵喵叫？找貓咪！",
  "Who says Quack? Find the duck!": "誰會呱呱叫？找鴨鴨！",
  "Who says Baa? Find the sheep!": "誰會咩咩叫？找綿羊！",
  "Who says Ribbit? Find the frog!": "誰會呱呱叫？找青蛙！",
  "Who says Roar? Find the lion!": "誰會吼吼叫？找獅子！",
  "Who says Oink? Find the pig!": "誰會哼哼叫？找豬豬！",
  "Moo!": "是牛牛！",
  "Woof!": "是狗狗！",
  "Meow!": "是貓咪！",
  "Quack!": "是鴨鴨！",
  "Baa!": "是綿羊！",
  "Ribbit!": "是青蛙！",
  "Roar!": "是獅子！",
  "Oink!": "是豬豬！",

  /* ---- Fruits (note: "Orange!" reward is shared with the color, stays 橘色) ---- */
  "Find the banana!": "找香蕉！",
  "Find the orange!": "找柳橙！",
  "Find the strawberry!": "找草莓！",
  "Find the grape!": "找葡萄！",
  "Find the watermelon!": "找西瓜！",
  "Find the cherry!": "找櫻桃！",
  "Find the pear!": "找梨子！",
  "Banana!": "香蕉！",
  "Strawberry!": "草莓！",
  "Grape!": "葡萄！",
  "Watermelon!": "西瓜！",
  "Cherry!": "櫻桃！",
  "Pear!": "梨子！",
};

/** The unique Chinese lines (for the TTS generator). */
export const ZH_PHRASES = [...new Set(Object.values(ZH))];
