// Leitura das perguntas em voz alta (Web Speech API do navegador). Sem ficheiros de áudio, funciona offline
// se o dispositivo tiver uma voz portuguesa instalada. Prefere pt-PT; se não houver, usa qualquer voz pt.
const synth = (typeof window !== "undefined" && "speechSynthesis" in window) ? window.speechSynthesis : null;
let _voice = null;

function escolherVoz() {
  if (!synth) return null;
  const vozes = synth.getVoices() || [];
  const pt = vozes.filter(v => /^pt/i.test(v.lang));
  _voice = pt.find(v => /pt[-_]PT/i.test(v.lang)) || pt[0] || null;
  return _voice;
}
if (synth) { escolherVoz(); synth.addEventListener?.("voiceschanged", escolherVoz); }

export function ttsDisponivel() { return !!synth; }
export function ttsTemVozPortuguesa() { return !!(_voice || escolherVoz()); }
export function pararLeitura() { try { synth && synth.cancel(); } catch {} }

export function lerEmVozAlta(partes) {
  if (!synth) return false;
  pararLeitura();
  const voz = _voice || escolherVoz();
  partes.filter(Boolean).forEach(texto => {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : "pt-PT"; if (voz) u.voice = voz;
    u.rate = 0.92; u.pitch = 1;
    synth.speak(u);
  });
  return true;
}
