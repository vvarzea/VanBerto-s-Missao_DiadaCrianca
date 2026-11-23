/*************************************************
 * VanBerto's e a O Dia da Criança 🎈  ·  game/blocks.js
 *
 * Blocos "?" e tijolos para dar CABEÇADAS (tipo Super Mário) e plataformas
 * extra. São gerados no fim do loadLevel() a partir dos dados do nível:
 * só se colocam em sítios livres (sem tocar em plataformas, canos,
 * trampolins, itens, spawn, porta ou letreiro) e a posição é sempre a mesma
 * para o mesmo nível (gerador pseudo-aleatório com semente).
 *
 * Os blocos vivem no grupo "platforms": por isso colidem com o jogador e
 * com os vilões, são limpos quando o nível/arena é reconstruído e ficam
 * escondidos nas salas secretas, sem mexer nesses sistemas.
 *************************************************/

import { platforms, itemsGroup, player, powered, starPower, lives, set_lives, getMaxLives, score, set_score, scoreText, set__hudDirty, difficulty } from "./state.js?v=20261118dd2";
import { showFloat } from "./feedback.js?v=20261118dd2";
import { makePlatformTextureThemed } from "../textures.js?v=20261118dd2";
import { ensureAudio, SFX, beep } from "../audio.js?v=20261118dd2";
import { THEMES } from "../data-levels.js?v=20261118dd2";
import { onHitMalware } from "./items.js?v=20261118dd2";
import { updateHearts } from "./level.js?v=20261118dd2";
import { loadNamespace, saveNamespace } from "../storage.js?v=20261118dd2";

const BLOCK = 40;
let windVx = 0;
const KEY_GOAL = 100;                 // 100 chaves = +1 vida (como as 100 moedas do Super Mário)
let keyData = null;                   // { count, taken: { nivel: [ids] } }  (guardado)
let keyText = null;
let curIdx = 0;
const keyList = [];
function loadKeys() { if (!keyData) { keyData = loadNamespace("keys", { count: 0, taken: {} }); keyData.taken = keyData.taken || {}; keyData.count = keyData.count || 0; } return keyData; }
function saveKeys() { try { saveNamespace("keys", keyData); } catch (e) {} }
function takenSet() { const k = loadKeys(); return (k.taken[curIdx] = k.taken[curIdx] || []); }
/** Chamado quando se recomeça o jogo / se apaga o progresso. */
export function resetKeys() { keyData = { count: 0, taken: {} }; saveKeys(); updateKeyHud(); }
function ensureKeyHud(scene) {
  loadKeys();
  if (!keyText || !keyText.scene || !keyText.active) {
    keyText = scene.add.text(150, 32, "", { fontFamily: "Nunito, system-ui, sans-serif", fontSize: "14px", fontStyle: "900", color: "#ffe14d", stroke: "#1e1b4b", strokeThickness: 5 }).setScrollFactor(0).setDepth(100);
  }
  updateKeyHud();
}
function updateKeyHud() {
  if (!keyText || !keyText.active) return;
  keyText.setText(`🎈 ${loadKeys().count}/${KEY_GOAL}`);
  if (scoreText && scoreText.active) keyText.setPosition(scoreText.x + scoreText.displayWidth + 10, scoreText.y);
}
/** Soma n chaves (+10 pontos cada). Às 100 chaves: +1 vida (ou pontos extra se já tiveres o máximo). */
function addKeys(scene, n, x, y) {
  const k = loadKeys();
  k.count += n;
  addPoints(10 * n);
  ensureAudio(); SFX.coin();
  if (k.count >= KEY_GOAL) {
    k.count -= KEY_GOAL;
    const px = player ? player.x : x, py = player ? player.y : y;
    if (lives < getMaxLives()) {
      set_lives(lives + 1); updateHearts(); SFX.life();
      showFloat(scene, px, py - 100, "🎈 100 balões! +1 vida ❤️", "#1e1b4b");
    } else {
      addPoints(500);
      showFloat(scene, px, py - 100, "🎈 100 balões! +500 pontos", "#1e1b4b");
    }
  }
  saveKeys(); updateKeyHud();
}
let obstacleTimer = null;
const beams = [];
const winds = [];
/** Empurrão do vento (px/s) a somar à velocidade do jogador; 0 fora das zonas de vento. */
export function getWindX() { return windVx; }

