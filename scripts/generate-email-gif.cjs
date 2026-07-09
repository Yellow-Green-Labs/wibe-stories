const sharp = require('sharp');
const GIFEncoder = require('gif-encoder-2');
const fs = require('fs');
const path = require('path');

const GIF_W = 600;
const GIF_H = 300;
const CARD_COUNT = 6;

// Layout: { x: left edge, s: side length (square) }
// Left/right cards overlap center by ~10% of center width
const L = { x: 46,  s: 150 };
const C = { x: 170, s: 260 };
const R = { x: 404, s: 150 };
const OL = { x: -170, s: 150 };
const OR = { x: 620,  s: 150 };

function topPos(s) { return Math.round((GIF_H - s) / 2); }

// Each cycle: [leavingIdx, centerToLeftIdx, rightToCenterIdx, enteringIdx]
const CYCLES = [
  [5, 0, 1, 2],
  [0, 1, 2, 3],
  [1, 2, 3, 4],
  [2, 3, 4, 5],
  [3, 4, 5, 0],
  [4, 5, 0, 1],
];

// Initial rest: [5(L), 0(C), 1(R)]
const REST_0 = [
  { idx: 5, x: L.x, s: L.s },
  { idx: 0, x: C.x, s: C.s },
  { idx: 1, x: R.x, s: R.s },
];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

async function renderFrame(cardBuffers, placements) {
  const composites = [];
  // Sort ascending by size so smaller cards render behind larger (center on top)
  const sorted = [...placements].sort((a, b) => a.s - b.s);

  for (const p of sorted) {
    const buf = cardBuffers[p.idx];
    const size = Math.round(p.s);
    const x = Math.round(p.x);
    const y = Math.round(topPos(p.s));
    if (x + size < 0 || x > GIF_W) continue;

    composites.push({
      input: await sharp(buf).resize(size, size).png().toBuffer(),
      top: y,
      left: x,
    });
  }

  const raw = await sharp({
    create: {
      width: GIF_W,
      height: GIF_H,
      channels: 4,
      background: { r: 255, g: 255, b: 235, alpha: 255 },
    },
  })
    .composite(composites)
    .raw()
    .toBuffer();

  return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
}

function transitionFrames(cardBuffers, restFrom, restTo, steps) {
  const promises = [];
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const et = easeInOut(t);
    const placements = [];
    for (let i = 0; i < restFrom.length; i++) {
      const f = restFrom[i];
      const to = restTo[i];
      placements.push({
        idx: f.idx,
        x: f.x + (to.x - f.x) * et,
        s: f.s + (to.s - f.s) * et,
      });
    }
    promises.push(renderFrame(cardBuffers, placements));
  }
  return Promise.all(promises);
}

function restFrames(cardBuffers, placements, count) {
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(renderFrame(cardBuffers, placements));
  }
  return Promise.all(promises);
}

async function main() {
  const cardsDir = path.join(__dirname, '..', 'assets', 'cards');

  const occasionFallbacks = [
    'christmas.png', 'diwali.png', 'holi.png',
    'valentines-day.png', 'new-year.png', 'eid.png',
  ];

  const cardBuffers = [];
  for (let i = 1; i <= CARD_COUNT; i++) {
    const cardPath = path.join(cardsDir, `card-${i}.png`);
    if (fs.existsSync(cardPath)) {
      const buf = await sharp(cardPath).resize(200, 200).png().toBuffer();
      cardBuffers.push(buf);
      console.log(`  Loaded card-${i}.png`);
    } else {
      const occPath = path.join(__dirname, '..', 'assets', 'occasions', occasionFallbacks[i - 1]);
      if (fs.existsSync(occPath)) {
        const buf = await sharp(occPath).resize(200, 200).png().toBuffer();
        cardBuffers.push(buf);
        console.log(`  Placeholder ${i} <- ${occasionFallbacks[i - 1]}`);
      } else {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const buf = await sharp({
          create: { width: 200, height: 200, channels: 3, background: colors[i - 1] }
        }).png().toBuffer();
        cardBuffers.push(buf);
        console.log(`  Placeholder ${i} <- solid color`);
      }
    }
  }

  const outPath = path.join(__dirname, '..', 'assets', 'occasion-cards-animation.gif');
  const encoder = new GIFEncoder(GIF_W, GIF_H, 'neuquant');
  encoder.createReadStream().pipe(fs.createWriteStream(outPath));
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(160);
  encoder.setQuality(30);
  encoder.setPaletteSize(128);

  const T_STEPS = 14;
  const R_COUNT = 7;

  const rests = CYCLES.map(c => [
    { idx: c[1], x: L.x, s: L.s },
    { idx: c[2], x: C.x, s: C.s },
    { idx: c[3], x: R.x, s: R.s },
  ]);

  console.log('Generating frames...');
  let total = 0;

  for (const f of await restFrames(cardBuffers, REST_0, 7)) {
    encoder.addFrame(f);
    total++;
  }

  for (let ci = 0; ci < CYCLES.length; ci++) {
    const from = ci === 0 ? REST_0 : rests[ci - 1];
    const to = rests[ci];

    for (const f of await transitionFrames(cardBuffers, from, to, T_STEPS)) {
      encoder.addFrame(f);
      total++;
    }
    for (const f of await restFrames(cardBuffers, to, R_COUNT)) {
      encoder.addFrame(f);
      total++;
    }
  }

  encoder.finish();
  console.log(`Done! ${total} frames -> ${path.relative(path.join(__dirname,'..'), outPath)}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
