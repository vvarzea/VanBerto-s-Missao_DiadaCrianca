/*************************************************
 * Arte dos bosses (imagens recortadas) + projéteis novos.
 * Cada boss é uma PNG com fundo transparente; aqui desenhamos, para cada um,
 * a textura "boss_<id>" (e as variantes _ouch / _angry / _sad / _laugh que o
 * motor já usa) numa tela de 232×232 — o dobro da antiga (116×116) — para a
 * hitbox e o tamanho no ecrã ficarem iguais (bossScale 0.75 em vez de 1.5).
 *************************************************/
export const BOSS_ART_FILES = {
  virus_gigante: "boss_virus.webp", monstro_ignorancia: "boss_ignorancia.webp",
  poluidor_mecanico: "boss_poluidor.webp", guardiao_sombras: "boss_guardiao.webp"
}; // se uma imagem faltar, o jogo usa o desenho antigo de textures.js

export function loadBossArt(scene) {
  Object.entries(BOSS_ART_FILES).forEach(([id, file]) => {
    if (!scene.textures.exists("bossimg_" + id)) scene.load.image("bossimg_" + id, file);
  });
}

function canvasTex(scene, key, w, h) {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const t = scene.textures.createCanvas(key, w, h);
  return { t, c: t.getContext() };
}

export function buildBossArt(scene) {
  const S = 232;
  Object.keys(BOSS_ART_FILES).forEach(id => {
    const srcKey = "bossimg_" + id;
    if (!scene.textures.exists(srcKey)) return;                 // sem imagem → mantém o desenho antigo
    const img = scene.textures.get(srcKey).getSourceImage();
    if (!img || !img.width) return;
    const k = Math.min(210 / img.width, 196 / img.height);
    const w = img.width * k, h = img.height * k;
    const draw = (c, mode) => {
      c.clearRect(0, 0, S, S);
      c.drawImage(img, (S - w) / 2, 200 - h, w, h);              // pés a ~84px do centro: onde assentavam os desenhos antigos
      c.globalCompositeOperation = "source-atop";
      if (mode === "ouch")  { c.fillStyle = "rgba(255,255,255,0.55)"; c.fillRect(0, 0, S, S); }
      if (mode === "angry") { c.fillStyle = "rgba(255,40,40,0.34)";   c.fillRect(0, 0, S, S); }
      if (mode === "sad")   { c.fillStyle = "rgba(70,100,170,0.50)";  c.fillRect(0, 0, S, S); }
      c.globalCompositeOperation = "source-over";
    };
    const done = new Set();
    [["", null], ["_laugh", null], ["_ouch", "ouch"], ["_angry", "angry"], ["_sad", "sad"]].forEach(([suffix, mode]) => {
      const { t, c } = canvasTex(scene, "boss_" + id + suffix, S, S);
      draw(c, mode); t.refresh(); done.add("boss_" + id + suffix);
    });
    // Outras variantes do desenho antigo (ex.: "_armsdown", usadas ao atirar) passam a mostrar a mesma imagem
    scene.textures.getTextureKeys().filter(k => k.startsWith("boss_" + id + "_") && !done.has(k)).forEach(k => {
      const { t, c } = canvasTex(scene, k, S, S);
      draw(c, null); t.refresh();
    });
  });

  // ----- projéteis novos (30×30) -----
  if (!scene.textures.exists("boss_proj_globe")) {         // globo azul do Guardião
    const { t, c } = canvasTex(scene, "boss_proj_globe", 30, 30);
    const g = c.createRadialGradient(11, 10, 2, 15, 15, 14);
    g.addColorStop(0, "#d8f4ff"); g.addColorStop(0.5, "#3aa0ff"); g.addColorStop(1, "#1d4ed8");
    c.fillStyle = g; c.beginPath(); c.arc(15, 15, 13, 0, 7); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 1.4;
    c.beginPath(); c.ellipse(15, 15, 13, 5, 0, 0, 7); c.stroke();
    c.beginPath(); c.ellipse(15, 15, 5, 13, 0, 0, 7); c.stroke();
    c.beginPath(); c.moveTo(2, 15); c.lineTo(28, 15); c.stroke();
    c.strokeStyle = "#1e1b4b"; c.lineWidth = 2; c.beginPath(); c.arc(15, 15, 13, 0, 7); c.stroke();
    t.refresh();
  }
  if (!scene.textures.exists("boss_proj_notif")) {         // notificação enganadora do Manipulador
    const { t, c } = canvasTex(scene, "boss_proj_notif", 34, 30);
    c.fillStyle = "#ef4444"; c.strokeStyle = "#1e1b4b"; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(6, 3); c.lineTo(28, 3); c.quadraticCurveTo(32, 3, 32, 7); c.lineTo(32, 18);
    c.quadraticCurveTo(32, 22, 28, 22); c.lineTo(15, 22); c.lineTo(8, 28); c.lineTo(9, 22); c.lineTo(6, 22);
    c.quadraticCurveTo(2, 22, 2, 18); c.lineTo(2, 7); c.quadraticCurveTo(2, 3, 6, 3); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#fff"; c.font = "900 17px Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("!", 17, 13);
    t.refresh();
  }
  if (!scene.textures.exists("boss_proj_data")) {          // pacote de dados da IA
    const { t, c } = canvasTex(scene, "boss_proj_data", 30, 30);
    c.fillStyle = "#1e1b4b"; c.fillRect(3, 3, 24, 24);
    const g = c.createLinearGradient(0, 0, 30, 30); g.addColorStop(0, "#67e8f9"); g.addColorStop(1, "#a855f7");
    c.fillStyle = g; c.fillRect(5, 5, 20, 20);
    c.fillStyle = "rgba(255,255,255,0.9)"; c.fillRect(8, 9, 14, 2); c.fillRect(8, 14, 10, 2); c.fillRect(8, 19, 12, 2);
    t.refresh();
  }
}