function startCrumble(scene, pl) {
  if (pl.getData("crumbling")) return;
  pl.setData("crumbling", true);
  const ox = pl.x, oy = pl.y;
  scene.tweens.add({ targets: pl, x: ox + 3, duration: 55, yoyo: true, repeat: 7, onComplete: () => { pl.x = ox; } });
  ensureAudio(); beep({ freq: 180, dur: 0.1, type: "triangle", vol: 0.05, slideTo: 120 });
  scene.time.delayedCall(650, () => {
    if (!pl.active) return;
    pl.body.checkCollision.none = true;
    scene.tweens.add({ targets: pl, y: oy + 240, alpha: 0, duration: 600, ease: "Quad.easeIn",
      onComplete: () => {
        scene.time.delayedCall(2600, () => {
          if (!pl.active) return;
          pl.x = ox; pl.y = oy; pl.alpha = 1; pl.body.checkCollision.none = false;
          pl.body.checkCollision.left = false; pl.body.checkCollision.right = false;
          pl.setData("crumbling", false);
        });
      } });
  });
}

function firewallPhase(now) {
  // período e janela ligada dependem da dificuldade
  const on = difficulty === "extremo" ? 2300 : difficulty === "dificil" ? 1900 : 1500;
  const off = difficulty === "extremo" ? 1200 : difficulty === "dificil" ? 1600 : 2100;
  const t = now % (on + off);
  if (t < on) return "on";
  return t > on + off - 450 ? "warn" : "off";
}

function tickObstacles(scene) {
  if (!scene || !scene.sys || !scene.sys.isActive || !player || !player.body) return;
  const now = scene.time.now;
  const ph = firewallPhase(now);
  const pb = player.body;
  for (const b of beams) {
    if (!b.active || !b.visible) continue;
    const warn = ph === "warn";
    b.setAlpha(ph === "on" ? 0.95 : warn ? (Math.floor(now / 90) % 2 ? 0.45 : 0.12) : 0.07);
    if (ph === "on" && !starPower) {
      const bx = b.x - 9, bw = 18, by = b.y - b.displayHeight / 2, bh = b.displayHeight;
      if (pb.right > bx && pb.left < bx + bw && pb.bottom > by && pb.top < by + bh) onHitMalware(player, b);
    }
  }
  updateKeyHud();
  if (!scene.physics.world.isPaused) {
    for (let i = keyList.length - 1; i >= 0; i--) {
      const kk = keyList[i];
      if (!kk.active || !kk.visible) continue;
      if (pb.right > kk.x - 14 && pb.left < kk.x + 14 && pb.bottom > kk.y - 15 && pb.top < kk.y + 15) {
        const id = kk.getData("kid"); const t = takenSet(); if (id && !t.includes(id)) t.push(id);
        keyList.splice(i, 1);
        scene.tweens.add({ targets: kk, y: kk.y - 24, alpha: 0, scale: 1.4, duration: 220, onComplete: () => kk.destroy() });
        addKeys(scene, 1, kk.x, kk.y);
      }
    }
  }
  let wx = 0;
  for (const w of winds) {
    if (!w.marker.active || !w.marker.visible) { if (w.emitter) w.emitter.stop(); continue; }
    if (w.emitter && !w.emitter.emitting) w.emitter.start();
    if (pb.right > w.l && pb.left < w.r && pb.bottom > w.t && pb.top < w.b) wx += w.dir * 120;
  }
  windVx = wx;
}

function clearObstacles(scene) {
  if (obstacleTimer) { obstacleTimer.remove(false); obstacleTimer = null; }
  beams.length = 0;
  keyList.length = 0;
  winds.forEach(w => { if (w.emitter) w.emitter.destroy(); });
  winds.length = 0;
  windVx = 0;
}
let brickHintShown = false;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ===== Texturas (desenhadas em canvas, 40×40) =====
function makeObstacleTextures(scene) {
  if (scene.textures.exists("fw_beam")) return;
  const mk = (key, w, h, draw) => {
    const t = scene.textures.createCanvas(key, w, h);
    draw(t.getContext());
    t.refresh();
  };
  mk("fw_beam", 26, 140, c => {            // jato de fogo-de-artifício (dourado-laranja a brilhar)
    const g = c.createLinearGradient(0, 0, 26, 0);
    g.addColorStop(0, "rgba(255,150,30,0)"); g.addColorStop(0.5, "rgba(255,196,40,0.95)"); g.addColorStop(1, "rgba(255,150,30,0)");
    c.fillStyle = g; c.fillRect(0, 0, 26, 140);
    c.fillStyle = "rgba(255,255,255,0.9)"; c.fillRect(11, 0, 4, 140);
    c.fillStyle = "rgba(255,255,255,0.95)";
    [[6, 14], [19, 38], [8, 62], [18, 90], [7, 116]].forEach(([x, y]) => {   // faíscas em estrela
      c.beginPath(); c.moveTo(x, y - 5); c.lineTo(x + 1.5, y - 1.5); c.lineTo(x + 5, y); c.lineTo(x + 1.5, y + 1.5);
      c.lineTo(x, y + 5); c.lineTo(x - 1.5, y + 1.5); c.lineTo(x - 5, y); c.lineTo(x - 1.5, y - 1.5); c.closePath(); c.fill();
    });
  });
  mk("fw_post", 34, 22, c => {             // tubo do foguete (base do jato)
    c.fillStyle = "#1e1b4b"; c.fillRect(0, 4, 34, 18);
    c.fillStyle = "#e8403a"; c.fillRect(2, 6, 30, 14);
    c.fillStyle = "#ffd21f"; c.fillRect(2, 11, 30, 4);
    c.fillStyle = "#ffb347"; c.fillRect(14, 1, 6, 6);
    c.fillStyle = "#1e1b4b"; c.fillRect(13, 0, 8, 2);
  });
  mk("crumble", 140, 22, c => {            // plataforma frágil (pedra gretada)
    c.fillStyle = "#1e1b4b"; c.fillRect(0, 0, 140, 22);
    c.fillStyle = "#b7c0e8"; c.fillRect(2, 2, 136, 18);
    c.fillStyle = "#dfe5ff"; c.fillRect(2, 2, 136, 5);
    c.strokeStyle = "#1e1b4b"; c.lineWidth = 2;
    [[22, 2, 30, 20], [58, 2, 46, 20], [92, 2, 82, 20], [112, 2, 124, 20]].forEach(([x1, y1, x2, y2]) => {
      c.beginPath(); c.moveTo(x1, y1); c.lineTo((x1 + x2) / 2 + 5, 11); c.lineTo(x2, y2); c.stroke();
    });
  });
}

function makeKeyTexture(scene) {
  if (scene.textures.exists("key_item")) return;
  const t = scene.textures.createCanvas("key_item", 34, 34);
  const c = t.getContext();
  c.lineWidth = 2.5; c.strokeStyle = "#1e1b4b";
  c.beginPath(); c.moveTo(17, 25); c.quadraticCurveTo(13, 29, 18, 33); c.stroke();            // fio
  c.fillStyle = "#ff4d6d"; c.beginPath(); c.ellipse(17, 14, 10, 12, 0, 0, 7); c.fill(); c.stroke();  // balão
  c.beginPath(); c.moveTo(17, 25); c.lineTo(14, 29); c.lineTo(20, 29); c.closePath(); c.fill(); c.stroke(); // nó
  c.fillStyle = "rgba(255,255,255,0.75)"; c.beginPath(); c.ellipse(12.5, 9, 2.6, 4.2, -0.5, 0, 7); c.fill();
  t.refresh();
}

function makeBlockTextures(scene) {
  if (scene.textures.exists("blk_q")) return;
  const mk = (key, draw) => {
    const t = scene.textures.createCanvas(key, BLOCK, BLOCK);
    draw(t.getContext());
    t.refresh();
  };
  const rivets = (c, col) => {
    c.fillStyle = col;
    [[6, 6], [34, 6], [6, 34], [34, 34]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 2.2, 0, 7); c.fill(); });
  };
  mk("blk_q", c => {
    c.fillStyle = "#7a4a00"; c.fillRect(0, 0, 40, 40);
    c.fillStyle = "#f5b400"; c.fillRect(2, 2, 36, 36);
    c.fillStyle = "#ffe066"; c.fillRect(3, 3, 34, 5);
    rivets(c, "#7a4a00");
    c.fillStyle = "#7a4a00"; c.font = "900 26px Arial, sans-serif";
    c.textAlign = "center"; c.textBaseline = "middle";
    c.fillText("?", 20, 22);
    c.fillStyle = "#fff6c0"; c.fillText("?", 19, 20.5);
  });
  mk("blk_brick", c => {
    c.fillStyle = "#5a2208"; c.fillRect(0, 0, 40, 40);
    c.fillStyle = "#c2571a";
    [[1, 1, 18, 8], [21, 1, 18, 8], [1, 11, 8, 8], [11, 11, 18, 8], [31, 11, 8, 8],
     [1, 21, 18, 8], [21, 21, 18, 8], [1, 31, 8, 8], [11, 31, 18, 8], [31, 31, 8, 8]]
      .forEach(([x, y, w, h]) => c.fillRect(x, y, w, h));
    c.fillStyle = "rgba(255,200,140,0.35)";
    [[1, 1, 18, 2], [21, 1, 18, 2], [11, 11, 18, 2], [1, 21, 18, 2], [21, 21, 18, 2], [11, 31, 18, 2]]
      .forEach(([x, y, w, h]) => c.fillRect(x, y, w, h));
  });
  mk("blk_used", c => {
    c.fillStyle = "#3d352b"; c.fillRect(0, 0, 40, 40);
    c.fillStyle = "#8a7a64"; c.fillRect(2, 2, 36, 36);
    rivets(c, "#3d352b");
  });
}

// ===== Cabeçada =====
export function onPlatformCollide(playerObj, pl) {
  if (pl && pl.getData && pl.getData("crumble")) {
    if (playerObj.body && playerObj.body.touching.down) startCrumble(playerObj.scene, pl);
    return;
  }
  if (!pl || !pl.getData || !pl.getData("isBlock")) return;
  const pb = playerObj.body;
  if (!pb || !pb.touching.up || pb.touching.down) return;
  // Vários blocos podem estar encostados à cabeça: bate no que fica mais centrado
  let best = pl, bestD = Infinity;
  platforms.getChildren().forEach(o => {
    if (!o.active || !o.body || !o.getData || !o.getData("isBlock")) return;
    if (Math.abs(o.body.bottom - pl.body.bottom) > 2) return;
    if (o.body.right <= pb.left || o.body.left >= pb.right) return;
    const d = Math.abs(o.x - playerObj.x);
    if (d < bestD) { bestD = d; best = o; }
  });
  hitBlock(playerObj.scene, best);
}

function hitBlock(scene, b) {
  if (b.getData("busy")) return;
  b.setData("busy", true);
  scene.time.delayedCall(180, () => { if (b.active) b.setData("busy", false); });
  const baseY = b.y;
  scene.tweens.add({ targets: b, y: baseY - 9, duration: 70, yoyo: true, ease: "Quad.easeOut",
    onComplete: () => { if (b.active) b.y = baseY; } });
  ensureAudio();
  beep({ freq: 210, dur: 0.07, type: "square", vol: 0.06, slideTo: 150 });

  const type = b.getData("type");
  if (type === "q") {
    if (b.getData("used")) return;
    b.setData("used", true);
    b.setTexture("blk_used");
    const bid = b.getData("bid"); if (bid) { const t = takenSet(); if (!t.includes(bid)) { t.push(bid); saveKeys(); } }
    releaseContent(scene, b);
  } else if (type === "brick") {
    if (powered || starPower) {
      breakBrick(scene, b);
    } else if (!brickHintShown) {
      brickHintShown = true;
      showFloat(scene, b.x, b.y - 34, "🛡️ Com o escudo partes o tijolo!", "#ffd700");
    }
  }
}

function addPoints(n) {
  set_score(score + n);
  if (scoreText) scoreText.setText(`🌟 Pontos: ${score}`);
  set__hudDirty(true);
}

function releaseContent(scene, b) {
  let kind = b.getData("content") || "moeda";
  if (kind === "heart" && lives >= getMaxLives()) kind = "moeda";
  if (kind === "moeda") {
    const coin = scene.add.text(b.x, b.y - 26, "🎈", { fontSize: "26px" }).setOrigin(0.5).setDepth(6);
    scene.tweens.add({ targets: coin, y: coin.y - 52, alpha: 0, duration: 520, ease: "Quad.easeOut", onComplete: () => coin.destroy() });
    showFloat(scene, b.x, b.y - 60, "+1 🎈", "#1e1b4b");
    addKeys(scene, 1, b.x, b.y);
    return;
  }
  const keyMap = { medalha: "item_medalha", duplosalto: "item_duplosalto", heart: "item_heart", estrela: "item_estrela" };
  const it = itemsGroup.create(b.x, b.y - 46, keyMap[kind] || "item_medalha");
  it.setDepth(5);
  it.setData("kind", kind);
  it.setData("bonus", true); // não conta para as estrelas do nível (ver items.js)
  it.setAlpha(0).setScale(0.4);
  scene.tweens.add({ targets: it, alpha: 1, scale: 1, y: b.y - 40, duration: 260, ease: "Back.easeOut",
    onComplete: () => {
      if (!it.active) return;
      scene.tweens.add({ targets: it, y: it.y - 6, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    } });
  ensureAudio(); SFX.coin();
}

function breakBrick(scene, b) {
  const x = b.x, y = b.y;
  b.destroy();
  addPoints(5);
  showFloat(scene, x, y - 30, "+5", "#ffb070");
  ensureAudio(); beep({ freq: 150, dur: 0.12, type: "sawtooth", vol: 0.06, slideTo: 80 });
  const p = scene.add.particles(0, 0, "spark_item", {
    x, y, speed: { min: 80, max: 220 }, angle: { min: 200, max: 340 }, lifespan: 600,
    quantity: 14, scale: { start: 1.1, end: 0 }, gravityY: 700, tint: [0xc2571a, 0x8a3a10, 0xe08a4a]
  });
  scene.time.delayedCall(450, () => p.destroy());
}

// ===== Geração =====
export function addBlocksAndPlatforms(scene, L, idx) {
  clearObstacles(scene);
  curIdx = idx;
  makeKeyTexture(scene);
  ensureKeyHud(scene);
  makeObstacleTextures(scene);
  makeBlockTextures(scene);
  brickHintShown = false;
  const rnd = mulberry32(idx * 9973 + 17);

  const rect = (cx, cy, w, h) => ({ l: cx - w / 2, r: cx + w / 2, t: cy - h / 2, b: cy + h / 2 });
  const obst = [];
  const anchors = [];
  L.platforms.forEach(p => {
    const o = rect(p.x, p.y, p.w, p.h); obst.push(o); anchors.push(o);
  });
  (L.movingPlatforms || []).forEach(m =>
    obst.push(rect(m.x, m.y, m.w + 2 * (m.rangeX || 0) + 30, m.h + 2 * (m.rangeY || 0) + 30)));
  (L.pipes || []).forEach(p => {
    obst.push(rect(p.x, p.y, 110, 190));
    if (p.toX != null) obst.push(rect(p.toX, p.toY, 110, 190));
    if (p.returnX != null) obst.push(rect(p.returnX, p.returnY ?? p.y, 110, 190));
  });
  (L.trampolines || []).forEach(t => obst.push({ l: t.x - 90, r: t.x + 90, t: 100, b: 560 }));
  (L.items || []).forEach(i => obst.push({ ...rect(i.x, i.y, 80, 80), soft: true }));
  (L.secrets || []).forEach(s => obst.push({ ...rect(s.x, s.y, 80, 80), soft: true }));
  obst.push(rect(L.spawn.x, 400, 380, 600));
  obst.push(rect(L.doorX, 300, 460, 700));
  obst.push(rect(L.signX || (L.spawn.x + 240), 450, 220, 260));

  // Obstáculos "duros" (plataformas, canos, trampolins, porta…) contam em toda a zona;
  // os "moles" (itens, segredos) só na faixa onde ficam os blocos (softB).
  const hits = (zl, zr, zt, zb, skip, softB) =>
    obst.some(o => o !== skip && !(o.r <= zl || o.l >= zr || o.b <= zt || o.t >= (o.soft ? softB : zb)));

  const centers = [];
  const farFromOthers = cx => centers.every(c => Math.abs(c - cx) >= 230);

  // Candidatos de x, embaralhados com a semente
  const cands = [];
  for (let x = 100; x <= L.doorX - 260; x += 20) cands.push(x);
  for (let i = cands.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1)); [cands[i], cands[j]] = [cands[j], cands[i]];
  }

  // Conteúdo dos blocos "?" — depende da dificuldade
  const pickContent = () => {
    const r = rnd();
    if (difficulty === "extremo") return "moeda";
    if (difficulty === "dificil") return r < 0.7 ? "moeda" : (r < 0.85 ? "duplosalto" : "medalha");
    return r < 0.55 ? "moeda" : (r < 0.72 ? "medalha" : (r < 0.88 ? "duplosalto" : "heart"));
  };

  let bi = 0;
  const addBlock = (x, y, type) => {
    const bid = "b" + (bi++);
    const wasUsed = type === "q" && takenSet().includes(bid);
    const s = platforms.create(x, y, type === "q" ? (wasUsed ? "blk_used" : "blk_q") : "blk_brick");
    s.setData("bid", bid); if (wasUsed) s.setData("used", true);
    s.setDepth(3);
    s.setData("isBlock", true);
    s.setData("type", type);
    if (type === "q") s.setData("content", pickContent());
    if (s.body) { s.body.checkCollision.left = false; s.body.checkCollision.right = false; }
    return s;
  };

  const layRow = (cx, cy, pattern) => {
    const w = pattern.length * BLOCK;
    pattern.forEach((t, i) => addBlock(cx - w / 2 + BLOCK / 2 + i * BLOCK, cy, t));
  };

  // 1) Plataformas extra flutuantes, com 1–2 blocos por cima
  const nExtra = 2 + (idx >= 7 ? 1 : 0) + (idx >= 14 ? 1 : 0);
  const themeIdx = L.theme % THEMES.length;
  const platKey = "platform_t" + themeIdx;
  if (!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
  const PW = 150, TOP = 385, PY = TOP + 11;
  let extras = 0;
  for (const cx of cands) {
    if (extras >= nExtra) break;
    if (!farFromOthers(cx)) continue;
    const ground = anchors.find(a => a.t >= 430 && cx - PW / 2 - 20 >= a.l && cx + PW / 2 + 20 <= a.r);
    if (!ground) continue;
    if (hits(cx - PW / 2 - 30, cx + PW / 2 + 30, 190, 425, ground, 430)) continue;
    const plat = platforms.create(cx, PY, platKey);
    plat.displayWidth = PW; plat.displayHeight = 22; plat.refreshBody(); plat.setData("extra", true);
    if (plat.body) { plat.body.checkCollision.left = false; plat.body.checkCollision.right = false; }
    layRow(cx, TOP - 154, rnd() < 0.5 ? ["q"] : ["brick", "q"]);
    obst.push(rect(cx, 290, PW + 30, 220));
    centers.push(cx); extras++;
  }

  // 3) OBSTÁCULOS NOVOS: plataformas que caem, firewalls intermitentes e vento.
  // Duas passagens: a 1.ª é exigente (espaço bem livre); a 2.ª, mais flexível, só corre
  // se faltarem obstáculos (níveis apertados), para quase todos os níveis terem algum.
  const farFar = (cx, d) => centers.every(c => Math.abs(c - cx) >= d);
  const special = [rect(L.spawn.x, 400, 260, 600), rect(L.doorX, 300, 440, 700), rect(L.signX || (L.spawn.x + 240), 450, 200, 260)];
  (L.pipes || []).forEach(p => {
    special.push(rect(p.x, p.y, 120, 200));
    if (p.toX != null) special.push(rect(p.toX, p.toY, 120, 200));
  });
  (L.trampolines || []).forEach(t => special.push({ l: t.x - 100, r: t.x + 100, t: 100, b: 560 }));
  const hitsSpecial = (zl, zr, zt, zb) => special.some(o => !(o.r <= zl || o.l >= zr || o.b <= zt || o.t >= zb));
  const groundAt = (cx, half) => anchors.find(a => a.t >= 480 && cx - half >= a.l && cx + half <= a.r);
  const keyFor = () => {
    const r = rnd();
    return difficulty === "dificil" ? (r < 0.5 ? "item_duplosalto" : "item_medalha")
      : (r < 0.4 ? "item_duplosalto" : r < 0.8 ? "item_medalha" : "item_heart");
  };

  // 3a) Plataformas que caem, com um prémio por cima (arriscas ou não)
  const nCrumble = (idx >= 2 && difficulty !== "extremo") ? (idx >= 9 ? 2 : 1) : 0;
  let crumbles = 0;
  for (const pass of [0, 1]) {
    const sep = pass ? 70 : 150, minW = pass ? 130 : 160, half = pass ? 65 : 80, marg = pass ? 70 : 85;
    for (const cx of cands) {
      if (crumbles >= nCrumble) break;
      if (!farFar(cx, sep)) continue;
      // Apoia-se no chão ou numa plataforma existente (sobe-se por baixo, ~125 px)
      const an = anchors.find(a => a.t >= 330 && a.t <= 520 && a.r - a.l >= minW && cx - half >= a.l && cx + half <= a.r
        && !hits(cx - marg, cx + marg, a.t - 195, a.t - 2, a, a.t - 2) && !hitsSpecial(cx - marg, cx + marg, a.t - 195, a.t));
      if (!an) continue;
      const T = an.t - 125;
      const pl = platforms.create(cx, T + 11, "crumble");
      pl.setDepth(2); pl.setData("crumble", true);
      if (pl.body) { pl.body.checkCollision.left = false; pl.body.checkCollision.right = false; }
      const it = itemsGroup.create(cx, T - 48, keyFor());
      it.setDepth(5); it.setData("kind", it.texture.key.replace("item_", "")); it.setData("bonus", true);
      scene.tweens.add({ targets: it, y: it.y - 6, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      obst.push(rect(cx, T - 20, 200, 160)); centers.push(cx); crumbles++;
    }
  }

  // 3b) Jatos de fogo-de-artifício: feixes que ligam e desligam (com aviso a piscar antes de ligar)
  const nBeams = idx >= 3 ? (idx >= 10 ? 2 : 1) + (idx >= 16 ? 1 : 0) : 0;
  let nb = 0;
  for (const pass of [0, 1]) {
    const sep = pass ? 70 : 130, half = pass ? 40 : 60, marg = pass ? 40 : 55;
    for (const cx of cands) {
      if (nb >= nBeams) break;
      if (!farFar(cx, sep)) continue;
      const g = groundAt(cx, half);
      if (!g) continue;
      const top = g.t;
      if (hits(cx - marg, cx + marg, top - 106, top - 2, g, top - 2) || hitsSpecial(cx - marg - 5, cx + marg + 5, top - 106, top)) continue;
      const base = platforms.create(cx, top - 9, "fw_post"); base.setDepth(3);
      base.body.checkCollision.none = true;
      const beam = platforms.create(cx, top - 18 - 40, "fw_beam"); beam.setDepth(3); beam.setDisplaySize(26, 80);
      beam.body.checkCollision.none = true; beam.setData("firewall", true);
      beams.push(beam);
      obst.push(rect(cx, top - 60, 140, 130)); centers.push(cx); nb++;
    }
  }

  // 3c) Vento: zona que empurra o VanBerto's para um lado (de 2 em 2 níveis, mais nos finais)
  const nWind = idx >= 5 ? ((idx % 2 === 1 ? 1 : 0) + (idx >= 14 ? 1 : 0)) : 0;
  let nw = 0;
  for (const pass of [0, 1]) {
    const sep = pass ? 60 : 120, half = pass ? 50 : 125;
    for (const cx of cands) {
      if (nw >= nWind) break;
      if (!farFar(cx, sep)) continue;
      const g = groundAt(cx, half);
      if (!g) continue;
      const top = g.t;
      if (hitsSpecial(cx - 125, cx + 125, 300, top)) continue;
      const dir = rnd() < 0.5 ? -1 : 1;
      const marker = platforms.create(cx, top - 120, "fw_post"); marker.setAlpha(0); marker.body.checkCollision.none = true;
      const zone = { l: cx - 125, r: cx + 125, t: top - 240, b: top, dir, marker, emitter: null };
      if (scene.textures.exists("spark_item")) {
        zone.emitter = scene.add.particles(0, 0, "spark_item", {
          x: { min: dir > 0 ? zone.l : zone.r - 30, max: dir > 0 ? zone.l + 30 : zone.r },
          y: { min: zone.t + 20, max: zone.b - 20 },
          speedX: dir * 300, speedY: 0, lifespan: 1200, frequency: 70, quantity: 1,
          scale: { start: 0.9, end: 0.2 }, alpha: { start: 0.7, end: 0 }, tint: [0xdff4ff, 0x9fe3ff, 0xffffff]
        }).setDepth(4);
      }
      winds.push(zone);
      obst.push(rect(cx, top - 120, 260, 250)); centers.push(cx); nw++;
    }
  }

  // 4) Balões 🎈 espalhados, como as moedas do Super Mário (arcos no chão e filas por cima das plataformas)
  const doneKeys = takenSet();
  let kn = 0;
  const putKey = (x, y) => {
    const id = "k" + (kn++);
    if (doneKeys.includes(id)) return;
    const k = platforms.create(x, y, "key_item");
    k.setDepth(4); k.setData("kid", id); k.body.checkCollision.none = true;
    scene.tweens.add({ targets: k, y: y - 5, duration: 700 + (kn % 4) * 90, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    keyList.push(k);
  };
  const nArcs = difficulty === "extremo" ? 1 : 2;
  const ARC = [[-72, 0], [-36, 22], [0, 34], [36, 22], [72, 0]];
  let arcs = 0;
  for (const pass of [0, 1, 2]) {
    for (const cx of cands) {
      if (arcs >= nArcs) break;
      if (!farFar(cx, pass === 0 ? 170 : 100)) continue;
      // passes 0-1: sobre o chão; pass 2: sobre qualquer plataforma larga
      const g = pass < 2 ? groundAt(cx, 80) : anchors.find(a => a.t >= 300 && a.t <= 520 && cx - 80 >= a.l && cx + 80 <= a.r);
      if (!g) continue;
      const top = g.t;
      if (pass === 0 && hits(cx - 90, cx + 90, top - 110, top - 2, g, top - 2)) continue;
      if (hitsSpecial(cx - 80, cx + 80, top - 110, top)) continue;
      ARC.forEach(([dx, h]) => putKey(cx + dx, top - 44 - h));
      obst.push(rect(cx, top - 60, 180, 80)); centers.push(cx); arcs++;
    }
  }
  const nRowK = difficulty === "extremo" ? 1 : 3;
  const anchorsShuffled = anchors.filter(a => a.t >= 300 && a.t <= 520 && a.r - a.l >= 100)
    .map(a => [rnd(), a]).sort((u, v) => u[0] - v[0]).map(u => u[1]);
  let krows = 0;
  for (const a of anchorsShuffled) {
    if (krows >= nRowK) break;
    const cx = (a.l + a.r) / 2;
    if (hitsSpecial(cx - 50, cx + 50, a.t - 95, a.t)) continue;
    if (hits(cx - 60, cx + 60, a.t - 95, a.t - 2, a, a.t - 2)) continue;
    [-36, 0, 36].forEach(dx => putKey(cx + dx, a.t - 42));
    obst.push(rect(cx, a.t - 45, 130, 60)); krows++;
  }

  if (beams.length || winds.length || keyList.length) {
    obstacleTimer = scene.time.addEvent({ delay: 40, loop: true, callback: () => tickObstacles(scene) });
  }

  // 2) Fileiras de blocos por cima do chão/plataformas (cabeçada a partir de baixo)
  const nRows = 2 + (idx >= 6 ? 1 : 0) + (idx >= 13 ? 1 : 0);
  const rowPatterns = [["brick", "q", "brick"], ["q", "brick", "q"], ["brick", "q", "brick", "q", "brick"], ["q"]];
  let rows = 0;
  for (const cx of cands) {
    if (rows >= nRows) break;
    if (!farFromOthers(cx)) continue;
    const order = [0, 1, 2, 3].sort(() => rnd() - 0.5);
    let pat = null, a = null;
    for (const k of order) {
      const pt = rowPatterns[k], w = pt.length * BLOCK;
      const found = anchors.find(an => {
        const top = an.t;
        if (top < 300 || top > 530) return false;
        const ground = top >= 480;
        // Em plataformas altas deixa-se folga para saltar dos lados (não cortar saltos)
        if (an.r - an.l < w + (ground ? 40 : 110)) return false;
        if (cx - w / 2 - 20 < an.l || cx + w / 2 + 20 > an.r) return false;
        const cy = top - 154;
        if (cy < 90) return false;
        return !hits(cx - w / 2 - 45, cx + w / 2 + 45, cy - 50, top - 2, an, cy + 50);
      });
      if (found) { pat = pt; a = found; break; }
    }
    if (!a) continue;
    const w = pat.length * BLOCK;
    const cy = a.t - 154;
    layRow(cx, cy, pat);
    obst.push(rect(cx, cy, w + 20, 60));
    centers.push(cx); rows++;
  }

}
