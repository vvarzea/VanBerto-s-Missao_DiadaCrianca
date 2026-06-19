/*************************************************
 * VanBerto's — O Dia da Criança 🎈
 * Professora: Vanda Várzea
 *
 * Jogo educativo sobre os Direitos das Crianças
 * e o Dia da Criança — 1 de Junho.
 *
 * 20 níveis · 3 opções por pergunta · Segunda tentativa
 * VanBerto's: mascote colorida com fato de festa
 *************************************************/

window.addEventListener("DOMContentLoaded", () => {

  // ===== DOM =====
  const startOverlay   = document.getElementById("startOverlay");
  const howOverlay     = document.getElementById("howOverlay");
  const quizOverlay    = document.getElementById("quizOverlay");
  const historyOverlay = document.getElementById("historyOverlay");
  const historyText    = document.getElementById("historyText");
  const btnHistory     = document.getElementById("btnHistory");
  const quizQuestion   = document.getElementById("quizQuestion");
  const quizAnswers    = document.getElementById("quizAnswers");
  const quizFeedback   = document.getElementById("quizFeedback");
  const quizExplanation= document.getElementById("quizExplanation");
  const btnCloseQuiz   = document.getElementById("btnCloseQuiz");
  const btnStart       = document.getElementById("btnStart");
  const btnHow         = document.getElementById("btnHow");
  const btnCloseHow    = document.getElementById("btnCloseHow");
  const btnMute        = document.getElementById("btnMute");
  const btnPause       = document.getElementById("btnPause");
  const btnRestart     = document.getElementById("btnRestartLevel");
  const btnRestartGame = document.getElementById("btnRestartGame");
  const playerNameInput= document.getElementById("playerName");
  const gameOverOverlay= document.getElementById("gameOverOverlay");
  const winOverlay     = document.getElementById("winOverlay");

  const hitFlash   = document.createElement("div"); hitFlash.id = "hitFlash";   document.body.appendChild(hitFlash);
  const bonusStars = document.createElement("div"); bonusStars.id = "bonusStars"; document.body.appendChild(bonusStars);

  let playerName = "";

  // ===== Áudio =====
  let audioCtx = null, muted = false;

  function ensureAudio() {
    if (muted) return;
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  }

  function beep({ freq=440, dur=0.08, type="square", vol=0.06, slideTo=null }) {
    if (muted || !audioCtx) return;
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  const SFX = {
    jump()    { beep({ freq:560, dur:0.08, type:"square",   vol:0.06,  slideTo:720  }); },
    coin()    { beep({ freq:960, dur:0.06, type:"square",   vol:0.055, slideTo:1500 }); },
    hit()     { beep({ freq:220, dur:0.10, type:"sawtooth", vol:0.055, slideTo:160  }); setTimeout(() => beep({ freq:140, dur:0.14, type:"square", vol:0.05, slideTo:110 }), 120); },
    door()    { beep({ freq:700, dur:0.10, type:"triangle", vol:0.055, slideTo:1050 }); },
    doorOpen() {
      beep({ freq:300, dur:0.07, type:"square",   vol:0.05,  slideTo:360 });
      setTimeout(() => beep({ freq:480, dur:0.09, type:"triangle", vol:0.055, slideTo:720  }), 90);
      setTimeout(() => beep({ freq:560, dur:0.12, type:"triangle", vol:0.055, slideTo:840  }), 200);
      setTimeout(() => beep({ freq:840, dur:0.14, type:"triangle", vol:0.055, slideTo:1120 }), 340);
      setTimeout(() => beep({ freq:1120,dur:0.18, type:"triangle", vol:0.055, slideTo:1400 }), 490);
    },
    power()   { beep({ freq:360, dur:0.10, type:"square",   vol:0.055, slideTo:960  }); },
    life()    { beep({ freq:800, dur:0.07, type:"triangle", vol:0.055, slideTo:1100 }); },
    starMelody() {
      // Melodia Super Mario Star — sequência cromática ascendente/descendente
      // Notas: E5 F#5 G#5 A5 A#5 C6 D6 E6 (subida) + descida espelhada
      const notes = [
        {f:659, d:0.10}, {f:740, d:0.10}, {f:830, d:0.10}, {f:880, d:0.10},
        {f:932, d:0.10}, {f:1047,d:0.10}, {f:1175,d:0.10}, {f:1319,d:0.14},
        {f:1175,d:0.10}, {f:1047,d:0.10}, {f:932, d:0.10}, {f:880, d:0.10},
        {f:830, d:0.10}, {f:740, d:0.10}, {f:659, d:0.10}, {f:587, d:0.14}
      ];
      const step = 95; // ms entre notas — mais rápido que o original
      notes.forEach(({f,d},i) => {
        setTimeout(() => {
          if (!muted && audioCtx) {
            // Melodia principal (voz lead)
            beep({ freq:f, dur:d, type:"square", vol:0.055 });
            // Harmonia em terça acima (mais suave, tipo eco)
            if (i % 2 === 0) beep({ freq:f*1.26, dur:d, type:"triangle", vol:0.018 });
          }
        }, i * step);
      });
    },
    win() {
      beep({ freq:560, dur:0.07, type:"square", vol:0.055, slideTo:700 });
      setTimeout(() => beep({ freq:700, dur:0.07, type:"square", vol:0.055, slideTo:840  }), 90);
      setTimeout(() => beep({ freq:840, dur:0.10, type:"square", vol:0.055, slideTo:1120 }), 180);
    },
    gameOver() {
      [330,262,196].forEach((n,i) => setTimeout(() => beep({ freq:n, dur:0.18, type:"square", vol:0.055, slideTo:n*0.75 }), i*220));
    },
    finalWin() {
      const seq=[560,700,840,1120,1050,840,1120,1400,1260,1400,1680,1400,1680,1900,1680,1900];
      seq.forEach((n,i) => setTimeout(() =>
        beep({ freq:n, dur:i<4?0.08:i<8?0.10:0.13, type:i<8?"square":"triangle", vol:0.06, slideTo:n*1.12 }), i*95));
      setTimeout(() => beep({ freq:1900, dur:0.28, type:"triangle", vol:0.06, slideTo:2200 }), seq.length*95+80);
      // Segunda vaga — acorde final
      setTimeout(() => {
        [560,840,1120].forEach((n,i)=>setTimeout(()=>beep({freq:n,dur:0.35,type:"triangle",vol:0.05,slideTo:n*1.05}),i*60));
      }, seq.length*95+500);
    }
  };

  // ===== Guardar =====
  const SAVE_KEY = "vanbertos_dia_crianca_v1";

  // ===== Gestão de overlay-open (desativa touch quando overlay visível) =====
  function updateOverlayOpenClass() {
    const anyOpen = !startOverlay.classList.contains("hidden")
      || !howOverlay.classList.contains("hidden")
      || !quizOverlay.classList.contains("hidden")
      || !historyOverlay.classList.contains("hidden")
      || !document.getElementById("gameOverOverlay").classList.contains("hidden")
      || !document.getElementById("winOverlay").classList.contains("hidden")
      || !document.getElementById("reviewOverlay").classList.contains("hidden");
    document.body.classList.toggle("overlay-open", anyOpen);
  }
  // Observer para detetar mudanças nos overlays
  const _overlayObserver = new MutationObserver(updateOverlayOpenClass);
  [startOverlay, howOverlay, quizOverlay, historyOverlay,
   document.getElementById("gameOverOverlay"), document.getElementById("winOverlay"),
   document.getElementById("reviewOverlay")
  ].forEach(el => { if(el) _overlayObserver.observe(el, { attributes: true, attributeFilter: ["class"] }); });
  updateOverlayOpenClass();
  function saveGame() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ muted, currentLevel, score, lives })); } catch {}
  }
  function loadGame() {
    try {
      const d = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      if (typeof d.muted === "boolean") muted = d.muted;
    } catch {}
  }

  // ===== Elogios =====
  const PRAISE = ["🌟 Excelente!", "🎈 Muito bem!", "🧸 Boa resposta!", "🎊 Fantástico!", "✨ Brilhante!", "🎁 Continua assim!"];
  function pickPraise() { return PRAISE[Math.floor(Math.random() * PRAISE.length)]; }

  function showFloat(scene, x, y, msg, color="#ff6b35") {
    const t = scene.add.text(x, y, msg, { fontSize:"24px", fontStyle:"900", color, stroke:"#fff8e0", strokeThickness:5 }).setOrigin(0.5).setDepth(999);
    scene.tweens.add({ targets:t, y:y-44, alpha:0, duration:640, ease:"Sine.easeOut", onComplete:()=>t.destroy() });
  }

  // ===== Quiz stats =====
  const quizStats = { total:0, correct:0, everWrong:false, errors:[], errorsByTheme:{} };
  const usedQuizByLevel = {};
  const usedQuizByTheme = {}; // anti-repetição global por tema (cross-nível)
  let lastQuizTheme = "historia";

  function resetQuizStats() { quizStats.total=0; quizStats.correct=0; quizStats.everWrong=false; quizStats.errors=[]; quizStats.errorsByTheme={}; }

  function pickQuizForLevel(levelIdx, theme) {
    const pool = QUIZ_BY_THEME[theme] || QUIZ_BY_THEME["historia"];
    // Rastreio global por tema — evita repetir a mesma pergunta em níveis diferentes com o mesmo tema
    if (!usedQuizByTheme[theme]) usedQuizByTheme[theme] = new Set();
    const usedGlobal = usedQuizByTheme[theme];
    if (usedGlobal.size >= pool.length) usedGlobal.clear(); // esgotou — reiniciar
    const candidates = pool.map((_,i) => i).filter(i => !usedGlobal.has(i));
    const pick = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : Math.floor(Math.random() * pool.length);
    usedGlobal.add(pick);
    if (!usedQuizByLevel[levelIdx]) usedQuizByLevel[levelIdx] = new Set();
    usedQuizByLevel[levelIdx].add(pick);
    return pool[pick];
  }

  // ===== "Sabias que…?" — 10 curiosidades sobre o Dia da Criança =====
  const HISTORY = [
    {
      title: "🎈 O Dia da Criança — 1 de Junho",
      text: "O Dia Internacional da Criança celebra-se a 1 de junho em Portugal e em muitos países do mundo. Esta data foi decidida em 1949 pela Federação Internacional das Mulheres Democráticas, numa conferência em Moscovo, e celebrada pela primeira vez em 1950. O objetivo era chamar a atenção do mundo para os direitos e o bem-estar das crianças. Em Portugal, o dia é celebrado com festas, prendas e atividades especiais nas escolas."
    },
    {
      title: "📜 A Declaração dos Direitos da Criança — 1959",
      text: "Em 1959, as Nações Unidas aprovaram a Declaração dos Direitos da Criança, com 10 princípios fundamentais. Esta declaração reconhecia que todas as crianças têm direito à proteção, à educação, a um nome e a uma nacionalidade. Foi o primeiro documento das Nações Unidas dedicado exclusivamente aos direitos das crianças — um passo enorme na história da humanidade!"
    },
    {
      title: "🌍 A Convenção dos Direitos da Criança — 1989",
      text: "A 20 de novembro de 1989, as Nações Unidas aprovaram a Convenção sobre os Direitos da Criança. É o tratado de direitos humanos mais ratificado da história — quase todos os países do mundo o assinaram! Portugal ratificou-o em 1990. A convenção tem 54 artigos e estabelece que todas as crianças têm direito à sobrevivência, ao desenvolvimento, à proteção e à participação."
    },
    {
      title: "⚽ O Direito ao Brincar",
      text: "O artigo 31.º da Convenção dos Direitos da Criança garante o direito ao descanso, ao lazer, ao brincar e às atividades recreativas. Brincar não é só divertimento — é essencial para o desenvolvimento do cérebro, da criatividade e das competências sociais das crianças. Estudos mostram que as crianças que brincam livremente são mais criativas, mais resilientes e têm melhor saúde mental."
    },
    {
      title: "📚 O Direito à Educação",
      text: "O artigo 28.º da Convenção garante o direito de todas as crianças à educação. Em Portugal, o ensino é obrigatório e gratuito até aos 18 anos. No mundo, ainda há 244 milhões de crianças fora da escola — muitas por causa da pobreza, de conflitos armados ou de discriminação. A UNICEF trabalha todos os dias para garantir que todas as crianças do mundo possam estudar."
    },
    {
      title: "💊 O Direito à Saúde",
      text: "O artigo 24.º da Convenção garante o direito de todas as crianças ao mais alto nível de saúde possível. Em Portugal, todas as crianças têm acesso ao Serviço Nacional de Saúde, ao Plano Nacional de Vacinação e ao médico de família. No mundo, morrem ainda por ano milhões de crianças de doenças que se podem prevenir. A UNICEF distribui vacinas, alimentos terapêuticos e água potável em todo o mundo."
    },
    {
      title: "🛡️ O Direito à Proteção",
      text: "Os artigos 19.º e 37.º da Convenção protegem as crianças contra todas as formas de violência, abuso e exploração. Nenhuma criança deve ser maltratada, trabalhar em condições perigosas ou ser privada da sua liberdade. Em Portugal, a CPCJ (Comissão de Proteção de Crianças e Jovens) trabalha para proteger as crianças em risco. Se uma criança estiver em perigo, pode ligar para a linha SOS Criança: 116 111."
    },
    {
      title: "🗣️ O Direito a Ser Ouvido",
      text: "O artigo 12.º da Convenção garante às crianças o direito de expressar a sua opinião em todas as decisões que as afetam. As crianças têm o direito de ser ouvidas nas escolas, nas famílias e pelos governos! Em Portugal, existem parlamentos jovens e conselhos municipais de jovens onde as crianças e adolescentes podem participar ativamente na vida democrática do país."
    },
    {
      title: "🌱 O Futuro das Crianças — Os ODS",
      text: "Em 2015, as Nações Unidas aprovaram os 17 Objetivos de Desenvolvimento Sustentável (ODS), a cumprir até 2030. Vários deles estão diretamente ligados ao bem-estar das crianças: erradicar a pobreza (ODS 1), acabar com a fome (ODS 2), garantir saúde (ODS 3), educação de qualidade (ODS 4) e reduzir as desigualdades (ODS 10). As crianças de hoje são os agentes de mudança do futuro!"
    },
    {
      title: "🌟 A UNICEF — A Guardiã dos Direitos",
      text: "A UNICEF (Fundo das Nações Unidas para a Infância) foi criada em 1946, após a Segunda Guerra Mundial, para ajudar as crianças afetadas pelo conflito. Hoje trabalha em mais de 190 países e territórios. Em Portugal, o Comité Português da UNICEF sensibiliza para os direitos das crianças e angaria fundos para programas em todo o mundo. Cada criança conta — e cada direito importa!"
    },
    {
      title: "🪪 O Direito à Identidade",
      text: "O artigo 7.º da Convenção garante que toda a criança tem direito a ser registada logo após o nascimento e a ter um nome e uma nacionalidade. Sem registo, uma criança não existe legalmente — não pode aceder à escola, à saúde ou a um passaporte. A UNICEF estima que 237 milhões de crianças no mundo não têm registo de nascimento. O teu nome é o primeiro direito que recebes!"
    },
    {
      title: "👨‍👩‍👧 O Direito à Família",
      text: "O artigo 9.º da Convenção garante que a criança não deve ser separada dos seus pais, exceto para a sua própria proteção. O artigo 10.º garante a reunificação familiar quando pais e filhos vivem em países diferentes. A família é o primeiro lugar onde a criança aprende amor, segurança e valores. Quando a família não pode cuidar da criança, o Estado tem obrigação de garantir cuidados alternativos adequados."
    },
    {
      title: "✈️ O Direito das Crianças Refugiadas",
      text: "Mais de 43 milhões de crianças estão deslocadas no mundo, fugindo de guerras, violência e perseguição. O artigo 22.º da Convenção garante que as crianças refugiadas têm exatamente os mesmos direitos que todas as outras. A UNICEF e o ACNUR trabalham em conjunto para proteger estas crianças, garantindo-lhes acesso à educação, à saúde e a um lugar seguro. Ser refugiado não apaga os teus direitos!"
    },
    {
      title: "🚫 O Direito a Não Trabalhar em Condições Perigosas",
      text: "O artigo 32.º da Convenção proíbe o trabalho infantil que prejudique a saúde, a segurança ou a educação da criança. Ainda há cerca de 160 milhões de crianças em situação de trabalho infantil no mundo — muitas em condições perigosas, como minas, fábricas ou campos agrícolas. Em Portugal, a idade mínima para trabalhar é 16 anos. As crianças têm direito a ser crianças!"
    },
    {
      title: "🗣️ O Direito à Liberdade de Expressão",
      text: "O artigo 13.º da Convenção garante que as crianças têm o direito de procurar, receber e partilhar informação e ideias — através de palavras, arte, escrita ou qualquer outro meio. Este direito inclui a liberdade de pensar de forma diferente e de partilhar essas ideias. É a base da criatividade, do pensamento crítico e da participação democrática. A tua voz importa!"
    },
    {
      title: "🔒 O Direito à Privacidade",
      text: "O artigo 16.º da Convenção protege a vida privada, a família, o domicílio e a correspondência das crianças. Na era digital, este direito é mais importante do que nunca: as tuas mensagens, fotos e dados pessoais merecem proteção. Em Portugal, o RGPD dá proteção especial aos dados de crianças menores de 13 anos. Cuida da tua privacidade online — e pede ajuda a um adulto se algo te preocupar!"
    },
    {
      title: "🌍 O Direito à Cultura e à Língua",
      text: "O artigo 30.º da Convenção garante que as crianças de minorias étnicas, religiosas ou linguísticas têm o direito de viver segundo a sua cultura, praticar a sua religião e usar a sua língua. No mundo existem cerca de 7 000 línguas vivas — cada uma é um tesouro único da humanidade! Em Portugal, o Mirandês é a única língua regional reconhecida oficialmente. A diversidade cultural enriquece a todos!"
    },
    {
      title: "♿ O Direito à Inclusão",
      text: "O artigo 23.º da Convenção garante que as crianças com deficiência têm direito a uma vida plena e digna, com acesso à educação, à saúde e à participação social. A educação inclusiva — em que todas as crianças aprendem juntas — é um direito e um benefício para todos. As tecnologias de apoio, como software de leitura de ecrã e comunicadores, ajudam as crianças com deficiência a participar plenamente. Cada criança tem o seu talento único!"
    },
    {
      title: "🌱 O Direito a um Ambiente Saudável",
      text: "As crianças têm direito a crescer num ambiente limpo e saudável. As alterações climáticas ameaçam este direito: mais de mil milhões de crianças vivem em zonas de risco climático extremo. Os ODS 13 (Ação Climática), 14 (Vida Marinha) e 15 (Vida Terrestre) protegem o futuro das crianças. A voz das crianças pode mudar o mundo — cada pequena ação conta. Separa o lixo, poupa água, planta uma semente. O planeta precisa de ti!"
    },
    {
      title: "💻 Os Direitos Digitais das Crianças",
      text: "Em 2021, as Nações Unidas confirmaram que todos os direitos da Convenção se aplicam também ao mundo online. Isto inclui o direito à privacidade, à proteção contra o ciberbullying, à educação digital e à expressão livre. A idade mínima para a maioria das redes sociais é 13 anos. Em Portugal, a Linha Internet Segura (1800 21 22 23) apoia crianças com problemas online. Sê um cidadão digital responsável!"
    }
  ];

  let pausedByTeacher = false;

  function showHistory(levelIndex, onDone) {
    const entry = HISTORY[levelIndex] || null;
    if (!entry) { awaitingQuiz=false; onDone?.(); return; }
    awaitingStory = true;
    historyText.innerHTML = `<strong class="history-title">${entry.title}</strong>\n${entry.text}`;
    historyOverlay.classList.remove("hidden");
    if (sceneRef) sceneRef.physics.pause();
    btnHistory.onclick = () => {
      historyOverlay.classList.add("hidden");
      awaitingStory = false;
      awaitingQuiz = false; // nível pronto a jogar — só agora desbloqueamos hits e porta
      if (sceneRef && !pausedByTeacher
          && startOverlay.classList.contains("hidden")
          && quizOverlay.classList.contains("hidden"))
        sceneRef.physics.resume();
      onDone?.();
    };
  }

  // ===== Dicas =====
  const QUIZ_TIPS = {
    historia:     "O Dia da Criança celebra-se a 1 de junho. A Convenção dos Direitos da Criança foi aprovada em 1989.",
    declaracao:   "A Declaração dos Direitos da Criança foi aprovada pelas Nações Unidas em 1959, com 10 princípios.",
    convencao:    "A Convenção sobre os Direitos da Criança de 1989 tem 54 artigos e foi ratificada por quase todos os países.",
    brincar:      "O artigo 31.º da Convenção garante o direito ao brincar, ao descanso e ao lazer.",
    educacao:     "O artigo 28.º garante o direito à educação. Em Portugal é obrigatória até aos 18 anos.",
    saude:        "O artigo 24.º garante o direito à saúde. A UNICEF distribui vacinas e cuidados básicos no mundo.",
    protecao:     "Os artigos 19.º e 37.º protegem as crianças contra violência e exploração. SOS Criança: 116 111.",
    participacao: "O artigo 12.º garante às crianças o direito de serem ouvidas nas decisões que as afetam.",
    futuro:       "Os 17 ODS das Nações Unidas, aprovados em 2015, incluem metas para acabar com a pobreza e garantir educação.",
    unicef:       "A UNICEF foi criada em 1946 e trabalha em mais de 190 países para defender os direitos das crianças.",
    identidade:   "O artigo 7.º garante o direito a um nome e a uma nacionalidade desde o nascimento.",
    familia:      "O artigo 9.º garante que a criança não seja separada dos pais, exceto em situações de proteção.",
    refugiados:   "O artigo 22.º protege as crianças refugiadas com os mesmos direitos das outras crianças.",
    trabalho:     "O artigo 32.º proíbe o trabalho infantil perigoso e prejudicial ao desenvolvimento da criança.",
    expressao:    "O artigo 13.º garante a liberdade de expressão — as crianças podem procurar e partilhar informação.",
    privacidade:  "O artigo 16.º protege a privacidade das crianças — a sua vida pessoal e correspondência.",
    cultura:      "O artigo 30.º garante às crianças de minorias o direito à sua língua, cultura e religião.",
    deficiencia:  "O artigo 23.º garante que as crianças com deficiência têm direito a apoio especial e plena inclusão.",
    ambiente:     "As crianças têm direito a crescer num ambiente saudável — base dos ODS 13, 14 e 15.",
    digital:      "Os direitos digitais das crianças aplicam os artigos da Convenção ao mundo online e às redes sociais."
  };

  // ===== Artigo da Convenção por tema =====
  const QUIZ_ARTICLE = {
    historia:     null,
    declaracao:   null,
    convencao:    null,
    brincar:      "Art. 31.º",
    educacao:     "Art. 28.º",
    saude:        "Art. 24.º",
    protecao:     "Art. 19.º / 37.º",
    participacao: "Art. 12.º",
    futuro:       "ODS 2030",
    unicef:       null,
    identidade:   "Art. 7.º",
    familia:      "Art. 9.º / 10.º",
    refugiados:   "Art. 22.º",
    trabalho:     "Art. 32.º",
    expressao:    "Art. 13.º",
    privacidade:  "Art. 16.º",
    cultura:      "Art. 30.º",
    deficiencia:  "Art. 23.º",
    ambiente:     "ODS 13-15",
    digital:      "Art. 16.º / 17.º"
  };

  // ===== Perguntas — 3 opções, 1 certa + explicação =====
  const QUIZ_BY_THEME = {
    historia: [
      { q:"Em que data se celebra o Dia da Criança em Portugal?", a:[{t:"1 de junho",ok:true},{t:"1 de maio",ok:false},{t:"20 de novembro",ok:false}], exp:"O Dia Internacional da Criança celebra-se a 1 de junho. Esta data foi decidida em novembro de 1949 e celebrada pela primeira vez em 1950. O 20 de novembro é o Dia Universal da Criança, data em que foi aprovada a Convenção dos Direitos da Criança." },
      { q:"Quem escolheu o 1 de junho como Dia da Criança, em 1949?", a:[{t:"A Federação Democrática Internacional das Mulheres",ok:true},{t:"As Nações Unidas",ok:false},{t:"A UNICEF",ok:false}], exp:"A 4 de novembro de 1949, em Moscovo, a Federação Democrática Internacional das Mulheres estabeleceu o 1 de junho como Dia Internacional de Proteção das Crianças. A data começou a ser celebrada a partir de 1950." },
      { q:"Qual é o objetivo do Dia da Criança?", a:[{t:"Celebrar e defender os direitos e o bem-estar das crianças",ok:true},{t:"Assinalar o fim do ano letivo",ok:false},{t:"Comemorar o início do verão",ok:false}], exp:"O Dia da Criança serve para lembrar que todas as crianças têm direitos — à educação, à saúde, ao brincar e à proteção — e que é responsabilidade de todos garantir esses direitos." },
      { q:"Em que ano surgiu o primeiro Dia da Criança?", a:[{t:"1950",ok:true},{t:"1989",ok:false},{t:"1945",ok:false}], exp:"O Dia Internacional da Criança surgiu em 1950, cinco anos após o fim da Segunda Guerra Mundial, num período em que o mundo tentava reconstruir-se e proteger as gerações mais novas." },
      { q:"Em Portugal, o Dia da Criança é celebrado com que tipo de atividades?", a:[{t:"Festas, prendas e atividades especiais nas escolas",ok:true},{t:"Apenas com um feriado nacional",ok:false},{t:"Com uma cerimónia oficial no Parlamento",ok:false}], exp:"Em Portugal, o 1 de junho é celebrado com grande alegria: festas nas escolas, prendas, atividades ao ar livre e ações de sensibilização para os direitos das crianças." }
    ],
    declaracao: [
      { q:"Em que ano foi aprovada a Declaração dos Direitos da Criança?", a:[{t:"1959",ok:true},{t:"1989",ok:false},{t:"1950",ok:false}], exp:"A Declaração dos Direitos da Criança foi aprovada pela Assembleia Geral das Nações Unidas a 20 de novembro de 1959. Trinta anos depois, em 1989, surgiu a Convenção — com força legal obrigatória." },
      { q:"Quantos princípios tinha a Declaração dos Direitos da Criança de 1959?", a:[{t:"10 princípios",ok:true},{t:"54 artigos",ok:false},{t:"7 capítulos",ok:false}], exp:"A Declaração de 1959 tinha 10 princípios fundamentais. Não era juridicamente vinculativa — era uma declaração de intenções. Foi a primeira vez que a comunidade internacional dedicou um documento exclusivamente aos direitos das crianças." },
      { q:"O que reconhecia a Declaração dos Direitos da Criança de 1959?", a:[{t:"Que todas as crianças têm direito à proteção, educação, nome e nacionalidade",ok:true},{t:"Que as crianças devem trabalhar para ajudar as famílias",ok:false},{t:"Que só as crianças de países ricos têm direito à educação",ok:false}], exp:"A Declaração afirmava que todas as crianças, sem discriminação, têm direito à proteção especial, a um nome, a uma nacionalidade, a cuidados de saúde e à educação gratuita." },
      { q:"Qual foi a importância histórica da Declaração de 1959?", a:[{t:"Foi o primeiro documento da ONU dedicado exclusivamente aos direitos das crianças",ok:true},{t:"Foi a primeira lei obrigatória sobre crianças do mundo",ok:false},{t:"Criou a UNICEF",ok:false}], exp:"Antes de 1959, já existia a Declaração de Genebra de 1924 (Liga das Nações), mas a Declaração de 1959 foi o primeiro documento aprovado pelas Nações Unidas exclusivamente sobre direitos da criança, com 10 princípios. Abriu caminho para a Convenção de 1989, com força legal obrigatória." },
      { q:"A Declaração de 1959 era juridicamente obrigatória para os países?", a:[{t:"Não — era uma declaração de intenções, sem força legal",ok:true},{t:"Sim, todos os países eram obrigados a cumpri-la",ok:false},{t:"Sim, mas só para os países fundadores da ONU",ok:false}], exp:"A diferença fundamental entre a Declaração de 1959 e a Convenção de 1989 é que a Declaração era apenas moral — não vinculava juridicamente nenhum Estado. A Convenção de 1989, com 54 artigos, é um tratado internacional com força de lei para os países que a ratificaram." },
      { q:"Que evento histórico motivou maior atenção aos direitos das crianças após 1945?", a:[{t:"A Segunda Guerra Mundial, que deixou milhões de crianças sem lar",ok:true},{t:"A Revolução Industrial, que usou trabalho infantil nas fábricas",ok:false},{t:"A Primeira Guerra Mundial, que criou a Liga das Nações",ok:false}], exp:"O fim da Segunda Guerra Mundial (1945) deixou milhões de crianças deslocadas, órfãs e traumatizadas. Isso impulsionou a criação da UNICEF (1946) e a redação da Declaração dos Direitos da Criança (1959). O sofrimento das crianças durante a guerra tornou urgente a sua proteção legal." }
    ],
    convencao: [
      { q:"Em que data foi aprovada a Convenção sobre os Direitos da Criança?", a:[{t:"20 de novembro de 1989",ok:true},{t:"1 de junho de 1989",ok:false},{t:"20 de novembro de 1959",ok:false}], exp:"A Convenção foi aprovada pela Assembleia Geral da ONU a 20 de novembro de 1989. Por isso, o 20 de novembro é celebrado como o Dia Universal da Criança em todo o mundo." },
      { q:"Em que ano Portugal ratificou a Convenção dos Direitos da Criança?", a:[{t:"1990",ok:true},{t:"1989",ok:false},{t:"1995",ok:false}], exp:"Portugal ratificou a Convenção a 21 de setembro de 1990, apenas alguns meses após a sua aprovação pelas Nações Unidas — um dos primeiros países a fazê-lo." },
      { q:"Quantos artigos tem a Convenção dos Direitos da Criança?", a:[{t:"54 artigos",ok:true},{t:"10 artigos",ok:false},{t:"100 artigos",ok:false}], exp:"A Convenção tem 54 artigos organizados em torno de 4 pilares: sobrevivência, desenvolvimento, proteção e participação. É o tratado de direitos humanos mais ratificado da história." },
      { q:"Quais são os 4 pilares principais da Convenção dos Direitos da Criança?", a:[{t:"Sobrevivência, desenvolvimento, proteção e participação",ok:true},{t:"Educação, saúde, habitação e alimentação",ok:false},{t:"Paz, liberdade, igualdade e fraternidade",ok:false}], exp:"A Convenção organiza-se em torno de 4 princípios fundamentais: o direito à sobrevivência, ao desenvolvimento pleno, à proteção contra abusos e à participação na vida familiar e social." },
      { q:"A Convenção dos Direitos da Criança é o tratado de direitos humanos com mais países a assiná-lo?", a:[{t:"Sim, quase todos os países do mundo a ratificaram",ok:true},{t:"Não, a Declaração Universal dos Direitos Humanos tem mais assinaturas",ok:false},{t:"Não, apenas metade dos países a assinou",ok:false}], exp:"Com 196 países signatários, a Convenção dos Direitos da Criança é o tratado de direitos humanos mais ratificado da história das Nações Unidas." }
    ],
    brincar: [
      { q:"Qual é o artigo da Convenção que garante o direito ao brincar?", a:[{t:"Artigo 31.º",ok:true},{t:"Artigo 24.º",ok:false},{t:"Artigo 12.º",ok:false}], exp:"O artigo 31.º garante o direito de todas as crianças ao descanso, ao lazer, ao brincar e às atividades recreativas adequadas à sua idade." },
      { q:"Por que é que brincar é considerado um direito e não apenas diversão?", a:[{t:"Porque é essencial para o desenvolvimento do cérebro e das competências sociais",ok:true},{t:"Porque as crianças ficam mais calmas",ok:false},{t:"Porque é obrigatório por lei brincar todos os dias",ok:false}], exp:"Brincar é fundamental para o desenvolvimento cognitivo, emocional e social das crianças. Através do jogo, aprendem a comunicar, a resolver problemas, a colaborar e a lidar com as emoções." },
      { q:"O que mostram os estudos sobre crianças que brincam livremente?", a:[{t:"São mais criativas, resilientes e têm melhor saúde mental",ok:true},{t:"Têm piores resultados académicos",ok:false},{t:"São mais difíceis de controlar na escola",ok:false}], exp:"A investigação científica mostra claramente que o brincar livre — sem instruções de adultos — desenvolve a criatividade, a autonomia e a capacidade de gerir emoções e conflitos." },
      { q:"O que mais inclui o direito ao brincar, além do jogo?", a:[{t:"Descanso, lazer e atividades recreativas e culturais",ok:true},{t:"Apenas jogar videojogos",ok:false},{t:"Só atividades desportivas organizadas",ok:false}], exp:"O artigo 31.º é abrangente: inclui o direito ao repouso, às férias escolares, à participação em atividades artísticas e culturais, e ao acesso a espaços de recreio seguros." },
      { q:"Qual das seguintes situações viola o direito ao brincar das crianças?", a:[{t:"Substituir todos os intervalos escolares por estudo",ok:true},{t:"Ter um parque infantil na escola",ok:false},{t:"Ter aulas de música e teatro",ok:false}], exp:"O artigo 31.º protege os intervalos escolares, as férias e o tempo livre das crianças. Sobrecarregar as crianças com trabalho académico sem momentos de brincadeira viola este artigo. A OMS recomenda pelo menos 60 minutos de atividade física diária para crianças em idade escolar." },
      { q:"Em que artigo da Convenção se baseia o direito das crianças a participar em atividades culturais?", a:[{t:"Artigo 31.º — direito ao lazer, jogo e participação cultural",ok:true},{t:"Artigo 17.º — acesso a informação nos media",ok:false},{t:"Artigo 29.º — objetivos da educação",ok:false}], exp:"O artigo 31.º reconhece que as crianças têm direito a participar plenamente na vida cultural e artística. Os Estados devem criar condições — espaços, recursos, programas — que permitam a todas as crianças, independentemente da sua origem, aceder a atividades recreativas e culturais." }
    ],
    educacao: [
      { q:"Qual é o artigo da Convenção que garante o direito à educação?", a:[{t:"Artigo 28.º",ok:true},{t:"Artigo 31.º",ok:false},{t:"Artigo 19.º",ok:false}], exp:"O artigo 28.º da Convenção garante o direito de todas as crianças à educação. O ensino primário deve ser obrigatório e gratuito, e os países devem promover o acesso ao ensino secundário e superior." },
      { q:"Até que idade é o ensino obrigatório em Portugal?", a:[{t:"Até aos 18 anos",ok:true},{t:"Até aos 15 anos",ok:false},{t:"Até aos 12 anos",ok:false}], exp:"Em Portugal, desde 2009, a escolaridade obrigatória foi alargada para 12 anos, o que significa que todas as crianças são obrigadas a estudar até completarem o ensino secundário ou 18 anos." },
      { q:"Quantas crianças ainda estão fora da escola em todo o mundo?", a:[{t:"244 milhões de crianças",ok:true},{t:"10 milhões de crianças",ok:false},{t:"50 milhões de crianças",ok:false}], exp:"Segundo dados da UNICEF, 244 milhões de crianças em idade escolar não frequentam a escola. As principais causas são a pobreza, os conflitos armados, a discriminação e a distância das escolas." },
      { q:"O que faz a UNICEF em relação ao direito à educação?", a:[{t:"Trabalha para garantir que todas as crianças do mundo possam estudar",ok:true},{t:"Constrói escolas apenas na Europa",ok:false},{t:"Distribui apenas livros escolares",ok:false}], exp:"A UNICEF trabalha em todo o mundo para garantir acesso à educação, especialmente em zonas de conflito e países em desenvolvimento. Financia escolas, forma professores e apoia programas de inclusão." },
      { q:"O que garante o artigo 29.º da Convenção em relação à educação?", a:[{t:"Que a educação deve desenvolver a personalidade, talentos e respeito pelos outros",ok:true},{t:"Que a educação deve focar-se apenas em matemática e línguas",ok:false},{t:"Que o Estado pode escolher o que as crianças aprendem sem ouvir os pais",ok:false}], exp:"O artigo 29.º vai além do acesso à escola: define os objetivos da educação. A educação deve desenvolver a personalidade da criança, os seus talentos, capacidades mentais e físicas, e preparar a criança para uma vida responsável numa sociedade livre, com respeito pelos direitos humanos." },
      { q:"O que é o ensino inclusivo e como se relaciona com os direitos das crianças?", a:[{t:"É um sistema em que todas as crianças aprendem juntas, independentemente das suas capacidades",ok:true},{t:"É ensino à distância através da internet",ok:false},{t:"É um sistema de escolas privadas acessíveis a todos",ok:false}], exp:"A educação inclusiva, apoiada pelo artigo 23.º (crianças com deficiência) e pelo artigo 28.º (educação para todos), assegura que nenhuma criança é excluída da escola por causa de deficiência, origem étnica, género ou pobreza. Portugal tem avançado significativamente neste modelo desde 2018." }
    ],
    saude: [
      { q:"Qual é o artigo da Convenção que garante o direito à saúde?", a:[{t:"Artigo 24.º",ok:true},{t:"Artigo 31.º",ok:false},{t:"Artigo 28.º",ok:false}], exp:"O artigo 24.º garante que todas as crianças têm direito ao mais alto nível possível de saúde e a serviços médicos. Os países devem combater a mortalidade infantil e garantir cuidados de saúde básicos." },
      { q:"A que serviços de saúde têm acesso as crianças em Portugal?", a:[{t:"Serviço Nacional de Saúde, vacinas e médico de família",ok:true},{t:"Apenas a urgências hospitalares",ok:false},{t:"Só as que têm seguro de saúde privado",ok:false}], exp:"Em Portugal, todas as crianças têm acesso gratuito ao SNS, ao Plano Nacional de Vacinação (que previne doenças como o sarampo e a poliomielite) e a um médico de família no centro de saúde." },
      { q:"O que distribui a UNICEF para ajudar a saúde das crianças no mundo?", a:[{t:"Vacinas, alimentos terapêuticos e água potável",ok:true},{t:"Apenas medicamentos caros",ok:false},{t:"Só equipamento hospitalar sofisticado",ok:false}], exp:"A UNICEF fornece vacinas a metade das crianças do mundo. Também distribui alimentos terapêuticos para crianças com desnutrição severa e apoia sistemas de abastecimento de água potável." },
      { q:"O que é o Plano Nacional de Vacinação (PNV) em Portugal?", a:[{t:"Um programa gratuito de vacinação para todas as crianças portuguesas",ok:true},{t:"Um plano pago apenas para famílias ricas",ok:false},{t:"Um programa só para adultos",ok:false}], exp:"O PNV é gratuito e universal — cobre todas as crianças portuguesas. Previne doenças graves como a tosse convulsa, o sarampo, a hepatite B e a meningite." },
      { q:"Por que morrem ainda muitas crianças de doenças preveníveis no mundo?", a:[{t:"Porque não têm acesso a vacinas, água potável e cuidados básicos",ok:true},{t:"Porque as vacinas não funcionam nesses países",ok:false},{t:"Porque os países não querem aderir à OMS",ok:false}], exp:"A falta de acesso a vacinas, água potável, saneamento básico e cuidados médicos de primeira linha é a principal causa de morte infantil evitável. A UNICEF distribui vacinas a metade das crianças do mundo para combater este problema." },
      { q:"O que significa 'o mais alto nível de saúde possível' no artigo 24.º da Convenção?", a:[{t:"Que cada país deve garantir o melhor cuidado de saúde ao seu alcance para todas as crianças",ok:true},{t:"Que todas as crianças têm direito a hospitais privados",ok:false},{t:"Que a saúde é mais importante do que a educação",ok:false}], exp:"O artigo 24.º reconhece que os recursos de cada país são diferentes — por isso fala em 'o mais alto nível possível'. Mas todos os países devem progressivamente melhorar o acesso das crianças à saúde, nutrição, água potável e ambiente saudável." }
    ],
    protecao: [
      { q:"Quais são os artigos da Convenção que protegem as crianças contra violência e abuso?", a:[{t:"Artigos 19.º e 37.º",ok:true},{t:"Artigos 24.º e 28.º",ok:false},{t:"Artigos 12.º e 31.º",ok:false}], exp:"O artigo 19.º protege as crianças contra todas as formas de violência física e psicológica. O artigo 37.º proíbe a tortura, os tratamentos degradantes e a privação ilegal de liberdade." },
      { q:"Qual é o número da linha de apoio SOS Criança em Portugal?", a:[{t:"116 111",ok:true},{t:"112",ok:false},{t:"800 202 202",ok:false}], exp:"O 116 111 é a linha dedicada às crianças e jovens em perigo em Portugal. Funciona 24 horas por dia, é gratuita e confidencial. Qualquer pessoa pode ligar se souber de uma criança em risco." },
      { q:"O que é a CPCJ?", a:[{t:"Comissão de Proteção de Crianças e Jovens",ok:true},{t:"Centro de Promoção Cultural Juvenil",ok:false},{t:"Comité Português da UNICEF",ok:false}], exp:"A CPCJ é uma instituição oficial portuguesa que intervém para proteger crianças e jovens em risco ou perigo. Existem comissões em todo o país, que trabalham com famílias, escolas e serviços sociais." },
      { q:"O que proibem os artigos de proteção da Convenção dos Direitos da Criança?", a:[{t:"Toda a forma de violência, trabalho perigoso e privação de liberdade",ok:true},{t:"Apenas a violência física",ok:false},{t:"Só o trabalho infantil em fábricas",ok:false}], exp:"A Convenção proíbe todas as formas de maus-tratos (físicos, psicológicos, sexuais), o trabalho infantil perigoso, o tráfico de crianças e qualquer privação ilegal da liberdade." },
      { q:"O que deve fazer uma criança ou adulto que suspeite de maus-tratos a uma criança?", a:[{t:"Contactar a linha 116 111 ou falar com a CPCJ da sua área",ok:true},{t:"Aguardar que a situação se resolva sozinha",ok:false},{t:"Só agir se tiver provas absolutas",ok:false}], exp:"Qualquer pessoa que suspeite de maus-tratos a uma criança pode (e deve) contactar a linha SOS Criança (116 111) ou a CPCJ local. Não são precisas provas absolutas — a suspeita fundamentada é suficiente. Denunciar é proteger." },
      { q:"O que é o tráfico de crianças e como é combatido?", a:[{t:"É a exploração de crianças através de recrutamento e transporte forçados — combatido com leis e cooperação internacional",ok:true},{t:"É apenas o tráfico de drogas envolvendo menores",ok:false},{t:"Só acontece em países em guerra",ok:false}], exp:"O tráfico de crianças inclui o recrutamento, transporte ou acolhimento de menores para fins de exploração sexual, trabalho forçado ou mendicidade. É proibido pelo artigo 35.º da Convenção e combatido pela INTERPOL, EUROPOL e UNICEF." }
    ],
    participacao: [
      { q:"Qual é o artigo da Convenção que garante às crianças o direito a ser ouvidas?", a:[{t:"Artigo 12.º",ok:true},{t:"Artigo 24.º",ok:false},{t:"Artigo 37.º",ok:false}], exp:"O artigo 12.º afirma que as crianças têm o direito de expressar livremente a sua opinião em todas as questões que as afetam. A sua opinião deve ser considerada, tendo em conta a sua idade e maturidade." },
      { q:"Em que espaços podem as crianças em Portugal exercer o direito à participação?", a:[{t:"Nos parlamentos jovens e conselhos municipais de jovens",ok:true},{t:"Apenas no conselho de turma",ok:false},{t:"Só depois dos 18 anos",ok:false}], exp:"Em Portugal, existem parlamentos jovens (assembleias de jovens a nível nacional e regional) e conselhos municipais de jovens, onde crianças e adolescentes podem debater e apresentar propostas." },
      { q:"O direito à participação aplica-se em que contextos?", a:[{t:"Nas escolas, nas famílias e nos governos",ok:true},{t:"Apenas em assembleias internacionais",ok:false},{t:"Só em atividades extracurriculares",ok:false}], exp:"O direito à participação aplica-se em todos os contextos onde se tomam decisões que afetam as crianças: em casa, na escola, nos tribunais, nos serviços sociais e a nível local e nacional." },
      { q:"Por que é importante ouvir a opinião das crianças?", a:[{t:"Porque as decisões que as afetam ficam mais justas e adequadas",ok:true},{t:"Porque as crianças sabem sempre melhor que os adultos",ok:false},{t:"Porque é obrigatório por lei que sejam elas a decidir tudo",ok:false}], exp:"Ouvir as crianças não significa que elas decidem tudo — significa que a sua perspetiva é considerada. Assim, as decisões são mais informadas, mais justas e mais adaptadas às necessidades reais das crianças." },
      { q:"Como se chama o mecanismo da ONU que avalia se os países respeitam a Convenção?", a:[{t:"Comité dos Direitos da Criança das Nações Unidas",ok:true},{t:"Tribunal Internacional de Justiça",ok:false},{t:"Conselho de Segurança da ONU",ok:false}], exp:"O Comité dos Direitos da Criança é um órgão independente de 18 especialistas que analisa os relatórios dos países sobre o cumprimento da Convenção e faz recomendações. Portugal é regularmente avaliado por este Comité." }
    ],
    futuro: [
      { q:"Quantos Objetivos de Desenvolvimento Sustentável (ODS) existem?", a:[{t:"17 objetivos",ok:true},{t:"10 objetivos",ok:false},{t:"27 objetivos",ok:false}], exp:"Em setembro de 2015, os 193 países membros da ONU aprovaram a Agenda 2030 com 17 ODS. Estes objetivos visam erradicar a pobreza, proteger o planeta e garantir prosperidade para todos até 2030." },
      { q:"Em que ano foram aprovados os Objetivos de Desenvolvimento Sustentável?", a:[{t:"2015",ok:true},{t:"2000",ok:false},{t:"2020",ok:false}], exp:"Os 17 ODS foram aprovados na Cimeira das Nações Unidas de setembro de 2015. São para ser atingidos até 2030 e envolvem governos, empresas, organizações e cidadãos de todo o mundo." },
      { q:"Qual ODS se refere diretamente à educação de qualidade?", a:[{t:"ODS 4 — Educação de Qualidade",ok:true},{t:"ODS 1 — Erradicar a Pobreza",ok:false},{t:"ODS 3 — Saúde de Qualidade",ok:false}], exp:"O ODS 4 estabelece o objetivo de garantir educação inclusiva, equitativa e de qualidade para todos até 2030, incluindo o acesso ao ensino pré-escolar e a aprendizagem ao longo da vida." },
      { q:"Por que são as crianças de hoje importantes para o futuro sustentável?", a:[{t:"Porque serão os agentes de mudança que implementarão soluções para os problemas globais",ok:true},{t:"Porque os adultos já não conseguem resolver os problemas do planeta",ok:false},{t:"Porque só as crianças votam nos ODS",ok:false}], exp:"As crianças de hoje crescerão num mundo em transformação e serão os líderes, cientistas, professores e cidadãos que implementarão soluções para as alterações climáticas, a pobreza e a desigualdade." },
      { q:"Qual ODS está diretamente ligado ao fim da pobreza extrema?", a:[{t:"ODS 1 — Erradicar a Pobreza",ok:true},{t:"ODS 8 — Trabalho Digno",ok:false},{t:"ODS 10 — Reduzir as Desigualdades",ok:false}], exp:"O ODS 1 visa erradicar a pobreza extrema para todos os povos até 2030. Cerca de 356 milhões de crianças vivem em pobreza extrema no mundo — menos de 1,90 dólares por dia. Os ODS reconhecem que sem acabar com a pobreza infantil não há futuro sustentável." },
      { q:"O que podem as crianças fazer hoje para contribuir para os ODS?", a:[{t:"Agir no dia a dia: poupar energia, reciclar, respeitar os outros e sensibilizar a comunidade",ok:true},{t:"Nada — os ODS são apenas para governos",ok:false},{t:"Esperar ter 18 anos para começar a participar",ok:false}], exp:"Os ODS são para todos. As crianças contribuem através das suas escolhas diárias, da sua participação na escola e comunidade, da sua voz nas redes sociais e do seu envolvimento em projetos locais. Cada ação conta — por mais pequena que pareça." }
    ],
    unicef: [
      { q:"Em que ano foi criada a UNICEF?", a:[{t:"1946",ok:true},{t:"1959",ok:false},{t:"1989",ok:false}], exp:"A UNICEF foi criada a 11 de dezembro de 1946, pela Assembleia Geral das Nações Unidas, para ajudar as crianças afetadas pela Segunda Guerra Mundial. 'UNICEF' vem de 'United Nations International Children's Emergency Fund'." },
      { q:"Em quantos países trabalha a UNICEF?", a:[{t:"Mais de 190 países e territórios",ok:true},{t:"Apenas 50 países",ok:false},{t:"Só nos países mais ricos",ok:false}], exp:"A UNICEF está presente em mais de 190 países e territórios — ou seja, praticamente em todo o mundo. A sua presença é especialmente importante em zonas de conflito e em países com muita pobreza." },
      { q:"O que significa a sigla UNICEF?", a:[{t:"Fundo das Nações Unidas para a Infância",ok:true},{t:"União Internacional de Crianças e Famílias",ok:false},{t:"Unidade Nacional de Cuidados de Emergência para a Família",ok:false}], exp:"UNICEF vem do inglês 'United Nations Children's Fund' — o nome foi encurtado em 1953, mantendo o acrónimo. Em português, o nome oficial é Fundo das Nações Unidas para a Infância. Foi criada em 1946 como fundo de emergência e é hoje a principal organização mundial dedicada aos direitos das crianças." },
      { q:"O que faz o Comité Português da UNICEF?", a:[{t:"Sensibiliza para os direitos das crianças e angaria fundos para programas no mundo",ok:true},{t:"Gere hospitais pediátricos em Portugal",ok:false},{t:"Substitui o Estado na proteção das crianças portuguesas",ok:false}], exp:"O Comité Português da UNICEF é uma organização não governamental que trabalha em Portugal para consciencializar a sociedade sobre os direitos das crianças e para angariar donativos que financiam programas da UNICEF em todo o mundo." },
      { q:"Qual é um dos principais programas de nutrição da UNICEF para crianças em risco?", a:[{t:"Distribuição de alimentos terapêuticos prontos a usar (RUTF) para desnutrição severa",ok:true},{t:"Vales de desconto em supermercados de países ricos",ok:false},{t:"Distribuição de vitaminas apenas em hospitais privados",ok:false}], exp:"O RUTF (Ready-to-Use Therapeutic Food) é uma pasta nutritiva que a UNICEF distribui em zonas de crise para tratar a desnutrição aguda severa em crianças. É barato, não precisa de refrigeração e salva milhões de vidas por ano." },
      { q:"O 20 de novembro é o Dia Universal da Criança — porquê esta data?", a:[{t:"Porque foi nesse dia de 1989 que a Convenção dos Direitos da Criança foi aprovada",ok:true},{t:"Porque foi o aniversário da fundação da UNICEF",ok:false},{t:"Porque é o dia em que a ONU foi criada",ok:false}], exp:"A 20 de novembro de 1989, a Assembleia Geral das ONU adotou a Convenção sobre os Direitos da Criança. Por isso, esta data é celebrada como Dia Universal da Criança em todo o mundo — um momento para refletir sobre os direitos e o bem-estar das crianças." }
    ],
    identidade: [
      { q:"Qual é o artigo da Convenção que garante o direito a um nome e a uma nacionalidade?", a:[{t:"Artigo 7.º",ok:true},{t:"Artigo 12.º",ok:false},{t:"Artigo 24.º",ok:false}], exp:"O artigo 7.º estipula que toda a criança tem direito a ser registada logo após o nascimento, a ter um nome e a adquirir uma nacionalidade. O registo de nascimento é o primeiro passo para garantir todos os outros direitos." },
      { q:"O que é o registo de nascimento e por que é importante?", a:[{t:"É o documento que prova a existência legal da criança e garante os seus direitos",ok:true},{t:"É apenas uma formalidade sem consequências práticas",ok:false},{t:"Só é obrigatório nos países ricos",ok:false}], exp:"Sem registo de nascimento, uma criança não existe legalmente. Não pode ir à escola, aceder a cuidados de saúde ou ter passaporte. A UNICEF estima que 237 milhões de crianças no mundo não estão registadas." },
      { q:"Qual artigo protege a identidade da criança (nome, nacionalidade e relações familiares)?", a:[{t:"Artigo 8.º",ok:true},{t:"Artigo 3.º",ok:false},{t:"Artigo 19.º",ok:false}], exp:"O artigo 8.º obriga os Estados a respeitar e preservar a identidade da criança — o seu nome, nacionalidade e vínculos familiares — e a ajudá-la a recuperar esses elementos se forem ilegalmente retirados." },
      { q:"Quantas crianças no mundo nascem sem registo?", a:[{t:"Cerca de 237 milhões",ok:true},{t:"Menos de 1 milhão",ok:false},{t:"Cerca de 50 milhões",ok:false}], exp:"Segundo a UNICEF, cerca de 237 milhões de crianças menores de 5 anos não têm registo de nascimento, sobretudo na África Subsariana e na Ásia do Sul. Sem registo, ficam invisíveis para o Estado e sem acesso aos seus direitos." },
      { q:"O que é uma criança apátrida?", a:[{t:"Uma criança sem nacionalidade reconhecida por nenhum Estado",ok:true},{t:"Uma criança que perdeu os pais",ok:false},{t:"Uma criança que vive em mais do que um país",ok:false}], exp:"A apatridia ocorre quando uma criança não é reconhecida como nacional por nenhum país. Há cerca de 4 milhões de apátridas no mundo. Sem nacionalidade, ficam excluídas de direitos básicos. A Convenção de 1954 sobre o Estatuto dos Apátridas e o artigo 7.º da CDC protegem estas crianças." },
      { q:"Porque é que algumas crianças não recebem registo de nascimento logo após nascer?", a:[{t:"Por pobreza, distância dos serviços, conflitos armados ou discriminação",ok:true},{t:"Porque os pais preferem esperar até a criança falar",ok:false},{t:"Porque a ONU proibiu o registo em certos países",ok:false}], exp:"As principais barreiras ao registo de nascimento são: distância de serviços de registo civil, pobreza (pagamento de taxas), discriminação de grupos minoritários, e conflitos que destroem infraestruturas administrativas. A UNICEF apoia programas de registo em zonas de crise." }
    ],
    familia: [
      { q:"Qual é o artigo da Convenção que garante que a criança não seja separada dos pais?", a:[{t:"Artigo 9.º",ok:true},{t:"Artigo 7.º",ok:false},{t:"Artigo 31.º",ok:false}], exp:"O artigo 9.º estabelece que a criança não deve ser separada dos pais contra a sua vontade, exceto quando essa separação for necessária para o seu bem-estar — por exemplo, em casos de abuso ou negligência graves." },
      { q:"O que garante o artigo 10.º da Convenção?", a:[{t:"O direito à reunificação familiar quando pais e filhos vivem em países diferentes",ok:true},{t:"O direito a ter sempre dois pais",ok:false},{t:"O direito a escolher com qual dos pais viver",ok:false}], exp:"O artigo 10.º garante que os pedidos de reunificação familiar — quando a criança e os seus pais vivem em países diferentes — sejam tratados de forma positiva, rápida e com humanidade pelos governos." },
      { q:"O que diz o artigo 18.º sobre o papel dos pais?", a:[{t:"Os pais têm responsabilidade conjunta pela criação e desenvolvimento da criança",ok:true},{t:"Só o pai é responsável pela criança",ok:false},{t:"O Estado é o principal responsável pela criação das crianças",ok:false}], exp:"O artigo 18.º reconhece que ambos os pais têm responsabilidades comuns na criação da criança. O Estado deve apoiar os pais nessa tarefa, por exemplo através de serviços de apoio à família e creches." },
      { q:"O que acontece quando a criança não pode viver com a sua família?", a:[{t:"O Estado deve garantir cuidados alternativos adequados, como famílias de acolhimento",ok:true},{t:"A criança fica automaticamente a cargo do Estado sem alternativas",ok:false},{t:"A criança perde os seus direitos enquanto não tiver família",ok:false}], exp:"O artigo 20.º garante que as crianças privadas do ambiente familiar têm direito a proteção e cuidados especiais. As alternativas incluem famílias de acolhimento, kafala (adoção islâmica) ou, em último recurso, instituições adequadas." },
      { q:"O que é a adoção e que artigo da Convenção a regula?", a:[{t:"É um processo legal pelo qual uma criança passa a ser filho de outra família — artigo 21.º",ok:true},{t:"É um acordo informal entre famílias — sem base legal",ok:false},{t:"É proibida pela Convenção dos Direitos da Criança",ok:false}], exp:"O artigo 21.º regula a adoção, garantindo que é feita no superior interesse da criança. A adoção internacional deve respeitar tratados e garantir que a criança não é alvo de tráfico ou lucro indevido." },
      { q:"Qual é o princípio fundamental que deve orientar todas as decisões sobre crianças?", a:[{t:"O superior interesse da criança — artigo 3.º",ok:true},{t:"A vontade dos pais em primeiro lugar",ok:false},{t:"As leis económicas do país em questão",ok:false}], exp:"O artigo 3.º da Convenção estabelece que o superior interesse da criança deve ser a consideração primordial em todas as ações que a afetam — seja por tribunais, serviços sociais, escolas ou pais. É o princípio-mestre da Convenção." }
    ],
    refugiados: [
      { q:"Qual artigo da Convenção protege especificamente as crianças refugiadas?", a:[{t:"Artigo 22.º",ok:true},{t:"Artigo 9.º",ok:false},{t:"Artigo 37.º",ok:false}], exp:"O artigo 22.º estabelece que as crianças que peçam o estatuto de refugiada ou sejam reconhecidas como tal têm direito a proteção especial e ao apoio dos Estados. Têm os mesmos direitos que todas as outras crianças." },
      { q:"Quantas crianças estão deslocadas no mundo devido a conflitos e perseguições?", a:[{t:"Mais de 43 milhões",ok:true},{t:"Menos de 1 milhão",ok:false},{t:"Cerca de 5 milhões",ok:false}], exp:"Segundo dados recentes da UNICEF e ACNUR, mais de 43 milhões de crianças estão deslocadas em todo o mundo — fugindo de guerras, violência, perseguição ou catástrofes naturais. É a maior crise de deslocamento desde a Segunda Guerra Mundial." },
      { q:"O que é o ACNUR?", a:[{t:"A agência das Nações Unidas para os refugiados",ok:true},{t:"Uma organização de países europeus para controlo de fronteiras",ok:false},{t:"Um programa de apoio alimentar da ONU",ok:false}], exp:"O ACNUR (Alto Comissariado das Nações Unidas para os Refugiados) é a agência da ONU responsável por proteger refugiados, apátridas e pessoas deslocadas. Trabalha em mais de 130 países e em parceria com a UNICEF para proteger crianças." },
      { q:"Uma criança refugiada tem os mesmos direitos que as outras crianças?", a:[{t:"Sim, a Convenção aplica-se a todas as crianças sem discriminação",ok:true},{t:"Não, os refugiados têm direitos reduzidos",ok:false},{t:"Só se tiverem documentos de identidade válidos",ok:false}], exp:"O artigo 2.º da Convenção afirma que todos os direitos se aplicam a todas as crianças, sem qualquer discriminação. Ser refugiado, apátrida ou migrante não reduz os direitos de uma criança — pelo contrário, justifica proteção adicional." },
      { q:"O que é uma criança não acompanhada no contexto dos refugiados?", a:[{t:"Uma criança que atravessa fronteiras sem pais ou responsáveis legais",ok:true},{t:"Uma criança que viaja de avião sozinha",ok:false},{t:"Uma criança que não fala a língua do país de acolhimento",ok:false}], exp:"Crianças não acompanhadas ou separadas são especialmente vulneráveis a tráfico, exploração e abuso. O artigo 22.º exige que os Estados lhes concedam a mesma proteção que a outras crianças, incluindo acesso a representação legal e tutores." },
      { q:"Que direitos imediatos deve um país garantir a uma criança refugiada à chegada?", a:[{t:"Abrigo, alimentação, cuidados médicos e acesso à educação",ok:true},{t:"Apenas um visto temporário",ok:false},{t:"Só alojamento em centros de detenção",ok:false}], exp:"Independentemente do estatuto legal, uma criança que chegue como refugiada tem direito imediato a condições de vida dignas, cuidados médicos, proteção contra violência e, o mais depressa possível, acesso à educação — conforme os artigos 22.º, 24.º e 28.º." }
    ],
    trabalho: [
      { q:"Qual é o artigo da Convenção que proíbe o trabalho infantil perigoso?", a:[{t:"Artigo 32.º",ok:true},{t:"Artigo 28.º",ok:false},{t:"Artigo 19.º",ok:false}], exp:"O artigo 32.º protege as crianças contra a exploração económica e contra qualquer trabalho perigoso, que prejudique a sua saúde ou interfira com a sua educação. Os Estados devem fixar idades mínimas de trabalho." },
      { q:"Quantas crianças trabalham em condições de exploração no mundo?", a:[{t:"Cerca de 160 milhões",ok:true},{t:"Menos de 10 milhões",ok:false},{t:"Cerca de 500 milhões",ok:false}], exp:"Segundo a OIT (Organização Internacional do Trabalho), cerca de 160 milhões de crianças estão em situação de trabalho infantil — quase metade em formas perigosas. A maioria está na África Subsariana e na Ásia." },
      { q:"Qual é a idade mínima geral para trabalhar em Portugal?", a:[{t:"16 anos",ok:true},{t:"14 anos",ok:false},{t:"18 anos",ok:false}], exp:"Em Portugal, a idade mínima geral para trabalhar é 16 anos. Menores de 16 anos só podem trabalhar em situações muito específicas (como participar em espetáculos culturais) e com autorização dos pais e autoridades." },
      { q:"O que distingue o trabalho infantil perigoso de uma pequena ajuda em casa?", a:[{t:"O trabalho perigoso prejudica a saúde, a educação e o desenvolvimento da criança",ok:true},{t:"Qualquer trabalho feito por uma criança é automaticamente exploração",ok:false},{t:"Só é ilegal se a criança não receber salário",ok:false}], exp:"A OIT distingue entre trabalho aceitável (pequenas tarefas que não prejudicam o desenvolvimento) e trabalho infantil (que priva a criança da infância, interfere com a escola ou é perigoso para a saúde). O contexto e o impacto são decisivos." },
      { q:"Em que setores é mais comum o trabalho infantil no mundo?", a:[{t:"Agricultura, minas, construção e trabalho doméstico",ok:true},{t:"Apenas nas fábricas têxteis da Ásia",ok:false},{t:"Só em países sem leis laborais",ok:false}], exp:"A maioria do trabalho infantil ocorre na agricultura (72%), seguida de minas, pedreiras, construção e trabalho doméstico em casas de terceiros. Estas atividades são perigosas para a saúde física e mental das crianças." },
      { q:"Qual organização internacional lidera o combate ao trabalho infantil a nível global?", a:[{t:"OIT — Organização Internacional do Trabalho",ok:true},{t:"INTERPOL",ok:false},{t:"Banco Mundial",ok:false}], exp:"A OIT lidera o programa IPEC (Programa Internacional para a Eliminação do Trabalho Infantil) e define normas internacionais, como a Convenção n.º 182, que proíbe as piores formas de trabalho infantil e foi ratificada por todos os membros da OIT." }
    ],
    expressao: [
      { q:"Qual é o artigo da Convenção que garante a liberdade de expressão?", a:[{t:"Artigo 13.º",ok:true},{t:"Artigo 12.º",ok:false},{t:"Artigo 17.º",ok:false}], exp:"O artigo 13.º garante às crianças o direito de procurar, receber e transmitir informações e ideias — oralmente, por escrito, através da arte ou de qualquer outro meio — desde que não prejudiquem os outros." },
      { q:"O artigo 17.º da Convenção trata de que direito?", a:[{t:"O acesso a informação e meios de comunicação adequados",ok:true},{t:"O direito a ter um telemóvel",ok:false},{t:"O direito a publicar um jornal escolar",ok:false}], exp:"O artigo 17.º reconhece o papel importante dos meios de comunicação e encoraja os Estados a garantir que as crianças tenham acesso a informação de fontes diversas, especialmente material que promova o seu bem-estar social, espiritual e moral." },
      { q:"O direito à liberdade de expressão tem limites?", a:[{t:"Sim, não pode ser usado para prejudicar os direitos e a reputação dos outros",ok:true},{t:"Não, é um direito absoluto sem qualquer restrição",ok:false},{t:"Sim, as crianças só podem expressar-se com autorização dos pais",ok:false}], exp:"O artigo 13.º reconhece que a liberdade de expressão pode ser limitada para respeitar os direitos dos outros ou para proteger a segurança nacional, a ordem pública, a saúde ou a moral. Direitos com responsabilidades." },
      { q:"O que é o bullying e como se relaciona com os direitos das crianças?", a:[{t:"É uma violação dos direitos da criança — prejudica a dignidade, a saúde e a educação",ok:true},{t:"É um problema menor que as crianças devem resolver sozinhas",ok:false},{t:"Só é relevante para os direitos se causar danos físicos",ok:false}], exp:"O bullying — seja físico, verbal ou online (ciberbullying) — viola vários artigos da Convenção: o direito à dignidade (art. 16.º), à proteção (art. 19.º) e à saúde (art. 24.º). As escolas e os Estados têm obrigação de prevenir e combater o bullying." },
      { q:"O que é a liberdade de pensamento e consciência das crianças? (art. 14.º)", a:[{t:"O direito a formar e expressar as suas próprias crenças e opiniões",ok:true},{t:"O direito a nunca frequentar aulas de religião",ok:false},{t:"O direito a não obedecer a regras escolares",ok:false}], exp:"O artigo 14.º garante que as crianças têm o direito à liberdade de pensamento, consciência e religião. Os pais têm o direito de orientar a criança nesta matéria, de forma compatível com os interesses superiores da criança e com a sua autonomia crescente." },
      { q:"Como pode uma criança exercer o direito à expressão na escola?", a:[{t:"Participando em assembleias de turma, jornais escolares e projetos artísticos",ok:true},{t:"Apenas nos testes e fichas de avaliação",ok:false},{t:"Só se tiver autorização escrita dos pais",ok:false}], exp:"As escolas são espaços privilegiados para o exercício da expressão: assembleias de turma, conselhos de alunos, jornais escolares, teatro, música e projetos de cidadania são exemplos concretos do artigo 13.º em ação no quotidiano escolar." }
    ],
    privacidade: [
      { q:"Qual é o artigo da Convenção que protege a privacidade das crianças?", a:[{t:"Artigo 16.º",ok:true},{t:"Artigo 8.º",ok:false},{t:"Artigo 13.º",ok:false}], exp:"O artigo 16.º garante que nenhuma criança seja sujeita a interferências arbitrárias na sua vida privada, família, domicílio ou correspondência, nem a ataques à sua honra e reputação. As crianças têm direito à proteção da lei contra tais ataques." },
      { q:"O que é o RGPD e como protege as crianças?", a:[{t:"É o regulamento europeu de proteção de dados, que dá proteção especial aos dados de crianças",ok:true},{t:"É uma lei apenas para adultos",ok:false},{t:"É um sistema de controlo parental obrigatório",ok:false}], exp:"O Regulamento Geral de Proteção de Dados (RGPD) da União Europeia, em vigor desde 2018, dá proteção especial aos dados pessoais das crianças. Em Portugal, o consentimento para usar dados de menores de 13 anos deve ser dado pelos pais." },
      { q:"As fotografias de crianças partilhadas sem autorização nas redes sociais violam algum direito?", a:[{t:"Sim, violam o direito à privacidade e à imagem da criança",ok:true},{t:"Não, qualquer pessoa pode partilhar fotos de crianças livremente",ok:false},{t:"Só é ilegal se a foto for em ambiente escolar",ok:false}], exp:"Partilhar fotos de crianças sem consentimento — mesmo de familiares — pode violar o direito à privacidade (art. 16.º) e à proteção da imagem. Em Portugal, a publicação de imagens de menores sem autorização pode ser ilegal, especialmente em contextos que os identifiquem." },
      { q:"O que devem as crianças fazer se sentirem que a sua privacidade está a ser violada online?", a:[{t:"Falar com um adulto de confiança e denunciar às plataformas ou autoridades",ok:true},{t:"Ignorar porque a internet não tem regras",ok:false},{t:"Responder ao agressor diretamente",ok:false}], exp:"As crianças devem falar com um adulto de confiança (pais, professor, psicólogo) e denunciar às plataformas digitais. Em Portugal, a Linha Internet Segura (1800 21 22 23) apoia crianças vítimas de violações de privacidade e outros problemas online." },
      { q:"O que é o 'direito ao esquecimento' e como beneficia as crianças?", a:[{t:"O direito de pedir a remoção de informação pessoal online que já não é relevante",ok:true},{t:"O direito de não ser avaliado na escola",ok:false},{t:"O direito de apagar as notas negativas do boletim escolar",ok:false}], exp:"O 'direito ao esquecimento' (RGPD, art. 17.º) permite pedir às plataformas digitais que apaguem dados pessoais. É especialmente importante para os jovens: publicações constrangedoras de infância não devem persegui-los na vida adulta." },
      { q:"O que é o 'sharenting' e que riscos apresenta?", a:[{t:"É a partilha excessiva de fotos e dados de filhos pelos pais nas redes sociais",ok:true},{t:"É um tipo de bullying online entre crianças",ok:false},{t:"É um sistema de controlo parental digital",ok:false}], exp:"'Sharenting' (share + parenting) é a prática de pais partilharem publicações frequentes sobre os filhos online. Pode violar a privacidade da criança, criar uma 'pegada digital' sem consentimento e expô-la a riscos. O artigo 16.º da CDC protege as crianças destas situações." }
    ],
    cultura: [
      { q:"Qual artigo garante às crianças de minorias o direito à sua língua e cultura?", a:[{t:"Artigo 30.º",ok:true},{t:"Artigo 17.º",ok:false},{t:"Artigo 28.º",ok:false}], exp:"O artigo 30.º estabelece que as crianças pertencentes a minorias étnicas, religiosas ou linguísticas não podem ser privadas do direito de ter a sua própria vida cultural, de professar e praticar a sua religião ou de usar a sua língua." },
      { q:"O que é a diversidade cultural e por que é importante respeitar?", a:[{t:"É a variedade de culturas, línguas e tradições no mundo — enriquece a humanidade",ok:true},{t:"É um problema que dificulta a convivência entre povos",ok:false},{t:"Só é relevante fora de Portugal",ok:false}], exp:"A diversidade cultural é uma riqueza da humanidade. A UNESCO defende que todas as culturas têm o mesmo valor e merecem proteção. Em Portugal, vivem pessoas de mais de 180 nacionalidades, tornando o país culturalmente muito diverso." },
      { q:"Quantas línguas são faladas no mundo atualmente?", a:[{t:"Cerca de 7 000 línguas",ok:true},{t:"Cerca de 200 línguas",ok:false},{t:"Cerca de 1 000 línguas",ok:false}], exp:"Estima-se que existam cerca de 7 000 línguas vivas no mundo. Muitas estão em risco de extinção — quando uma língua morre, perde-se também uma forma única de ver e descrever o mundo. Preservar as línguas minoritárias é proteger a diversidade cultural." },
      { q:"Em Portugal, que língua além do Português tem estatuto oficial de língua regional?", a:[{t:"O Mirandês, falado em Miranda do Douro",ok:true},{t:"O Galego, falado no Norte",ok:false},{t:"O Crioulo, falado em Lisboa",ok:false}], exp:"O Mirandês é a única língua regional com reconhecimento oficial em Portugal, falada em Miranda do Douro e arredores. Tem raízes na antiga língua asturo-leonesa e é património linguístico único. A sua proteção é um exemplo do artigo 30.º em ação." },
      { q:"O que é a UNESCO e que papel tem na proteção das culturas?", a:[{t:"É a agência da ONU para a educação, ciência e cultura — protege o património cultural mundial",ok:true},{t:"É uma organização de países ricos para financiar museus",ok:false},{t:"É o serviço secreto cultural da União Europeia",ok:false}], exp:"A UNESCO (United Nations Educational, Scientific and Cultural Organization) promove a paz através da educação, ciência e cultura. Gere a Lista do Património Mundial e a Convenção para a Salvaguarda do Património Imaterial, protegendo tradições, línguas e expressões culturais." },
      { q:"Porque é importante que as crianças conheçam a cultura dos outros?", a:[{t:"Para desenvolver empatia, respeito e competências para viver num mundo diverso",ok:true},{t:"Para poder criticar melhor as outras culturas",ok:false},{t:"Porque a lei obriga ao estudo de todas as culturas",ok:false}], exp:"O contacto com outras culturas desde cedo desenvolve a empatia, combate preconceitos e prepara as crianças para uma cidadania global. O artigo 29.º da CDC destaca o desenvolvimento do respeito pelas outras culturas como objetivo central da educação." }
    ],
    deficiencia: [
      { q:"Qual artigo da Convenção protege as crianças com deficiência?", a:[{t:"Artigo 23.º",ok:true},{t:"Artigo 24.º",ok:false},{t:"Artigo 28.º",ok:false}], exp:"O artigo 23.º reconhece que as crianças com deficiência têm direito a uma vida plena e digna, em condições que garantam a sua participação ativa na sociedade. Os Estados devem assegurar apoio especial e inclusão." },
      { q:"O que é a educação inclusiva?", a:[{t:"Um sistema em que todas as crianças, com ou sem deficiência, aprendem juntas",ok:true},{t:"Um sistema de escolas separadas para crianças com necessidades especiais",ok:false},{t:"Aulas online para crianças com mobilidade reduzida",ok:false}], exp:"A educação inclusiva pressupõe que todas as crianças aprendam juntas, com as adaptações necessárias para cada uma. Portugal tem avançado neste modelo, integrando alunos com necessidades educativas especiais nas escolas regulares com apoio especializado." },
      { q:"Qual a percentagem estimada de crianças no mundo com algum tipo de deficiência?", a:[{t:"Cerca de 15%",ok:true},{t:"Menos de 1%",ok:false},{t:"Mais de 50%",ok:false}], exp:"A OMS estima que cerca de 15% da população mundial vive com alguma forma de deficiência. No caso das crianças, estima-se que entre 93 e 150 milhões enfrentam alguma deficiência. Muitas enfrentam barreiras no acesso à educação, saúde e participação social." },
      { q:"O que são tecnologias de apoio e como ajudam as crianças com deficiência?", a:[{t:"São ferramentas que compensam limitações e aumentam a autonomia e participação",ok:true},{t:"São medicamentos especiais para crianças com deficiência",ok:false},{t:"São apenas cadeiras de rodas e bengalas",ok:false}], exp:"Tecnologias de apoio incluem software de leitura de ecrã, comunicadores alternativos, impressoras Braille, aplicações de comunicação aumentativa e muitas outras ferramentas. Permitem que crianças com deficiências físicas, sensoriais ou cognitivas participem plenamente na escola e na sociedade." },
      { q:"O que é a acessibilidade e por que é um direito das crianças com deficiência?", a:[{t:"É a garantia de que espaços, serviços e informação são utilizáveis por todos",ok:true},{t:"É um benefício opcional que os países podem oferecer",ok:false},{t:"É apenas sobre rampas para cadeiras de rodas",ok:false}], exp:"A acessibilidade — física, digital e comunicacional — é uma condição para que as crianças com deficiência possam exercer os seus direitos. A Convenção da ONU sobre os Direitos das Pessoas com Deficiência (2006) e o artigo 23.º da CDC exigem que os Estados removam barreiras e garantam plena participação." },
      { q:"O que significa o slogan 'Nada sobre nós sem nós' no contexto das crianças com deficiência?", a:[{t:"Que as decisões que as afetam devem contar com a sua participação",ok:true},{t:"Que as crianças com deficiência devem viver de forma completamente independente",ok:false},{t:"Que os pais não devem participar nas decisões sobre os filhos",ok:false}], exp:"'Nada sobre nós sem nós' é o lema do movimento de defesa dos direitos das pessoas com deficiência. Significa que qualquer política, lei ou serviço que afete crianças com deficiência deve ser desenvolvido com a sua participação ativa. O artigo 12.º da CDC e o artigo 23.º reforçam este princípio." }
    ],
    ambiente: [
      { q:"Existe um artigo específico sobre o direito ao ambiente na Convenção de 1989?", a:[{t:"Não diretamente, mas os ODS e comentários gerais reconhecem este direito",ok:true},{t:"Sim, é o artigo 29.º",ok:false},{t:"Sim, foi acrescentado em 2010",ok:false}], exp:"A Convenção de 1989 não tem um artigo específico sobre ambiente, mas o Comité dos Direitos da Criança reconhece nos seus comentários gerais que as alterações climáticas e a degradação ambiental ameaçam todos os direitos das crianças. Os ODS 13, 14 e 15 abordam estes temas." },
      { q:"Como afetam as alterações climáticas os direitos das crianças?", a:[{t:"Ameaçam o direito à saúde, à alimentação, à água e a um futuro seguro",ok:true},{t:"Não afetam significativamente as crianças",ok:false},{t:"Só afetam crianças que vivem em zonas costeiras",ok:false}], exp:"As alterações climáticas afetam desproporcionalmente as crianças: aumentam doenças respiratórias, reduzem o acesso a água potável e alimentos, causam deslocamentos forçados e comprometem o seu direito a um futuro seguro. A UNICEF alerta que mais de mil milhões de crianças vivem em zonas de risco extremo." },
      { q:"O que pode cada criança fazer para ajudar o ambiente?", a:[{t:"Reduzir desperdícios, poupar energia, plantar árvores e sensibilizar outros",ok:true},{t:"Nada — só os governos e empresas podem fazer diferença",ok:false},{t:"Deixar de ir à escola para protestar",ok:false}], exp:"Cada criança pode contribuir: separar o lixo, poupar água e energia, escolher produtos sustentáveis, plantar plantas, comer menos carne e sensibilizar família e amigos. As pequenas ações individuais, multiplicadas por milhões, fazem diferença." },
      { q:"O que significa a sigla ODS?", a:[{t:"Objetivos de Desenvolvimento Sustentável",ok:true},{t:"Organização dos Direitos Sociais",ok:false},{t:"Ordem de Defesa da Sustentabilidade",ok:false}], exp:"Os ODS (Objetivos de Desenvolvimento Sustentável) são 17 metas aprovadas pelas Nações Unidas em 2015 para tornar o mundo melhor até 2030. Os ODS 13 (Ação Climática), 14 (Vida Marinha) e 15 (Vida Terrestre) protegem diretamente o ambiente onde as crianças crescem." },
      { q:"O que é a 'pegada ecológica'?", a:[{t:"A quantidade de recursos naturais que cada pessoa consome",ok:true},{t:"O rasto de sujidade que deixamos no chão",ok:false},{t:"O número de animais que existem numa floresta",ok:false}], exp:"A pegada ecológica mede os recursos naturais (água, terra, energia) que cada pessoa usa. Se toda a humanidade vivesse como um europeu médio, precisaríamos de 3 planetas! Reduzir a nossa pegada — consumindo menos, reciclando e poupando energia — é essencial para preservar o planeta para as gerações futuras." },
      { q:"Qual é o principal gás responsável pelo aquecimento global?", a:[{t:"O dióxido de carbono (CO₂)",ok:true},{t:"O oxigénio (O₂)",ok:false},{t:"O azoto (N₂)",ok:false}], exp:"O CO₂ (dióxido de carbono) libertado pela queima de combustíveis fósseis (petróleo, carvão, gás) é o principal responsável pelo efeito de estufa e pelo aquecimento global. As florestas absorvem CO₂ — por isso a desflorestação agrava o problema. Plantar árvores e usar energia limpa são passos fundamentais." },
      { q:"O que é a biodiversidade e por que é importante para as crianças?", a:[{t:"É a variedade de seres vivos no planeta, essencial para o equilíbrio da natureza",ok:true},{t:"É um tipo de energia renovável produzida por animais",ok:false},{t:"É o nome científico das florestas tropicais",ok:false}], exp:"Biodiversidade é a riqueza de espécies de plantas, animais e microrganismos que existem na Terra. Sem biodiversidade, perderíamos alimentos, medicamentos e o equilíbrio dos ecossistemas. A Convenção sobre a Diversidade Biológica reconhece que as crianças de hoje herdarão um planeta mais empobrecido se não agirmos." }
    ],
    digital: [
      { q:"Os direitos das crianças aplicam-se também ao mundo online?", a:[{t:"Sim, todos os direitos da Convenção se aplicam ao espaço digital",ok:true},{t:"Não, a internet é um espaço sem regras para crianças",ok:false},{t:"Só a partir dos 16 anos os direitos digitais são reconhecidos",ok:false}], exp:"Em 2021, o Comité dos Direitos da Criança das Nações Unidas publicou o Comentário Geral n.º 25, confirmando que todos os direitos da Convenção se aplicam ao ambiente digital. Isto inclui privacidade, proteção, expressão, educação e participação online." },
      { q:"O que é o ciberbullying e como se combate?", a:[{t:"É assédio ou intimidação online — combate-se com educação, denúncia e apoio",ok:true},{t:"É um jogo de computador perigoso",ok:false},{t:"Só acontece em redes sociais e não é muito grave",ok:false}], exp:"O ciberbullying é o assédio, humilhação ou ameaça através de meios digitais — mensagens, redes sociais, jogos online. Pode causar ansiedade, depressão e isolamento. Em Portugal, a Linha Internet Segura (1800 21 22 23) apoia vítimas e é possível denunciar às plataformas e às autoridades." },
      { q:"Que cuidados deve ter uma criança ao usar redes sociais?", a:[{t:"Não partilhar dados pessoais, ter perfil privado e contar a um adulto se algo correr mal",ok:true},{t:"Aceitar todos os pedidos de amizade para ter mais seguidores",ok:false},{t:"Partilhar a localização para que os amigos saibam onde está",ok:false}], exp:"A segurança online começa com boas práticas: perfil privado, não partilhar morada ou escola, não aceitar pedidos de estranhos, não responder a mensagens que causem desconforto e contar sempre a um adulto de confiança se algo parecer errado. A UNICEF tem guias gratuitos de literacia digital para crianças." },
      { q:"Qual é a idade mínima para criar conta nas principais redes sociais?", a:[{t:"13 anos na maioria das plataformas (Instagram, TikTok, YouTube)",ok:true},{t:"10 anos, com autorização dos pais",ok:false},{t:"18 anos em todas as plataformas",ok:false}], exp:"A maioria das grandes plataformas (Instagram, TikTok, YouTube, Snapchat) exige 13 anos de idade mínima, com base na lei norte-americana COPPA. Na UE, o RGPD fixa os 16 anos como regra geral, mas os países podem baixar para 13. Portugal fixou os 13 anos." },
      { q:"O que é a literacia digital?", a:[{t:"A capacidade de usar a tecnologia de forma segura, crítica e responsável",ok:true},{t:"Saber escrever código de programação",ok:false},{t:"Ter muitos seguidores nas redes sociais",ok:false}], exp:"A literacia digital é o conjunto de competências que permitem usar a internet e a tecnologia de forma segura, criativa e crítica: distinguir informação verdadeira de falsa, proteger os dados pessoais, comunicar com respeito e aproveitar as oportunidades digitais para aprender." },
      { q:"O que é o phishing e como se protege uma criança?", a:[{t:"É uma tentativa de enganar para obter dados pessoais — não clicar em links suspeitos",ok:true},{t:"É um jogo de pesca online muito popular",ok:false},{t:"É um vírus que apaga os ficheiros do computador",ok:false}], exp:"Phishing é quando alguém finge ser uma entidade de confiança (banco, escola, plataforma) para roubar palavras-passe ou dados pessoais. A proteção passa por não clicar em links suspeitos, não partilhar palavras-passe e contar sempre a um adulto se algo parecer errado." },
      { q:"O que são 'fake news' e como podemos identificá-las?", a:[{t:"São notícias falsas — verifica a fonte, a data e procura outras referências",ok:true},{t:"São notícias sobre acontecimentos futuros",ok:false},{t:"São notícias publicadas apenas nas redes sociais",ok:false}], exp:"Fake news são notícias falsas ou enganosas criadas para manipular opiniões. Para as identificar: verifica se a fonte é credível, procura a mesma notícia em vários meios, verifica a data e desconfia de títulos muito chocantes. O pensamento crítico é a melhor defesa contra a desinformação." },
      { q:"Qual linha de apoio podes contactar em Portugal se tiveres um problema online?", a:[{t:"Linha Internet Segura: 1800 21 22 23",ok:true},{t:"Linha de Apoio à Vítima: 116 006",ok:false},{t:"Linha de Saúde: 808 24 24 24",ok:false}], exp:"A Linha Internet Segura (1800 21 22 23) é gratuita, disponível em Portugal e apoia crianças e jovens com problemas online: ciberbullying, conteúdos perturbadores, assédio ou outros incidentes digitais. Podes também denunciar conteúdos ilegais em www.internetsegura.pt." }
    ]
  };

  // ===== TEMAS visuais — colorido e alegre =====
  const THEMES = [
    // ── 20 paletas únicas — uma por nível ──────────────────────────
    { skyTop:0x1a6ab5, skyBot:0x8ed6f8, hillColor:0x2e9e52, grassTop:0x44cc6a }, //  0 · Nível  1 — azul rico de manhã
    { skyTop:0x3d1466, skyBot:0xff8c40, hillColor:0xbf3c0f, grassTop:0xd95210 }, //  1 · Nível  2 — crepúsculo roxo-laranja
    { skyTop:0x006680, skyBot:0x50e8e0, hillColor:0x0a7a6a, grassTop:0x18c0b0 }, //  2 · Nível  3 — aqua tropical
    { skyTop:0xc02880, skyBot:0xffb8d8, hillColor:0xd0408a, grassTop:0xf060aa }, //  3 · Nível  4 — rosa vibrante
    { skyTop:0x1a0060, skyBot:0xb060ff, hillColor:0x5010a0, grassTop:0x7830d8 }, //  4 · Nível  5 — lilás noturno 🌙
    { skyTop:0x7a2000, skyBot:0xffb060, hillColor:0xd05010, grassTop:0xf07030 }, //  5 · Nível  6 — laranja quente pôr-do-sol
    { skyTop:0x001a5a, skyBot:0x2090e8, hillColor:0x0050a0, grassTop:0x1878d0 }, //  6 · Nível  7 — azul noturno profundo 🌙
    { skyTop:0x5a0030, skyBot:0xff80b8, hillColor:0xb02070, grassTop:0xd83090 }, //  7 · Nível  8 — magenta rico 🌙
    { skyTop:0x0a2010, skyBot:0x40b858, hillColor:0x1a5e2a, grassTop:0x28904a }, //  8 · Nível  9 — floresta verde profunda
    { skyTop:0x5a1a00, skyBot:0xffcc60, hillColor:0xc06010, grassTop:0xe08020 }, //  9 · Nível 10 — âmbar dourado
    { skyTop:0x1a3a00, skyBot:0x90e840, hillColor:0x2e7a10, grassTop:0x4ab020 }, // 10 · Nível 11 — verde lima primavera
    { skyTop:0x001a3a, skyBot:0x4090d0, hillColor:0x004a80, grassTop:0x1060a8 }, // 11 · Nível 12 — azul oceano 🌙
    { skyTop:0x2a0050, skyBot:0xe060ff, hillColor:0x6010b0, grassTop:0x8030d0 }, // 12 · Nível 13 — violeta mágico 🌙
    { skyTop:0x004040, skyBot:0x20d8c0, hillColor:0x006858, grassTop:0x10a898 }, // 13 · Nível 14 — teal escuro 🌙
    { skyTop:0x002850, skyBot:0x60c0ff, hillColor:0x005090, grassTop:0x1080c0 }, // 14 · Nível 15 — azul celeste
    { skyTop:0x603000, skyBot:0xffd060, hillColor:0xb05800, grassTop:0xe07800 }, // 15 · Nível 16 — castanho-ouro (terra)
    { skyTop:0x1a0828, skyBot:0xa040e8, hillColor:0x4a1090, grassTop:0x6820b8 }, // 16 · Nível 17 — índigo cósmico 🌙
    { skyTop:0x003820, skyBot:0x40e870, hillColor:0x106030, grassTop:0x20a050 }, // 17 · Nível 18 — verde floresta 🌙
    { skyTop:0x600010, skyBot:0xff5040, hillColor:0xa02020, grassTop:0xd03030 }, // 18 · Nível 19 — vermelho escarlate 🌙
    { skyTop:0xff6a1a, skyBot:0xffe39a, hillColor:0xe0871a, grassTop:0x5ec85a }, // 19 · Nível 20 — FINAL festivo pôr-do-sol dourado
  ];

  // ===== Níveis (10) =====
  const LEVELS = [
    {
      name: "Nível 1 — O Dia da Criança",
      theme:0, quizTheme:"historia", worldW:2600,
      spawn:{x:480,y:460}, doorX:2100,
      platforms:[
        {x:450,y:520,w:900,h:28},{x:1040,y:450,w:300,h:22},{x:1380,y:380,w:270,h:22},
        {x:1700,y:310,w:240,h:22},{x:2050,y:520,w:900,h:28}
      ],
      items:[{x:1040,y:400,kind:"estrela"},{x:1380,y:330,kind:"medalha"},{x:1700,y:260,kind:"brinquedo"}],
      malwares:[{x:1240,y:480,vx:0,pattern:"mini"},{x:1960,y:480,vx:-150,pattern:"patrol"}]
    },
    {
      name: "Nível 2 — A Declaração de 1959",
      theme:1, quizTheme:"declaracao", worldW:2800,
      spawn:{x:480,y:460}, doorX:2350,
      platforms:[
        {x:520,y:520,w:980,h:28},{x:900,y:450,w:240,h:22},{x:1180,y:380,w:240,h:22},
        {x:1460,y:310,w:240,h:22},{x:1740,y:380,w:240,h:22},{x:2020,y:450,w:240,h:22},
        {x:2380,y:520,w:980,h:28}
      ],
      items:[{x:900,y:400,kind:"balao"},{x:1460,y:260,kind:"medalha"},{x:1740,y:330,kind:"estrela"}],
      malwares:[{x:1320,y:480,vx:0,pattern:"mini"},{x:2140,y:480,vx:-155,pattern:"patrol"}]
    },
    {
      name: "Nível 3 — A Convenção de 1989",
      theme:2, quizTheme:"convencao", worldW:2900,
      spawn:{x:480,y:460}, doorX:2500,
      platforms:[
        {x:520,y:520,w:1040,h:28},{x:840,y:460,w:240,h:22},{x:1180,y:390,w:240,h:22},
        {x:1520,y:320,w:240,h:22},{x:1860,y:390,w:240,h:22},{x:2200,y:460,w:240,h:22},
        {x:2480,y:520,w:1040,h:28}
      ],
      items:[{x:840,y:220,kind:"estrela"},{x:1520,y:270,kind:"medalha"},{x:2200,y:410,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:1000,y:480,vx:0,pattern:"mini"},{x:1700,y:480,vx:-160,pattern:"patrol"},{x:2350,y:480,vx:155,pattern:"patrol"}]
    },
    {
      name: "Nível 4 — O Direito ao Brincar",
      theme:3, quizTheme:"brincar", worldW:2800,
      spawn:{x:80,y:464}, doorX:2630,
      // ══ MECÂNICA ESPECIAL: TRAMPOLINS ══
      // Plataformas mais largas (240px) e vãos mais curtos (~200px) — acessível em mobile.
      // Os trampolins são o caminho principal mas um bom salto normal chega às plataformas mais baixas.
      // Tematicamente: "brincar é essencial — sem brincar não chegas lá!"
      platforms:[
        // Ilhas separadas por vãos de ~200px — desafiante mas praticável em telemóvel
        {x:500,y:390,w:240,h:22},
        {x:880,y:430,w:240,h:22},
        {x:1260,y:370,w:240,h:22},
        {x:1640,y:420,w:240,h:22},
        {x:2020,y:360,w:240,h:22},
        {x:2400,y:410,w:240,h:22},
        // Plataforma final com o portal
        {x:2580,y:518,w:260,h:22}
      ],
      // Trampolins entre ilhas — caminho mais rápido e divertido
      trampolines:[
        {x:680,y:490},{x:1060,y:490},{x:1440,y:490},
        {x:1820,y:490},{x:2200,y:490}
      ],
      items:[
        {x:500,y:340,kind:"estrela"},{x:880,y:380,kind:"brinquedo"},
        {x:1260,y:320,kind:"medalha"},{x:1640,y:370,kind:"duplosalto"},
        {x:2020,y:310,kind:"balao"}
      ],
      malwares:[
        {x:650,y:480,vx:0,pattern:"mini"},
        {x:1030,y:480,vx:-145,pattern:"patrol"},
        {x:1410,y:480,vx:150,pattern:"patrol"},
        {x:1790,y:480,vx:-150,pattern:"jumper"},
        {x:2170,y:480,vx:145,pattern:"jumper"}
      ],
      secrets:[{x:1060,y:415,kind:"estrela",points:20}]
    },
    {
      name: "Nível 5 — O Direito à Educação",
      theme:4, quizTheme:"educacao", worldW:3100,
      spawn:{x:480,y:460}, doorX:2950,
      platforms:[
        {x:520,y:520,w:1000,h:28},{x:880,y:450,w:220,h:22},{x:1160,y:380,w:220,h:22},
        {x:1460,y:310,w:220,h:22},{x:1760,y:380,w:220,h:22},{x:2060,y:450,w:220,h:22},
        {x:2360,y:380,w:220,h:22},{x:2660,y:520,w:1000,h:28}
      ],
      items:[{x:880,y:230,kind:"estrela"},{x:1460,y:260,kind:"brinquedo"},{x:2060,y:400,kind:"balao"},{x:2360,y:330,kind:"medalha"}],
      malwares:[{x:1020,y:480,vx:165},{x:1620,y:480,vx:-170},{x:2220,y:480,vx:165},{x:2820,y:480,vx:-160}],
      trampolines:[{x:1310,y:462},{x:2210,y:462}],
      secrets:[{x:740,y:470,kind:"estrela",points:20}]
    },
    {
      name: "Nível 6 — O Direito à Saúde",
      theme:5, quizTheme:"saude", worldW:3100,
      spawn:{x:480,y:460}, doorX:2700,
      // Layout: ilhas a alturas variadas — umas altas, outras baixas, sem padrão regular
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:860,y:430,w:180,h:22},
        {x:1100,y:340,w:220,h:22},
        {x:1340,y:460,w:160,h:22},
        {x:1560,y:310,w:200,h:22},
        {x:1800,y:410,w:180,h:22},
        {x:2050,y:340,w:160,h:22},
        {x:2260,y:450,w:190,h:22},
        {x:2500,y:370,w:170,h:22},
        {x:2720,y:520,w:960,h:28}
      ],
      items:[{x:860,y:380,kind:"medalha"},{x:1100,y:290,kind:"duplosalto"},{x:1560,y:260,kind:"estrela"},{x:2050,y:290,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:1010,y:480,vx:170},{x:1480,y:480,vx:-170},{x:1940,y:480,vx:172},{x:2400,y:480,vx:-168},{x:2720,y:480,vx:165}],
      trampolines:[{x:1220,y:462}],
      secrets:[{x:2160,y:355,kind:"estrela",points:20}]
    },
    {
      name: "Nível 7 — O Direito à Proteção",
      theme:6, quizTheme:"protecao", worldW:3200,
      spawn:{x:480,y:460}, doorX:2850,
      // Layout: pirâmide central alta + plataformas laterais baixas
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:820,y:450,w:180,h:22},
        {x:1060,y:390,w:180,h:22},
        {x:1300,y:330,w:180,h:22},
        {x:1540,y:260,w:200,h:22},   // topo da pirâmide
        {x:1780,y:330,w:180,h:22},
        {x:2020,y:390,w:180,h:22},
        {x:2260,y:450,w:180,h:22},
        {x:2500,y:380,w:160,h:22},
        {x:2870,y:520,w:960,h:28}
      ],
      items:[{x:820,y:220,kind:"estrela"},{x:1300,y:280,kind:"balao"},{x:1540,y:210,kind:"medalha"},{x:2020,y:340,kind:"brinquedo"},{x:2500,y:330,kind:"duplosalto"}],
      malwares:[{x:970,y:480,vx:175,pattern:"patrol"},{x:1450,y:480,vx:-178,pattern:"patrol"},{x:1920,y:480,vx:177,pattern:"jumper"},{x:2360,y:480,vx:-175,pattern:"jumper"},{x:2720,y:480,vx:172}],
      secrets:[{x:680,y:462,kind:"heart"}]
    },
    {
      name: "Nível 8 — O Direito à Participação",
      theme:7, quizTheme:"participacao", worldW:3300,
      spawn:{x:480,y:460}, doorX:2950,
      // Layout: "trampolim central obrigatório" — vão largo a meio onde o trampolim é o único caminho
      platforms:[
        {x:520,y:520,w:1000,h:28},
        {x:840,y:440,w:200,h:22},
        {x:1080,y:360,w:200,h:22},
        {x:1320,y:460,w:140,h:22},   // plataforma baixa antes do vão
        // Vão de 400px — só o trampolim chega ao outro lado
        {x:1880,y:460,w:140,h:22},   // plataforma baixa depois do vão
        {x:2100,y:360,w:200,h:22},
        {x:2340,y:440,w:200,h:22},
        {x:2580,y:360,w:200,h:22},
        {x:2980,y:520,w:1000,h:28}
      ],
      items:[{x:840,y:390,kind:"brinquedo"},{x:1080,y:310,kind:"estrela"},{x:1600,y:330,kind:"duplosalto"},{x:2100,y:310,kind:"balao"},{x:2580,y:310,kind:"medalha"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:980,y:480,vx:180,pattern:"patrol"},{x:1580,y:480,vx:-183,pattern:"jumper"},{x:2040,y:480,vx:182,pattern:"jumper"},{x:2450,y:480,vx:-179,pattern:"jumper"},{x:2780,y:480,vx:177}],
      trampolines:[{x:1600,y:462}],
      secrets:[{x:1190,y:355,kind:"estrela",points:25}]
    },
    {
      name: "Nível 9 — O Futuro Sustentável",
      theme:8, quizTheme:"futuro", worldW:3400,
      spawn:{x:480,y:460}, doorX:3050,
      // Layout: "cascata de terraços" — desce e sobe de forma orgânica, com plataformas a alturas muito variadas
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:800,y:420,w:170,h:22},
        {x:980,y:330,w:150,h:22},
        {x:1140,y:460,w:150,h:22},   // buraco entre grupos
        {x:1600,y:270,w:160,h:22},   // pico alto
        {x:1820,y:370,w:170,h:22},
        {x:2050,y:450,w:150,h:22},
        {x:2270,y:340,w:170,h:22},
        {x:2500,y:420,w:160,h:22},
        {x:2720,y:310,w:170,h:22},
        {x:3080,y:520,w:960,h:28}
      ],
      items:[{x:800,y:220,kind:"estrela"},{x:980,y:280,kind:"balao"},{x:1600,y:220,kind:"medalha"},{x:2270,y:290,kind:"brinquedo"},{x:2720,y:260,kind:"duplosalto"}],
      malwares:[{x:940,y:480,vx:185,pattern:"jumper"},{x:1490,y:480,vx:-188,pattern:"jumper"},{x:1960,y:480,vx:186,pattern:"jumper"},{x:2400,y:480,vx:-184,pattern:"jumper"},{x:2830,y:480,vx:182,pattern:"patrol"}],
      movingPlatforms:[{x:1380,y:340,w:150,h:22,rangeX:0,rangeY:70,speed:55}],
      trampolines:[{x:2160,y:462}],
      secrets:[{x:660,y:462,kind:"heart"}]
    },
    {
      name: "Nível 10 — A UNICEF e os Direitos",
      theme:9, quizTheme:"unicef", worldW:3500,
      spawn:{x:480,y:460}, doorX:3100,
      platforms:[
        {x:520,y:520,w:1000,h:28},{x:920,y:442,w:185,h:22},{x:1200,y:368,w:185,h:22},
        {x:1480,y:298,w:185,h:22},{x:1760,y:368,w:185,h:22},{x:2040,y:442,w:185,h:22},
        {x:2320,y:368,w:185,h:22},{x:2600,y:442,w:185,h:22},
        {x:3150,y:520,w:1100,h:28}
      ],
      items:[{x:920,y:342,kind:"estrela"},{x:1480,y:248,kind:"medalha"},{x:2040,y:392,kind:"balao"},{x:2600,y:392,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:1060,y:480,vx:190,pattern:"jumper"},{x:1660,y:480,vx:-195,pattern:"jumper"},{x:2260,y:480,vx:190,pattern:"jumper"},{x:2860,y:480,vx:-185,pattern:"jumper"},{x:3200,y:480,vx:188,pattern:"jumper"}],
      movingPlatforms:[
        {x:1640,y:360,w:140,h:22,rangeX:200,rangeY:0,speed:90},
        {x:2760,y:310,w:130,h:22,rangeX:0,rangeY:80,speed:60}
      ],
      trampolines:[{x:2180,y:462}],
      secrets:[{x:1150,y:430,kind:"heart"}]
    },
    {
      name: "Nível 11 — O Direito à Identidade",
      theme:10, quizTheme:"identidade", worldW:3600,
      spawn:{x:480,y:460}, doorX:3200,
      // Layout: "escadinhas duplas" — dois picos com vale ao meio
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:820,y:440,w:170,h:22},
        {x:1040,y:360,w:160,h:22},
        {x:1260,y:280,w:160,h:22},   // 1º pico
        {x:1500,y:380,w:150,h:22},   // descida para o vale
        {x:1700,y:460,w:130,h:22},   // fundo do vale
        {x:1940,y:360,w:150,h:22},   // subida 2º pico
        {x:2160,y:280,w:160,h:22},   // 2º pico
        {x:2400,y:360,w:160,h:22},
        {x:2640,y:440,w:170,h:22},
        {x:2900,y:360,w:160,h:22},
        {x:3250,y:520,w:960,h:28}
      ],
      items:[{x:820,y:360,kind:"estrela"},{x:1260,y:230,kind:"duplosalto"},{x:1700,y:410,kind:"balao"},{x:2160,y:230,kind:"medalha"},{x:2640,y:390,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:940,y:480,vx:192,pattern:"patrol"},{x:1420,y:480,vx:-196,pattern:"jumper"},{x:1830,y:480,vx:194,pattern:"jumper"},{x:2300,y:480,vx:-192,pattern:"patrol"},{x:2760,y:480,vx:190,pattern:"jumper"}],
      secrets:[{x:1600,y:370,kind:"estrela",points:25}]
    },
    {
      name: "Nível 12 — O Direito à Família",
      theme:11, quizTheme:"familia", worldW:3650,
      spawn:{x:480,y:460}, doorX:3340,
      // Layout: "mini-mundos" — 3 grupos de plataformas isolados com vãos entre eles
      platforms:[
        {x:520,y:520,w:960,h:28},
        // grupo A
        {x:820,y:430,w:180,h:22},
        {x:1040,y:340,w:180,h:22},
        {x:1240,y:440,w:160,h:22},
        // vão — trampolim necessário
        {x:1640,y:350,w:180,h:22},
        {x:1860,y:440,w:160,h:22},
        // grupo B
        {x:2100,y:350,w:180,h:22},
        {x:2320,y:270,w:160,h:22},
        {x:2540,y:360,w:160,h:22},
        // grupo C
        {x:2780,y:440,w:170,h:22},
        {x:3000,y:350,w:160,h:22},
        {x:3370,y:520,w:960,h:28}
      ],
      items:[{x:820,y:380,kind:"balao"},{x:1040,y:290,kind:"estrela"},{x:1640,y:300,kind:"duplosalto"},{x:2320,y:220,kind:"medalha"},{x:2780,y:390,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:950,y:480,vx:194,pattern:"patrol"},{x:1530,y:480,vx:-198,pattern:"jumper"},{x:1980,y:480,vx:196,pattern:"jumper"},{x:2440,y:480,vx:-194,pattern:"patrol"},{x:2880,y:480,vx:192,pattern:"jumper"}],
      trampolines:[{x:1440,y:462}],
      secrets:[{x:3110,y:263,kind:"balao",points:15}]
    },
    {
      name: "Nível 13 — Os Direitos dos Refugiados",
      theme:12, quizTheme:"refugiados", worldW:3700,
      spawn:{x:480,y:460}, doorX:3300,
      // Layout: "labirinto horizontal" — plataformas em ziguezague apertado exige precisão
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:820,y:400,w:150,h:22},
        {x:1010,y:310,w:150,h:22},
        {x:1200,y:400,w:130,h:22},
        {x:1380,y:310,w:130,h:22},
        {x:1560,y:400,w:130,h:22},
        {x:1760,y:300,w:150,h:22},
        {x:2000,y:420,w:130,h:22},
        {x:2200,y:330,w:150,h:22},
        {x:2430,y:420,w:140,h:22},
        {x:2650,y:310,w:150,h:22},
        {x:2880,y:410,w:140,h:22},
        {x:3070,y:320,w:150,h:22},
        {x:3360,y:520,w:960,h:28}
      ],
      items:[{x:820,y:210,kind:"estrela"},{x:1010,y:260,kind:"balao"},{x:1760,y:250,kind:"duplosalto"},{x:2200,y:280,kind:"medalha"},{x:2650,y:260,kind:"brinquedo"}],
      malwares:[{x:1100,y:480,vx:196,pattern:"patrol"},{x:1660,y:480,vx:-200,pattern:"jumper"},{x:2100,y:480,vx:196,pattern:"patrol"},{x:2540,y:480,vx:-192,pattern:"jumper"},{x:2980,y:480,vx:194,pattern:"patrol"}],
      movingPlatforms:[{x:1560,y:370,w:120,h:22,rangeX:100,rangeY:0,speed:95}],
      secrets:[{x:680,y:462,kind:"heart"}]
    },
    {
      name: "Nível 14 — Contra o Trabalho Infantil",
      theme:13, quizTheme:"trabalho", worldW:3750,
      spawn:{x:480,y:460}, doorX:3350,
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:880,y:440,w:200,h:22},
        {x:1140,y:360,w:180,h:22},
        {x:1400,y:440,w:200,h:22},
        {x:1660,y:350,w:180,h:22},
        {x:1920,y:440,w:200,h:22},
        {x:2180,y:360,w:180,h:22},
        {x:2440,y:440,w:200,h:22},
        {x:2700,y:350,w:180,h:22},
        {x:2960,y:440,w:200,h:22},
        {x:3430,y:520,w:960,h:28}
      ],
      movingPlatforms:[
        {x:1270,y:400,w:130,h:22,rangeX:120,rangeY:0,speed:80},
        {x:1790,y:380,w:130,h:22,rangeX:0,rangeY:80,speed:65},
        {x:2310,y:400,w:130,h:22,rangeX:120,rangeY:0,speed:90},
        {x:2830,y:380,w:130,h:22,rangeX:0,rangeY:80,speed:70}
      ],
      items:[
        {x:880,y:390,kind:"balao"},{x:1140,y:310,kind:"estrela"},
        {x:1660,y:300,kind:"duplosalto"},{x:2180,y:310,kind:"medalha"},
        {x:2700,y:300,kind:"brinquedo"},{x:560,y:470,kind:"heart"}
      ],
      malwares:[
        {x:980,y:480,vx:190,pattern:"patrol"},
        {x:1520,y:480,vx:-194,pattern:"jumper"},
        {x:2020,y:480,vx:192,pattern:"patrol"},
        {x:2540,y:480,vx:-190,pattern:"jumper"},
        {x:3050,y:480,vx:188,pattern:"patrol"}
      ],
      secrets:[{x:2960,y:390,kind:"estrela",points:30}]
    },
    {
      name: "Nível 15 — O Direito à Expressão",
      theme:14, quizTheme:"expressao", worldW:3800,
      spawn:{x:480,y:460}, doorX:3400,
      platforms:[
        {x:520,y:520,w:1000,h:28},{x:980,y:432,w:160,h:22},{x:1260,y:350,w:160,h:22},
        {x:1540,y:274,w:160,h:22},{x:1820,y:350,w:160,h:22},{x:2100,y:432,w:160,h:22},
        {x:2380,y:350,w:160,h:22},{x:2660,y:270,w:160,h:22},{x:2940,y:350,w:160,h:22},
        {x:3220,y:432,w:160,h:22},{x:3480,y:520,w:1100,h:28}
      ],
      items:[{x:980,y:382,kind:"estrela"},{x:1540,y:224,kind:"balao"},{x:2100,y:382,kind:"brinquedo"},{x:2660,y:220,kind:"medalha"},{x:3220,y:382,kind:"duplosalto"}],
      malwares:[{x:1130,y:480,vx:200,pattern:"patrol"},{x:1760,y:480,vx:-204,pattern:"jumper"},{x:2360,y:480,vx:200,pattern:"patrol"},{x:2960,y:480,vx:-196,pattern:"jumper"},{x:3380,y:480,vx:-198,pattern:"patrol"}],
      movingPlatforms:[
        {x:1410,y:340,w:130,h:22,rangeX:190,rangeY:0,speed:110},
        {x:2230,y:280,w:120,h:22,rangeX:0,rangeY:100,speed:75},
        {x:3090,y:360,w:130,h:22,rangeX:220,rangeY:0,speed:125}
      ],
      trampolines:[{x:1690,y:462},{x:2810,y:462}],
      secrets:[{x:760,y:470,kind:"medalha"},{x:2820,y:262,kind:"estrela",points:30}]
    },
    {
      name: "Nível 16 — O Direito à Privacidade",
      theme:15, quizTheme:"privacidade", worldW:3850,
      spawn:{x:480,y:460}, doorX:3450,
      // Layout: "degraus duplos" — sobe dois andares, desce dois andares, plataformas estreitas
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:820,y:440,w:150,h:22},
        {x:1020,y:360,w:140,h:22},
        {x:1200,y:280,w:150,h:22},   // 1º andar
        {x:1380,y:200,w:130,h:22},   // 2º andar (topo)
        {x:1580,y:280,w:140,h:22},
        {x:1780,y:380,w:150,h:22},
        {x:2000,y:460,w:140,h:22},   // vale
        {x:2220,y:370,w:150,h:22},
        {x:2440,y:280,w:140,h:22},   // novo pico
        {x:2640,y:190,w:130,h:22},   // topo absoluto
        {x:2860,y:290,w:140,h:22},
        {x:3080,y:390,w:150,h:22},
        {x:3300,y:450,w:150,h:22},
        {x:3530,y:520,w:960,h:28}
      ],
      items:[{x:820,y:390,kind:"balao"},{x:1380,y:150,kind:"duplosalto"},{x:1780,y:330,kind:"estrela"},{x:2440,y:230,kind:"medalha"},{x:2640,y:140,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:940,y:480,vx:202,pattern:"patrol"},{x:1680,y:480,vx:-205,pattern:"jumper"},{x:2100,y:480,vx:202,pattern:"jumper"},{x:2760,y:480,vx:-200,pattern:"jumper"},{x:3180,y:480,vx:198,pattern:"patrol"}],
      movingPlatforms:[{x:2000,y:430,w:120,h:22,rangeX:120,rangeY:0,speed:100}],
      trampolines:[{x:1480,y:462}],
      secrets:[{x:1100,y:273,kind:"estrela",points:25}]
    },
    {
      name: "Nível 17 — O Direito à Cultura",
      theme:16, quizTheme:"cultura", worldW:3900,
      spawn:{x:480,y:460}, doorX:3500,
      // Layout: "cultura em círculos" — plataformas em grupos de 3 como constelações
      platforms:[
        {x:520,y:520,w:960,h:28},
        // constelação A
        {x:820,y:420,w:155,h:22},
        {x:1020,y:330,w:155,h:22},
        {x:1220,y:420,w:140,h:22},
        // constelação B
        {x:1520,y:360,w:155,h:22},
        {x:1720,y:270,w:155,h:22},
        {x:1920,y:370,w:140,h:22},
        // constelação C
        {x:2220,y:440,w:155,h:22},
        {x:2420,y:340,w:155,h:22},
        {x:2620,y:440,w:140,h:22},
        // constelação D
        {x:3080,y:270,w:155,h:22},
        {x:3540,y:520,w:960,h:28}
      ],
      items:[{x:820,y:220,kind:"estrela"},{x:1020,y:280,kind:"balao"},{x:1720,y:220,kind:"duplosalto"},{x:2420,y:290,kind:"medalha"},{x:3080,y:220,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:950,y:480,vx:204,pattern:"patrol"},{x:1620,y:480,vx:-208,pattern:"jumper"},{x:2120,y:480,vx:204,pattern:"patrol"},{x:2720,y:480,vx:-200,pattern:"jumper"},{x:3180,y:480,vx:-202,pattern:"patrol"}],
      movingPlatforms:[
        {x:1520,y:330,w:130,h:22,rangeX:140,rangeY:0,speed:105},
        {x:2880,y:330,w:130,h:22,rangeX:0,rangeY:90,speed:80}
      ],
      secrets:[{x:2020,y:283,kind:"estrela",points:25}]
    },
    {
      name: "Nível 18 — O Direito à Inclusão",
      theme:17, quizTheme:"deficiencia", worldW:3950,
      spawn:{x:480,y:460}, doorX:3550,
      // ══ MECÂNICA ESPECIAL: ESTEIRA — PLATAFORMAS TODAS EM MOVIMENTO ══
      // Todas as plataformas intermédias se movem. Umas horizontalmente (esq/dir),
      // outras verticalmente (sobe/desce). O jogador tem de "surfar" o ritmo em vez
      // de saltar em escada estática.
      // Tematicamente: inclusão requer adaptação contínua — nada está fixo.
      platforms:[
        {x:520,y:520,w:960,h:28},     // arranque fixo
        {x:3590,y:520,w:960,h:28}     // chegada fixa
      ],
      // Todas as plataformas intermédias são móveis
      movingPlatforms:[
        // Grupo 1 — balancins horizontais lentos
        {x:900,  y:420, w:160, h:22, rangeX:140, rangeY:0,   speed:60},
        {x:1120, y:340, w:150, h:22, rangeX:0,   rangeY:110, speed:55},
        // Grupo 2 — elevadores verticais médios
        {x:1380, y:380, w:160, h:22, rangeX:120, rangeY:0,   speed:80},
        {x:1620, y:280, w:150, h:22, rangeX:0,   rangeY:130, speed:65},
        {x:1860, y:400, w:160, h:22, rangeX:110, rangeY:0,   speed:90},
        // Grupo 3 — plataformas rápidas
        {x:2120, y:320, w:145, h:22, rangeX:0,   rangeY:120, speed:75},
        {x:2360, y:250, w:150, h:22, rangeX:160, rangeY:0,   speed:100},
        {x:2600, y:370, w:145, h:22, rangeX:0,   rangeY:100, speed:85},
        // Grupo 4 — final mais caótico
        {x:2860, y:430, w:150, h:22, rangeX:130, rangeY:0,   speed:110},
        {x:3080, y:310, w:145, h:22, rangeX:0,   rangeY:120, speed:95},
        {x:3320, y:410, w:150, h:22, rangeX:140, rangeY:0,   speed:105}
      ],
      items:[
        {x:860,y:370,kind:"balao"},{x:1320,y:230,kind:"estrela"},
        {x:1520,y:180,kind:"duplosalto"},{x:2360,y:150,kind:"medalha"},
        {x:3040,y:210,kind:"brinquedo"},{x:560,y:470,kind:"heart"}
      ],
      malwares:[
        {x:980,y:480,vx:206,pattern:"patrol"},{x:1620,y:480,vx:-210,pattern:"jumper"},
        {x:2040,y:480,vx:206,pattern:"patrol"},{x:2700,y:480,vx:-202,pattern:"jumper"},
        {x:3150,y:480,vx:-204,pattern:"patrol"}
      ],
      trampolines:[{x:2480,y:510}],
      secrets:[{x:1820,y:263,kind:"estrela",points:30}]
    },
    {
      name: "Nível 19 — O Direito ao Ambiente",
      theme:18, quizTheme:"ambiente", worldW:4000,
      spawn:{x:480,y:460}, doorX:3600,
      // Layout: "floresta" — muitas plataformas pequenas a alturas variadas, como ramos de árvores
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:800,y:430,w:140,h:22},
        {x:980,y:350,w:130,h:22},
        {x:1160,y:440,w:120,h:22},
        {x:1340,y:360,w:130,h:22},
        {x:1520,y:280,w:130,h:22},
        {x:1720,y:360,w:120,h:22},
        {x:1920,y:270,w:130,h:22},  // galho alto
        {x:2120,y:360,w:120,h:22},
        {x:2320,y:440,w:130,h:22},
        {x:2720,y:260,w:130,h:22},  // galho mais alto
        {x:2920,y:340,w:130,h:22},
        {x:3120,y:430,w:130,h:22},
        {x:3340,y:340,w:130,h:22},
        {x:3630,y:520,w:960,h:28}
      ],
      items:[{x:800,y:220,kind:"estrela"},{x:1520,y:230,kind:"balao"},{x:1920,y:220,kind:"duplosalto"},{x:2720,y:210,kind:"medalha"},{x:3120,y:380,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[{x:880,y:480,vx:208,pattern:"patrol"},{x:1440,y:480,vx:-212,pattern:"jumper"},{x:2020,y:480,vx:208,pattern:"jumper"},{x:2620,y:480,vx:-204,pattern:"jumper"},{x:3220,y:480,vx:-206,pattern:"patrol"}],
      movingPlatforms:[
        {x:1340,y:330,w:110,h:22,rangeX:80,rangeY:0,speed:90},
        {x:2520,y:320,w:110,h:22,rangeX:0,rangeY:70,speed:70},
        {x:3340,y:310,w:110,h:22,rangeX:100,rangeY:0,speed:110}
      ],
      trampolines:[{x:2220,y:462}],
      secrets:[{x:1620,y:193,kind:"estrela",points:35},{x:2820,y:173,kind:"heart"}]
    },
    {
      name: "Nível 20 — Os Direitos Digitais",
      theme:19, quizTheme:"digital", worldW:4100,
      spawn:{x:480,y:460}, doorX:3700,
      // Layout: "circuito digital" — plataformas em padrão de circuito impresso: retas longas com viragens bruscas
      platforms:[
        {x:520,y:520,w:960,h:28},
        {x:900,y:440,w:300,h:22},    // bloco horizontal longo
        {x:1500,y:280,w:300,h:22},   // outro bloco longo
        {x:1920,y:360,w:130,h:22},   // viragem
        {x:2100,y:440,w:300,h:22},   // bloco longo
        {x:2700,y:260,w:300,h:22},   // bloco longo no topo
        {x:3300,y:430,w:300,h:22},   // reta final
        {x:3680,y:520,w:1100,h:28}
      ],
      items:[{x:1000,y:390,kind:"balao"},{x:1320,y:310,kind:"estrela"},{x:1650,y:230,kind:"duplosalto"},{x:2200,y:390,kind:"medalha"},{x:2800,y:210,kind:"brinquedo"},{x:560,y:470,kind:"heart"}],
      malwares:[
        {x:950,y:420,vx:130,pattern:"patrol"},{x:1100,y:420,vx:-130,pattern:"patrol"},
        {x:1580,y:260,vx:125,pattern:"patrol"},{x:1730,y:260,vx:-125,pattern:"patrol"},
        {x:2180,y:420,vx:122,pattern:"patrol"},{x:2340,y:420,vx:-122,pattern:"patrol"},
        {x:2760,y:240,vx:120,pattern:"patrol"},{x:2940,y:240,vx:-120,pattern:"patrol"},
        {x:3600,y:480,vx:-210,pattern:"jumper"}
      ],
      movingPlatforms:[
        {x:1320,y:330,w:110,h:22,rangeX:0,rangeY:60,speed:85},
        {x:2520,y:310,w:110,h:22,rangeX:120,rangeY:0,speed:115},
        {x:3120,y:310,w:110,h:22,rangeX:0,rangeY:70,speed:90}
      ],
      trampolines:[{x:1750,y:462},{x:3000,y:462}],
      secrets:[
        {x:1420,y:273,kind:"estrela",points:30},
        {x:2950,y:173,kind:"medalha"},
        {x:3550,y:343,kind:"estrela",points:40}
      ]
    },
  ];

  // ===== Phaser =====
  let sceneRef=null, currentLevel=0;
  let bgGraphics, hillsGraphics, groundGraphics, decorGraphics, shadowGfx;
  let sunGraphics, starGraphics, doorGlowGfx, powerHaloGfx;
  let farGraphics;           // 4ª camada parallax (montanhas/edifícios)
  let moonGraphics;          // lua para temas noturnos
  let platDecorGfx;          // decorações animadas nas plataformas
  let bgConfetti = [];       // confetes de fundo nos últimos níveis
  let platDecorData = [];    // dados das flores/borboletas nas plataformas
  let sunAngle = 0;
  let trailSprites = [];
  let footStepTimer = 0;
  let balloons=[], critters=[], enemyTimers=[];
  let movingPlatforms=[], trampolines=[], secretDoors=[], hazards=[];
  let player, platforms, itemsGroup, malwareGroup, door, doorOverlap=null;
  let cursors, keySpace;
  let hudText, scoreText, heartsGfx, tipText, itemCountText;
  let progressBg, progressFill, powerIndicator, playerNameHUD;
  let pauseOverlayGfx, pauseVanImg, pauseLabel;
  let transitionGfx, transitionLabel;
  let score=0, lives=3, livesLostThisLevel=0;
  const MAX_LIVES=5;
  let itemsCollected=0, itemsTotal=0;
  let collectedItemIndices=new Set(); // índices dos itens já apanhados neste nível
  let _hudDirty=true; // flag: só redesenha HUD quando algo mudou
  let touch={left:false,right:false,jump:false};
  let awaitingQuiz=false, awaitingStory=false;
  let _doorWatchdogTimer=null, _landingCheckTimer=null, _levelAtDoorTrigger=-1;
  let powered=false, poweredTimer=null, powerCountdown=null, invuln=false;
  let starPower=false, starPowerTimer=null, starPowerCountdown=null, starPowerCountVal=0;
  let doubleJumpActive=false, doubleJumpUsed=false; // duplo salto power-up
  // Coyote time + buffer de salto — torna o salto mais "justo" para as crianças
  let coyoteUntil=0, jumpBufferedUntil=0;
  const COYOTE_MS=110, JUMP_BUFFER_MS=130;
  let currentLevelTip = "⭐ Apanha estrelas e chega ao Portal ✨!";
  const GRAVITY=1100;

  const config = {
    type: Phaser.AUTO,
    width: 960, height: 540,
    parent: "game",
    backgroundColor: "#000000",
    transparent: true,
    physics: { default:"arcade", arcade:{ gravity:{y:GRAVITY}, debug:false, overlapBias:12, tileBias:32 } },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960, height: 540
    },
    scene: { preload, create, update }
  };

  function preload() {
    // PNG externa desativada: a imagem vanberto_voar.png não é quadrada (420×537px)
    // e o jogo força-a num quadrado 72×72, o que a deixa esticada/distorcida.
    // Por isso usamos sempre o robô desenhado em Canvas ("vanberto_open"), que é
    // o que aparece corretamente tanto localmente como online.
    // this.load.image("vanberto_png", "vanberto_voar.png");
  }

  function initPhaser() {
    if (window.__dc_game) return;
    const game = new Phaser.Game(config);
    window.__dc_game = game;
  }

  function create() {
    sceneRef = this;
    cursors  = this.input.keyboard.createCursorKeys();
    keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.physics.world.setBounds(0, 0, 2600, 514);
    this.cameras.main.setBounds(0, 0, 2600, 540);

    makeTextures(this);
    initBackground(this);

    shadowGfx = this.add.graphics().setDepth(1);
    powerHaloGfx = this.add.graphics().setDepth(2);

    // HUD
    hudText      = this.add.text(14, 10, "", { fontSize:"16px", fontStyle:"900", color:"#fff5e0", stroke:"#200040", strokeThickness:4 }).setScrollFactor(0).setDepth(100);
    scoreText    = this.add.text(14, 32, "", { fontSize:"14px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:3 }).setScrollFactor(0).setDepth(100);
    // Nome do jogador — elemento HTML fixo (não Phaser), acima de tudo
    playerNameHUD = document.getElementById("playerNameHtml");
    heartsGfx    = this.add.graphics().setScrollFactor(0).setDepth(100);
    tipText      = this.add.text(14, 74, "", { fontSize:"13px", fontStyle:"800", color:"#ff6b35", stroke:"#fff5e0", strokeThickness:3 }).setScrollFactor(0).setDepth(100);
    itemCountText= this.add.text(14, 92, "", { fontSize:"12px", fontStyle:"800", color:"#fff5e0", stroke:"#200040", strokeThickness:2 }).setScrollFactor(0).setDepth(100);

    progressBg   = this.add.graphics().setScrollFactor(0).setDepth(100);
    progressFill = this.add.graphics().setScrollFactor(0).setDepth(100);
    progressBg.fillStyle(0x000000, 0.20);
    progressBg.fillRoundedRect(8, 110, 230, 10, 5);

    powerIndicator = this.add.text(960-14, 52, "", { fontSize:"14px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:4 }).setScrollFactor(0).setDepth(102).setOrigin(1,0);

    // Assinatura da professora — dentro da faixa castanha do chão, muito subtil
    this.add.text(960-8, 536, "Professora Vanda Várzea", {
      fontSize:"8px", fontStyle:"italic", color:"#f5d9a8",
      stroke:"#3a1a00", strokeThickness:1
    }).setScrollFactor(0).setDepth(100).setOrigin(1,1).setAlpha(0.55);

    pauseOverlayGfx = this.add.graphics().setScrollFactor(0).setDepth(500);
    // pauseVanImg e pauseLabel removidos — substituídos pelo overlay HTML #pauseInfoOverlay

    transitionGfx   = this.add.graphics().setScrollFactor(0).setDepth(800).setAlpha(0);
    transitionLabel = this.add.text(480, 270, "", { fontSize:"32px", fontStyle:"900", color:"#ffd700", stroke:"#200040", strokeThickness:8, align:"center" }).setOrigin(0.5).setScrollFactor(0).setDepth(801).setAlpha(0);

    platforms    = this.physics.add.staticGroup();
    itemsGroup   = this.physics.add.group({ allowGravity:false });
    malwareGroup = this.physics.add.group();

    // Usar a PNG original do VanBerto's como sprite de jogo se disponível,
    // senão cair no Canvas gerado como fallback
    const vanKey = this.textures.exists("vanberto_png") ? "vanberto_png" : "vanberto_open";
    player = this.physics.add.sprite(480, 460, vanKey);
    // Redimensionar a PNG para 72×72 no jogo (tamanho visual idêntico ao Canvas anterior)
    if (vanKey === "vanberto_png") {
      player.setDisplaySize(72, 72);
      player.body.setSize(44, 52);
      player.body.setOffset(
        (player.width  - 44) / 2,
        (player.height - 52) / 2 + 4
      );
    } else {
      player.setCollideWorldBounds(true);
      player.body.setSize(44, 48);
      player.body.setOffset(26, 46);
    }
    player.setCollideWorldBounds(true);
    // Guardar se está a usar a PNG para ajustar animações
    player.setData("usingPng", vanKey === "vanberto_png");

    this.physics.add.collider(player, platforms);
    this.physics.add.overlap(player, itemsGroup, onCollectItem, null, this);
    this.physics.add.collider(malwareGroup, platforms);
    this.physics.add.overlap(player, malwareGroup, (p,m)=>onHitMalware(p,m), null, this);

    // Lerp 1.0 = snap instantâneo; loadLevel repõe 0.08 após posicionar
    this.cameras.main.startFollow(player, true, 1.0, 1.0);
    this.cameras.main.setDeadzone(140, 90);

    createTouchInput(this);
    loadGame();
    btnMute.textContent = muted ? "🔇 Som: OFF" : "🔊 Som: ON";
    // Level loaded by btnStart

    if (btnPause && btnRestart) {
      btnPause.onclick = () => {
        if (!sceneRef) return;
        pausedByTeacher = !pausedByTeacher;
        if (pausedByTeacher) {
          sceneRef.physics.pause(); btnPause.textContent = "▶ Continuar"; showPauseScreen(true);
        } else {
          if (!awaitingQuiz && startOverlay.classList.contains("hidden") && historyOverlay.classList.contains("hidden"))
            sceneRef.physics.resume();
          btnPause.textContent = "⏸ Pausa"; showPauseScreen(false);
        }
      };
      btnRestart.onclick = () => {
        if (!sceneRef) return;
        const lvlName = LEVELS[currentLevel]?.name || `Nível ${currentLevel+1}`;
        if (!confirm(`⚠️ Reiniciar o ${lvlName}?\nO progresso neste nível perde-se.`)) return;
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden");
        // Matar todos os tweens pendentes (porta e robot) para evitar que callbacks antigos
        // disparem showQuiz no nível novo se o botão for pressionado durante a animação da porta
        try { sceneRef.tweens.killAll(); } catch {}
        _doorAnimRunning = false;
        touch.left=touch.right=touch.jump=false;
        loadLevel(sceneRef,currentLevel);
        showHistory(currentLevel, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef.physics.resume(); });
        saveGame();
      };
    }

    if (btnRestartGame) {
      btnRestartGame.onclick = () => {
        if (!sceneRef) return;
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden");
        // Matar todos os tweens pendentes antes de reiniciar
        try { sceneRef.tweens.killAll(); } catch {}
        _doorAnimRunning = false;
        touch.left=touch.right=touch.jump=false;
        score=0; lives=3; livesLostThisLevel=0;
        resetQuizStats(); Object.keys(usedQuizByLevel).forEach(k=>usedQuizByLevel[k].clear()); Object.keys(usedQuizByTheme).forEach(k=>usedQuizByTheme[k].clear());
        scoreText.setText(`🌟 Pontos: ${score}`); updateHearts();
        loadLevel(sceneRef,0);
        showHistory(0, () => { awaitingQuiz=false; if(!pausedByTeacher) sceneRef.physics.resume(); });
        saveGame();
      };
    }

    // Botão "Ir para nível" — seletor de nível para a professora (protegido por PIN)
    const TEACHER_PIN = "3583";
    const btnGoToLevel = document.getElementById("btnGoToLevel");
    if (btnGoToLevel) {
      btnGoToLevel.onclick = () => {
        if (!sceneRef) return;
        const pin = prompt("🔒 Código da professora:");
        if (pin === null) return;
        if (pin !== TEACHER_PIN) { alert("❌ Código incorreto."); return; }
        const levelNames = LEVELS.map((l,i)=>`${i+1}. ${l.name.replace(/^Nível \d+\s*[—–-]\s*/,"")}`).join("\n");
        const input = prompt(
          `🎯 Ir para qual nível? (1-${LEVELS.length})\n\n${levelNames}`,
          String(currentLevel + 1)
        );
        if (input === null) return; // cancelou
        const idx = parseInt(input, 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= LEVELS.length) {
          alert(`❌ Nível inválido. Escolhe entre 1 e ${LEVELS.length}.`); return;
        }
        pausedByTeacher=false; btnPause.textContent="⏸ Pausa"; showPauseScreen(false);
        quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
        historyOverlay.classList.add("hidden"); awaitingQuiz=false;
        // Cancelar timers da porta antes de mudar de nível
        if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
        if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
        // Remover overlap da porta antiga antes da transição para evitar disparo acidental
        if(doorOverlap){ try{ sceneRef.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
        touch.left=touch.right=touch.jump=false;
        livesLostThisLevel=0;
        sceneRef.physics.resume();
        playLevelTransition(sceneRef, idx, () => {
          loadLevel(sceneRef, idx);
          showHistory(idx, () => { if(!pausedByTeacher) sceneRef.physics.resume(); });
          saveGame();
        });
      };
    }


    // Botão hamburger mobile — abre/fecha painel suspenso
    const btnTeacherMenu = document.getElementById("btnTeacherMenu");
    const teacherMenuPanel = document.getElementById("teacherMenuPanel");
    if (btnTeacherMenu && teacherMenuPanel) {
      btnTeacherMenu.onclick = (e) => {
        e.stopPropagation();
        teacherMenuPanel.classList.toggle("open");
        // Limpar estado do touch ao abrir o menu — evita VanBerto's ficar preso a andar
        if (teacherMenuPanel.classList.contains("open")) {
          touch.left = touch.right = touch.jump = false;
        }
      };
      // Fechar ao clicar fora
      document.addEventListener("click", (e) => {
        if (!teacherMenuPanel.contains(e.target) && e.target !== btnTeacherMenu) {
          teacherMenuPanel.classList.remove("open");
        }
      });
      // Ligar botões do painel aos originais
      const mirror = (mId, origId) => {
        const m = document.getElementById(mId);
        const o = document.getElementById(origId);
        if (m && o) m.onclick = () => { o.click(); teacherMenuPanel.classList.remove("open"); };
      };
      mirror("mBtnFullscreen", "btnFullscreenGame");
      mirror("mBtnTouch",      "btnTouchToggle");
      mirror("mBtnPause",      "btnPause");
      mirror("mBtnLevel",      "btnRestartLevel");
      mirror("mBtnGoToLevel",  "btnGoToLevel");
      mirror("mBtnRestart",    "btnRestartGame");
    }
  }

  // Dicas de pausa rotativas
  const PAUSE_TIPS = [
    "💡 <b>Star Power:</b> Apanha a estrela ⭐ para atropelar vilões durante 8 segundos e ganhar +50 pontos cada!",
    "🛡️ <b>Escudo:</b> Fica invencível por 8s e absorve um golpe de qualquer vilão.",
    "🦅 <b>Asas:</b> Permitem fazer um segundo salto no ar — ótimo para plataformas altas!",
    "❓ <b>Bloco surpresa:</b> Passa por cima dos blocos <b>❓</b> para revelar itens escondidos!",
    "🟠 <b>Trampolim:</b> Salta numa plataforma laranja para voar muito mais alto que o normal.",
    "🥇 <b>Bónus:</b> Completa um nível sem perder nenhuma vida para ganhar +50 pontos extra!",
    "🔴 Vilão vermelho — lento e previsível. 🔵 Azul — salta às vezes. 🟢 Verde — persegue-te!",
    "❤️ <b>Coração:</b> Apanha-o para ganhar +1 vida (máximo 5 vidas ao mesmo tempo).",
    "🦘 <b>Nível dos Trampolins:</b> Os vãos são intransponíveis sem trampolim — procura-os no chão!",
    "🔥 <b>Nível da Lava:</b> O chão queima! Mantém-te sempre em cima das plataformas.",
    "🏃 <b>Nível da Esteira:</b> Todas as plataformas se movem — observa o ritmo antes de saltar!"
  ];
  let _pauseTipIdx = 0;

  function showPauseScreen(on) {
    const overlay = document.getElementById("pauseInfoOverlay");
    if (!overlay) return;
    if (pauseOverlayGfx) {
      if (on) {
        pauseOverlayGfx.clear();
        pauseOverlayGfx.fillStyle(0x000000, 0.55);
        pauseOverlayGfx.fillRect(0, 0, 960, 540);
      } else {
        pauseOverlayGfx.clear();
      }
    }
    if (on) {
      const lvl = currentLevel + 1;
      const lvlName = (typeof LEVELS !== "undefined" && LEVELS[currentLevel]?.name) ? LEVELS[currentLevel].name : `Nível ${lvl}`;
      const total = (typeof LEVELS !== "undefined") ? LEVELS.length : 20;
      const el = id => document.getElementById(id);
      if (el("pauseLevel"))    el("pauseLevel").textContent    = lvlName;
      if (el("pauseScore"))    el("pauseScore").textContent    = score ?? 0;
      if (el("pauseLives"))    el("pauseLives").textContent    = (lives ?? 3) + " ❤️".repeat(Math.min(lives ?? 3, 5)).replace(/ /g,"");
      if (el("pauseProgress")) el("pauseProgress").textContent = `${lvl} / ${total}`;
      // Dica contextual: priorizar dicas dos níveis especiais
      let tipIdx;
      if (currentLevel === 3)  tipIdx = 8;  // nível trampolins
      else if (currentLevel === 13) tipIdx = 9;  // nível lava
      else if (currentLevel === 17) tipIdx = 10; // nível esteira
      else { _pauseTipIdx = (_pauseTipIdx + 1) % 8; tipIdx = _pauseTipIdx; }
      if (el("pauseTip")) el("pauseTip").innerHTML = PAUSE_TIPS[tipIdx];
      overlay.classList.remove("hidden");
      document.body.classList.add("overlay-open");
    } else {
      overlay.classList.add("hidden");
      document.body.classList.remove("overlay-open");
    }
  }

  // ===== UPDATE =====
  function updateCritters() {
    if(player){
      const px=player.x, py=player.y;
      const now=sceneRef.time.now*0.001;
      critters.forEach(c=>{
        if(c.collected||!c.sprite||!c.sprite.active) return;

        // Garantir velocidade mínima robusta — nunca ficam paradas
        if(Math.abs(c.speedX) < 0.7) c.speedX = (c.speedX >= 0 ? 1 : -1) * 0.7;
        if(Math.abs(c.speedY) < 0.5) c.speedY = (c.speedY >= 0 ? 1 : -1) * 0.5;
        // Acumular angulo proprio por critter
        if(c.angle === undefined) c.angle = c.phase;
        c.angle += c.isBee ? 0.06 : 0.04;
        c.x += c.speedX;
        c.y += c.speedY * Math.sin(c.angle);
        // Rebater nas bordas
        if(c.x < 40) { c.x=40; c.speedX=Math.abs(c.speedX); }
        if(c.x > c.worldW-40) { c.x=c.worldW-40; c.speedX=-Math.abs(c.speedX); }
        if(c.y < 30)  { c.y=30;  c.speedY= Math.abs(c.speedY); }
        if(c.y > 310) { c.y=310; c.speedY=-Math.abs(c.speedY); }
        const sc=c.isBee?0.75:0.80;
        // Batimento de asas — scaleY oscilante
        const wingFlap=1+Math.sin(now*(c.isBee?18:9)+c.wingPhase)*(c.isBee?0.18:0.12);
        c.sprite.setFlipX(c.speedX < 0);
        c.sprite.setScale(sc, sc*wingFlap);
        c.sprite.setPosition(c.x, c.y);
        // Colisao com o jogador — hitbox ligeiramente maior para facilitar apanhar
        const pb=player.body;
        if(pb.right>c.x-32&&pb.left<c.x+32&&pb.bottom>c.y-26&&pb.top<c.y+26){
          c.collected=true; c.sprite.destroy(); c.sprite=null;
          const pts=c.isBee?15:10;
          score+=pts; scoreText.setText(`🌟 Pontos: ${score}`);
          showFloat(sceneRef,px,py-68,c.isBee?`🐝 Abelha +${pts}`:`🦋 Borboleta +${pts}`,c.isBee?"#ffd700":"#ff80c0");
          if(Math.random()<0.4) showFloat(sceneRef,px,py-100,pickPraise(),"#ffd700");
          ensureAudio(); SFX.coin();
          const tint=c.isBee?[0xffd700,0xff9500,0xffffff]:[0xff80c0,0xd0a0ff,0x80d0ff,0xffffff];
          const pt=sceneRef.add.particles(0,0,"spark_item",{x:px,y:py,speed:{min:50,max:170},lifespan:380,quantity:c.isBee?14:12,scale:{start:0.9,end:0},gravityY:280,tint});
          sceneRef.time.delayedCall(280,()=>pt.destroy());
          saveGame();
          // Respawnar após 5-9 segundos — usar session para ignorar se o nível mudou
          const wW=LEVELS[currentLevel]?.worldW||2600;
          const mySession = c.session;
          sceneRef.time.delayedCall(5000+Math.random()*4000,()=>{
            // Ignorar se o nível foi reiniciado ou mudou (nova session)
            if(mySession !== _critterSession) return;
            if(!c.collected) return;
            c.collected=false;
            c.x=120+Math.random()*(wW-240); c.y=60+Math.random()*260;
            // Garantir velocidade mínima robusta no respawn
            const dir = Math.random() < 0.5 ? 1 : -1;
            c.speedX = dir * (0.7 + Math.random() * 0.6);
            c.speedY = (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5);
            c.angle = Math.random() * Math.PI * 2;
            c.sprite=sceneRef.add.image(c.x,c.y,c.key).setDepth(2).setScale(c.isBee?0.75:0.80).setAlpha(0.92);
          });
        }
      });
    }
  }

  function update() {
    const _updOverlay = awaitingQuiz || awaitingStory
      || !startOverlay.classList.contains('hidden')
      || !historyOverlay.classList.contains('hidden')
      || !quizOverlay.classList.contains('hidden');
    if (!_updOverlay) {
      updateCritters();
      updateTrampolines(sceneRef);
      updateSecrets(sceneRef);
      updateHazards(sceneRef);
    }
    updateMovingPlatforms(sceneRef);
    const _overlayOpen = awaitingQuiz || awaitingStory
      || !startOverlay.classList.contains("hidden")
      || !historyOverlay.classList.contains("hidden")
      || !quizOverlay.classList.contains("hidden")
      || !document.getElementById("gameOverOverlay").classList.contains("hidden")
      || !document.getElementById("winOverlay").classList.contains("hidden");
    if (_overlayOpen) {
      player.setVelocityX(0); applyVanBertoTexture(sceneRef); updateShadow(); return;
    }
    // Watchdog: se nenhum overlay está aberto e a física está pausada sem razão, retomá-la
    if (!pausedByTeacher && !awaitingStory && !awaitingQuiz && sceneRef.physics.world.isPaused) {
      sceneRef.physics.resume();
    }
    const speed=powered?320:280;
    const leftDown=cursors.left.isDown||touch.left;
    const rightDown=cursors.right.isDown||touch.right;

    if (leftDown&&!rightDown) { player.setVelocityX(-speed); player.setFlipX(true);  player.setAngle(-2); }
    else if (rightDown&&!leftDown) { player.setVelocityX(speed); player.setFlipX(false); player.setAngle(2); }
    else { player.setVelocityX(0); player.setAngle(0); }
    // Só aplica escala se não estiver a piscar (invuln) para não interromper o tween de alpha
    if(!invuln){
      if(player.getData("usingPng")){
        const ps = powered ? 72*1.18 : 72;
        player.setDisplaySize(ps, ps);
      } else {
        player.setScale(powered?1.18:1.0);
      }
    }

    // ── COYOTE TIME + BUFFER DE SALTO ────────────────────────────
    const now=sceneRef.time.now;
    const onGround=player.body.blocked.down;
    if(onGround){ coyoteUntil=now+COYOTE_MS; doubleJumpUsed=false; }

    // Deteção de "carregar saltar" (flanco, não "premido") — guarda o pedido por uns ms
    let jumpJustPressed=false;
    if(Phaser.Input.Keyboard.JustDown(cursors.up))  jumpJustPressed=true;
    if(Phaser.Input.Keyboard.JustDown(keySpace))    jumpJustPressed=true;
    if(touch.jump){ jumpJustPressed=true; touch.jump=false; }
    if(jumpJustPressed) jumpBufferedUntil=now+JUMP_BUFFER_MS;

    const wantJump  = now<=jumpBufferedUntil;                  // pedido (flanco) ainda dentro da janela
    const jumpHeld  = cursors.up.isDown||keySpace.isDown;      // tecla mantida (saltar segurando no chão)
    const canGround = now<=coyoteUntil;                        // ainda dá para saltar do "chão" (inclui coyote)

    if ((wantJump||jumpHeld) && canGround) {
      // Salto normal — chão, coyote time (acabou de sair da plataforma) ou tecla mantida
      player.setVelocityY(powered?-680:-650); ensureAudio(); SFX.jump();
      jumpBufferedUntil=0; coyoteUntil=0; doubleJumpUsed=false;
      sceneRef.tweens.add({targets:player,scaleY:powered?1.26:1.11,scaleX:powered?1.11:0.95,duration:120,yoyo:true});
    } else if (wantJump&&!onGround&&doubleJumpActive&&!doubleJumpUsed) {
      // DUPLO SALTO — só com toque/tecla NOVO no ar (flanco), nunca por manter premido
      doubleJumpUsed=true; jumpBufferedUntil=0;
      player.setVelocityY(-920); // muito mais alto que o salto normal (-650)
      ensureAudio();
      // Som especial duplo (acorde ascendente)
      beep({freq:520,dur:0.07,type:"triangle",vol:0.07,slideTo:880});
      setTimeout(()=>beep({freq:880,dur:0.12,type:"triangle",vol:0.07,slideTo:1200}),70);
      // Explosão de asas — círculo de partículas douradas/azuis
      const burst=sceneRef.add.particles(0,0,"spark_item",{
        x:player.x, y:player.y+10,
        speed:{min:60,max:200}, angle:{min:0,max:360},
        lifespan:420, quantity:20, scale:{start:1.1,end:0}, gravityY:120,
        tint:[0xffd700,0xffffff,0x80d0ff,0xffe080,0x40c0ff]
      });
      sceneRef.time.delayedCall(300,()=>burst.destroy());
      // Squash & stretch exagerado para sentir o impulso
      sceneRef.tweens.add({targets:player,scaleY:0.6,scaleX:1.4,duration:80,yoyo:true,
        onComplete:()=>{ player.setScale(1); }});
      showFloat(sceneRef,player.x,player.y-60,"🦅 DUPLO SALTO!","#ffd700");
    }

    // Rastro de partículas de asa enquanto doubleJumpActive e no ar
    if (doubleJumpActive && player && !player.body.blocked.down) {
      if (!sceneRef._wingTrailTimer) sceneRef._wingTrailTimer = 0;
      sceneRef._wingTrailTimer += sceneRef.sys.game.loop.delta;
      if (sceneRef._wingTrailTimer > 80) {
        sceneRef._wingTrailTimer = 0;
        const t = sceneRef.add.particles(0,0,"spark_item",{
          x:player.x, y:player.y+8,
          speed:{min:15,max:50}, angle:{min:80,max:100},
          lifespan:220, quantity:3, scale:{start:0.7,end:0}, gravityY:60,
          tint:[0xffd700,0x80d0ff,0xffffff]
        });
        sceneRef.time.delayedCall(180,()=>t.destroy());
      }
    } else if (!doubleJumpActive && sceneRef._wingTrailTimer !== undefined) {
      sceneRef._wingTrailTimer = 0;
    }

    // Efeito visual estrela: tint arco-íris rápido (dourado/laranja/branco) — como Super Mario
    if (starPower && player && !invuln) {
      if (!sceneRef._starBlinkTimer) sceneRef._starBlinkTimer = 0;
      sceneRef._starBlinkTimer += sceneRef.sys.game.loop.delta;
      // Ciclo de cores arco-íris a cada 80ms: amarelo→laranja→branco→ciano→laranja→amarelo
      const starColors = [0xffd700, 0xff9500, 0xffffff, 0x80ffff, 0xff6b35, 0xffd700];
      if (sceneRef._starBlinkTimer > 80) {
        sceneRef._starBlinkTimer = 0;
        if (!sceneRef._starColorIdx) sceneRef._starColorIdx = 0;
        sceneRef._starColorIdx = (sceneRef._starColorIdx + 1) % starColors.length;
        player.setTint(starColors[sceneRef._starColorIdx]);
        if (!awaitingQuiz) player.setAlpha(1); // visível durante star power, mas não durante quiz
      }
      // Rastro de estrelinhas douradas enquanto move
      if (Math.abs(player.body.velocity.x) > 30 || Math.abs(player.body.velocity.y) > 60) {
        if (!sceneRef._starTrailTimer) sceneRef._starTrailTimer = 0;
        sceneRef._starTrailTimer += sceneRef.sys.game.loop.delta;
        if (sceneRef._starTrailTimer > 60) {
          sceneRef._starTrailTimer = 0;
          const t = sceneRef.add.particles(0,0,"spark_item",{
            x:player.x, y:player.y+4,
            speed:{min:20,max:80}, angle:{min:0,max:360},
            lifespan:280, quantity:4, scale:{start:0.9,end:0}, gravityY:80,
            tint:[0xffd700,0xffffff,0xff9500,0xffe080]
          });
          sceneRef.time.delayedCall(200,()=>t.destroy());
        }
      }
    } else if (!starPower && !invuln && player) {
      sceneRef._starBlinkTimer = 0;
      sceneRef._starColorIdx  = 0;
      sceneRef._starTrailTimer = 0;
      // Repõe alpha e limpa tint (só se não há outro power ativo)
      if (!powered) player.clearTint();
      // Só repõe alpha se o robot estiver visível no jogo (não durante animação de porta/quiz)
      if (player.alpha < 0.9 && !awaitingQuiz) player.setAlpha(1);
    }

    applyVanBertoTexture(sceneRef);
    updatePowerHalo(sceneRef);
    updateShadow();

    if (progressFill&&LEVELS[currentLevel]) {
      if (_hudDirty) { updateHUD(LEVELS[currentLevel]); _hudDirty=false; }
      else { updateProgressBar(LEVELS[currentLevel]); } // só a posição do marcador
    }

    // Animar sol (rotação lenta dos raios)
    sunAngle += 0.004;
    drawSun(sunAngle);

    // Animar estrelas noturnas (piscar)
    if(LEVELS[currentLevel]&&NIGHT_THEMES.has(LEVELS[currentLevel].theme))
      drawStars(LEVELS[currentLevel].theme, LEVELS[currentLevel].worldW||2600);

    // Animar nuvens
    clouds.forEach(c=>{
      c.x += c.speed;
      if(c.x > c.worldW+120) c.x=-120;
      drawCloud(c.gfx,c.x,c.y,c.scale,c.alpha,c.type||"cumulo");
    });

    // Trail de movimento (super modo ou no ar)
    updateTrail(sceneRef);

    // Partículas de passo quando corre no chão
    updateFootsteps(sceneRef);

    // Halo da porta quando o player está perto
    updateDoorGlow(sceneRef);

    // Decorações animadas nas plataformas
    updatePlatformDecor(sceneRef);

    // Confetes de fundo — deriva suave
    bgConfetti.forEach(c=>{
      if(!c.gfx||!c.gfx.active) return;
      c.gfx.y = c.baseY + Math.sin(sceneRef.time.now*0.0008+c.phase)*18;
    });

    // Itens sem rotação — apenas flutuam

    // Animar e verificar colisão dos balões flutuantes apanháveis
    if(player){
      const px=player.x, py=player.y;
      balloons.forEach(b=>{
        if(b.collected||!b.sprite) return;
        // Movimento flutuante — sobem pelo ar com deriva lateral
        b.y -= 0.45 + b.speed * 0.12;
        b.x += Math.sin(b.y * 0.018 + b.phase) * 0.6;
        if(b.y < -50){ b.y=560; b.x=80+Math.random()*((LEVELS[currentLevel]?.worldW||2600)-160); }
        b.sprite.setPosition(b.x, b.y);
        b.sprite.setAngle(0);
        // Oscilação suave de alpha
        b.sprite.setAlpha(0.82+Math.sin(Date.now()*0.003+b.phase)*0.12);
        // Colisão com jogador
        const pb=player.body;
        const bLeft=b.x-20, bRight=b.x+20, bTop=b.y-28, bBot=b.y+10;
        if(pb.right>bLeft&&pb.left<bRight&&pb.bottom>bTop&&pb.top<bBot){
          b.collected=true;
          b.sprite.destroy(); b.sprite=null;
          score+=10; scoreText.setText(`🌟 Pontos: ${score}`);
          showFloat(sceneRef,px,py-68,"🎈 Balão +10","#ff6b35");
          if(Math.random()<0.35) showFloat(sceneRef,px,py-100,pickPraise(),"#ffd700");
          ensureAudio(); SFX.coin();
          const tint=[0xff6b35,0xffd700,0xff80c0,0x80d0ff];
          const p=sceneRef.add.particles(0,0,"spark_item",{x:px,y:py,speed:{min:60,max:160},lifespan:340,quantity:12,scale:{start:0.9,end:0},gravityY:300,tint});
          sceneRef.time.delayedCall(240,()=>p.destroy());
          saveGame();
          // Respawnar lá em baixo após 4-7 segundos
          const worldW=LEVELS[currentLevel]?.worldW||2600;
          const _balloonLevel=currentLevel;
          sceneRef.time.delayedCall(4000+Math.random()*3000,()=>{
            if(_balloonLevel!==currentLevel) return; // nível mudou — ignorar
            if(!b.collected) return;
            b.collected=false;
            b.x=80+Math.random()*(worldW-160); b.y=560;
            const newKey="item_balao_"+Math.floor(Math.random()*6);
            b.sprite=sceneRef.add.image(b.x,b.y,newKey).setDepth(1).setScale(0.85).setAlpha(0.92);
          });
        }
      });
    }

    // Animar borboletas e abelhas apanháveis
    malwareGroup.getChildren().forEach(m=>{
      if (!m.active || !m.body) return;
      const pat = m.getData("pattern") || "patrol";
      const spd = m.getData("speed") || 120;
      const dir = m.getData("dir") || 1;  // direcao guardada

      if (pat === "mini") {
        const minL = m.getData("minLeft")  ?? (m.x - 120);
        const minR = m.getData("minRight") ?? (m.x + 120);
        if (m.x <= minL || m.body.blocked.left)  { m.setVelocityX(spd);  m.setData("dir", 1); }
        if (m.x >= minR || m.body.blocked.right) { m.setVelocityX(-spd); m.setData("dir", -1); }
        if (Math.abs(m.body.velocity.x) < 8) { m.setVelocityX(spd * dir); }
        m.rotation += 0.012;
      } else {
        if (m.body.blocked.left)  { m.setVelocityX(spd);  m.setData("dir", 1); }
        if (m.body.blocked.right) { m.setVelocityX(-spd); m.setData("dir", -1); }
        if (door && m.x > door.x - 220 && m.body.velocity.x > 0) { m.setVelocityX(-spd); m.setData("dir", -1); }
        // Impede vilões de cair em zonas de perigo (lava/ácido/abismo) — inverte na borda da plataforma
        // Só ativa em níveis com hazards, para não afetar o comportamento normal
        if (hazards.length && m.body.onFloor()) {
          // Sonda um passo à frente, ao nível do chão do vilão
          const probeX = m.x + (m.body.velocity.x > 0 ? 32 : -32);
          const feetY  = m.body.bottom;
          // 1) Verificar se há plataforma sólida sob esse ponto (margem generosa de 30px)
          const hasPlatformAhead = platforms.getChildren().some(p => {
            if (!p.body) return false;
            return probeX >= p.body.left && probeX <= p.body.right &&
                   feetY  >= p.body.top  - 30 && feetY <= p.body.bottom + 30;
          });
          // 2) Verificar se o passo à frente cai numa zona de lava/perigo
          const inHazardAhead = hazards.some(h =>
            probeX >= h.x - h.w / 2 && probeX <= h.x + h.w / 2
          );
          if (!hasPlatformAhead || inHazardAhead) {
            const newDir = m.body.velocity.x > 0 ? -1 : 1;
            m.setVelocityX(spd * newDir);
            m.setData("dir", newDir);
          }
        }
        // Watchdog robusto: se parou, usar direção guardada
        if (Math.abs(m.body.velocity.x) < 8) { m.setVelocityX(spd * (m.getData("dir") || 1)); }
        m.rotation += pat === "jumper" ? 0.038 : 0.022;
      }
      if (m.body.velocity.x < -2) m.setFlipX(true);
      else if (m.body.velocity.x > 2) m.setFlipX(false);
    });
  }

  function updateShadow() {
    if (!shadowGfx||!player) return;
    shadowGfx.clear();
    if (awaitingQuiz) return;
    const px=player.x,py=player.y; let groundY=520;
    platforms.getChildren().forEach(p=>{
      if(!p.body) return;
      if(px>=p.body.left&&px<=p.body.right&&p.body.top>py&&p.body.top<groundY) groundY=p.body.top;
    });
    const dist=Math.max(0,groundY-py), alpha=Math.max(0,0.28-dist*0.001), sc=Math.max(0.3,1-dist*0.003);
    shadowGfx.fillStyle(0x000000,alpha); shadowGfx.fillEllipse(player.x,groundY+2,44*sc,10*sc);
  }

  function updatePowerHalo(scene) {
    if (!powerHaloGfx||!player) return;
    powerHaloGfx.clear();
    // Esconder halo durante animação da porta ou quiz
    if (awaitingQuiz) return;

    // ── Barra de Star Power por cima do robô ─────────────────────
    if (starPower) {
      const barW = 46, barH = 6;
      const bx = player.x - barW/2;
      // Se o escudo também estiver ativo, a barra da estrela fica uma linha acima
      const by = powered ? player.y - 66 : player.y - 54;
      const pct = Math.max(0, starPowerCountVal / 8);
      // Halo estelar à volta do robô — cor arco-íris pulsante
      const t2 = scene.time.now * 0.006;
      const pulse2 = 0.45 + Math.sin(t2 * 1.3) * 0.45;
      powerHaloGfx.lineStyle(3, 0xffd700, 0.65 * pulse2);
      powerHaloGfx.strokeCircle(player.x, player.y, 38 + pulse2 * 5);
      powerHaloGfx.lineStyle(2, 0xffe080, 0.40 * pulse2);
      powerHaloGfx.strokeCircle(player.x, player.y, 28 + pulse2 * 3);
      // Fundo escuro
      powerHaloGfx.fillStyle(0x000000, 0.50);
      powerHaloGfx.fillRoundedRect(bx-1, by-1, barW+2, barH+2, 4);
      // Preenchimento — amarelo→laranja→vermelho conforme acaba
      const starBarColor = pct > 0.5 ? 0xffd700 : pct > 0.25 ? 0xff9500 : 0xff3300;
      powerHaloGfx.fillStyle(starBarColor, 0.95);
      powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH, 3);
      // Brilho
      powerHaloGfx.fillStyle(0xffffff, 0.35);
      powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH/2, 3);
      // Ícone ⭐ à esquerda da barra (círculo dourado — fillStar não existe em Phaser)
      powerHaloGfx.fillStyle(0xffd700, 0.9);
      powerHaloGfx.fillCircle(bx - 8, by + barH/2, 5);
    }

    if (!powered) return;
    const t = scene.time.now * 0.004;
    const pulse = 0.55 + Math.sin(t) * 0.45;
    // Halo exterior — azul royal
    powerHaloGfx.lineStyle(4, 0x4488ff, 0.55 * pulse);
    powerHaloGfx.strokeCircle(player.x, player.y, 34 + pulse * 6);
    // Halo interior — azul claro
    powerHaloGfx.lineStyle(2.5, 0x88ccff, 0.7 * pulse);
    powerHaloGfx.strokeCircle(player.x, player.y, 26 + pulse * 4);
    // Barra de tempo por cima do robô
    const barW = 46, barH = 6;
    const bx = player.x - barW/2, by = player.y - 54;
    const pct = Math.max(0, poweredCountdownVal / 8);
    // Fundo da barra
    powerHaloGfx.fillStyle(0x000000, 0.45);
    powerHaloGfx.fillRoundedRect(bx-1, by-1, barW+2, barH+2, 4);
    // Preenchimento — azul vivo → azul claro → vermelho conforme acaba
    const barColor = pct > 0.5 ? 0x2266ff : pct > 0.25 ? 0x55aaff : 0xff4400;
    powerHaloGfx.fillStyle(barColor, 0.92);
    powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH, 3);
    // Brilho no topo da barra
    powerHaloGfx.fillStyle(0xffffff, 0.30);
    powerHaloGfx.fillRoundedRect(bx, by, Math.max(3, barW * pct), barH/2, 3);
  }

  // ===== Balões flutuantes apanháveis =====
  function spawnBalloons(scene,worldW) {
    balloons.forEach(b=>{ if(b.sprite) b.sprite.destroy(); if(b.gfx) b.gfx.destroy(); });
    balloons=[];
    const count=6+(currentLevel%4);
    for(let i=0;i<count;i++){
      const x=80+Math.random()*(worldW-160);
      const y=80+Math.random()*380; // espalhados pelo ar
      const bKey="item_balao_"+(i%6);
      const sprite=scene.add.image(x,y,bKey).setDepth(1).setScale(0.85).setAlpha(0.92);
      balloons.push({
        sprite, x, y,
        colorKey:bKey, speed:0.4+Math.random()*0.7,
        phase:Math.random()*Math.PI*2,
        collected:false
      });
    }
  }
  function drawBalloon() {} // mantida para compatibilidade

  // ===== Borboletas e Abelhas apanháveis =====
  // Calcula posições das flores do chão para poder enviar borboletas até lá
  function getFlowerPositions(worldW) {
    const flowers = [];
    for(let fi=0; fi<Math.floor(worldW/38); fi++){
      flowers.push({ x: 18+fi*38+(fi%4)*5, y: 507+(fi%2)*2 });
    }
    return flowers;
  }

  let _critterSession = 0; // incrementado a cada loadLevel para invalidar respawns pendentes

  function spawnCritters(scene, worldW){
    _critterSession++; // invalidar todos os delayedCall de respawn anteriores
    critters.forEach(c=>{ if(c.sprite&&c.sprite.active) c.sprite.destroy(); });
    critters=[];
    const count = 3 + Math.floor(currentLevel / 2); // 3 no nível 1, até ~12 nos últimos
    const session = _critterSession;
    for(let i=0; i<count; i++){
      // Alternar: metade são borboletas, metade são abelhas
      const isBee = (i % 2 === 0);
      const colorIdx = i % 5;
      const key = isBee ? "item_abelha" : "item_borboleta_"+colorIdx;
      const x = 120 + Math.random() * (worldW - 240);
      const y = 60 + Math.random() * 260;
      const sprite = scene.add.image(x, y, key)
        .setDepth(2).setScale(isBee ? 0.75 : 0.80).setAlpha(0.92);
      critters.push({
        sprite, x, y, isBee, key,
        speedX: (Math.random() < 0.5 ? 1 : -1) * (0.7 + Math.random() * 0.6),
        speedY: (Math.random() < 0.5 ? 1 : -1) * (0.5 + Math.random() * 0.5),
        phase: Math.random() * Math.PI * 2,
        wingPhase: Math.random() * Math.PI * 2,
        collected: false, worldW,
        session // identificador de sessão para cancelar respawns obsoletos
      });
    }
  }

  // ===== Escudos extra distribuídos pelo nível =====
  // Cria 2-3 escudos adicionais espalhados pelo mapa (além do que já está em L.items),
  // posicionados acima das plataformas existentes para ficarem acessíveis.
  // Os escudos ficam no itemsGroup normal e são tratados como "medalha".
  function spawnShields(scene, L) {
    if (currentLevel < 3) return;

    const spawnX = L.spawn?.x ?? 0;
    const plats = L.platforms.filter(p => p.w < 600 && Math.abs(p.x - spawnX) > 200); // excluir plataforma de arranque
    if (!plats.length) return;

    // Ordenar da esquerda para a direita — queremos o escudo perto do início
    const sorted = [...plats].sort((a, b) => a.x - b.x);

    // Primeira plataforma que não tenha NENHUM item de L.items dentro dos seus limites
    // (margem de 8px para dar espaço ao sprite do item)
    const p = sorted.find(pl => {
      const left  = pl.x - pl.w / 2 - 8;
      const right = pl.x + pl.w / 2 + 8;
      return L.items.every(it => it.x < left || it.x > right);
    });
    if (!p) return;

    const sx = p.x;
    const sy = p.y - 52;
    const obj = itemsGroup.create(sx, sy, "item_medalha");
    obj.setDepth(2);
    scene.tweens.add({ targets: obj, y: sy - 8, duration: 940, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    obj.setData("kind", "medalha");
    obj.setData("itemIdx", -1); // -1 = escudo extra, não entra no collectedItemIndices
  }
  // ===== PLATAFORMAS MÓVEIS =====
  function spawnMovingPlatforms(scene, L) {
    movingPlatforms.forEach(mp => {
      if (mp.sprite && mp.sprite.active) mp.sprite.destroy();
      if (mp.gfx    && mp.gfx.active)   mp.gfx.destroy();
    });
    movingPlatforms = [];
    const defs = L.movingPlatforms || [];
    if (!defs.length) return;
    const themeIdx = (L.theme || 0) % THEMES.length;
    const platKey  = "platform_t" + themeIdx;
    if (!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
    defs.forEach(def => {
      const speed  = def.speed  || 80;
      const rangeX = def.rangeX || 0;
      const rangeY = def.rangeY || 0;
      const spr = scene.physics.add.image(def.x, def.y, platKey)
        .setDisplaySize(def.w, def.h || 22).setDepth(2).setImmovable(true);
      spr.body.allowGravity = false;
      const collider1 = scene.physics.add.collider(player, spr);
      const collider2 = scene.physics.add.collider(malwareGroup, spr);
      const gfx = scene.add.graphics().setDepth(3);
      movingPlatforms.push({
        sprite: spr, gfx, collider1, collider2,
        originX: def.x, originY: def.y,
        rangeX, rangeY, speed, dirX: 1, dirY: 1
      });
    });
  }

  function updateMovingPlatforms(scene) {
    if (!movingPlatforms.length) return;
    const dt = scene.sys.game.loop.delta * 0.001;
    movingPlatforms.forEach(mp => {
      if (!mp.sprite || !mp.sprite.active) return;
      if (mp.rangeX > 0) {
        mp.sprite.x += mp.dirX * mp.speed * dt;
        if (mp.sprite.x >= mp.originX + mp.rangeX) { mp.sprite.x = mp.originX + mp.rangeX; mp.dirX = -1; }
        if (mp.sprite.x <= mp.originX - mp.rangeX) { mp.sprite.x = mp.originX - mp.rangeX; mp.dirX =  1; }
      }
      if (mp.rangeY > 0) {
        mp.sprite.y += mp.dirY * (mp.speed * 0.6) * dt;
        if (mp.sprite.y >= mp.originY + mp.rangeY) { mp.sprite.y = mp.originY + mp.rangeY; mp.dirY = -1; }
        if (mp.sprite.y <= mp.originY - mp.rangeY) { mp.sprite.y = mp.originY - mp.rangeY; mp.dirY =  1; }
      }
      // Arrastar o jogador se estiver em cima
      if (player && player.body && player.body.blocked.down) {
        const pb = player.body, sb = mp.sprite.body;
        const onTop = pb.right > sb.left && pb.left < sb.right && Math.abs(pb.bottom - sb.top) < 8;
        if (onTop) {
          if (mp.rangeX > 0) player.x += mp.dirX * mp.speed * dt;
          if (mp.rangeY > 0 && mp.dirY < 0) player.y += mp.dirY * (mp.speed * 0.6) * dt;
        }
      }
      mp.sprite.body.reset(mp.sprite.x, mp.sprite.y);
      // Setas indicadoras
      mp.gfx.clear();
      mp.gfx.lineStyle(2, 0xffd700, 0.55);
      const cx = mp.sprite.x, cy = mp.sprite.y - 18;
      if (mp.rangeX > 0) {
        mp.gfx.beginPath(); mp.gfx.moveTo(cx-10,cy); mp.gfx.lineTo(cx+10,cy); mp.gfx.strokePath();
        mp.gfx.fillStyle(0xffd700, 0.55);
        mp.gfx.fillTriangle(cx-13,cy, cx-7,cy-3, cx-7,cy+3);
        mp.gfx.fillTriangle(cx+13,cy, cx+7,cy-3, cx+7,cy+3);
      } else {
        mp.gfx.beginPath(); mp.gfx.moveTo(cx,cy-8); mp.gfx.lineTo(cx,cy+8); mp.gfx.strokePath();
        mp.gfx.fillStyle(0xffd700, 0.55);
        mp.gfx.fillTriangle(cx,cy-11, cx-3,cy-5, cx+3,cy-5);
        mp.gfx.fillTriangle(cx,cy+11, cx-3,cy+5, cx+3,cy+5);
      }
    });
  }

  function clearMovingPlatforms() {
    movingPlatforms.forEach(mp => {
      if (mp.collider1) { try{ sceneRef.physics.world.removeCollider(mp.collider1); }catch{} }
      if (mp.collider2) { try{ sceneRef.physics.world.removeCollider(mp.collider2); }catch{} }
      if (mp.sprite && mp.sprite.active) mp.sprite.destroy();
      if (mp.gfx    && mp.gfx.active)   mp.gfx.destroy();
    });
    movingPlatforms = [];
  }

  // ===== TRAMPOLINS =====
  function _drawTrampoline(gfx, x, y, compressed) {
    gfx.clear();
    const w = 72, topY = compressed ? y - 4 : y;
    gfx.lineStyle(4, 0xa0a0a0, 0.9);
    gfx.beginPath(); gfx.moveTo(x-w*0.4, topY+14); gfx.lineTo(x-w*0.28, topY); gfx.strokePath();
    gfx.beginPath(); gfx.moveTo(x+w*0.4, topY+14); gfx.lineTo(x+w*0.28, topY); gfx.strokePath();
    const springColors = [0xffd700, 0xff6b35];
    for (let si=0; si<3; si++) {
      gfx.fillStyle(springColors[si%2], 0.9);
      gfx.fillRect(x-5, topY+(compressed?2:4)+si*(compressed?2:3), 10, compressed?2:2.5);
    }
    const arcY = compressed ? topY-2 : topY-6;
    gfx.fillStyle(0xff6b35, 0.95);
    gfx.fillRoundedRect(x-w/2, arcY, w, 9, 4);
    gfx.fillStyle(0xffffff, 0.28);
    gfx.fillRoundedRect(x-w/2+4, arcY+1, w-8, 4, 3);
    gfx.lineStyle(1.5, 0xffd700, 0.55);
    for (let ri=-20; ri<=20; ri+=10) {
      gfx.beginPath(); gfx.moveTo(x+ri, arcY+2); gfx.lineTo(x+ri+5, arcY+7); gfx.strokePath();
    }
    if (!compressed) { gfx.fillStyle(0xffd700, 0.70); gfx.fillCircle(x, arcY-8, 5); }
  }

  function spawnTrampolines(scene, L) {
    trampolines.forEach(t => { if (t.gfx && t.gfx.active) t.gfx.destroy(); });
    trampolines = [];
    const defs = L.trampolines || [];
    if (!defs.length) return;
    defs.forEach(def => {
      const gfx = scene.add.graphics().setDepth(3);
      _drawTrampoline(gfx, def.x, def.y, false);
      trampolines.push({ x: def.x, y: def.y, gfx, cooldown: 0 });
    });
  }

  function updateTrampolines(scene) {
    if (!trampolines.length || !player || !player.body) return;
    const now = scene.time.now;
    trampolines.forEach(t => {
      if (!t.gfx || !t.gfx.active || t.cooldown > now) return;
      const pb = player.body;
      const hit = pb.right > t.x-38 && pb.left < t.x+38 &&
                  pb.bottom > t.y-20 && pb.bottom < t.y+12 &&
                  pb.velocity.y >= 0;
      if (!hit) return;
      player.setVelocityY(powered ? -1200 : -960);
      t.cooldown = now + 600;
      _drawTrampoline(t.gfx, t.x, t.y, true);
      scene.time.delayedCall(140, () => { if (t.gfx && t.gfx.active) _drawTrampoline(t.gfx, t.x, t.y, false); });
      const burst = scene.add.particles(0, 0, "spark_item", {
        x: t.x, y: t.y-10, speed:{min:40,max:140}, angle:{min:200,max:340},
        lifespan:320, quantity:12, scale:{start:0.9,end:0}, gravityY:200,
        tint:[0xff6b35,0xffd700,0xffffff]
      });
      scene.time.delayedCall(240, () => burst.destroy());
      ensureAudio();
      showFloat(scene, player.x, player.y-60, "🌟 Trampolim!", "#ffd700");
    });
  }

  function clearTrampolines() {
    trampolines.forEach(t => { if (t.gfx && t.gfx.active) t.gfx.destroy(); });
    trampolines = [];
  }

  // ===== ZONAS DE PERIGO (lava / ácido / abismo) =====
  // Cada hazard: { x, w, y, gfx, kind }
  // kind: "lava" | "acid" | "void"
  // O player perde uma vida instantaneamente se tocar (a não ser que invuln ou powered)

  function spawnHazards(scene, L) {
    hazards = [];
    const defs = L.hazards || [];
    if (!defs.length) return;

    defs.forEach(def => {
      const kind   = def.kind || "lava";
      const gfx    = scene.add.graphics().setDepth(2).setScrollFactor(1);
      _drawHazard(gfx, def.x, def.y ?? 510, def.w, kind, scene.time.now);
      // Animação de ondulação — recria a cada 120ms
      const timer = scene.time.addEvent({
        delay: 120, loop: true,
        callback: () => {
          if (!gfx || !gfx.active) return;
          _drawHazard(gfx, def.x, def.y ?? 510, def.w, kind, scene.time.now);
        }
      });
      hazards.push({ x: def.x, y: def.y ?? 510, w: def.w, gfx, kind, timer });
    });
  }

  function _drawHazard(gfx, x, y, w, kind, now) {
    gfx.clear();
    const t = now * 0.003;
    const half = w / 2;

    if (kind === "lava") {
      // Base: laranja escuro → vermelho
      gfx.fillStyle(0xcc2200, 1);
      gfx.fillRect(x - half, y, w, 30);
      // Camada brilhante — laranja quente
      gfx.fillStyle(0xff5500, 0.85);
      gfx.fillRect(x - half, y, w, 18);
      // Bolhas/ondas animadas
      gfx.fillStyle(0xff8800, 0.9);
      for (let i = 0; i < Math.floor(w / 22); i++) {
        const bx = x - half + 11 + i * 22 + Math.sin(t + i * 1.3) * 6;
        const by = y + 4 + Math.sin(t * 1.4 + i * 0.9) * 3;
        gfx.fillCircle(bx, by, 6 + Math.sin(t * 2 + i) * 2);
      }
      // Brilho topo — linha amarela pulsante
      gfx.fillStyle(0xffdd00, 0.55 + Math.sin(t * 3) * 0.2);
      gfx.fillRect(x - half, y, w, 3);
      // Faíscas individuais
      gfx.fillStyle(0xffee88, 0.85);
      for (let i = 0; i < 5; i++) {
        const sx = x - half + ((i * 137 + Math.floor(t * 8)) % w);
        const sy = y - 2 - ((Math.floor(t * 6 + i * 3)) % 8);
        gfx.fillCircle(sx, sy, 2);
      }
      // Label 🔥 — texto Phaser não funciona em graphics, usamos círculo como símbolo visual
    } else if (kind === "acid") {
      // Verde ácido tóxico
      gfx.fillStyle(0x004400, 1);
      gfx.fillRect(x - half, y, w, 30);
      gfx.fillStyle(0x00aa00, 0.85);
      gfx.fillRect(x - half, y, w, 18);
      // Ondas verdes
      gfx.fillStyle(0x44ff44, 0.75);
      for (let i = 0; i < Math.floor(w / 18); i++) {
        const bx = x - half + 9 + i * 18 + Math.sin(t * 1.2 + i * 1.5) * 5;
        const by = y + 5 + Math.sin(t * 1.8 + i * 0.7) * 3;
        gfx.fillCircle(bx, by, 5 + Math.sin(t * 2.5 + i) * 1.5);
      }
      gfx.fillStyle(0x88ff88, 0.45 + Math.sin(t * 4) * 0.18);
      gfx.fillRect(x - half, y, w, 3);
      // Bolhas de gás a subir
      gfx.fillStyle(0x00ff66, 0.6);
      for (let i = 0; i < 4; i++) {
        const bx2 = x - half + ((i * 79 + Math.floor(t * 5)) % w);
        const by2 = y - 1 - ((Math.floor(t * 4 + i * 4)) % 10);
        gfx.fillCircle(bx2, by2, 2.5);
      }
    } else {
      // void — abismo escuro com aura
      gfx.fillStyle(0x000000, 1);
      gfx.fillRect(x - half, y, w, 30);
      gfx.fillStyle(0x220044, 0.8);
      gfx.fillRect(x - half, y, w, 8);
      // Estrelinhas no abismo
      gfx.fillStyle(0xffffff, 0.5 + Math.sin(t * 2) * 0.3);
      for (let i = 0; i < 6; i++) {
        const sx = x - half + ((i * 53 + Math.floor(t * 2)) % w);
        const sy = y + 6 + (i % 3) * 6;
        gfx.fillCircle(sx, sy, 1.5);
      }
    }
  }

  function updateHazards(scene) {
    if (!hazards.length || !player || !player.body) return;
    if (invuln) return; // já protegido
    hazards.forEach(h => {
      const pb = player.body;
      const half = h.w / 2;
      const inX = pb.right > h.x - half + 4 && pb.left < h.x + half - 4;
      const inY = pb.bottom >= h.y - 2 && pb.top < h.y + 20;
      if (!inX || !inY) return;
      // Toca na lava — tratar como hit de inimigo sem knockback horizontal fixo
      hitByHazard(scene, h);
    });
  }

  function hitByHazard(scene, h) {
    if (invuln || awaitingQuiz) return;
    ensureAudio(); SFX.hit();
    hitFlash.classList.add("active"); setTimeout(() => hitFlash.classList.remove("active"), 200);
    scene.cameras.main.shake(180, 0.010);

    // Salto de knockback para cima
    player.setVelocityX(0);
    player.setVelocityY(-500);

    // Flash visual no jogador
    scene.tweens.add({
      targets: player,
      angle: { from: -20, to: 20 },
      duration: 70, yoyo: true, repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => { if (player) player.setAngle(0); }
    });

    if (powered) { clearPower(scene); setInvuln(scene, 800); tipText.setText("🛡️ Escudo usado! Cuidado."); return; }

    lives -= 1; updateHearts(); livesLostThisLevel++; _hudDirty = true;
    invuln = true;

    const hazardNames = { lava: "🔥 Lava!", acid: "☠️ Ácido!", void: "🌑 Abismo!" };
    showFloat(scene, player.x, player.y - 60, hazardNames[h.kind] || "⚠️ Perigo!", "#ff4400");

    scene.time.delayedCall(420, () => {
      if (!player) return;
      const L = LEVELS[currentLevel];
      touch.left = touch.right = touch.jump = false;
      player.setVelocity(0, 0);
      player.setPosition(L.spawn.x, L.spawn.y);
      snapPlayerToGround();
      if (lives <= 0) { showGameOver(); return; }
      setInvuln(scene, 2000);
      const spawnFlash = scene.add.graphics().setDepth(10);
      spawnFlash.fillStyle(0xffffff, 0.7);
      spawnFlash.fillCircle(L.spawn.x, L.spawn.y, 30);
      scene.tweens.add({ targets: spawnFlash, alpha: 0, scaleX: 2.5, scaleY: 2.5,
        duration: 400, ease: "Quad.easeOut", onComplete: () => spawnFlash.destroy() });
      tipText.setText("⚡ Protegido por 2s!");
    });

    if (lives <= 0) return;
    // Repor itens (mesmo comportamento do hit normal)
    collectedItemIndices.clear();
    const keyMap = { estrela:"item_estrela", balao:"item_chupachupa", brinquedo:"item_brinquedo",
                     medalha:"item_medalha", heart:"item_heart", duplosalto:"item_duplosalto" };
    LEVELS[currentLevel].items.forEach((it, idx) => {
      const exists = itemsGroup.getChildren().some(o => o.getData("itemIdx") === idx);
      if (exists) return;
      const _km = keyMap[it.kind]; const _key = (typeof _km === "function" ? _km() : _km) || "item_estrela";
      const obj = itemsGroup.create(it.x, it.y, _key);
      obj.setDepth(2);
      scene.tweens.add({ targets:obj, y:obj.y-8, duration:940, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      obj.setData("kind", it.kind);
      obj.setData("itemIdx", idx);
    });
    const hasExtraShield = itemsGroup.getChildren().some(o => o.getData("itemIdx") === -1);
    if (!hasExtraShield) spawnShields(scene, LEVELS[currentLevel]);
    saveGame();
  }

  function clearHazards() {
    hazards.forEach(h => {
      if (h.gfx && h.gfx.active) h.gfx.destroy();
      if (h.timer) h.timer.remove(false);
    });
    hazards = [];
  }

  // ===== PASSAGENS SECRETAS =====
  function spawnSecrets(scene, L) {
    secretDoors.forEach(s => {
      if (s.gfx  && s.gfx.active)  s.gfx.destroy();
      if (s.item && s.item.active)  s.item.destroy();
    });
    secretDoors = [];
    const defs = L.secrets || [];
    if (!defs.length) return;
    defs.forEach(def => {
      const kind   = def.kind   || "estrela";
      const points = def.points || 0;
      // Criar textura própria para o marcador de segredo (mais visível que emoji)
      const mkKey = "secret_marker";
      if (!scene.textures.exists(mkKey)) {
        const mt = scene.textures.createCanvas(mkKey, 36, 40), mc = mt.getContext();
        // Fundo vermelho vivo com borda amarela
        mc.fillStyle = "#cc0000";
        mc.beginPath(); mc.roundRect(1, 1, 34, 34, 7); mc.fill();
        mc.strokeStyle = "#ffd700"; mc.lineWidth = 2.5;
        mc.beginPath(); mc.roundRect(1, 1, 34, 34, 7); mc.stroke();
        // Ponto de interrogação branco em negrito
        mc.fillStyle = "#ffffff";
        mc.font = "bold 26px Arial";
        mc.textAlign = "center"; mc.textBaseline = "middle";
        mc.fillText("?", 18, 17);
        // Pontinho inferior
        mc.beginPath(); mc.arc(18, 33, 3, 0, Math.PI*2);
        mc.fillStyle = "#ffd700"; mc.fill();
        mt.refresh();
      }
      const gfx = scene.add.image(def.x, def.y - 34, mkKey)
        .setOrigin(0.5).setDepth(4).setAlpha(1);
      scene.tweens.add({ targets:gfx, alpha:{from:0.80,to:1}, scaleX:{from:1,to:1.20}, scaleY:{from:1,to:1.20},
        duration:700, yoyo:true, repeat:-1, ease:"Sine.easeInOut" });
      secretDoors.push({ x:def.x, y:def.y, kind, points, gfx, item:null, triggered:false });
    });
  }

  function updateSecrets(scene) {
    if (!secretDoors.length || !player || !player.body) return;
    secretDoors.forEach(s => {
      if (s.triggered) return;
      const pb = player.body;
      const near = pb.right > s.x-32 && pb.left < s.x+32 && pb.bottom > s.y-60 && pb.top < s.y+10;
      if (!near) return;
      s.triggered = true;
      if (s.gfx && s.gfx.active) {
        scene.tweens.add({ targets:s.gfx, alpha:0, y:s.y-60, duration:400,
          onComplete:()=>{ if(s.gfx&&s.gfx.active) s.gfx.destroy(); } });
      }

      // ── Flash de ecrã amarelo ──────────────────────────────────
      const flash = scene.add.graphics().setDepth(200).setScrollFactor(0);
      flash.fillStyle(0xffd700, 0.55);
      flash.fillRect(0, 0, 960, 540);
      scene.tweens.add({ targets:flash, alpha:0, duration:350,
        onComplete:()=>flash.destroy() });

      // ── Explosão de raios dourados MUITO mais visível ──────────
      const rays = scene.add.graphics().setDepth(5);
      rays.fillStyle(0xffd700, 0.80);
      for (let ri=0; ri<12; ri++) {
        const a = (Math.PI*2*ri)/12;
        rays.fillTriangle(s.x, s.y-20,
          s.x+Math.cos(a)*80, s.y-20+Math.sin(a)*80,
          s.x+Math.cos(a+0.22)*80, s.y-20+Math.sin(a+0.22)*80);
      }
      // Segundo anel de raios mais curtos
      rays.fillStyle(0xffffff, 0.60);
      for (let ri=0; ri<8; ri++) {
        const a = (Math.PI*2*ri)/8 + Math.PI/8;
        rays.fillTriangle(s.x, s.y-20,
          s.x+Math.cos(a)*40, s.y-20+Math.sin(a)*40,
          s.x+Math.cos(a+0.30)*40, s.y-20+Math.sin(a+0.30)*40);
      }
      scene.tweens.add({ targets:rays, alpha:0, scaleX:1.8, scaleY:1.8,
        duration:600, ease:"Sine.easeOut", onComplete:()=>rays.destroy() });

      // ── Burst de partículas douradas + coloridas ───────────────
      const burst = scene.add.particles(0,0,"spark_item",{
        x:s.x, y:s.y-20,
        speed:{min:80,max:260}, angle:{min:0,max:360},
        lifespan:520, quantity:30, scale:{start:1.2,end:0}, gravityY:180,
        tint:[0xffd700,0xffffff,0xff9500,0xff80c0,0x80d0ff,0xffe080]
      });
      scene.time.delayedCall(380,()=>burst.destroy());

      // ── Item bónus ─────────────────────────────────────────────
      const keyMap = { estrela:"item_estrela", medalha:"item_medalha", heart:"item_heart", brinquedo:"item_brinquedo", duplosalto:"item_duplosalto", balao:"item_balao_0" };
      const it = itemsGroup.create(s.x, s.y-40, keyMap[s.kind]||"item_estrela");
      it.setDepth(3);
      it.setData("kind", s.kind);
      it.setData("itemIdx", -99);
      it.setData("secretPoints", s.points);
      s.item = it;
      // Item aparece com pop de escala
      it.setScale(0.1);
      scene.tweens.add({ targets:it, scaleX:1, scaleY:1, duration:300, ease:"Back.easeOut" });
      scene.tweens.add({ targets:it, y:it.y-8, duration:940, yoyo:true, repeat:-1, ease:"Sine.easeInOut", delay:300 });

      // ── Texto MUITO MAIOR e mais visível ──────────────────────
      const lbl = scene.add.text(s.x, s.y-60, "🔍 SEGREDO!", {
        fontSize:"26px", fontStyle:"900", color:"#ffd700",
        stroke:"#200040", strokeThickness:7
      }).setOrigin(0.5).setDepth(200).setAlpha(0).setScale(0.5);
      scene.tweens.add({ targets:lbl, alpha:1, scaleX:1.3, scaleY:1.3, y:s.y-100,
        duration:300, ease:"Back.easeOut",
        onComplete:()=>scene.time.delayedCall(1600, ()=>{
          scene.tweens.add({ targets:lbl, alpha:0, y:s.y-130, duration:300,
            onComplete:()=>lbl.destroy() });
        }) });

      // ── Som especial de segredo — fanfarra curta ──────────────
      ensureAudio();
      beep({freq:440, dur:0.06, type:"square",   vol:0.07, slideTo:660});
      setTimeout(()=>beep({freq:660, dur:0.06, type:"square",   vol:0.07, slideTo:880}),  70);
      setTimeout(()=>beep({freq:880, dur:0.10, type:"triangle", vol:0.07, slideTo:1320}), 140);
      setTimeout(()=>beep({freq:1320,dur:0.18, type:"triangle", vol:0.07, slideTo:1760}), 260);

      showFloat(scene, s.x, s.y-140, `✨ +${s.points||10} pontos!`, "#ffe080");
    });
  }

  function clearSecrets() {
    secretDoors.forEach(s => {
      if (s.gfx  && s.gfx.active)  s.gfx.destroy();
      if (s.item && s.item.active)  s.item.destroy();
    });
    secretDoors = [];
  }

  function difficultyFactor(idx) {
    let f = 1 + idx * 0.02;
    if (idx >= 8)  f += (idx - 8)  * 0.015;
    if (idx >= 14) f += (idx - 14) * 0.02;
    return Math.min(1.35, f); // cap mais baixo — 1.35 em vez de 1.85
  }

  // ===== Carregar nível =====
  function loadLevel(scene,idx) {
    currentLevel=idx;
    const L=LEVELS[currentLevel];
    const T=THEMES[L.theme%THEMES.length];

    scene.physics.world.setBounds(0,0,L.worldW,514);
    scene.cameras.main.setBounds(0,0,L.worldW,540);

    enemyTimers.forEach(t=>{ try{t.remove(false);}catch{} }); enemyTimers=[];
    platforms.clear(true,true); itemsGroup.clear(true,true);
    malwareGroup.clear(true,true);
    if(door) door.destroy();

    // Manter awaitingQuiz=true e física pausada durante todo o setup do nível.
    // O chamador (nextLevel → showHistory callback) é responsável por fazer resume().
    // Evita que o overlap da porta dispare no 1º frame antes do player estar no spawn.
    // Cancelar timers da porta pendentes antes de qualquer setup do nível
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    awaitingQuiz=true; invuln=false; clearPower(scene); clearDoubleJump(scene); clearStarPower(scene); livesLostThisLevel=0; _doorAnimRunning=false;
    scene.physics.pause();
    // Garantir que halo e sombra estão visíveis no início do nível
    if(powerHaloGfx) powerHaloGfx.setVisible(true);
    if(shadowGfx)    shadowGfx.setVisible(true);
    itemsCollected=0; itemsTotal=L.items.filter(it=>it.kind!=="heart").length;
    collectedItemIndices=new Set();
    _hudDirty=true; updateHUD(L); applyBackground(scene,L.theme%THEMES.length,L.worldW,L.hazards||[]);

    L.platforms.forEach(p=>{
      const themeIdx = L.theme % THEMES.length;
      const platKey = "platform_t"+themeIdx;
      if(!scene.textures.exists(platKey)) makePlatformTextureThemed(scene, platKey, themeIdx);
      const plat=platforms.create(p.x,p.y,platKey);
      plat.displayWidth=p.w; plat.displayHeight=p.h; plat.refreshBody();
      if(plat.body){plat.body.checkCollision.left=false;plat.body.checkCollision.right=false;}
    });

    door=scene.physics.add.staticSprite(L.doorX,448,"door_party").setDisplaySize(88,104);
    door.refreshBody(); // sincronizar hitbox físico com o tamanho visual (setDisplaySize não o faz automaticamente)
    door.clearTint();
    // Guardar referência ao collider para o poder destruir no momento do toque (evita re-disparo no móvel)
    if(doorOverlap) { try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
    let _doorTriggered=false; // guarda local — evita disparo duplo no mesmo frame
    const _spawnX = L.spawn.x; // guardar spawn para verificação de distância mínima
    doorOverlap = scene.physics.add.overlap(player,door,()=>{
      if(awaitingQuiz||_doorTriggered||invuln) return;
      // Segurança: ignorar overlap se o player ainda está perto do spawn (evita disparo falso no 1º frame após resume)
      if(Math.abs(player.x - _spawnX) < 200) return;
      _doorTriggered=true;
      try{ scene.physics.world.removeCollider(doorOverlap); doorOverlap=null; }catch{}
      tryOpenDoor(scene);
    },null,scene);
    scene.tweens.add({targets:door,alpha:{from:1,to:0.82},duration:900,yoyo:true,repeat:-1});

    // Decorações animadas nas plataformas
    spawnPlatformDecor(scene, platforms);

    const keyMap={
      estrela:"item_estrela",
      balao:"item_chupachupa",
      brinquedo:"item_brinquedo",medalha:"item_medalha",heart:"item_heart",
      duplosalto:"item_duplosalto"
    };
    // Velocidade de rotação por tipo de item — removida (itens ficam fixos)
    const rotSpeeds={};
    L.items.forEach((it,idx)=>{
      const _km=keyMap[it.kind]; const _key=typeof _km==="function"?_km():(_km||"item_estrela");
      const obj=itemsGroup.create(it.x,it.y,_key);
      obj.setDepth(2);
      scene.tweens.add({targets:obj,y:obj.y-8,duration:940,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
      obj.setData("kind",it.kind);
      obj.setData("itemIdx",idx);
    });

    // Halo da porta (criado aqui, atualizado no update)
    if(doorGlowGfx) doorGlowGfx.destroy();
    doorGlowGfx = scene.add.graphics().setDepth(1);
    doorGlowGfx._hintShown = false;

    const df=difficultyFactor(currentLevel);
    L.malwares.forEach(m=>spawnVilao(scene,m.x,480,m.vx,df,m.pattern||"patrol"));

    // Garantir que os 3 tipos de vilao aparecem SEMPRE em todos os niveis
    if(L.platforms.length>=5) {
      const mid  = L.platforms[Math.floor(L.platforms.length/2)];
      const q1   = L.platforms[Math.floor(L.platforms.length/4)];
      const q3   = L.platforms[Math.floor(L.platforms.length*3/4)];

      // Tipo 1 - vilao_round (mini/redondo): sempre presente, zona central
      spawnVilao(scene, mid.x, 480, (currentLevel%2===0)?120:-120, df, "mini");

      // Tipo 2 - vilao_spike (patrol): sempre presente no 1/4 do nivel
      spawnVilao(scene, q1.x, 480, (currentLevel%2===0)?-170:170, df, "patrol");

      // Tipo 3 - vilao_bug (jumper): sempre presente no 3/4 do nivel (a partir do nivel 2)
      if(currentLevel>=2){
        spawnVilao(scene, q3.x, 480, (currentLevel%2===0)?190:-190, df, "jumper");
      }
      // Segundo jumper extra a partir do nivel 4
      if(currentLevel>=4){
        const qEx = L.platforms[Math.floor(L.platforms.length*2/3)];
        spawnVilao(scene, qEx.x, 480, (currentLevel%2===0)?-200:200, df, "jumper");
      }
      // Terceiro jumper e patrol extra nos ultimos 6 niveis (14-20)
      if(currentLevel>=14){
        const qLate = L.platforms[Math.floor(L.platforms.length*5/6)] || q3;
        spawnVilao(scene, qLate.x, 480, (currentLevel%2===0)?210:-210, df, "jumper");
        spawnVilao(scene, q1.x+200, 480, (currentLevel%2===0)?-160:160, df, "patrol");
      }
      // Ultimo nivel — viloes em todos os quartos
      if(currentLevel>=19){
        spawnVilao(scene, mid.x+300, 480, (currentLevel%2===0)?220:-220, df, "jumper");
        spawnVilao(scene, mid.x-300, 480, (currentLevel%2===0)?-180:180, df, "patrol");
      }
    }

    spawnBalloons(scene,L.worldW);
    spawnCritters(scene,L.worldW);
    spawnShields(scene,L);
    clearMovingPlatforms(); spawnMovingPlatforms(scene,L);
    clearTrampolines();     spawnTrampolines(scene,L);
    clearSecrets();         spawnSecrets(scene,L);
    clearHazards();         spawnHazards(scene,L);

    player.setAlpha(0); player.setAngle(0); player.setFlipX(false); player.setOrigin(0.5,0.5); player.setDepth(3);
    // PNG mode: preservar displaySize; Canvas mode: usar setScale
    if(player.getData("usingPng")){
      player.setDisplaySize(72 * 0.6, 72 * 1.3); // começa pequeno e achatado (pop de entrada)
    } else {
      player.setScale(0.6);
    }
    player.setPosition(L.spawn.x, L.spawn.y); player.setVelocity(0, 0);
    if (player.body) player.body.reset(L.spawn.x, L.spawn.y); // forçar corpo físico para o spawn imediatamente
    // Snap instantâneo da câmara para o spawn, depois repor lerp suave para o jogo
    scene.cameras.main.startFollow(player, true, 1.0, 1.0);
    scene.cameras.main.centerOn(L.spawn.x, 270);
    scene.time.delayedCall(50, () => scene.cameras.main.startFollow(player, true, 0.08, 0.08));
    touch.left=touch.right=touch.jump=false;
    // Robot aparece com fade-in e pequeno "pop" no início do nível seguinte
    scene.time.delayedCall(80,()=>{
      snapPlayerToGround();
      if(player.getData("usingPng")){
        scene.tweens.add({
          targets: player,
          alpha: { from: 0, to: 1 },
          displayWidth:  { from: 72*0.6, to: 72 },
          displayHeight: { from: 72*1.3, to: 72 },
          duration: 320, ease: "Back.easeOut",
          onComplete: () => {
            if (sceneRef && !sceneRef.physics.world.isPaused) player.setVelocityY(-160);
          }
        });
      } else {
        scene.tweens.add({
          targets: player,
          alpha: { from: 0, to: 1 },
          scaleX: { from: 0.6, to: 1 },
          scaleY: { from: 1.3, to: 1 },
          duration: 320, ease: "Back.easeOut",
          onComplete: () => {
            if (sceneRef && !sceneRef.physics.world.isPaused) player.setVelocityY(-160);
          }
        });
      }
    });

    const TIPS = [
      "🌟 Apanha estrelas e chega ao Portal ✨!",
      "🎈 Apanha balões no ar e chupa-chupas nas plataformas!",
      "🧸 A Convenção de 1989 protege todas as crianças!",
      "🦘 USA OS TRAMPOLINS! Os vãos são intransponíveis sem eles!",
      "📚 Apanha itens e chega ao Portal ✨!",
      "💊 Todas as crianças têm direito à saúde!",
      "🛡️ Evita os vilões e protege os teus direitos!",
      "🗣️ A tua opinião conta! Chega à porta!",
      "🌱 O futuro sustentável depende de ti!",
      "🌍 A UNICEF defende todas as crianças do mundo!",
      "🪪 Toda a criança tem direito a um nome e identidade!",
      "👨‍👩‍👧 A família é o primeiro lugar de amor e segurança!",
      "✈️ Crianças refugiadas têm os mesmos direitos que todas!",
      "🔥 CUIDADO COM A LAVA! Mantém-te nas plataformas — não caias!",
      "🗣️ A tua voz importa — tens direito à expressão!",
      "🔒 A tua privacidade online é um direito — protege-a!",
      "🌍 Cada língua e cultura é um tesouro único!",
      "🏃 As plataformas MOVEM-SE! Observa o ritmo antes de saltar!",
      "🌱 O planeta precisa de ti — cuida do ambiente!",
      "💻 Os teus direitos existem também no mundo digital!"
    ];
    currentLevelTip = (TIPS[currentLevel] || TIPS[0]) + (currentLevel >= 6 ? " ⚠️ Cuidado!" : "");
    tipText.setText(currentLevelTip);
    ensureAudio(); SFX.door(); saveGame();
  }

  /*
   * spawnVilao — 3 padrões de comportamento:
   *   "mini"    → patrulha zona pequena (±120px), devagar, sem saltar (mais fácil, níveis 1-3)
   *   "patrol"  → patrulha horizontal normal (médio, níveis 1-8)
   *   "jumper"  → patrulha E salta frequentemente (difícil, níveis 7-10)
   */
  function spawnVilao(scene, x, y, vx, df, pattern="patrol") {
    const keyMap = { mini:"vilao_round", patrol:"vilao_spike", jumper:"vilao_bug" };
    const keys = ["vilao_round","vilao_spike","vilao_bug"];
    const key = keyMap[pattern] || keys[Math.floor(Math.random()*keys.length)];

    const v = malwareGroup.create(x, y, key);
    v.setCollideWorldBounds(true);
    v.setBounce(0);
    // Tamanho distinto por tipo: mini=pequeno, patrol=médio, jumper=grande
    if (pattern === "mini") {
      v.setDisplaySize(36, 36); v.body.setSize(34, 34, true);
    } else if (pattern === "jumper") {
      v.setDisplaySize(58, 58); v.body.setSize(54, 54, true);
    } else {
      v.setDisplaySize(48, 48); v.body.setSize(48, 48, true);
    }
    v.setDepth(2);
    v.setData("pattern", pattern);
    v.setData("originX", x);
    v.setData("originY", y);

    if (pattern === "mini") {
      const miniSpeed = 60 + Math.random() * 40;
      v.setVelocityX(miniSpeed);
      v.setData("speed", miniSpeed);
      v.setData("dir", 1);
      v.setData("minLeft",  x - 120);
      v.setData("minRight", x + 120);
    } else if (pattern === "jumper") {
      const spd = Math.round(Math.abs(vx) * df * 0.60) || 120;
      v.setVelocityX(vx >= 0 ? spd : -spd);
      v.setData("speed", spd);
      v.setData("dir", vx >= 0 ? 1 : -1);
    } else {
      const spd = Math.round(Math.abs(vx) * df) || 120;
      v.setVelocityX(vx >= 0 ? spd : -spd);
      v.setData("speed", spd);
      v.setData("dir", vx >= 0 ? 1 : -1);
    }

    // Saltos periódicos — só patrol e jumper
    if (pattern === "patrol" || pattern === "jumper") {
      const jumpInterval = pattern === "jumper"
        ? 1400 + Math.random() * 700
        : 2200 + Math.random() * 1400;

      const outerTimer = scene.time.addEvent({
        delay: 400 + Math.random() * 1000,
        callback: () => {
          const innerTimer = scene.time.addEvent({
            delay: jumpInterval, loop: true,
            callback: () => {
              if (!v.active || !v.body) return;
              if (!v.body.blocked.down) return;
              if (pattern === "jumper" && player) {
                // Salto inteligente: força proporcional à altura do jogador
                const dy = v.y - player.y; // positivo se jogador está acima
                const targetForce = dy > 30
                  ? -Math.min(780, Math.sqrt(2 * 1100 * (dy + 30)) + 60)
                  : -380;
                // Virar na direção do jogador ao saltar
                const dirX = player.x > v.x ? 1 : -1;
                const spd2 = v.getData("speed") || 150;
                v.setVelocityX(dirX * spd2);
                v.setVelocityY(targetForce);
              } else {
                v.setVelocityY(-420 - Math.random() * 80);
              }
            }
          });
          enemyTimers.push(innerTimer);
        }
      });
      enemyTimers.push(outerTimer);
    }

    // Timer anti-stuck: verifica posição real a cada 600ms
    let lastX = v.x;
    const stuckTimer = scene.time.addEvent({
      delay: 600, loop: true,
      callback: () => {
        if (!v.active || !v.body) return;
        const moved = Math.abs(v.x - lastX);
        if (moved < 4) {
          // Verdadeiramente parado — forçar velocidade na direção guardada
          const d = v.getData("dir") || 1;
          const s = v.getData("speed") || 120;
          v.setVelocityX(s * d);
        } else {
          // Atualizar dir com base no movimento real
          if (v.x > lastX) v.setData("dir", 1);
          else v.setData("dir", -1);
        }
        lastX = v.x;
      }
    });
    enemyTimers.push(stuckTimer);

    // Animações visuais
    if (pattern === "mini") {
      // Rotação lenta + pulsação suave — menos ameaçador
      scene.tweens.add({targets:v, angle:{from:-8,to:8},
        duration:1100+Math.random()*400, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:0.92,to:1.08}, scaleY:{from:1.08,to:0.92},
        duration:900+Math.random()*300, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    } else if (pattern === "patrol") {
      scene.tweens.add({targets:v, angle:{from:-6,to:6},
        duration:700+Math.random()*300, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:1.0,to:1.15}, scaleY:{from:1.0,to:1.15},
        duration:500+Math.random()*200, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    } else if (pattern === "jumper") {
      scene.tweens.add({targets:v, angle:{from:-12,to:12},
        duration:320+Math.random()*160, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});
      scene.tweens.add({targets:v, scaleX:{from:0.95,to:1.20}, scaleY:{from:1.20,to:0.95},
        duration:380+Math.random()*120, yoyo:true, repeat:-1, ease:"Sine.easeInOut"});

    }
  }

  function updateHUD(L) {
    hudText.setText(`${L.name}  (${currentLevel+1}/${LEVELS.length})`);
    scoreText.setText(`🌟 Pontos: ${score}`);
    updateHearts();
    itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`);
    if(powerIndicator&&!powered) powerIndicator.setText("");
    if(playerNameHUD){
      playerNameHUD.textContent = playerName ? `⭐ ${playerName}` : "";
      playerNameHUD.style.display = playerName ? "block" : "none";
    }
    updateProgressBar(L);
  }

  function updateProgressBar(L) {
    if(!progressFill) return;
    progressFill.clear();
    const BAR_X=8,BAR_Y=110,BAR_W=230,BAR_H=10;
    const levelPct=currentLevel/LEVELS.length;
    const levelNextPct=(currentLevel+1)/LEVELS.length;
    progressFill.fillStyle(0x200040,0.55);
    progressFill.fillRoundedRect(BAR_X,BAR_Y,Math.max(4,Math.round(BAR_W*levelPct)),BAR_H,5);
    if(player&&L){
      const worldW=L.worldW||2600,doorX=L.doorX||worldW-200,spawnX=L.spawn?.x||120;
      const px=Math.max(spawnX,Math.min(player.x,doorX));
      const inLevelPct=(px-spawnX)/Math.max(1,doorX-spawnX);
      const segStart=BAR_X+Math.round(BAR_W*levelPct);
      const segEnd=BAR_X+Math.round(BAR_W*levelNextPct);
      const segW=segEnd-segStart;
      progressFill.fillStyle(0xff6b35,0.9);
      progressFill.fillRoundedRect(segStart,BAR_Y,Math.max(3,Math.round(segW*inLevelPct)),BAR_H,5);
      const markerX=segStart+Math.round(segW*inLevelPct);
      progressFill.fillStyle(0x200040,1); progressFill.fillCircle(markerX,BAR_Y+BAR_H/2,6);
      progressFill.fillStyle(0xffd700,1); progressFill.fillCircle(markerX,BAR_Y+BAR_H/2,3);
      progressFill.fillStyle(0xff6b35,1); progressFill.fillRect(segEnd-5,BAR_Y+1,8,BAR_H-2);
    }
  }

  function updateHearts(){
    if(!heartsGfx) return;
    heartsGfx.clear();
    const startX=14,y=56,size=12,gap=17;
    for(let i=0;i<MAX_LIVES;i++){
      const x=startX+i*gap, full=i<lives;
      const r=size*0.52;
      heartsGfx.fillStyle(full?0xe84d10:0xffc0a0,full?1:0.4);
      heartsGfx.fillCircle(x-r*0.55,y-r*0.18,r); heartsGfx.fillCircle(x+r*0.55,y-r*0.18,r);
      heartsGfx.fillTriangle(x-size,y-r*0.1,x+size,y-r*0.1,x,y+size*1.05);
      if(full){heartsGfx.fillStyle(0xffffff,0.3);heartsGfx.fillCircle(x-r*0.3,y-r*0.5,r*0.3);}
    }
  }

  function snapPlayerToGround(){
    if(!player?.body||!platforms) return;
    player.body.updateFromGameObject();
    const pb=player.body; let best=null,bestTop=Infinity;
    platforms.getChildren().forEach(p=>{
      if(!p.body) return;
      if(pb.right>p.body.left&&pb.left<p.body.right){
        const top=p.body.top;
        if(top>=pb.bottom-2&&top<bestTop){bestTop=top;best=p;}
      }
    });
    if(best){const dy=pb.bottom-(best.body.top-1);player.setVelocity(0,0);player.y-=dy;player.body.updateFromGameObject();}
  }

  // ===== Porta + Quiz =====
  function tryOpenDoor(scene){
    if(awaitingQuiz) return;
    awaitingQuiz=true;
    // Parar melodia da estrela ao chegar à porta
    if(_starMelodyInterval){ clearInterval(_starMelodyInterval); _starMelodyInterval=null; }
    // Cancelar TODOS os timers/tweens que possam alterar alpha/scale do player
    if(scene && scene.tweens) scene.tweens.killTweensOf(player);
    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }
    if(starPowerTimer){   starPowerTimer.remove(false);   starPowerTimer=null; }
    if(starPowerCountdown){ starPowerCountdown.remove(false); starPowerCountdown=null; }
    if(poweredTimer){     poweredTimer.remove(false);     poweredTimer=null; }
    if(powerCountdown){   powerCountdown.remove(false);   powerCountdown=null; }
    if(doubleJumpTimer){  doubleJumpTimer.remove(false);  doubleJumpTimer=null; }
    if(doubleJumpCountdown){ doubleJumpCountdown.remove(false); doubleJumpCountdown=null; }
    invuln=false; starPower=false; powered=false; doubleJumpActive=false;
    player.setAlpha(1); player.setScale(1); player.clearTint();
    // Remover overlap da porta imediatamente — antes de qualquer resume() da física
    if(doorOverlap){ try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
    // Esconder halo e sombra imediatamente — não redesenhar durante animação
    if(powerHaloGfx) { powerHaloGfx.clear(); powerHaloGfx.setVisible(false); }
    if(shadowGfx)    { shadowGfx.clear();    shadowGfx.setVisible(false); }
    player.setVelocityX(0);
    player.setFlipX(false);
    touch.left=touch.right=touch.jump=false;
    const doorOrigX = door.x;
    // Garantir que a física está ativa para o body.blocked atualizar corretamente
    scene.physics.resume();
    let waited = 0;
    let _animStarted = false; // guarda — impede startDoorAnimation de ser chamado duas vezes
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    _landingCheckTimer = scene.time.addEvent({
      delay: 16, loop: true,
      callback: () => {
        if(_animStarted) return;
        waited += 16;
        const onGround = player.body && player.body.blocked.down;
        // No móvel o body.blocked pode não atualizar — forçar após 200ms
        if (onGround || waited >= 200) {
          _animStarted = true;
          if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
          player.setVelocity(0, 0);
          snapPlayerToGround();
          scene.physics.pause();
          ensureAudio(); SFX.doorOpen();
          startDoorAnimation(scene, doorOrigX);
        }
      }
    });
    // Timeout de segurança: se ao fim de 4s o quiz ainda não apareceu, desbloquear
    // Guarda snapshot do nível para evitar disparo no nível seguinte
    _levelAtDoorTrigger = currentLevel;
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    _doorWatchdogTimer = scene.time.delayedCall(4000, () => {
      _doorWatchdogTimer = null;
      if (!awaitingQuiz) return; // já resolveu normalmente
      if (currentLevel !== _levelAtDoorTrigger) return; // já avançou de nível
      if (awaitingStory) return; // história ainda visível — não interferir
      const quizVisible = !quizOverlay.classList.contains("hidden");
      if (!quizVisible) {
        // Quiz não apareceu — desbloquear o jogo
        awaitingQuiz = false;
        _doorAnimRunning = false;
        if(powerHaloGfx) powerHaloGfx.setVisible(true);
        if(shadowGfx)    shadowGfx.setVisible(true);
        scene.physics.resume();
        // Recriar o overlap da porta para nova tentativa
        if(doorOverlap) { try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
        let _retryTriggered=false;
        doorOverlap = scene.physics.add.overlap(player, door, () => {
          if(awaitingQuiz||_retryTriggered||invuln) return;
          if(Math.abs(player.x - door.x) > 120) return; // segurança extra: só activa perto da porta
          _retryTriggered=true;
          try{ scene.physics.world.removeCollider(doorOverlap); doorOverlap=null; }catch{}
          tryOpenDoor(scene);
        }, null, scene);
      }
    });
  }

  let _doorAnimRunning = false;
  function startDoorAnimation(scene, doorOrigX){
    // Impedir execução dupla — só pode correr uma vez por abertura de porta
    if(_doorAnimRunning) return;
    _doorAnimRunning = true;
    door.setOrigin(0.5, 0.5);
    door.x = doorOrigX;

    // FASE 1 — portal pulsa para indicar que está a ativar
    scene.tweens.add({
      targets: door,
      scaleX: { from: 1, to: 1.18 },
      scaleY: { from: 1, to: 1.18 },
      duration: 120, yoyo: true, repeat: 3,
      ease: "Sine.easeInOut",
      onComplete: () => {
        door.x = doorOrigX;
        door.setScale(1);

        // Brilho dourado no chão à frente do portal
        const glow = scene.add.graphics().setDepth(10);
        glow.fillStyle(0xffd700, 0.7);
        glow.fillEllipse(doorOrigX, door.y + 36, 90, 20);
        scene.tweens.add({ targets: glow, alpha: { from: 0.7, to: 0 }, duration: 600,
          onComplete: () => glow.destroy() });

        // Burst de partículas ao ativar o portal
        const portalBurst = scene.add.particles(0, 0, "spark_item", {
          x: doorOrigX, y: door.y - 20,
          speed: { min: 60, max: 200 }, lifespan: 500, quantity: 22,
          scale: { start: 1.1, end: 0 }, gravityY: 60,
          angle: { min: 0, max: 360 },
          tint: [0xffd700, 0xa060ff, 0x80d0ff, 0xff6b35, 0xffffff]
        });
        scene.time.delayedCall(400, () => portalBurst.destroy());

        // FASE 2 — portal gira e cresce (ativação)
        scene.tweens.add({
          targets: door,
          angle: { from: 0, to: 360 },
          scaleX: { from: 1, to: 1.3 },
          scaleY: { from: 1, to: 1.3 },
          duration: 400, ease: "Back.easeIn",
          onComplete: () => {

            // FASE 3 — robot voa para o portal (spin + encolhe)
            player.setDepth(2);
            player.setFlipX(false);

            // Pequenas partículas do portal ao absorver
            const burst = scene.add.particles(0, 0, "spark_item", {
              x: doorOrigX, y: door.y - 10,
              speed: { min: 30, max: 120 },
              lifespan: 400, quantity: 14,
              scale: { start: 0.8, end: 0 },
              gravityY: -40,
              angle: { min: 0, max: 360 },
              tint: [0xffd700, 0xa060ff, 0xffffff, 0x80d0ff]
            });
            scene.time.delayedCall(320, () => burst.destroy());

            // Robot desloca-se até ao portal enquanto gira
            scene.tweens.add({
              targets: player,
              x: doorOrigX,
              y: door.y - 18,
              duration: 280, ease: "Sine.easeIn",
              onComplete: () => {

                // FASE 4 — robot entra no portal: gira e desaparece no vórtice
                scene.tweens.add({
                  targets: player,
                  scaleX: { from: player.scaleX, to: 0.05 },
                  scaleY: { from: player.scaleY, to: 0.05 },
                  angle:  { from: 0, to: 720 },
                  alpha: { from: 1, to: 0 },
                  duration: 280, ease: "Sine.easeIn",
                  onComplete: () => {
                    // Robot está completamente dentro da porta
                    // Matar todos os tweens (invuln, star power, etc.) para nenhum restaurar o alpha
                    if(scene && scene.tweens) scene.tweens.killTweensOf(player);
                    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
                    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }
                    invuln = false;
                    player.setOrigin(0.5, 0.5);
                    player.setScale(1);
                    player.setAlpha(0); // manter invisível enquanto o quiz está aberto
                    player.setDepth(3);
                    // Esconder porta completamente durante o quiz
                    door.setOrigin(0.5, 0.5);
                    door.x = doorOrigX;
                    door.setScale(1);
                    door.setAlpha(0);

                    // Label "Responde!"
                    const label = scene.add.text(doorOrigX, door.y - 70, "✨ Responde! ✨", {
                      fontSize: "20px", fontStyle: "900",
                      color: "#ffd700", stroke: "#200040", strokeThickness: 5
                    }).setOrigin(0.5).setDepth(20).setAlpha(0);
                    scene.tweens.add({
                      targets: label, alpha: 1, y: door.y - 88,
                      duration: 240, ease: "Back.easeOut",
                      onComplete: () => scene.time.delayedCall(280, () => {
                        scene.tweens.add({ targets: label, alpha: 0, duration: 160,
                          onComplete: () => label.destroy() });
                      })
                    });

                    // FASE 5 — mostrar quiz
                    scene.time.delayedCall(560, () => {
                      if(!awaitingQuiz) return; // segurança: só mostrar se ainda estamos à espera
                      _doorAnimRunning = false; // reset para próxima porta
                      lastQuizTheme = LEVELS[currentLevel].quizTheme;
                      showQuiz(pickQuizForLevel(currentLevel, LEVELS[currentLevel].quizTheme), (ok) => {
                        if(ok){
                          ensureAudio();
                          if(currentLevel===LEVELS.length-1) SFX.finalWin(); else SFX.win();
                          nextLevel(scene);
                        } else {
                          // NOTA: Este bloco é código morto — showQuiz() nunca chama done(false).
                          // O jogador tem retentativas infinitas até acertar (btnCloseQuiz lança showQuiz com isRetry=true).
                          // Mantido por segurança caso a lógica do quiz mude no futuro.
                          door.setOrigin(0.5, 0.5);
                          door.x = doorOrigX;
                          door.setScale(1);
                          door.setAlpha(1);
                          player.setAlpha(1); player.setScale(1);
                          const L = LEVELS[currentLevel];
                          player.setPosition(L.spawn.x, L.spawn.y);
                          snapPlayerToGround();
                          if(powerHaloGfx) powerHaloGfx.setVisible(true);
                          if(shadowGfx)    shadowGfx.setVisible(true);
                          if(doorOverlap) { try{ scene.physics.world.removeCollider(doorOverlap); }catch{} doorOverlap=null; }
                          _doorAnimRunning = false; // reset para nova tentativa
                          awaitingQuiz = false;
                          scene.physics.resume();
                          let _doorTriggered2=false;
                          doorOverlap = scene.physics.add.overlap(player, door, () => {
                            if(awaitingQuiz||_doorTriggered2||invuln) return;
                            _doorTriggered2=true;
                            try{ scene.physics.world.removeCollider(doorOverlap); doorOverlap=null; }catch{}
                            tryOpenDoor(scene);
                          }, null, scene);
                        }
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  // Frases motivacionais por nível — mostradas na transição de entrada
  const LEVEL_ENTRY_PHRASES = [
    "Celebra os teus direitos! 🎈",
    "Conheces os teus direitos? 📜",
    "A Convenção protege-te! 🌍",
    "Brincar é um direito! 🧸",
    "Aprender abre o mundo! 📚",
    "A saúde é um tesouro! 💊",
    "Ninguém te pode magoar! 🛡️",
    "A tua voz importa! 🗣️",
    "O futuro começa já! 🌱",
    "A UNICEF está do teu lado! 🌍",
    "O teu nome é único! 🪪",
    "A família é o teu porto! 👨‍👩‍👧",
    "Todos merecem um lar seguro! ✈️",
    "Crianças não trabalham — brincam! ⚠️",
    "Expressa-te livremente! 🗣️",
    "A tua privacidade é sagrada! 🔒",
    "Cada cultura é um tesouro! 🌍",
    "Inclusão é para todos! 🏃",
    "Cuida do planeta! 🌱",
    "Os teus direitos existem online! 💻"
  ];

  function playLevelTransition(scene, nextIdx, onMidpoint){
    const nextL = LEVELS[nextIdx];
    if(!nextL){ onMidpoint?.(); return; }

    const ov    = document.getElementById("levelTransitionOverlay");
    const panel = document.getElementById("levelTransitionPanel");
    const elNum    = document.getElementById("ltNum");
    const elTitle  = document.getElementById("ltTitle");
    const elPhrase = document.getElementById("ltPhrase");
    const elName   = document.getElementById("ltName");
    if(!ov){ onMidpoint?.(); return; }

    // Cor do céu do nível seguinte
    const T      = THEMES[nextL.theme] || THEMES[0];
    const topHex = T.skyTop;
    const botHex = T.skyBot;
    const topR=(topHex>>16)&0xff, topG=(topHex>>8)&0xff, topB=topHex&0xff;
    const botR=(botHex>>16)&0xff, botG=(botHex>>8)&0xff, botB=botHex&0xff;
    const midR=Math.round((topR+botR)/2), midG=Math.round((topG+botG)/2), midB=Math.round((topB+botB)/2);
    const brightness = 0.299*midR + 0.587*midG + 0.114*midB;
    const isDark = brightness < 110;

    const topCss = `rgb(${topR},${topG},${topB})`;
    const botCss = `rgb(${botR},${botG},${botB})`;
    const textCol  = isDark ? "#ffd700" : "#1a0040";
    const subCol   = isDark ? "#ffe0b0" : "#3a0868";
    const nameCol  = isDark ? "#fff5e0" : "#200050";
    const numCol   = isDark ? "rgba(255,215,0,0.80)" : "rgba(40,0,80,0.65)";
    const borderCol= isDark ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.45)";

    // Aplicar estilos dinâmicos
    ov.style.background    = `linear-gradient(180deg, ${topCss} 0%, ${botCss} 100%)`;
    panel.style.borderColor = borderCol;
    panel.style.background  = isDark ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.18)";

    elNum.style.color    = numCol;
    elNum.textContent    = `Nível ${nextIdx+1} / ${LEVELS.length}`;
    elTitle.style.color  = textCol;
    elTitle.textContent  = nextL.name.replace(/^Nível \d+\s*[—–-]\s*/, "");
    elPhrase.style.color = subCol;
    elPhrase.textContent = LEVEL_ENTRY_PHRASES[nextIdx] || "Vai em frente! 🎈";
    elName.style.color   = nameCol;
    elName.textContent   = playerName ? `✨ Vai, ${playerName}! ✨` : "✨ Vai lá! ✨";

    // Mostrar overlay com fade-in CSS
    ov.style.opacity   = "0";
    ov.style.display   = "flex";
    ov.style.transition= "opacity 0.30s ease";
    ov.style.cursor    = "pointer";
    requestAnimationFrame(()=>{ ov.style.opacity = "1"; });

    // Carregar o nível a meio da transição (invisível) — acontece rapidamente
    const midTimer = setTimeout(()=>{ onMidpoint?.(); }, 350);

    // Função que esconde o painel (partilhada entre timeout e clique)
    let hidden = false;
    function hidePanel() {
      if (hidden) return;
      hidden = true;
      ov.style.cursor = "";
      ov.removeEventListener("click", hidePanel);
      ov.style.opacity = "0";
      setTimeout(()=>{ ov.style.display = "none"; }, 320);
    }

    // Manter visível 3,2 s — tempo suficiente para uma criança ler
    // Toque/clique em qualquer sítio do painel avança imediatamente
    const hideTimer = setTimeout(hidePanel, 3200);
    ov.addEventListener("click", hidePanel);

    // Guardar timers para poder cancelar se necessário
    ov._midTimer  = midTimer;
    ov._hideTimer = hideTimer;
  }

  function nextLevel(scene){
    const next=currentLevel+1;
    // Cancelar timers da porta antes da transição — evita watchdog disparar no nível seguinte
    if(_doorWatchdogTimer){ try{_doorWatchdogTimer.remove(false);}catch{} _doorWatchdogTimer=null; }
    if(_landingCheckTimer){ try{_landingCheckTimer.remove(false);}catch{} _landingCheckTimer=null; }
    // Garantir robot invisível ANTES de fechar o quiz overlay
    scene.tweens.killTweensOf(player);
    player.setAlpha(0);
    player.setVelocity(0,0);
    if(door) door.setAlpha(0);
    quizOverlay.classList.add("hidden"); btnCloseQuiz.classList.add("hidden");
    // Manter awaitingQuiz=true durante TODA a transição — o loadLevel trata de o resetar.
    // Se fosse false aqui, havia uma janela de ~750ms em que o jogador (invisível mas com
    // corpo físico ativo) podia ser atingido por um vilão e perder uma vida indevidamente.
    awaitingQuiz=true;
    scene.physics.pause();

    if(livesLostThisLevel===0){
      score+=50; bonusStars.textContent="⭐⭐⭐\n+50 Nível Perfeito!";
      bonusStars.classList.add("show"); setTimeout(()=>bonusStars.classList.remove("show"),2000);
    }
    livesLostThisLevel=0;

    setTimeout(()=>{
      if(next>=LEVELS.length){scene.physics.resume();showVictoryScreen(scene);return;}
      score+=100; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;
      playLevelTransition(scene,next,()=>{
        loadLevel(scene,next);
        showHistory(next,()=>{
          if(!pausedByTeacher) scene.physics.resume();
        });
      });
      saveGame();
    },750);
  }

  function showGameOver(){
    try{sceneRef.physics.pause();}catch{}
    awaitingQuiz=true; touch.left=touch.right=touch.jump=false;
    try{player.setVelocity(0,0);}catch{}
    ensureAudio(); SFX.gameOver();
    document.getElementById("gameOverOverlay").classList.remove("hidden");
  }

  function robotDance(scene,done){
    if(!player||!scene){done?.();return;}
    const camX=scene.cameras.main.scrollX;
    player.setPosition(camX + scene.scale.width / 2, 455);
    player.setVelocity(0,0);
    player.setFlipX(false); player.setAngle(0); player.setScale(1);
    // Danca mais energica — rotacao rapida + saltos + crescer
    const t1=scene.tweens.add({targets:player,angle:{from:-22,to:22},duration:80,yoyo:true,repeat:70});
    const t2=scene.tweens.add({targets:player,y:{from:455,to:410},duration:130,yoyo:true,repeat:46});
    const t3=scene.tweens.add({targets:player,scaleX:{from:1,to:1.35},scaleY:{from:1,to:1.35},duration:600,yoyo:true,repeat:5,ease:"Sine.easeInOut"});
    // Fogos de artificio Phaser — rafagas periodicas
    function burst(){
      if(!scene||!scene.add) return;
      const bx=(camX+Math.random()*scene.scale.width);
      const by=60+Math.random()*300;
      const colors=[0xffd700,0xff6b35,0xff80c0,0x80d0ff,0xa0ff80,0xffffff,0xd0a0ff];
      const p=scene.add.particles(0,0,"spark_item",{
        x:bx,y:by,speed:{min:80,max:260},lifespan:600,quantity:28,
        scale:{start:1.3,end:0},gravityY:-40,
        angle:{min:0,max:360},tint:colors
      });
      scene.time.delayedCall(500,()=>p.destroy());
    }
    // Disparar fogos a cada 400ms durante toda a danca
    const fireInterval=scene.time.addEvent({delay:400,loop:true,callback:burst});
    burst(); // primeiro imediatamente
    scene.time.delayedCall(9500,()=>{
      try{t1.stop();t2.stop();t3.stop();fireInterval.remove();}catch{}
      player.setAngle(0);player.setScale(1);player.y=455;done?.();
    });
  }

  function startConfetti(durationMs=5000){
    const el=document.getElementById("confetti"); if(!el) return;
    el.classList.remove("hidden"); el.innerHTML="";
    const emojis=["🎈","✨","⭐","🌟","🧸","🎁","🎊","🎉","🏆","🎀","🌈","💫","🥳","🎆","🎇","🪅","🏅","🎵","🎶","❤️","🌺","🦋","🐝"];
    const vw=Math.max(320,window.innerWidth||800);
    // Muito mais confetis na vitoria final
    const isMobile=window.matchMedia("(max-width:768px)").matches;
    const confettiCount=isMobile?180:400;
    for(let i=0;i<confettiCount;i++){
      const s=document.createElement("span");
      s.textContent=emojis[i%emojis.length];
      s.style.left=(Math.random()*vw)+"px";
      // Tamanhos variados para profundidade visual
      const sz=12+Math.floor(Math.random()*20);
      s.style.fontSize=sz+"px";
      s.style.animationDuration=(1.8+Math.random()*4.5)+"s";
      s.style.animationDelay=(Math.random()*3.5)+"s";
      s.style.opacity=(0.75+Math.random()*0.25).toFixed(2);
      el.appendChild(s);
    }
    setTimeout(()=>{el.classList.add("hidden");el.innerHTML="";},durationMs);
  }

  function showVictoryScreen(scene){
    try{scene.physics.pause();}catch{}
    awaitingQuiz=true;
    touch.left=touch.right=touch.jump=false;
    ensureAudio(); SFX.finalWin(); startConfetti(28000);
    robotDance(scene,()=>{
      const pct=quizStats.total?Math.round((quizStats.correct/quizStats.total)*100):0;
      let medal="🥉 Bronze — missão concluída!";
      if(pct>=70) medal="🥈 Prata — muito bem!";
      if(pct>=90) medal="🥇 Ouro — excelente!";
      const master=(!quizStats.everWrong&&quizStats.total>0)?" 🌟 Defensor Perfeito dos Direitos!":"";
      document.getElementById("winPlayerName").textContent=playerName||"Herói das Crianças";
      document.getElementById("winScore").textContent=score;
      document.getElementById("winPct").textContent=`${quizStats.correct}/${quizStats.total} (${pct}%)`;
      document.getElementById("winMedal").textContent=medal+master;

      // ── Tabela de erros por tema ──────────────────────────────────
      const THEME_LABELS = {
        historia:"O Dia da Criança",declaracao:"Declaração de 1959",
        convencao:"Convenção de 1989",brincar:"Direito ao Brincar",
        educacao:"Direito à Educação",saude:"Direito à Saúde",
        protecao:"Direito à Proteção",participacao:"Participação",
        futuro:"Futuro Sustentável",unicef:"UNICEF",
        identidade:"Identidade",familia:"Família",
        refugiados:"Refugiados",trabalho:"Trabalho Infantil",
        expressao:"Expressão",privacidade:"Privacidade",
        cultura:"Cultura",deficiencia:"Inclusão",
        ambiente:"Ambiente",digital:"Mundo Digital"
      };
      const winThemeErrors = document.getElementById("winThemeErrors");
      const winThemeTable  = document.getElementById("winThemeTable");
      const hasThemeErrors = Object.keys(quizStats.errorsByTheme).length > 0;
      if(winThemeErrors && winThemeTable) {
        if(hasThemeErrors){
          winThemeErrors.style.display = "block";
          winThemeTable.innerHTML = "";
          // Cabeçalho
          const hdr = document.createElement("tr");
          hdr.innerHTML = `
            <th style="text-align:left;padding:3px 6px;border-bottom:1px solid rgba(255,215,0,0.3);color:#ffd700;font-size:11px;">Tema</th>
            <th style="text-align:center;padding:3px 6px;border-bottom:1px solid rgba(255,215,0,0.3);color:#ffd700;font-size:11px;">Erros</th>
            <th style="text-align:center;padding:3px 6px;border-bottom:1px solid rgba(255,215,0,0.3);color:#ffd700;font-size:11px;width:80px;">Resultado</th>`;
          winThemeTable.appendChild(hdr);
          // Ordenar por nº de erros (mais erros primeiro)
          const sorted = Object.entries(quizStats.errorsByTheme).sort((a,b)=>b[1]-a[1]);
          sorted.forEach(([theme, count]) => {
            const tr = document.createElement("tr");
            const bar = "🟥".repeat(Math.min(count,5)) + (count>5?` +${count-5}`:"");
            const label = THEME_LABELS[theme] || theme;
            const bg = count >= 3 ? "rgba(255,80,50,0.10)" : count === 2 ? "rgba(255,160,50,0.08)" : "transparent";
            tr.innerHTML = `
              <td style="padding:4px 6px;background:${bg};border-radius:4px 0 0 4px;">${label}</td>
              <td style="text-align:center;padding:4px 6px;background:${bg};font-weight:700;color:${count>=3?"#ff6050":count===2?"#ffaa40":"#a0ffb0"};">${count}</td>
              <td style="text-align:left;padding:4px 6px;background:${bg};border-radius:0 4px 4px 0;letter-spacing:1px;">${bar}</td>`;
            winThemeTable.appendChild(tr);
          });
        } else {
          winThemeErrors.style.display = "none";
        }
      }

      // ── Lista detalhada das perguntas erradas ─────────────────────
      const winErrors=document.getElementById("winErrors");
      const winErrorList=document.getElementById("winErrorList");
      if(winErrors&&winErrorList){
        if(quizStats.errors&&quizStats.errors.length>0){
          winErrors.style.display="block"; winErrorList.innerHTML="";
          quizStats.errors.forEach(e=>{
            const li=document.createElement("li");
            li.innerHTML=`<strong>${e.level}:</strong> ${e.q} <span style="color:#ff8050">→ "${e.wrong}"</span>`;
            winErrorList.appendChild(li);
          });
        } else { winErrors.style.display="none"; }
      }
      document.getElementById("winOverlay").classList.remove("hidden");

      // ── Botão Modo Revisão ────────────────────────────────────────
      const btnReview = document.getElementById("btnReviewMode");
      if (btnReview) {
        if (quizStats.errors && quizStats.errors.length > 0) {
          btnReview.style.display = "block";
          btnReview.textContent = `📋 Rever ${quizStats.errors.length} pergunta${quizStats.errors.length>1?"s":""} errada${quizStats.errors.length>1?"s":""}`;
          btnReview.onclick = () => {
            const reviewList = document.getElementById("reviewList");
            if (reviewList) {
              reviewList.innerHTML = "";
              quizStats.errors.forEach((e, i) => {
                const pool = QUIZ_BY_THEME[e.theme] || [];
                const orig = pool.find(q => q.q === e.q);
                const exp = orig?.exp || "";
                const art = QUIZ_ARTICLE[e.theme];
                const div = document.createElement("div");
                div.className = "review-question";
                div.innerHTML = `
                  ${art ? `<div style="margin-bottom:5px;"><span class="quiz-article-badge">📜 ${art}</span></div>` : ""}
                  <div class="review-question-text">${i+1}. ${e.level} — ${e.q}</div>
                  <div class="review-wrong">❌ A tua resposta: <strong>${e.wrong}</strong></div>
                  <div class="review-correct">✅ Resposta certa: <strong>${e.correct}</strong></div>
                  ${exp ? `<div class="review-explanation">💡 ${exp}</div>` : ""}
                `;
                reviewList.appendChild(div);
              });
            }
            document.getElementById("reviewOverlay").classList.remove("hidden");
          };
        } else {
          btnReview.style.display = "none";
        }
      }
      const btnCloseReview = document.getElementById("btnCloseReview");
      if (btnCloseReview) {
        btnCloseReview.onclick = () => document.getElementById("reviewOverlay").classList.add("hidden");
      }
    });
  }

  function showQuiz(quiz,done,isRetry){
    quizOverlay.classList.remove("hidden");
    const _qTheme = LEVELS[currentLevel]?.quizTheme;
    const _article = QUIZ_ARTICLE[_qTheme];
    const _badgeHTML = _article ? `<span class="quiz-article-badge">📜 ${_article}</span><br>` : "";
    quizQuestion.innerHTML = _badgeHTML + (isRetry ? "🔄 Segunda tentativa! " : "") + quiz.q;
    quizAnswers.innerHTML=""; quizFeedback.textContent=""; quizFeedback.style.color="#ff6b35";
    quizExplanation.textContent=""; quizExplanation.classList.add("hidden");
    // Limpar sempre o btnCloseQuiz ao abrir nova pergunta — evita cliques acidentais
    btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;

    const correct=quiz.a.filter(x=>x.ok), wrong=quiz.a.filter(x=>!x.ok);
    for(let i=wrong.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[wrong[i],wrong[j]]=[wrong[j],wrong[i]];}
    const opts=[...correct.slice(0,1),...wrong.slice(0,2)];
    for(let i=opts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[opts[i],opts[j]]=[opts[j],opts[i]];}

    let answered=false;
    opts.forEach(ans=>{
      const b=document.createElement("button");
      b.className="btn"; b.textContent=ans.t;
      b.setAttribute("aria-label",`Resposta: ${ans.t}`);
      b.onclick=()=>{
        if(answered) return; answered=true;
        ensureAudio(); if(!isRetry) quizStats.total+=1;

        quizAnswers.querySelectorAll(".btn").forEach(btn=>{
          btn.disabled=true;
          if(btn.textContent===correct[0].t){
            btn.style.background="rgba(20,80,20,0.75)";
            btn.style.borderColor="#4caf50";
            btn.style.color="#b8ffb8";
          } else if(btn===b&&!ans.ok){
            btn.style.background="rgba(100,20,20,0.75)";
            btn.style.borderColor="#c0392b";
            btn.style.color="#ffb8b8";
          } else { btn.style.opacity="0.35"; }
        });

        if(ans.ok){
          quizStats.correct+=1;
          btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;
          quizFeedback.textContent=isRetry?"✅ Conseguiste na segunda tentativa! 💪":"✅ Muito bem!";
          quizFeedback.style.color="#208050";
          SFX.coin();
          // Mostrar SEMPRE: explicação do quiz E/OU dica do tema
          const tipFact = QUIZ_TIPS[LEVELS[currentLevel]?.quizTheme] || "";
          const expText = quiz.exp ? "💡 " + quiz.exp : "";
          const combined = expText || (tipFact ? "📌 Recorda: " + tipFact : "");
          if(combined){
            quizExplanation.textContent = combined;
            quizExplanation.classList.remove("hidden");
            btnCloseQuiz.classList.remove("hidden");
            btnCloseQuiz.textContent = "Continuar ▶";
            btnCloseQuiz.onclick=()=>{
              btnCloseQuiz.classList.add("hidden"); btnCloseQuiz.onclick=null;
              // Esconder robot ANTES de fechar o overlay
              if(sceneRef&&player){ sceneRef.tweens.killTweensOf(player); player.setAlpha(0); }
              quizOverlay.classList.add("hidden"); done(true);
            };
          } else {
            setTimeout(()=>{
              // Esconder robot ANTES de fechar o overlay
              if(sceneRef&&player){ sceneRef.tweens.killTweensOf(player); player.setAlpha(0); }
              quizOverlay.classList.add("hidden"); done(true);
            },900);
          }
        } else {
          quizStats.everWrong=true; SFX.hit();
          if(sceneRef&&player){sceneRef.tweens.add({targets:player,angle:{from:-10,to:10},duration:80,yoyo:true,repeat:4,ease:"Sine.easeInOut",onComplete:()=>{if(player)player.setAngle(0);}});}

          quizStats.errors=quizStats.errors||[];
          if(!isRetry) {
            const qTheme = LEVELS[currentLevel]?.quizTheme || "historia";
            quizStats.errors.push({level:LEVELS[currentLevel]?.name||`Nível ${currentLevel+1}`,theme:qTheme,q:quiz.q,wrong:ans.t,correct:correct[0].t});
            quizStats.errorsByTheme[qTheme] = (quizStats.errorsByTheme[qTheme]||0) + 1;
          }
          if(quiz.exp){quizExplanation.textContent="💡 "+quiz.exp;quizExplanation.classList.remove("hidden");}
          const tip=QUIZ_TIPS[LEVELS[currentLevel]?.quizTheme]||"";
          quizFeedback.textContent="❌ Quase! A resposta certa era: "+correct[0].t+"\nTenta outra pergunta!";
          if(tip) quizFeedback.textContent+=`\n💡 Lembra-te: ${tip}`;
          quizFeedback.style.color="#e84d10";
          btnCloseQuiz.classList.remove("hidden"); btnCloseQuiz.textContent="🔄 Tentar outra pergunta";
          btnCloseQuiz.onclick=()=>{
            btnCloseQuiz.classList.add("hidden");
            showQuiz(pickQuizForLevel(currentLevel,LEVELS[currentLevel].quizTheme),done,true);
          };
        }
      };
      quizAnswers.appendChild(b);
    });
  }

  // ===== Itens =====
  const ITEM_LABELS={
    estrela:    {label:"⭐ STAR POWER! 8s",      color:"#ffd700"},
    balao:      {label:"🍭 Chupa-chupa +10",    color:"#e0209a"},
    brinquedo:  {label:"🧸 Brinquedo +10",      color:"#a050ff"},
    medalha:    {label:"🛡️ Escudo! PROTEGIDO",  color:"#ffd700"},
    duplosalto: {label:"🦅 Duplo Salto! 10s",   color:"#80d0ff"},
    heart:      {label:"❤️ +1 Vida!",           color:"#e84d10"}
  };

  // Cores das partículas por tipo de item
  const ITEM_TINTS={
    estrela:    [0xffd700, 0xffe980, 0xffffff, 0xff6b35],
    balao:      [0xe0209a, 0xff80c0, 0xffd700, 0x9030e0],
    brinquedo:  [0xa050ff, 0xff80c0, 0xffd700, 0xffffff],
    medalha:    [0xffd700, 0xffe980, 0xffffff, 0xff9500],
    duplosalto: [0x80d0ff, 0xffffff, 0xffd700, 0xa0e8ff],
    heart:      [0xff2040, 0xff6080, 0xffffff, 0xe84d10]
  };

  function onCollectItem(playerObj,itemObj){
    if(awaitingQuiz) return;
    const kind=itemObj.getData("kind");
    const idx=itemObj.getData("itemIdx");
    const secretBonus = itemObj.getData("secretPoints") || 0;
    if(idx !== undefined && idx >= 0) collectedItemIndices.add(idx);
    itemObj.destroy();
    const totalPoints = 10 + secretBonus;
    score += totalPoints; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;
    if(kind!=="heart"&&kind!=="medalha"){ itemsCollected=Math.min(itemsCollected+1,itemsTotal); itemCountText.setText(`⭐ Itens: ${itemsCollected}/${itemsTotal}`); }
    const lbl=ITEM_LABELS[kind]||{label:"+10 ⭐",color:"#ff6b35"};
    showFloat(sceneRef,playerObj.x,playerObj.y-68,lbl.label,lbl.color);
    if(Math.random()<0.35) showFloat(sceneRef,playerObj.x,playerObj.y-100,pickPraise(),"#ffd700");
    ensureAudio(); SFX.coin();
    // Burst de partículas com cores específicas por tipo
    const tint = ITEM_TINTS[kind] || [0xffd700,0xff6b35,0xffffff,0xa0ff80];
    const qty  = kind==="medalha" ? 22 : kind==="heart" ? 18 : 14;
    const p=sceneRef.add.particles(0,0,"spark_item",{x:playerObj.x,y:playerObj.y,speed:{min:60,max:190},lifespan:420,quantity:qty,scale:{start:1.1,end:0},gravityY:380,tint});
    sceneRef.time.delayedCall(300,()=>p.destroy());
    if(kind==="medalha"){givePower(sceneRef);tipText.setText("🛡️ ESCUDO ATIVO: VanBerto's está protegido e aumentado!");}
    if(kind==="duplosalto"){giveDoubleJump(sceneRef);}
    if(kind==="estrela"){giveStarPower(sceneRef);}
    if(kind==="heart"){
      if(lives<MAX_LIVES){
        lives+=1; updateHearts(); ensureAudio(); SFX.life();
        tipText.setText("❤️ Ganhaste uma vida extra!");
        if(heartsGfx&&sceneRef) sceneRef.tweens.add({targets:heartsGfx,scaleX:{from:1,to:1.25},scaleY:{from:1,to:1.25},duration:140,yoyo:true,repeat:1,ease:"Back.easeOut"});
      } else { showFloat(sceneRef,playerObj.x,playerObj.y-100,"❤️ MÁXIMO!","#e84d10"); }
    }
    saveGame();
  }

  function onHitMalware(playerObj, malwareObj){
    if(invuln||awaitingQuiz) return;

    // ── STAR POWER: atropela o vilão ─────────────────────────────
    if(starPower && malwareObj && malwareObj.active){
      ensureAudio();
      beep({freq:600,dur:0.05,type:"square",vol:0.07,slideTo:200});
      // Explosão no sítio do vilão
      const ex=sceneRef.add.particles(0,0,"spark_item",{
        x:malwareObj.x, y:malwareObj.y,
        speed:{min:80,max:240}, angle:{min:0,max:360},
        lifespan:380, quantity:18, scale:{start:1.1,end:0}, gravityY:200,
        tint:[0xffd700,0xff6b35,0xff0000,0xffffff]
      });
      sceneRef.time.delayedCall(280,()=>ex.destroy());
      sceneRef.cameras.main.shake(100,0.006);
      score+=50; scoreText.setText(`🌟 Pontos: ${score}`); _hudDirty=true;
      showFloat(sceneRef,malwareObj.x,malwareObj.y-50,"💥 +50","#ff6b35");
      // Destruir o vilão (com respawn depois de 4s, como os outros)
      malwareObj.setActive(false).setVisible(false);
      malwareObj.body.setEnable(false);
      const _cs=_critterSession;
      sceneRef.time.delayedCall(4000,()=>{
        if(_cs!==_critterSession||!malwareObj) return;
        malwareObj.setPosition(malwareObj.getData("originX")||malwareObj.x,
                               malwareObj.getData("originY")||malwareObj.y);
        malwareObj.setActive(true).setVisible(true);
        malwareObj.body.setEnable(true);
        // Proteger o jogador por 1s se estiver perto do ponto de respawn
        if(player && !invuln){
          const ox = malwareObj.getData("originX") || malwareObj.x;
          const oy = malwareObj.getData("originY") || malwareObj.y;
          if(Math.hypot(player.x-ox, player.y-oy) < 140) setInvuln(sceneRef, 1000);
        }
      });
      return;
    }

    ensureAudio(); SFX.hit();
    hitFlash.classList.add("active"); setTimeout(()=>hitFlash.classList.remove("active"),200);

    // ── Knockback visual ──────────────────────────────────────
    // Direção oposta ao vilão; se não há referência usa esquerda
    const knockDir = (malwareObj && malwareObj.x < playerObj.x) ? 1 : -1;
    player.setVelocityX(knockDir * 320);
    player.setVelocityY(-340);
    sceneRef.cameras.main.shake(180, 0.009);
    // Flash vermelho no player + giro
    sceneRef.tweens.add({
      targets: player,
      angle: { from: knockDir * -25, to: knockDir * 25 },
      duration: 80, yoyo: true, repeat: 2,
      ease: "Sine.easeInOut",
      onComplete: () => { if(player) player.setAngle(0); }
    });
    // ─────────────────────────────────────────────────────────

    if(powered){clearPower(sceneRef);setInvuln(sceneRef,800);tipText.setText("🛡️ Escudo usado! Cuidado.");return;}
    lives-=1; updateHearts(); livesLostThisLevel++; _hudDirty=true;
    if(heartsGfx&&sceneRef) sceneRef.tweens.add({targets:heartsGfx,x:{from:-4,to:4},duration:60,yoyo:true,repeat:3,ease:"Sine.easeInOut",onComplete:()=>{if(heartsGfx)heartsGfx.x=0;}});
    // Marca invuln imediatamente para bloquear hits durante o voo de knockback
    invuln=true;
    // Após o voo de knockback, teletransportar e iniciar 2s de proteção completa
    sceneRef.time.delayedCall(400, () => {
      if(!player) return;
      const L=LEVELS[currentLevel];
      touch.left=touch.right=touch.jump=false;
      player.setVelocity(0,0); player.setPosition(L.spawn.x,L.spawn.y); snapPlayerToGround();
      if(lives<=0){showGameOver();return;}
      // Iniciar invulnerabilidade de 2s a partir do spawn (não do hit)
      setInvuln(sceneRef, 2000);
      // Flash de "reaparecimento" — círculo de luz no spawn
      const spawnFlash = sceneRef.add.graphics().setDepth(10);
      spawnFlash.fillStyle(0xffffff, 0.7);
      spawnFlash.fillCircle(L.spawn.x, L.spawn.y, 30);
      sceneRef.tweens.add({ targets: spawnFlash, alpha: 0, scaleX: 2.5, scaleY: 2.5,
        duration: 400, ease: "Quad.easeOut",
        onComplete: () => spawnFlash.destroy() });
      tipText.setText("⚡ Protegido por 2s!");
    });
    if(lives<=0) return; // evitar correr o resto se já vai para game over
    // Ao perder uma vida, os itens voltam a aparecer — EXCETO os corações já apanhados
    const heartIndicesCollected = new Set(
      [...collectedItemIndices].filter(idx => LEVELS[currentLevel].items[idx]?.kind === "heart")
    );
    collectedItemIndices.clear();
    heartIndicesCollected.forEach(idx => collectedItemIndices.add(idx));
    const keyMap={
      estrela:"item_estrela",
      balao:"item_chupachupa",
      brinquedo:"item_brinquedo",medalha:"item_medalha",heart:"item_heart",
      duplosalto:"item_duplosalto"
    };
    LEVELS[currentLevel].items.forEach((it,idx)=>{
      if(it.kind==="heart" && heartIndicesCollected.has(idx)) return;
      const exists=itemsGroup.getChildren().some(o=>o.getData("itemIdx")===idx);
      if(exists) return;
      const _km=keyMap[it.kind]; const _key=typeof _km==="function"?_km():(_km||"item_estrela");
      const obj=itemsGroup.create(it.x,it.y,_key);
      obj.setDepth(2);
      sceneRef.tweens.add({targets:obj,y:obj.y-8,duration:940,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
      obj.setData("kind",it.kind);
      obj.setData("itemIdx",idx);
    });
    // Recriar também os escudos extra (itemIdx === -1) se já não existir nenhum no mapa
    const hasExtraShield=itemsGroup.getChildren().some(o=>o.getData("itemIdx")===-1);
    if(!hasExtraShield) spawnShields(sceneRef, LEVELS[currentLevel]);
    saveGame();
  }

  let invulnBlinkEvent=null, invulnEndEvent=null;

  function setInvuln(scene,ms){
    // Cancelar timers anteriores para evitar conflito de alpha
    if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
    if(invulnEndEvent){   invulnEndEvent.remove(false);   invulnEndEvent=null; }

    invuln=true;
    player.setAlpha(1);
    const blinks=Math.floor(ms/160);
    let blinkCount=0;
    invulnBlinkEvent=scene.time.addEvent({
      delay:80,
      repeat:blinks*2,
      callback:()=>{
        blinkCount++;
        // Só pisca se invuln ainda estiver ativo (evita sobrepor o reset final)
        if(!invuln) return;
        if(blinkCount%2===1) player.setAlpha(0.25);
        else player.setAlpha(1);
      }
    });
    invulnEndEvent=scene.time.delayedCall(ms,()=>{
      // Cancelar o blink event primeiro, para garantir que não dispara mais
      if(invulnBlinkEvent){ invulnBlinkEvent.remove(false); invulnBlinkEvent=null; }
      invuln=false;
      player.setAlpha(1);
      player.setScale(powered?1.18:1.0);
      // Só limpar o tint se não houver poder ativo com cor própria
      if(!starPower && !doubleJumpActive) {
        player.clearTint();
      }
      invulnEndEvent=null;
    });
  }

  let poweredCountdownVal=0;
  function givePower(scene){
    powered=true; SFX.power();
    player.clearTint();
    if(powerIndicator) powerIndicator.setText("🛡️ ESCUDO 8s");
    if(poweredTimer) poweredTimer.remove(false);
    if(powerCountdown) powerCountdown.remove(false);
    poweredCountdownVal=8;
    powerCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      poweredCountdownVal--;
      if(powerIndicator) powerIndicator.setText(`🛡️ ESCUDO ${poweredCountdownVal}s`);
      if(poweredCountdownVal<=0){clearPower(scene);}
    }});
    poweredTimer=scene.time.delayedCall(8000,()=>clearPower(scene));
  }
  function clearPower(scene){
    powered=false;
    if(poweredTimer){poweredTimer.remove(false);poweredTimer=null;}
    if(powerCountdown){powerCountdown.remove(false);powerCountdown=null;}
    if(player){
      player.clearTint();
      // Só repõe escala, alpha e mata tweens se não estiver em invuln
      // (mover killTweensOf para dentro evita matar o blink event de invulnerabilidade
      // e deixar o alpha preso em 0.25)
      if(!invuln){
        if(scene&&scene.tweens) scene.tweens.killTweensOf(player);
        player.setScale(1.0); player.setAlpha(1);
      }
    }
    if(powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  let doubleJumpTimer=null, doubleJumpCountdown=null, doubleJumpCountVal=0;
  function giveDoubleJump(scene){
    doubleJumpActive=true; doubleJumpUsed=false;
    ensureAudio(); SFX.power();
    if(powerIndicator) powerIndicator.setText("🦅 DUPLO SALTO 10s");
    if(doubleJumpTimer)    doubleJumpTimer.remove(false);
    if(doubleJumpCountdown) doubleJumpCountdown.remove(false);
    doubleJumpCountVal=10;
    doubleJumpCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      doubleJumpCountVal--;
      if(powerIndicator) powerIndicator.setText(`🦅 DUPLO SALTO ${doubleJumpCountVal}s`);
      if(doubleJumpCountVal<=0) clearDoubleJump(scene);
    }});
    doubleJumpTimer=scene.time.delayedCall(10000,()=>clearDoubleJump(scene));
    tipText.setText("🦅 DUPLO SALTO ATIVO: carrega ↑ novamente no ar!");
  }
  function clearDoubleJump(scene){
    doubleJumpActive=false; doubleJumpUsed=false;
    if(doubleJumpTimer){doubleJumpTimer.remove(false);doubleJumpTimer=null;}
    if(doubleJumpCountdown){doubleJumpCountdown.remove(false);doubleJumpCountdown=null;}
    if(!powered&&powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  // ===== STAR POWER — atropela vilões por 8s =====
  let _starMelodyInterval = null;
  function giveStarPower(scene){
    starPower=true;
    ensureAudio();
    if(powerIndicator) powerIndicator.setText("⭐ STAR POWER 8s");
    tipText.setText("⭐ STAR POWER: atropela os maus!");
    if(starPowerTimer)    starPowerTimer.remove(false);
    if(starPowerCountdown) starPowerCountdown.remove(false);
    // Tocar melodia imediatamente e depois em loop a cada 1520ms (16 notas × 95ms)
    SFX.starMelody();
    if(_starMelodyInterval) clearInterval(_starMelodyInterval);
    _starMelodyInterval = setInterval(()=>{ if(starPower) SFX.starMelody(); }, 1520);
    window._dc_starMelodyInterval = _starMelodyInterval; // exposto para visibilitychange
    starPowerCountVal=8;
    starPowerCountdown=scene.time.addEvent({delay:1000,loop:true,callback:()=>{
      starPowerCountVal--;
      if(powerIndicator) powerIndicator.setText(`⭐ STAR POWER ${starPowerCountVal}s`);
      if(starPowerCountVal<=0) clearStarPower(scene);
    }});
    starPowerTimer=scene.time.delayedCall(8000,()=>clearStarPower(scene));
    // Piscar apenas — sem tint de cor
    if(player) player.clearTint();
  }
  function clearStarPower(scene){
    starPower=false;
    if(starPowerTimer){starPowerTimer.remove(false);starPowerTimer=null;}
    if(starPowerCountdown){starPowerCountdown.remove(false);starPowerCountdown=null;}
    if(_starMelodyInterval){ clearInterval(_starMelodyInterval); _starMelodyInterval=null; }
    window._dc_starMelodyInterval = null;
    if(player){ player.clearTint(); player.setAlpha(1); }
    // Limpar estado visual arco-íris
    if(sceneRef){ sceneRef._starBlinkTimer=0; sceneRef._starColorIdx=0; sceneRef._starTrailTimer=0; }
    if(!powered&&!doubleJumpActive&&powerIndicator) powerIndicator.setText("");
    if(tipText) tipText.setText(currentLevelTip);
  }

  // ===== Touch =====
  function createTouchInput(scene){
    let downAt=0, anyTouchBtnActive=false; const TAP_MS=190;
    const _teacherPanel = document.getElementById("teacherMenuPanel");
    const _isTeacherMenuOpen = () => _teacherPanel && _teacherPanel.classList.contains("open");
    // O toque direto no ecra (swipe) so funciona quando os botoes NAO estao visiveis
    const _canvasTouchAllowed = () => {
      const state = window._dc_touchState || "auto";
      if (state === "on") return false;  // botoes forcados — usar so botoes
      if (state === "off") return true;  // botoes ocultos — usar toque no ecra
      // "auto": verificar se os botoes estao visiveis (touch device portrait)
      const tc = document.getElementById("touchControls");
      return !(tc && getComputedStyle(tc).display !== "none");
    };
    scene.input.on("pointerdown",(p)=>{ensureAudio();if(anyTouchBtnActive||_isTeacherMenuOpen())return;if(!_canvasTouchAllowed())return;downAt=scene.time.now;touch.left=p.x<scene.scale.width/2;touch.right=!touch.left;});
    scene.input.on("pointerup",()=>{if(anyTouchBtnActive||_isTeacherMenuOpen())return;if(!_canvasTouchAllowed()){touch.left=false;touch.right=false;return;}const held=scene.time.now-downAt;touch.left=false;touch.right=false;if(held<=TAP_MS)touch.jump=true;});
    scene.input.on("pointerout",()=>{touch.left=false;touch.right=false;touch.jump=false;});
    const btnL=document.getElementById("btnLeft"),btnR=document.getElementById("btnRight"),btnJ=document.getElementById("btnJump");
    if(btnL&&btnR&&btnJ){
      const activeBtns=new Set(), updateActive=()=>{anyTouchBtnActive=activeBtns.size>0;};
      const press=(btn,action,val)=>{
        const start=(e)=>{e.preventDefault();ensureAudio();touch[action]=val;btn.classList.add("pressed");activeBtns.add(btn.id);updateActive();};
        const end=(e)=>{e.preventDefault();touch[action]=false;btn.classList.remove("pressed");activeBtns.delete(btn.id);updateActive();};
        btn.addEventListener("touchstart",start,{passive:false});btn.addEventListener("touchend",end,{passive:false});btn.addEventListener("touchcancel",end,{passive:false});
        btn.addEventListener("mousedown",start);btn.addEventListener("mouseup",end);btn.addEventListener("mouseleave",end);
      };
      press(btnL,"left",true); press(btnR,"right",true);
      const jumpStart=(e)=>{e.preventDefault();ensureAudio();touch.jump=true;btnJ.classList.add("pressed");activeBtns.add(btnJ.id);updateActive();};
      const jumpEnd=(e)=>{e.preventDefault();touch.jump=false;btnJ.classList.remove("pressed");activeBtns.delete(btnJ.id);updateActive()};
      btnJ.addEventListener("touchstart",jumpStart,{passive:false});btnJ.addEventListener("touchend",jumpEnd,{passive:false});btnJ.addEventListener("touchcancel",jumpEnd,{passive:false});
      btnJ.addEventListener("mousedown",jumpStart);btnJ.addEventListener("mouseup",jumpEnd);btnJ.addEventListener("mouseleave",jumpEnd);
    }
  }

  // ===== Animação VanBerto =====
  function scheduleBlink(scene){
    const blinkOnce=()=>{
      if(!player) return;
      if(player.getData("usingPng")){
        // PNG mode: piscar com fade rápido de alpha (0.85) e scaleY ligeiro
        const origAlpha = player.alpha;
        scene.tweens.add({
          targets: player,
          scaleY: { from: player.scaleY, to: player.scaleY * 0.85 },
          alpha:  { from: origAlpha, to: Math.max(0.7, origAlpha - 0.15) },
          duration: 60, yoyo: true,
          onComplete: () => { if(player) player.setAlpha(origAlpha); }
        });
      } else {
        player.setTexture("vanberto_blink");
        scene.time.delayedCall(120,()=>{if(player)applyVanBertoTexture(scene);});
      }
      scene.time.delayedCall(2200+Math.floor(Math.random()*2600),blinkOnce);
    };
    scene.time.delayedCall(1800,blinkOnce);
  }

  function applyVanBertoTexture(scene){
    if(!player||!player.body) return;
    if(awaitingQuiz||!startOverlay.classList.contains("hidden")||!historyOverlay.classList.contains("hidden")){
      if(player.getData("usingPng")){
        // PNG: estado parado — mostrar sem inclinação
        if(!invuln) { player.setScale(powered ? 1.18 : 1.0); }
      } else {
        if(player.texture.key!=="vanberto_open") player.setTexture("vanberto_open");
      }
      return;
    }
    const onGround=!!player.body.blocked.down, moving=Math.abs(player.body.velocity.x)>5;

    if(player.getData("usingPng")){
      // PNG mode: animar com squash/stretch e bob vertical
      const baseScale = powered ? 1.18 : 1.0;
      const displayW = 72 * baseScale;
      const displayH = 72 * baseScale;
      if(onGround && moving){
        // Bob de andar — passo alternado a cada 140ms com squash/stretch suave
        const step = Math.floor(scene.time.now / 140) % 4;
        // 4 fases: 0=neutro, 1=comprime (foot down), 2=neutro, 3=estica (push off)
        const bobY  = [0, 3, 0, -4][step];
        const scaleX = [1.0, 1.08, 1.0, 0.93][step];
        const scaleY = [1.0, 0.92, 1.0, 1.09][step];
        if(!invuln){
          player.setDisplaySize(displayW * scaleX, displayH * scaleY);
        }
        // Deslocar o sprite ligeiramente para cima/baixo no bob
        // (usamos a posição Y base + bobY — só visual, não afeta body)
        player.y += bobY * 0.15; // suave, não o frame inteiro
      } else if(onGround){
        // Parado — animar respiração leve
        const breathe = 0.5 + Math.sin(scene.time.now * 0.002) * 0.5;
        const scaleXb = 1.0 + breathe * 0.012;
        const scaleYb = 1.0 - breathe * 0.010;
        if(!invuln) player.setDisplaySize(displayW * scaleXb, displayH * scaleYb);
      } else {
        // No ar — esticar ligeiramente na vertical
        const vy = player.body.velocity.y;
        const stretch = vy < 0 ? 1.10 : (vy > 200 ? 0.88 : 1.0);
        const squeeze = vy < 0 ? 0.90 : (vy > 200 ? 1.12 : 1.0);
        if(!invuln) player.setDisplaySize(displayW * squeeze, displayH * stretch);
      }
    } else {
      // Canvas mode — comportamento original
      if(onGround&&moving){
        const step=Math.floor(scene.time.now/140)%2;
        const tex=step===0?"vanberto_walk1":"vanberto_walk2";
        if(player.texture.key!==tex) player.setTexture(tex);
      } else { if(player.texture.key!=="vanberto_open") player.setTexture("vanberto_open"); }
    }
  }

  // ===== TEXTURAS =====

  function rrPath(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
    ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
    ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
    ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
    ctx.closePath();
  }
  function makeTextures(scene){
    makePlatformTexture(scene);
    makeDoorTexture(scene);
    makeVilaosTextures(scene);
    makeSparkTexture(scene);
    makeItemTextures(scene);
    makeVanBertoTexture(scene,"vanberto_open",false,-1);
    makeVanBertoTexture(scene,"vanberto_blink",true,-1);
    makeVanBertoTexture(scene,"vanberto_walk1",false,0);
    makeVanBertoTexture(scene,"vanberto_walk2",false,1);
  }

  // Plataforma colorida estilo cartoon
  function makePlatformTexture(scene){
    if(scene.textures.exists("platform_grass")) return;
    makePlatformTextureThemed(scene,"platform_grass",0);
  }

  // Gera uma textura de plataforma para cada tema
  const PLAT_COLORS=[
    [0x0d3878,0x1e5cb8,0x6aa8ff], // tema0 azul rico
    [0x6a1800,0xc04018,0xff8850], // tema1 crepúsculo
    [0x004858,0x0090a0,0x60e8f0], // tema2 aqua profundo
    [0x780840,0xc03070,0xffa0c8], // tema3 rosa
    [0x200060,0x4810a0,0xc080ff], // tema4 lilás noturno
    [0x003a3a,0x008888,0x40e8e0], // tema5 turquesa
    [0x6a1800,0xb84010,0xff9050], // tema6 laranja quente
    [0x001040,0x0848a0,0x60b8f8], // tema7 azul noturno
    [0x580020,0xa01060,0xff80b8], // tema8 magenta rico
    [0x081808,0x185c28,0x70d870], // tema9 floresta
    [0x7a4a00,0xd9921a,0xffd86a], // tema10 final dourado
  ];
  function makePlatformTextureThemed(scene, key, themeIdx){
    if(scene.textures.exists(key)) return;
    const [dark, mid, light] = PLAT_COLORS[themeIdx % PLAT_COLORS.length];
    const g=scene.make.graphics({x:0,y:0,add:false});
    // Sombra exterior — mais larga e deslocada para dar profundidade
    g.fillStyle(0x000000,0.40); g.fillRoundedRect(4,25,98,8,4);
    // Corpo principal
    g.fillStyle(dark,1);        g.fillRoundedRect(0,7,100,17,5);
    // Face superior (mais clara)
    g.fillStyle(mid,1);         g.fillRoundedRect(0,0,100,12,5);
    // Brilho suave no topo (efeito vidro)
    g.fillStyle(light,0.35);    g.fillRoundedRect(4,1,92,6,3);
    // Linha de brilho no topo
    g.lineStyle(2,light,0.75);  g.beginPath(); g.moveTo(5,2); g.lineTo(95,2); g.strokePath();
    // Aresta inferior arredondada
    g.fillStyle(dark,1);        g.fillRoundedRect(0,21,100,3,{bl:5,br:5,tl:0,tr:0});
    // Contorno exterior
    g.lineStyle(2.5,dark,1);    g.strokeRoundedRect(0,0,100,24,5);
    // Realce lateral esquerdo (efeito 3D)
    g.lineStyle(1.5,light,0.28); g.beginPath(); g.moveTo(2,6); g.lineTo(2,22); g.strokePath();
    g.generateTexture(key,100,32); g.destroy();
  }

  // Portal de Estrela — fim do nível muito mais apelativo que uma porta
  function makeDoorTexture(scene){
    if(scene.textures.exists("door_party")) return;
    const w=88, h=104, tex=scene.textures.createCanvas("door_party",w,h), ctx=tex.getContext();
    const cx=w/2, cy=h*0.46;

    // ── Aura exterior pulsante (desenhada estaticamente; a animação fica no update) ──
    // Camadas de brilho arco-íris (externas)
    const auras=[
      {r:44, c:"rgba(160,80,255,0.13)"},
      {r:38, c:"rgba(255,107,53,0.16)"},
      {r:33, c:"rgba(255,215,0,0.18)"},
    ];
    auras.forEach(a=>{
      ctx.fillStyle=a.c;
      ctx.beginPath(); ctx.arc(cx,cy,a.r,0,Math.PI*2); ctx.fill();
    });

    // ── Anéis do portal ──
    // Anel 3 — exterior lilás
    const r3g=ctx.createRadialGradient(cx,cy,24,cx,cy,38);
    r3g.addColorStop(0,"rgba(200,120,255,0.0)");
    r3g.addColorStop(0.4,"rgba(200,120,255,0.45)");
    r3g.addColorStop(0.75,"rgba(255,107,53,0.35)");
    r3g.addColorStop(1,"rgba(255,215,0,0.0)");
    ctx.fillStyle=r3g; ctx.beginPath(); ctx.arc(cx,cy,38,0,Math.PI*2); ctx.fill();

    // Anel 2 — intermédio dourado
    const r2g=ctx.createRadialGradient(cx,cy,16,cx,cy,28);
    r2g.addColorStop(0,"rgba(255,215,0,0.0)");
    r2g.addColorStop(0.5,"rgba(255,215,0,0.55)");
    r2g.addColorStop(0.85,"rgba(255,107,53,0.40)");
    r2g.addColorStop(1,"rgba(255,215,0,0.0)");
    ctx.fillStyle=r2g; ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fill();

    // Centro do portal — vórtice azul-ciano profundo
    const vortex=ctx.createRadialGradient(cx-3,cy-3,1,cx,cy,18);
    vortex.addColorStop(0,"#ffffff");
    vortex.addColorStop(0.18,"#c0f0ff");
    vortex.addColorStop(0.42,"#40b8ff");
    vortex.addColorStop(0.70,"#1040d0");
    vortex.addColorStop(0.88,"#060830");
    vortex.addColorStop(1,"#020415");
    ctx.fillStyle=vortex; ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fill();

    // Espirais no vórtice (6 raios curvos brancos)
    ctx.save(); ctx.translate(cx,cy);
    for(let s=0;s<6;s++){
      ctx.save(); ctx.rotate(s*Math.PI/3);
      ctx.strokeStyle="rgba(255,255,255,0.22)"; ctx.lineWidth=1.5;
      ctx.beginPath();
      ctx.moveTo(2,0);
      ctx.bezierCurveTo(6,-4, 10,-2, 14,0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // ── Estrela grande central de 5 pontas ──
    ctx.save(); ctx.translate(cx,cy);
    // Sombra da estrela
    ctx.shadowColor="rgba(255,215,0,0.9)"; ctx.shadowBlur=18;
    const sgr=ctx.createRadialGradient(-1,-2,0,0,0,16);
    sgr.addColorStop(0,"#ffffff");
    sgr.addColorStop(0.3,"#fffbe0");
    sgr.addColorStop(0.6,"#ffd700");
    sgr.addColorStop(1,"#ff9500");
    ctx.fillStyle=sgr;
    ctx.beginPath();
    for(let j=0;j<5;j++){
      const o=Math.PI*2*j/5-Math.PI/2, inn=o+Math.PI/5;
      j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
      ctx.lineTo(Math.cos(inn)*7,Math.sin(inn)*7);
    }
    ctx.closePath(); ctx.fill();
    ctx.shadowBlur=0;
    // Brilho no centro da estrela
    ctx.fillStyle="rgba(255,255,255,0.75)";
    ctx.beginPath(); ctx.arc(-2,-3,4,0,Math.PI*2); ctx.fill();
    ctx.restore();

    // ── Partículas estáticas em redor (pequenas estrelinhas) ──
    const sparks=[
      {x:cx-30,y:cy-28,r:3.5,c:"#ffd700"},{x:cx+32,y:cy-24,r:3,c:"#ff6b35"},
      {x:cx-36,y:cy+8,r:2.5,c:"#ff80c0"},{x:cx+34,y:cy+12,r:2.5,c:"#80d0ff"},
      {x:cx-18,y:cy-40,r:3,c:"#a0ff80"},{x:cx+16,y:cy-42,r:2.5,c:"#c080ff"},
      {x:cx-4, y:cy+44,r:3.5,c:"#ffd700"},{x:cx+22,y:cy+38,r:2,c:"#ff6b35"},
      {x:cx-24,y:cy+36,r:2,c:"#80d0ff"},
    ];
    sparks.forEach(s=>{
      // Mini-estrela de 4 pontas
      ctx.save(); ctx.translate(s.x,s.y);
      ctx.fillStyle=s.c;
      ctx.shadowColor=s.c; ctx.shadowBlur=6;
      ctx.beginPath();
      for(let k=0;k<4;k++){
        const a=k*Math.PI/2-Math.PI/4, inn=a+Math.PI/4;
        k===0?ctx.moveTo(Math.cos(a)*s.r,Math.sin(a)*s.r):ctx.lineTo(Math.cos(a)*s.r,Math.sin(a)*s.r);
        ctx.lineTo(Math.cos(inn)*s.r*0.38,Math.sin(inn)*s.r*0.38);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0;
      ctx.restore();
    });

    // ── Texto de apelo no fundo ──
    ctx.font="bold 11px 'Baloo 2', sans-serif";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillStyle="#ffd700";
    ctx.shadowColor="rgba(0,0,0,0.8)"; ctx.shadowBlur=4;
    ctx.fillText("PORTAL!", cx, h-10);
    ctx.shadowBlur=0;

    tex.refresh();
  }

  // Vilões — muito mais detalhados e com personalidade própria
  function makeVilaosTextures(scene){

    // helper: olhos malvados com sobrancelhas
    function evilEyes(ctx,cx,cy,eyeColor){
      // Sobrancelhas malvadas (mais espessas e inclinadas)
      ctx.strokeStyle="#000"; ctx.lineWidth=3;
      ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx-14,cy-11); ctx.lineTo(cx-4,cy-6); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+14,cy-11); ctx.lineTo(cx+4,cy-6); ctx.stroke();
      // Brancos dos olhos (com sombra)
      ctx.shadowColor="rgba(0,0,0,0.4)"; ctx.shadowBlur=3;
      ctx.fillStyle="#fff";
      ctx.beginPath(); ctx.ellipse(cx-7,cy,5.5,6.5,Math.PI*0.08,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+7,cy,5.5,6.5,-Math.PI*0.08,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      // Íris colorida
      ctx.fillStyle=eyeColor;
      ctx.beginPath(); ctx.ellipse(cx-7,cy+1,3.5,4.5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+7,cy+1,3.5,4.5,0,0,Math.PI*2); ctx.fill();
      // Pupila preta
      ctx.fillStyle="#000";
      ctx.beginPath(); ctx.ellipse(cx-7,cy+2,1.8,2.4,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+7,cy+2,1.8,2.4,0,0,Math.PI*2); ctx.fill();
      // Brilho duplo na pupila (mais realista)
      ctx.fillStyle="rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(cx-8,cy-0.5,1.4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+6,cy-0.5,1.4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.45)";
      ctx.beginPath(); ctx.arc(cx-6,cy+2,0.8,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+8,cy+2,0.8,0,Math.PI*2); ctx.fill();
    }

    // helper: boca malvada com dentes e babas
    function evilMouth(ctx,cx,cy,color, drool=false){
      // Boca aberta (meia-lua)
      ctx.fillStyle="#1a0000";
      ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI); ctx.fill();
      // Língua
      ctx.fillStyle="#cc2244";
      ctx.beginPath(); ctx.ellipse(cx, cy+5, 4, 3, 0, 0, Math.PI*2); ctx.fill();
      // Dentes (4 dentes irregulares)
      ctx.fillStyle="#ffffee";
      ctx.fillRect(cx-9, cy, 4, 6);
      ctx.fillRect(cx-4, cy, 4, 7);
      ctx.fillRect(cx+1, cy, 4, 6);
      ctx.fillRect(cx+6, cy, 4, 5);
      // Contorno da boca
      ctx.strokeStyle=color; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI); ctx.stroke();
      // Babas (detalhe de vilão perigoso)
      if(drool){
        ctx.fillStyle="rgba(200,255,200,0.7)";
        ctx.beginPath(); ctx.moveTo(cx-3,cy+8); ctx.quadraticCurveTo(cx-3,cy+14,cx-2,cy+18); ctx.quadraticCurveTo(cx+0,cy+16,cx+1,cy+8); ctx.fill();
      }
    }

    // ── Vilão Redondo — bola vermelha mais elaborada ──────────────
    if(!scene.textures.exists("vilao_round")){
      const tex=scene.textures.createCanvas("vilao_round",64,64), ctx=tex.getContext();
      const cx=32,cy=32;

      // Sombra no chão
      ctx.fillStyle="rgba(0,0,0,0.22)";
      ctx.beginPath(); ctx.ellipse(cx,cy+26,20,5,0,0,Math.PI*2); ctx.fill();

      // Halo externo para contraste em qualquer fundo
      ctx.shadowColor="rgba(200,0,0,0.60)"; ctx.shadowBlur=10;
      ctx.strokeStyle="rgba(255,255,255,0.90)"; ctx.lineWidth=4.5;
      ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.strokeStyle="rgba(0,0,0,0.30)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

      // Corpo — gradiente esférico rico
      const gr=ctx.createRadialGradient(cx-8,cy-8,2,cx,cy,22);
      gr.addColorStop(0,"#ff7070");
      gr.addColorStop(0.25,"#ee1111");
      gr.addColorStop(0.65,"#bb0000");
      gr.addColorStop(1,"#6a0000");
      ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

      // Padrão de pintas (marcas de perigo — como cogumelo venenoso)
      const spots = [[cx-8,cy-8,4.5],[cx+8,cy-5,3.5],[cx-5,cy+8,4],[cx+10,cy+7,3],[cx+1,cy-13,3]];
      spots.forEach(([px,py,pr])=>{
        ctx.fillStyle="rgba(255,255,255,0.22)";
        ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fill();
        // Borda branca da pinta
        ctx.strokeStyle="rgba(255,255,255,0.15)"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.stroke();
      });

      // Brilho esférico (canto sup. esq.)
      ctx.fillStyle="rgba(255,200,200,0.40)";
      ctx.beginPath(); ctx.ellipse(cx-8,cy-9,10,14,Math.PI*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.25)";
      ctx.beginPath(); ctx.ellipse(cx-10,cy-12,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

      // Contorno final
      ctx.strokeStyle="#6a0000"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.stroke();

      // Cara malvada
      evilEyes(ctx,cx,cy-3,"#ff0000");
      evilMouth(ctx,cx,cy+10,"#8a0000", false);
      tex.refresh();
    }

    // ── Vilão Espinhoso — azul muito mais detalhado ────────────────
    if(!scene.textures.exists("vilao_spike")){
      const tex=scene.textures.createCanvas("vilao_spike",64,64), ctx=tex.getContext();
      const cx=32,cy=34;

      // Sombra
      ctx.fillStyle="rgba(0,0,0,0.20)";
      ctx.beginPath(); ctx.ellipse(cx,cy+22,18,5,0,0,Math.PI*2); ctx.fill();

      // Halo azul exterior
      ctx.shadowColor="rgba(0,80,220,0.55)"; ctx.shadowBlur=10;
      ctx.strokeStyle="rgba(255,255,255,0.88)"; ctx.lineWidth=4.5;
      ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.strokeStyle="rgba(0,0,0,0.28)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

      // Aura azul elétrica
      ctx.fillStyle="rgba(50,100,255,0.18)";
      ctx.beginPath(); ctx.arc(cx,cy,28,0,Math.PI*2); ctx.fill();

      // Espinhos (8 ao redor) — antes do corpo para ficarem por baixo
      ctx.fillStyle="#003090";
      ctx.shadowColor="rgba(0,60,180,0.50)"; ctx.shadowBlur=4;
      for(let si=0;si<8;si++){
        const sa=Math.PI*2*si/8 - Math.PI*0.08;
        const sx1=cx+Math.cos(sa)*20, sy1=cy+Math.sin(sa)*20;
        const sx2=cx+Math.cos(sa)*30, sy2=cy+Math.sin(sa)*30;
        const sxL=cx+Math.cos(sa+0.25)*21, syL=cy+Math.sin(sa+0.25)*21;
        const sxR=cx+Math.cos(sa-0.25)*21, syR=cy+Math.sin(sa-0.25)*21;
        ctx.beginPath(); ctx.moveTo(sx2,sy2); ctx.lineTo(sxL,syL); ctx.lineTo(sxR,syR); ctx.closePath(); ctx.fill();
      }
      ctx.shadowBlur=0;

      // Corpo principal — gradiente azul elétrico
      const gr=ctx.createRadialGradient(cx-7,cy-7,2,cx,cy,21);
      gr.addColorStop(0,"#80b0ff");
      gr.addColorStop(0.30,"#2255ee");
      gr.addColorStop(0.70,"#0030cc");
      gr.addColorStop(1,"#001080");
      ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

      // Padrão de circuitos (linhas azuis brilhantes)
      ctx.strokeStyle="rgba(150,200,255,0.35)"; ctx.lineWidth=1;
      ctx.lineCap="round";
      [[cx-6,cy-10,cx-6,cy-3],[cx-6,cy-3,cx+4,cy-3],[cx+4,cy-3,cx+4,cy+5],
       [cx-12,cy+4,cx-4,cy+4],[cx+6,cy+8,cx+12,cy+2]].forEach(([x1,y1,x2,y2])=>{
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });
      // Nódulos dos circuitos
      ctx.fillStyle="rgba(180,220,255,0.55)";
      [[cx-6,cy-3],[cx+4,cy+5],[cx-4,cy+4]].forEach(([nx,ny])=>{
        ctx.beginPath(); ctx.arc(nx,ny,2,0,Math.PI*2); ctx.fill();
      });

      // Brilho esférico
      ctx.fillStyle="rgba(160,200,255,0.38)";
      ctx.beginPath(); ctx.ellipse(cx-7,cy-8,9,13,Math.PI*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.22)";
      ctx.beginPath(); ctx.ellipse(cx-9,cy-11,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

      // Contorno
      ctx.strokeStyle="#001580"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.stroke();

      evilEyes(ctx,cx,cy-2,"#0044ff");
      evilMouth(ctx,cx,cy+10,"#001080", false);
      tex.refresh();
    }

    // ── Vilão Inseto — verde muito mais elaborado ──────────────────
    if(!scene.textures.exists("vilao_bug")){
      const tex=scene.textures.createCanvas("vilao_bug",64,64), ctx=tex.getContext();
      const cx=32,cy=30;

      // Sombra
      ctx.fillStyle="rgba(0,0,0,0.22)";
      ctx.beginPath(); ctx.ellipse(cx,cy+28,22,6,0,0,Math.PI*2); ctx.fill();

      // Halo verde exterior
      ctx.shadowColor="rgba(0,160,0,0.55)"; ctx.shadowBlur=10;
      ctx.strokeStyle="rgba(255,255,255,0.82)"; ctx.lineWidth=4.5;
      ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.strokeStyle="rgba(0,0,0,0.22)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,25,0,Math.PI*2); ctx.stroke();

      // Corpo principal — gradiente verde rico
      const gr=ctx.createRadialGradient(cx-6,cy-6,2,cx,cy,21);
      gr.addColorStop(0,"#90ff50");
      gr.addColorStop(0.35,"#30b020");
      gr.addColorStop(0.70,"#0d7010");
      gr.addColorStop(1,"#044806");
      ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.fillStyle=gr; ctx.fill();

      // Patas (3 de cada lado, com articulações)
      ctx.strokeStyle="#1a6010"; ctx.lineWidth=2.5; ctx.lineCap="round";
      for(let pi=0;pi<3;pi++){
        const py=cy-5+pi*7;
        // Pata esquerda — 2 segmentos com joelho
        ctx.beginPath(); ctx.moveTo(cx-21,py); ctx.lineTo(cx-28,py-5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx-28,py-5); ctx.lineTo(cx-35,py+4); ctx.stroke();
        // Garra esquerda
        ctx.fillStyle="#064806"; ctx.beginPath(); ctx.arc(cx-35,py+4,3.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="#1a6010"; ctx.lineWidth=1; ctx.stroke();
        // Pata direita
        ctx.strokeStyle="#1a6010"; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.moveTo(cx+21,py); ctx.lineTo(cx+28,py-5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx+28,py-5); ctx.lineTo(cx+35,py+4); ctx.stroke();
        ctx.fillStyle="#064806"; ctx.beginPath(); ctx.arc(cx+35,py+4,3.5,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle="#1a6010"; ctx.lineWidth=1; ctx.stroke();
      }

      // Antenas curvas com bola brilhante
      ctx.strokeStyle="#064806"; ctx.lineWidth=2.5; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx-7,cy-20); ctx.quadraticCurveTo(cx-18,cy-36,cx-11,cy-45); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+7,cy-20); ctx.quadraticCurveTo(cx+18,cy-36,cx+11,cy-45); ctx.stroke();
      // Bolas das antenas com brilho
      ctx.shadowColor="rgba(255,100,50,0.70)"; ctx.shadowBlur=6;
      ctx.fillStyle="#ff5520";
      ctx.beginPath(); ctx.arc(cx-11,cy-45,5.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+11,cy-45,5.5,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle="#c04000"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.arc(cx-11,cy-45,5.5,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx+11,cy-45,5.5,0,Math.PI*2); ctx.stroke();
      // Brilho nas bolas
      ctx.fillStyle="rgba(255,220,180,0.65)";
      ctx.beginPath(); ctx.arc(cx-13,cy-47,2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx+9,cy-47,2,0,Math.PI*2); ctx.fill();

      // Segmentos do abdómen (3 anéis)
      ctx.strokeStyle="rgba(0,80,0,0.45)"; ctx.lineWidth=1.5;
      for(let s=0;s<3;s++){
        ctx.beginPath(); ctx.ellipse(cx,cy-3+s*9,16,3,0,0,Math.PI); ctx.stroke();
      }

      // Brilho esférico
      ctx.fillStyle="rgba(200,255,150,0.28)";
      ctx.beginPath(); ctx.ellipse(cx-7,cy-8,9,13,Math.PI*0.3,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.20)";
      ctx.beginPath(); ctx.ellipse(cx-9,cy-11,5,7,Math.PI*0.3,0,Math.PI*2); ctx.fill();

      // Contorno final
      ctx.strokeStyle="#044806"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(cx,cy,21,0,Math.PI*2); ctx.stroke();

      evilEyes(ctx,cx,cy-2,"#00aa00");
      evilMouth(ctx,cx,cy+10,"#0a5000", true); // babas no inseto — mais assustador!
      tex.refresh();
    }
  } // fim makeVilaosTextures

  function makeSparkTexture(scene){
    if(scene.textures.exists("spark_item")) return;
    const g=scene.make.graphics({x:0,y:0,add:false});
    g.fillStyle(0xffd700,1);
    g.beginPath();
    for(let _i=0;_i<5;_i++){
      const _o=Math.PI*2*_i/5-Math.PI/2, _in=_o+Math.PI/5;
      _i===0?g.moveTo(8+Math.cos(_o)*8,8+Math.sin(_o)*8):g.lineTo(8+Math.cos(_o)*8,8+Math.sin(_o)*8);
      g.lineTo(8+Math.cos(_in)*3,8+Math.sin(_in)*3);
    }
    g.closePath(); g.fillPath();
    g.generateTexture("spark_item",16,16); g.destroy();
  }

  function makeItemTextures(scene){
    // Estrela
    if(!scene.textures.exists("item_estrela")){
      const tex=scene.textures.createCanvas("item_estrela",36,36), ctx=tex.getContext();
      // Sombra escura por baixo para contraste com qualquer fundo
      ctx.fillStyle="rgba(0,0,0,0.35)"; ctx.shadowColor="rgba(0,0,0,0.5)"; ctx.shadowBlur=6;
      ctx.save(); ctx.translate(18,20);
      ctx.beginPath();
      for(let j=0;j<5;j++){
        const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
        j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
        ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
      }
      ctx.closePath(); ctx.fill(); ctx.restore(); ctx.shadowBlur=0;
      // Estrela principal
      ctx.fillStyle="#ffd700"; ctx.shadowColor="#ff6b35"; ctx.shadowBlur=8;
      ctx.save(); ctx.translate(18,18);
      ctx.beginPath();
      for(let j=0;j<5;j++){
        const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
        j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
        ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
      }
      ctx.closePath(); ctx.fill();
      // Contorno escuro
      ctx.strokeStyle="rgba(100,60,0,0.7)"; ctx.lineWidth=2;
      ctx.beginPath();
      for(let j=0;j<5;j++){
        const o=Math.PI*2*j/5-Math.PI/2, i=o+Math.PI/5;
        j===0?ctx.moveTo(Math.cos(o)*16,Math.sin(o)*16):ctx.lineTo(Math.cos(o)*16,Math.sin(o)*16);
        ctx.lineTo(Math.cos(i)*7,Math.sin(i)*7);
      }
      ctx.closePath(); ctx.stroke();
      ctx.restore(); ctx.shadowBlur=0;
      ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.arc(13,11,4,0,Math.PI*2); ctx.fill();
      tex.refresh();
    }
    // Balões 🎈 flutuantes — 6 cores
    const BALAO_COLORS=[
      {hi:"#ff9080", lo:"#e84d10", stroke:"#b03000"}, // laranja-vermelho
      {hi:"#ffe080", lo:"#ffd700", stroke:"#b09000"}, // amarelo
      {hi:"#ff90d0", lo:"#e0209a", stroke:"#900060"}, // rosa
      {hi:"#90d0ff", lo:"#1a90e0", stroke:"#005090"}, // azul
      {hi:"#90ffb0", lo:"#20c060", stroke:"#008030"}, // verde
      {hi:"#d0a0ff", lo:"#9030e0", stroke:"#500090"}, // lilás
    ];
    BALAO_COLORS.forEach((bc,ci)=>{
      const key="item_balao_"+ci;
      if(scene.textures.exists(key)) return;
      const tex=scene.textures.createCanvas(key,32,46), ctx=tex.getContext();
      // Corpo do balão
      const gr=ctx.createRadialGradient(10,11,2,16,16,14);
      gr.addColorStop(0,bc.hi); gr.addColorStop(1,bc.lo);
      ctx.fillStyle=gr;
      ctx.beginPath(); ctx.ellipse(16,16,13,15,0,0,Math.PI*2); ctx.fill();
      // Contorno
      ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.ellipse(16,16,13,15,0,0,Math.PI*2); ctx.stroke();
      // Brilho oval
      ctx.fillStyle="rgba(255,255,255,0.55)";
      ctx.beginPath(); ctx.ellipse(10,9,4,6,Math.PI/4,0,Math.PI*2); ctx.fill();
      // Brilho pequeno secundário
      ctx.fillStyle="rgba(255,255,255,0.25)";
      ctx.beginPath(); ctx.ellipse(20,11,2.5,3.5,Math.PI/5,0,Math.PI*2); ctx.fill();
      // Nozinho na base
      ctx.fillStyle=bc.lo;
      ctx.beginPath(); ctx.arc(16,31,3,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=bc.stroke; ctx.lineWidth=1; ctx.stroke();
      // Fio
      ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(16,31);
      ctx.quadraticCurveTo(18,38,16,44); ctx.stroke();
      tex.refresh();
    });
    // Chupa-chupa 🍭 — desenhado em Canvas (consistente com todos os outros itens)
    if(!scene.textures.exists("item_chupachupa")){
      const tex=scene.textures.createCanvas("item_chupachupa",52,56), ctx=tex.getContext();
      const cx=26, cy=20;

      // Halo exterior colorido (brilho de candy)
      const haloGr = ctx.createRadialGradient(cx,cy,12,cx,cy,22);
      haloGr.addColorStop(0,"rgba(255,100,200,0)");
      haloGr.addColorStop(0.6,"rgba(255,80,180,0.22)");
      haloGr.addColorStop(1,"rgba(255,200,80,0.0)");
      ctx.fillStyle=haloGr;
      ctx.beginPath(); ctx.arc(cx,cy,22,0,Math.PI*2); ctx.fill();

      // Cabo — listrado como bastão de Natal (vermelho e branco alternados)
      for(let ri=0; ri<5; ri++){
        ctx.fillStyle = ri%2===0 ? "#ff1a44" : "#fff5f8";
        ctx.beginPath();
        ctx.roundRect(cx-4, cy+12+ri*5, 8, 6, ri===0?[3,3,0,0]:ri===4?[0,0,3,3]:[0]);
        ctx.fill();
      }
      // Brilho no cabo (lateral esquerda)
      ctx.fillStyle="rgba(255,255,255,0.45)";
      ctx.fillRect(cx-3, cy+13, 2, 22);
      // Contorno do cabo
      ctx.strokeStyle="#cc0030"; ctx.lineWidth=1.4;
      ctx.beginPath(); ctx.roundRect(cx-4,cy+12,8,28,3); ctx.stroke();

      // Sombra suave por baixo do berlinde
      ctx.fillStyle="rgba(180,0,80,0.20)";
      ctx.beginPath(); ctx.ellipse(cx+3,cy+5,15,5,0,0,Math.PI*2); ctx.fill();

      // Berlinde — 6 fatias arco-íris bem saturadas
      const sliceColors=[
        "#ff1a44",  // vermelho vivo
        "#ff8c00",  // laranja
        "#ffe600",  // amarelo
        "#00cc44",  // verde
        "#0088ff",  // azul
        "#cc00ff",  // violeta
      ];
      ctx.save(); ctx.translate(cx,cy);
      // Clip ao círculo para as fatias não saírem
      ctx.beginPath(); ctx.arc(0,0,17,0,Math.PI*2); ctx.clip();
      for(let si=0;si<6;si++){
        ctx.fillStyle=sliceColors[si];
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,17, si*Math.PI/3 - Math.PI*0.015, (si+1)*Math.PI/3 + Math.PI*0.015);
        ctx.closePath(); ctx.fill();
      }
      // Espiral branca por cima das fatias (dá o aspeto de twist clássico)
      ctx.strokeStyle="rgba(255,255,255,0.70)";
      ctx.lineWidth=3.5;
      ctx.lineCap="round";
      ctx.beginPath();
      for(let t=0; t<=Math.PI*1.7; t+=0.06){
        const r = t / (Math.PI*1.7) * 15;
        const x2 = Math.cos(t) * r;
        const y2 = Math.sin(t) * r;
        t===0 ? ctx.moveTo(x2,y2) : ctx.lineTo(x2,y2);
      }
      ctx.stroke();
      ctx.restore();

      // Contorno do berlinde — grosso e escuro para destacar
      ctx.shadowColor="rgba(180,0,80,0.55)"; ctx.shadowBlur=8;
      ctx.strokeStyle="#990022"; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(cx,cy,17,0,Math.PI*2); ctx.stroke();
      ctx.shadowBlur=0;

      // Brilho principal (oval branco grande no canto sup. esq.)
      ctx.fillStyle="rgba(255,255,255,0.62)";
      ctx.beginPath(); ctx.ellipse(cx-6,cy-7,7,9,Math.PI*0.35,0,Math.PI*2); ctx.fill();
      // Brilho secundário mais pequeno
      ctx.fillStyle="rgba(255,255,255,0.38)";
      ctx.beginPath(); ctx.ellipse(cx-4,cy-12,3.5,4.5,Math.PI*0.3,0,Math.PI*2); ctx.fill();
      // Ponto de luz vivo no centro do brilho
      ctx.fillStyle="rgba(255,255,255,0.85)";
      ctx.beginPath(); ctx.arc(cx-8,cy-9,2.5,0,Math.PI*2); ctx.fill();

      tex.refresh();
    }
    // Brinquedo — ursinho de peluche 🧸 completo (com pernas)
    if(!scene.textures.exists("item_brinquedo")){
      const tex=scene.textures.createCanvas("item_brinquedo",44,48), ctx=tex.getContext();
      const C="#c07030", CL="#e8a860", CI="#e8905a", CD="#8b4a00";

      // --- PERNAS (atrás do corpo) ---
      ctx.fillStyle=C;
      ctx.beginPath(); ctx.ellipse(14,41,5,6,Math.PI*0.08,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30,41,5,6,-Math.PI*0.08,0,Math.PI*2); ctx.fill();
      // Patinhas
      ctx.fillStyle=CI;
      ctx.beginPath(); ctx.ellipse(14,46,5,3,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30,46,5,3,0,0,Math.PI*2); ctx.fill();

      // --- CORPO ---
      const bodyGr=ctx.createRadialGradient(19,28,2,22,28,14);
      bodyGr.addColorStop(0,CL); bodyGr.addColorStop(1,C);
      ctx.beginPath(); ctx.ellipse(22,29,13,12,0,0,Math.PI*2); ctx.fillStyle=bodyGr; ctx.fill();
      // Barriga clara
      ctx.beginPath(); ctx.ellipse(22,31,7,6,0,0,Math.PI*2); ctx.fillStyle="rgba(255,220,160,0.75)"; ctx.fill();

      // --- BRAÇOS ---
      ctx.fillStyle=C;
      ctx.beginPath(); ctx.ellipse(10,27,4,6,Math.PI*0.2,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(34,27,4,6,-Math.PI*0.2,0,Math.PI*2); ctx.fill();
      // Mãozinhas
      ctx.fillStyle=CI;
      ctx.beginPath(); ctx.arc(8,31,3.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(36,31,3.5,0,Math.PI*2); ctx.fill();

      // --- CABEÇA ---
      const headGr=ctx.createRadialGradient(19,15,2,22,16,11);
      headGr.addColorStop(0,CL); headGr.addColorStop(1,C);
      ctx.beginPath(); ctx.arc(22,16,11,0,Math.PI*2); ctx.fillStyle=headGr; ctx.fill();

      // Orelhas
      ctx.fillStyle=C;
      ctx.beginPath(); ctx.arc(13,8,5.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(31,8,5.5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=CI;
      ctx.beginPath(); ctx.arc(13,8,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(31,8,3,0,Math.PI*2); ctx.fill();

      // Focinho
      ctx.beginPath(); ctx.ellipse(22,20,5.5,4,0,0,Math.PI*2); ctx.fillStyle="#d08050"; ctx.fill();
      // Nariz
      ctx.beginPath(); ctx.arc(22,17.5,2.5,0,Math.PI*2); ctx.fillStyle="#2a1000"; ctx.fill();
      // Boca
      ctx.strokeStyle="#2a1000"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(19,21); ctx.quadraticCurveTo(22,24,25,21); ctx.stroke();

      // Olhos brilhantes
      ctx.fillStyle="#2a1000";
      ctx.beginPath(); ctx.arc(17,14,2.8,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(27,14,2.8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="#ffffff";
      ctx.beginPath(); ctx.arc(18,13,1.1,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(28,13,1.1,0,Math.PI*2); ctx.fill();

      // Contornos suaves
      ctx.strokeStyle=CD; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.arc(22,16,11,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(22,29,13,12,0,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(14,41,5,6,Math.PI*0.08,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(30,41,5,6,-Math.PI*0.08,0,Math.PI*2); ctx.stroke();
      tex.refresh();
    }
    // Escudo — canvas 52×58, forma classica de escudo heraldico
    if(!scene.textures.exists("item_medalha")){
      const tex=scene.textures.createCanvas("item_medalha",52,58), ctx=tex.getContext();
      const cx=26, cy=26;

      // Funcao auxiliar para desenhar a forma do escudo
      function shieldPath(ctx, x, y, w, h){
        const r=w*0.18;
        ctx.beginPath();
        ctx.moveTo(x+r, y);
        ctx.lineTo(x+w-r, y);
        ctx.quadraticCurveTo(x+w, y, x+w, y+r);
        ctx.lineTo(x+w, y+h*0.55);
        // Curva inferior que forma a ponta do escudo
        ctx.quadraticCurveTo(x+w, y+h*0.82, x+w/2, y+h);
        ctx.quadraticCurveTo(x, y+h*0.82, x, y+h*0.55);
        ctx.lineTo(x, y+r);
        ctx.quadraticCurveTo(x, y, x+r, y);
        ctx.closePath();
      }

      // Sombra exterior
      ctx.shadowColor="rgba(255,215,0,0.55)"; ctx.shadowBlur=8;
      // Borda exterior dourada
      const borderGr=ctx.createLinearGradient(0,0,0,54);
      borderGr.addColorStop(0,"#ffe060"); borderGr.addColorStop(1,"#c07000");
      ctx.fillStyle=borderGr; shieldPath(ctx,1,1,50,54); ctx.fill();
      ctx.shadowBlur=0;

      // Corpo do escudo — gradiente azul real
      const bodyGr=ctx.createLinearGradient(4,4,4,50);
      bodyGr.addColorStop(0,"#4a90e8"); bodyGr.addColorStop(0.5,"#1a50b8"); bodyGr.addColorStop(1,"#0a2878");
      ctx.fillStyle=bodyGr; shieldPath(ctx,4,4,44,50); ctx.fill();

      // Reflexo de luz no topo esquerdo
      ctx.fillStyle="rgba(255,255,255,0.28)";
      ctx.beginPath(); ctx.ellipse(16,14,9,13,Math.PI*0.15,0,Math.PI*2); ctx.fill();

      // Divisao central horizontal (cruz do escudo — faixa horizontal)
      ctx.fillStyle="rgba(255,215,0,0.22)";
      ctx.fillRect(4,24,44,6);
      // Divisao central vertical
      ctx.fillRect(23,4,6,50);

      // Estrela dourada no centro
      ctx.save(); ctx.translate(cx, cy+4);
      ctx.shadowColor="#ffd700"; ctx.shadowBlur=6;
      const sg=ctx.createRadialGradient(-1,-2,1,0,0,10);
      sg.addColorStop(0,"#ffffff"); sg.addColorStop(0.35,"#ffe060"); sg.addColorStop(1,"#ffa000");
      ctx.fillStyle=sg;
      ctx.beginPath();
      for(let j=0;j<5;j++){
        const o=Math.PI*2*j/5-Math.PI/2, inn=o+Math.PI/5;
        j===0?ctx.moveTo(Math.cos(o)*11,Math.sin(o)*11):ctx.lineTo(Math.cos(o)*11,Math.sin(o)*11);
        ctx.lineTo(Math.cos(inn)*5,Math.sin(inn)*5);
      }
      ctx.closePath(); ctx.fill();
      ctx.shadowBlur=0;
      ctx.restore();

      // Contorno exterior dourado
      ctx.strokeStyle="#ffd700"; ctx.lineWidth=2.5;
      shieldPath(ctx,4,4,44,50); ctx.stroke();
      // Linha de brilho interior
      ctx.strokeStyle="rgba(255,255,255,0.35)"; ctx.lineWidth=1.2;
      shieldPath(ctx,7,7,38,44); ctx.stroke();

      tex.refresh();
    }
    // Borboleta — 48×40, asas coloridas com padrão
    const BUTTERFLY_COLORS=[
      {top:"#ff80c0",bot:"#e0209a",pat:"#ffd700",stroke:"#800040"}, // rosa
      {top:"#80d0ff",bot:"#1a90e0",pat:"#ffffff",stroke:"#004090"}, // azul
      {top:"#a0ff80",bot:"#20c060",pat:"#ffd700",stroke:"#006030"}, // verde
      {top:"#ffd700",bot:"#ff9500",pat:"#ffffff",stroke:"#804000"}, // laranja-dourado
      {top:"#d0a0ff",bot:"#9030e0",pat:"#ffe080",stroke:"#400080"}, // lilás
    ];
    BUTTERFLY_COLORS.forEach((bc,ci)=>{
      const key="item_borboleta_"+ci;
      if(scene.textures.exists(key)) return;
      const tex=scene.textures.createCanvas(key,48,40), ctx=tex.getContext();
      // Asa superior esquerda
      const grTL=ctx.createRadialGradient(14,14,2,12,16,14);
      grTL.addColorStop(0,bc.top); grTL.addColorStop(1,bc.bot);
      ctx.fillStyle=grTL;
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(20,8,2,4,2,16);
      ctx.bezierCurveTo(2,24,14,26,24,20);
      ctx.fill();
      // Asa superior direita
      const grTR=ctx.createRadialGradient(34,14,2,36,16,14);
      grTR.addColorStop(0,bc.top); grTR.addColorStop(1,bc.bot);
      ctx.fillStyle=grTR;
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(28,8,46,4,46,16);
      ctx.bezierCurveTo(46,24,34,26,24,20);
      ctx.fill();
      // Asa inferior esquerda
      ctx.fillStyle=bc.bot;
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(18,24,4,28,6,36);
      ctx.bezierCurveTo(8,40,20,36,24,20);
      ctx.fill();
      // Asa inferior direita
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(30,24,44,28,42,36);
      ctx.bezierCurveTo(40,40,28,36,24,20);
      ctx.fill();
      // Padrões nas asas (círculos)
      ctx.fillStyle=bc.pat; ctx.globalAlpha=0.6;
      ctx.beginPath(); ctx.arc(13,14,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(35,14,4,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(11,28,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(37,28,3,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1;
      // Contornos das asas
      ctx.strokeStyle=bc.stroke; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(20,8,2,4,2,16);
      ctx.bezierCurveTo(2,24,14,26,24,20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(24,20);
      ctx.bezierCurveTo(28,8,46,4,46,16);
      ctx.bezierCurveTo(46,24,34,26,24,20); ctx.stroke();
      // Corpo (abdómen)
      ctx.fillStyle="#1a1a1a";
      ctx.beginPath(); ctx.ellipse(24,20,3,10,0,0,Math.PI*2); ctx.fill();
      // Cabeça
      ctx.fillStyle="#2a2a2a";
      ctx.beginPath(); ctx.arc(24,11,3,0,Math.PI*2); ctx.fill();
      // Antenas
      ctx.strokeStyle="#1a1a1a"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.moveTo(24,9); ctx.quadraticCurveTo(18,2,14,1); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(24,9); ctx.quadraticCurveTo(30,2,34,1); ctx.stroke();
      ctx.fillStyle=bc.pat;
      ctx.beginPath(); ctx.arc(14,1,2.5,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(34,1,2.5,0,Math.PI*2); ctx.fill();
      tex.refresh();
    });

    // Abelha — 44×40, listras amarelas e pretas, asas transparentes
    if(!scene.textures.exists("item_abelha")){
      // Abelha desenhada na horizontal (como emoji 🐝): cabeça à direita, ferrão à esquerda
      // Canvas 56×36
      const tex=scene.textures.createCanvas("item_abelha",56,36), ctx=tex.getContext();
      const bx=28, by=18; // centro

      // --- ASAS (em cima do corpo, semi-transparentes) ---
      ctx.fillStyle="rgba(210,245,255,0.80)";
      ctx.strokeStyle="rgba(80,160,220,0.85)"; ctx.lineWidth=1;
      // Asa superior esquerda (maior)
      ctx.beginPath(); ctx.ellipse(bx-2, by-11, 11, 6, Math.PI*0.15, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Asa superior direita (maior)
      ctx.beginPath(); ctx.ellipse(bx+10, by-11, 11, 6, -Math.PI*0.15, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Asa inferior esquerda (menor)
      ctx.beginPath(); ctx.ellipse(bx-3, by-4, 7, 4, Math.PI*0.2, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();
      // Asa inferior direita (menor)
      ctx.beginPath(); ctx.ellipse(bx+9, by-4, 7, 4, -Math.PI*0.2, 0, Math.PI*2);
      ctx.fill(); ctx.stroke();

      // --- ABDÓMEN (oval horizontal, listras) ---
      const abdGr=ctx.createRadialGradient(bx-6,by-2,2,bx-4,by,12);
      abdGr.addColorStop(0,"#ffe566"); abdGr.addColorStop(1,"#d49000");
      ctx.fillStyle=abdGr;
      ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.fill();
      // Listras pretas horizontais (clip ao abdómen)
      ctx.save();
      ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.clip();
      ctx.fillStyle="rgba(15,15,15,0.80)";
      [-4, 1, 6].forEach(dx=>{
        ctx.fillRect(bx-6+dx-1, by-9, 3, 18);
      });
      ctx.restore();
      // Contorno abdómen
      ctx.strokeStyle="#8a5500"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(bx-6, by, 13, 9, 0, 0, Math.PI*2); ctx.stroke();

      // --- FERRÃO (ponta à esquerda) ---
      ctx.fillStyle="#b07800";
      ctx.beginPath();
      ctx.moveTo(bx-19, by);
      ctx.lineTo(bx-14, by-3);
      ctx.lineTo(bx-14, by+3);
      ctx.closePath(); ctx.fill();

      // --- TÓRAX (peludo, ligação entre abdómen e cabeça) ---
      const torGr=ctx.createRadialGradient(bx+7,by-2,1,bx+8,by,7);
      torGr.addColorStop(0,"#a07020"); torGr.addColorStop(1,"#4a2800");
      ctx.fillStyle=torGr;
      ctx.beginPath(); ctx.ellipse(bx+8, by, 7, 8, 0, 0, Math.PI*2); ctx.fill();
      // Pelos do tórax
      ctx.strokeStyle="rgba(220,180,0,0.55)"; ctx.lineWidth=0.9;
      for(let pi=0;pi<6;pi++){
        const pa=Math.PI*2*pi/6;
        ctx.beginPath();
        ctx.moveTo(bx+8+Math.cos(pa)*5, by+Math.sin(pa)*6);
        ctx.lineTo(bx+8+Math.cos(pa)*8, by+Math.sin(pa)*9);
        ctx.stroke();
      }

      // --- CABEÇA (à direita, amarela) ---
      const headGr=ctx.createRadialGradient(bx+17,by-2,1,bx+18,by,7);
      headGr.addColorStop(0,"#fff0a0"); headGr.addColorStop(1,"#e8a800");
      ctx.fillStyle=headGr;
      ctx.beginPath(); ctx.arc(bx+18, by, 7, 0, Math.PI*2); ctx.fill();
      ctx.strokeStyle="#8a5500"; ctx.lineWidth=1.1; ctx.stroke();

      // Olho (único, virado para a direita)
      ctx.fillStyle="#1a1000";
      ctx.beginPath(); ctx.arc(bx+21, by-1, 2.8, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.75)";
      ctx.beginPath(); ctx.arc(bx+22, by-2, 1.1, 0, Math.PI*2); ctx.fill();

      // Antena (saindo da cabeça para a direita/cima)
      ctx.strokeStyle="#5a3000"; ctx.lineWidth=1.3;
      ctx.beginPath(); ctx.moveTo(bx+22, by-6);
      ctx.quadraticCurveTo(bx+26, by-14, bx+28, by-16); ctx.stroke();
      ctx.fillStyle="#ffd700";
      ctx.beginPath(); ctx.arc(bx+28, by-16, 2.5, 0, Math.PI*2); ctx.fill();

      tex.refresh();
    }

    // Coração — vermelho vivo, grande, com brilho e gradiente
    if(!scene.textures.exists("item_heart")){
      const tex=scene.textures.createCanvas("item_heart",44,40), ctx=tex.getContext();
      const cx=22, cy=20;

      // Função para desenhar o coração centrado
      function heartPath(){
        ctx.beginPath();
        ctx.moveTo(cx, cy+12);
        // Lado esquerdo
        ctx.bezierCurveTo(cx-2, cy+10, cx-14, cy+4, cx-14, cy-4);
        ctx.bezierCurveTo(cx-14, cy-13, cx-6, cy-15, cx, cy-8);
        // Lado direito
        ctx.bezierCurveTo(cx+6, cy-15, cx+14, cy-13, cx+14, cy-4);
        ctx.bezierCurveTo(cx+14, cy+4, cx+2, cy+10, cx, cy+12);
        ctx.closePath();
      }

      // Sombra exterior rosada
      ctx.shadowColor="rgba(255,80,80,0.55)"; ctx.shadowBlur=10;
      const hg=ctx.createRadialGradient(cx-3,cy-5,2,cx,cy,16);
      hg.addColorStop(0,"#ff6080");
      hg.addColorStop(0.4,"#ff2040");
      hg.addColorStop(0.8,"#cc0020");
      hg.addColorStop(1,"#990010");
      ctx.fillStyle=hg;
      heartPath(); ctx.fill();
      ctx.shadowBlur=0;

      // Contorno fino
      ctx.strokeStyle="rgba(140,0,20,0.5)"; ctx.lineWidth=1.2;
      heartPath(); ctx.stroke();

      // Brilho principal (oval branco no canto superior esquerdo)
      ctx.fillStyle="rgba(255,255,255,0.55)";
      ctx.beginPath(); ctx.ellipse(cx-5,cy-6,5,7,Math.PI*0.35,0,Math.PI*2); ctx.fill();

      // Brilho secundário (pequeno)
      ctx.fillStyle="rgba(255,255,255,0.30)";
      ctx.beginPath(); ctx.ellipse(cx+4,cy-3,3,4,Math.PI*0.2,0,Math.PI*2); ctx.fill();

      tex.refresh();
    }

    // Duplo Salto — asa azul luminosa com fundo circular
    if(!scene.textures.exists("item_duplosalto")){
      const tex=scene.textures.createCanvas("item_duplosalto",64,56), ctx=tex.getContext();
      const cx=32, cy=30;

      // ── Fundo circular azul-celeste ────────────────────────────
      const bg=ctx.createRadialGradient(cx,cy,1,cx,cy,24);
      bg.addColorStop(0,"#eaf9ff"); bg.addColorStop(0.4,"#7dd6ff");
      bg.addColorStop(0.85,"#1a8fe0"); bg.addColorStop(1,"#0050a0");
      ctx.fillStyle=bg;
      ctx.beginPath(); ctx.arc(cx,cy,24,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.80)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,23,0,Math.PI*2); ctx.stroke();

      // ── Desenho de asa (reutilizável para esq. e dir.) ─────────
      function wing(dir) { // dir = -1 esq, +1 dir
        ctx.save();
        ctx.translate(cx + dir*3, cy+2);
        ctx.scale(dir, 1);

        // Silhueta principal da asa — forma de asa de anjo
        const wg = ctx.createLinearGradient(0,-14,26,4);
        wg.addColorStop(0,"#fffbe0");
        wg.addColorStop(0.45,"#ffd740");
        wg.addColorStop(1,"#e08000");
        ctx.fillStyle = wg;
        ctx.beginPath();
        ctx.moveTo(0, 4);                         // base interior
        ctx.bezierCurveTo( 4,  4,  8, -2, 12,-10); // bordo superior
        ctx.bezierCurveTo(18,-16, 26,-14, 28, -6); // ponta da asa
        ctx.bezierCurveTo(24,  2, 16,  6,  8,  8); // bordo inferior
        ctx.bezierCurveTo( 4,  8,  0,  6,  0,  4);
        ctx.closePath();
        ctx.fill();

        // Contorno fino
        ctx.strokeStyle="rgba(160,80,0,0.50)"; ctx.lineWidth=0.8;
        ctx.stroke();

        // ── 4 penas sobrepostas ──────────────────────────────────
        const penas = [
          {x:4,  y:2,  a:-0.30, l:12, w:3.2},
          {x:9,  y:-2, a:-0.52, l:14, w:3.5},
          {x:15, y:-6, a:-0.72, l:14, w:3.2},
          {x:21, y:-9, a:-0.88, l:11, w:2.6},
        ];
        penas.forEach((p,i)=>{
          const t = i/3;
          const c1 = `rgba(255,${245-i*20},${100-i*15},0.95)`;
          const c2 = `rgba(255,${220-i*20},${60-i*10},0)`;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.a);
          const fg=ctx.createLinearGradient(0,-p.w/2, p.l, p.w/2);
          fg.addColorStop(0,c1); fg.addColorStop(0.6,c1); fg.addColorStop(1,c2);
          ctx.fillStyle=fg;
          // Pena com forma ligeiramente arqueada
          ctx.beginPath();
          ctx.moveTo(0,0);
          ctx.bezierCurveTo(p.l*0.3,-p.w*0.7, p.l*0.7,-p.w*0.5, p.l,0);
          ctx.bezierCurveTo(p.l*0.7, p.w*0.5, p.l*0.3, p.w*0.7, 0,0);
          ctx.fill();
          // Veia central
          ctx.strokeStyle="rgba(200,120,0,0.35)"; ctx.lineWidth=0.7;
          ctx.beginPath(); ctx.moveTo(1,0); ctx.lineTo(p.l-2,0); ctx.stroke();
          ctx.restore();
        });

        // Brilho topo da asa
        ctx.fillStyle="rgba(255,255,255,0.30)";
        ctx.beginPath();
        ctx.moveTo(2, 2);
        ctx.bezierCurveTo(5,-6, 14,-12, 20,-8);
        ctx.bezierCurveTo(14,-5, 6,-2, 2, 2);
        ctx.fill();

        ctx.restore();
      }

      wing(-1); // asa esquerda
      wing(1);  // asa direita

      // ── Setas ↑↑ douradas com contorno ────────────────────────
      [[cy-8],[cy+2]].forEach(([ay])=>{
        ctx.fillStyle="#ffe040"; ctx.strokeStyle="#7a4000"; ctx.lineWidth=1.2;
        ctx.beginPath();
        ctx.moveTo(cx,     ay-5);   // ponta
        ctx.lineTo(cx-5,   ay+1);
        ctx.lineTo(cx-2.5, ay+1);
        ctx.lineTo(cx-2.5, ay+5);
        ctx.lineTo(cx+2.5, ay+5);
        ctx.lineTo(cx+2.5, ay+1);
        ctx.lineTo(cx+5,   ay+1);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      });

      // Brilho central
      ctx.fillStyle="rgba(255,255,255,0.55)";
      ctx.beginPath(); ctx.ellipse(cx,cy-6,5,4,0,0,Math.PI*2); ctx.fill();

      tex.refresh();
    }
  }

  // ===== VanBerto — robozinho 100% original do jogo da UE =====
  function rrVan(ctx,x,y,w,h,r){
    const rr=Math.min(r,w/2,h/2);
    ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
  }
  function cVan(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
  function cfVan(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function lVan(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}

  function makeVanBertoTexture(scene,key,blink,step){
    if(scene.textures.exists(key)) return;
    const w=96,h=96, tex=scene.textures.createCanvas(key,w,h), ctx=tex.getContext();
    ctx.clearRect(0,0,w,h);
    ctx.lineJoin="round"; ctx.lineCap="round";
    // Desloca todo o desenho 6px para baixo para o halo da antena (y≈0) não ser cortado.
    // O setOffset do corpo físico foi ajustado em igual medida para o robô ficar na mesma posição no ecrã.
    ctx.save(); ctx.translate(0, 6);
    const NAVY="#16233e", NAVY2="#26365a", OUT="#101a30";
    function white(x0,y0,x1,y1){const g=ctx.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,"#ffffff");g.addColorStop(0.55,"#e6edf7");g.addColorStop(1,"#b4c4dc");return g;}

    // ===== PERNAS (bem visíveis por baixo do tronco; passo marcado) =====
    const LIFT=8, STRIDE=3;
    let lTop=70, rTop=70, lDX=0, rDX=0;          // topo da coxa; planta=70 -> pé a y=88
    if(step===0){ lTop=70-LIFT; lDX=STRIDE; rDX=-STRIDE; }
    else if(step===1){ rTop=70-LIFT; rDX=STRIDE; lDX=-STRIDE; }
    function leg(cx,top){
      rrVan(ctx,cx-5,top,10,11,4.5); ctx.fillStyle=white(cx-5,top,cx+5,top); ctx.fill();
      ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
      const fy=top+9;
      rrVan(ctx,cx-6.5,fy,13,9,4); ctx.fillStyle=NAVY; ctx.fill();
      ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
      rrVan(ctx,cx-6.5,fy+2,13,2.4,1.2); ctx.fillStyle="rgba(255,255,255,0.85)"; ctx.fill();
      cfVan(ctx,cx-2.5,fy+4.5,1.4,"rgba(255,255,255,0.5)");
    }
    leg(41+lDX,lTop); leg(55+rDX,rTop);

    // ===== BRAÇOS (curtos e encostados) =====
    function arm(sx){
      rrVan(ctx,sx,52,9,13,4.5); ctx.fillStyle=white(sx,52,sx+9,52); ctx.fill();
      ctx.lineWidth=2.6; ctx.strokeStyle=OUT; ctx.stroke();
      const hx=sx+4.5, hy=67;
      cfVan(ctx,hx,hy,5,NAVY);
      ctx.lineWidth=2.3; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(hx,hy,5,0,Math.PI*2); ctx.stroke();
      cfVan(ctx,hx-2,hy+1.6,1.4,NAVY2); cfVan(ctx,hx+0.5,hy+2.4,1.4,NAVY2); cfVan(ctx,hx+2.5,hy+1.6,1.4,NAVY2);
    }
    arm(17); arm(70);

    // ===== TRONCO (estreito: x26–70, igual à cabeça) =====
    rrVan(ctx,26,44,44,32,15); ctx.fillStyle=white(28,46,68,46); ctx.fill();
    ctx.save(); rrVan(ctx,26,44,44,32,15); ctx.clip();
    const wg=ctx.createLinearGradient(0,64,0,76); wg.addColorStop(0,"rgba(22,35,62,0)"); wg.addColorStop(0.4,"#1c2c4c"); wg.addColorStop(1,"#142038");
    ctx.fillStyle=wg; ctx.fillRect(26,62,44,16);
    ctx.strokeStyle="rgba(16,26,48,0.6)"; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(28,64); ctx.lineTo(68,64); ctx.stroke();
    ctx.fillStyle="rgba(255,255,255,0.5)"; ctx.beginPath(); ctx.ellipse(36,52,9,5.5,-0.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.lineWidth=3; ctx.strokeStyle=OUT; rrVan(ctx,26,44,44,32,15); ctx.stroke();

    // ===== PAINEL DO PEITO =====
    cfVan(ctx,48,56,8,NAVY);
    ctx.lineWidth=2.5; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(48,56,8,0,Math.PI*2); ctx.stroke();
    const dome=ctx.createRadialGradient(45.5,53.5,1,48,56,7); dome.addColorStop(0,"#aebccf"); dome.addColorStop(0.6,"#5a6a85"); dome.addColorStop(1,"#2b3a57");
    ctx.fillStyle=dome; ctx.beginPath(); ctx.arc(48,56,5.7,0,Math.PI*2); ctx.fill();
    cfVan(ctx,46,53.8,1.5,"rgba(255,255,255,0.85)");

    // ===== EAR PODS (atrás do capacete) =====
    function pod(cx){
      cfVan(ctx,cx,32,6,NAVY);
      ctx.lineWidth=2.3; ctx.strokeStyle=OUT; ctx.beginPath(); ctx.arc(cx,32,6,0,Math.PI*2); ctx.stroke();
      cfVan(ctx,cx,32,2.8,NAVY2); cfVan(ctx,cx-0.8,31,1,"rgba(255,255,255,0.6)");
    }
    pod(25); pod(71);

    // ===== ANTENA =====
    ctx.fillStyle=NAVY; ctx.beginPath(); ctx.moveTo(45,16); ctx.lineTo(51,16); ctx.lineTo(49.2,8); ctx.lineTo(46.8,8); ctx.closePath(); ctx.fill();
    const halo=ctx.createRadialGradient(48,5,1,48,5,11); halo.addColorStop(0,"rgba(90,200,255,0.55)"); halo.addColorStop(1,"rgba(90,200,255,0)");
    ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(48,5,11,0,Math.PI*2); ctx.fill();
    const bg=ctx.createRadialGradient(46.3,3.5,0.5,48,5,5.5); bg.addColorStop(0,"#e6f7ff"); bg.addColorStop(0.4,"#48b4ff"); bg.addColorStop(1,"#1670d8");
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(48,5,5.5,0,Math.PI*2); ctx.fill();
    cfVan(ctx,46.2,3.4,1.6,"#ffffff");

    // ===== CAPACETE =====
    rrVan(ctx,26,14,44,34,17); ctx.fillStyle=white(28,15,68,15); ctx.fill();
    ctx.lineWidth=3; ctx.strokeStyle=OUT; ctx.stroke();
    ctx.save(); rrVan(ctx,26,14,44,34,17); ctx.clip();
    ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.beginPath(); ctx.ellipse(38,19,10,4,-0.5,0,Math.PI*2); ctx.fill(); ctx.restore();

    // ===== MOLDURA + VISEIRA =====
    rrVan(ctx,30,20,36,23,12); ctx.fillStyle=NAVY; ctx.fill();
    rrVan(ctx,32.5,22,31,19,10);
    const vg=ctx.createLinearGradient(0,22,0,41); vg.addColorStop(0,"#7fd4ff"); vg.addColorStop(0.5,"#2a9bf0"); vg.addColorStop(1,"#1366c6");
    ctx.fillStyle=vg; ctx.fill();
    ctx.save(); rrVan(ctx,32.5,22,31,19,10); ctx.clip();
    ctx.fillStyle="rgba(255,255,255,0.45)"; ctx.beginPath(); ctx.ellipse(42,25,9,3.5,-0.4,0,Math.PI*2); ctx.fill(); ctx.restore();

    // ===== OLHOS =====
    if(!blink){
      ctx.fillStyle="#0a0f1c";
      ctx.beginPath(); ctx.ellipse(41,30,3.3,4,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(55,30,3.3,4,0,0,Math.PI*2); ctx.fill();
      cfVan(ctx,42.3,28.4,1.5,"#fff"); cfVan(ctx,39.9,31,0.8,"#fff");
      cfVan(ctx,56.3,28.4,1.5,"#fff"); cfVan(ctx,53.9,31,0.8,"#fff");
    } else {
      // piscar feliz — arcos ^_^
      ctx.lineWidth=3; ctx.strokeStyle="#0a0f1c";
      ctx.beginPath(); ctx.arc(41,31,3.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.arc(55,31,3.5,0.15*Math.PI,0.85*Math.PI); ctx.stroke();
    }
    // ===== BOCA — sorriso aberto e contente =====
    ctx.fillStyle="#0a0f1c";
    ctx.beginPath(); ctx.ellipse(48,36,4.6,3.2,0,0,Math.PI); ctx.fill();   // metade de baixo = sorriso
    ctx.fillStyle="#ff7a7a";
    ctx.beginPath(); ctx.ellipse(48,37.4,2.4,1.5,0,0,Math.PI); ctx.fill(); // línguinha

    ctx.restore();
    tex.refresh();
  }

  // ===== Fundo =====
  // Nuvens animadas
  let clouds=[];
  function initBackground(scene){
    bgGraphics    =scene.add.graphics().setDepth(-60).setScrollFactor(0.0);
    farGraphics   =scene.add.graphics().setDepth(-57).setScrollFactor(0.06); // nova camada parallax profunda
    hillsGraphics =scene.add.graphics().setDepth(-50).setScrollFactor(0.25);
    groundGraphics=scene.add.graphics().setDepth(-10).setScrollFactor(1.0);
    decorGraphics =scene.add.graphics().setDepth(-8).setScrollFactor(1.0);
    platDecorGfx  =scene.add.graphics().setDepth(-6).setScrollFactor(1.0);
    sunGraphics   =scene.add.graphics().setDepth(-55).setScrollFactor(0.05);
    moonGraphics  =scene.add.graphics().setDepth(-55).setScrollFactor(0.05);
    starGraphics  =scene.add.graphics().setDepth(-59).setScrollFactor(0.02);
    applyBackground(scene,0,2600,[]);
    drawSun(0);
    spawnClouds(scene,2600);
  }

  function spawnClouds(scene,worldW){
    clouds.forEach(c=>{if(c.gfx)c.gfx.destroy();});
    clouds=[];
    const count=10+Math.floor(worldW/300);
    const types=["cumulo","cumulo","cumulo","cirro","cirro","coracao","estrela"]; // mais cúmulos
    for(let i=0;i<count;i++){
      const layer=Math.floor(Math.random()*3);
      const scale=[0.35,0.65,1.05][layer]+Math.random()*[0.25,0.35,0.55][layer];
      const alpha=[0.18,0.45,0.75][layer]+Math.random()*[0.18,0.20,0.18][layer];
      const speed=[0.05,0.14,0.28][layer]+Math.random()*[0.08,0.10,0.16][layer];
      const y=[15,25,30][layer]+Math.random()*[60,90,120][layer];
      const sf=[0.12,0.30,0.55][layer];
      const type=types[Math.floor(Math.random()*types.length)];
      const gfx=scene.add.graphics().setDepth(-47+layer).setScrollFactor(sf);
      clouds.push({ gfx, x:Math.random()*worldW, y, speed, scale, alpha, worldW, type });
    }
  }

  function drawCloud(gfx,x,y,sc,alpha,type){
    gfx.clear();
    if(type==="cirro"){
      // Cirro — fino, alongado, rápido
      gfx.fillStyle(0xffffff,alpha*0.65);
      gfx.fillEllipse(x,y,90*sc,12*sc);
      gfx.fillEllipse(x+20*sc,y-4*sc,60*sc,8*sc);
      gfx.fillEllipse(x-15*sc,y+3*sc,50*sc,7*sc);
    } else if(type==="coracao"){
      // Nuvem em forma de coração — temática
      gfx.fillStyle(0xffffff,alpha*0.75);
      gfx.fillCircle(x-14*sc,y,16*sc);
      gfx.fillCircle(x+14*sc,y,16*sc);
      // Base triangular do coração
      const cx=x, cy=y;
      gfx.fillTriangle(cx-28*sc,cy+4*sc, cx+28*sc,cy+4*sc, cx,cy+28*sc);
      // Brilho
      gfx.fillStyle(0xffffff,alpha*0.4);
      gfx.fillCircle(x-10*sc,y-6*sc,7*sc);
    } else if(type==="estrela"){
      // Nuvem redondinha com pontinhas tipo estrela
      gfx.fillStyle(0xffffff,alpha*0.70);
      for(let p=0;p<6;p++){
        const a=Math.PI*2*p/6;
        gfx.fillCircle(x+Math.cos(a)*18*sc, y+Math.sin(a)*14*sc, 14*sc);
      }
      gfx.fillCircle(x,y,20*sc); // centro
      gfx.fillStyle(0xffffff,alpha*0.35);
      gfx.fillCircle(x-6*sc,y-6*sc,8*sc);
    } else {
      // Cúmulo — clássico mas variado
      gfx.fillStyle(0x8090c0,alpha*0.15);
      gfx.fillEllipse(x+4*sc,y+9*sc,80*sc,20*sc); // sombra
      gfx.fillStyle(0xffffff,alpha);
      gfx.fillEllipse(x,y,54*sc,32*sc);
      gfx.fillEllipse(x+22*sc,y-13*sc,44*sc,30*sc);
      gfx.fillEllipse(x-18*sc,y-4*sc,38*sc,26*sc);
      gfx.fillEllipse(x+42*sc,y-2*sc,34*sc,22*sc);
      gfx.fillEllipse(x-2*sc,y-18*sc,28*sc,20*sc); // pico extra
      gfx.fillStyle(0xffffff,alpha*0.55);
      gfx.fillEllipse(x+10*sc,y-16*sc,22*sc,12*sc);
    }
  }

  // ── Trail de movimento — removido ────────────────────────────
  function updateTrail(scene){}

  // ── Partículas de passo ───────────────────────────────────────
  function updateFootsteps(scene){
    if(!player||!player.body) return;
    const onGround=player.body.blocked.down;
    const moving=Math.abs(player.body.velocity.x)>60;
    if(onGround&&moving){
      footStepTimer++;
      if(footStepTimer>=14){
        footStepTimer=0;
        const px=player.x+(player.flipX?12:-12), py=player.y+24;
        const tint=powered?[0xffd700,0xffa040,0xffffff]:[0xa0ff80,0xffffff,0x80d0ff];
        const p=scene.add.particles(0,0,"spark_item",{
          x:px, y:py,
          speed:{min:20,max:60},
          angle:{min:220,max:320},
          lifespan:200,quantity:3,
          scale:{start:0.35,end:0},
          gravityY:200,
          tint
        });
        scene.time.delayedCall(120,()=>p.destroy());
      }
    } else { footStepTimer=0; }
  }

  // ── Halo pulsante da porta ────────────────────────────────────
  function updateDoorGlow(scene){
    if(!doorGlowGfx||!door||!player) return;
    doorGlowGfx.clear();
    const dist=Math.abs(player.x-door.x);
    const t=scene.time.now*0.003;
    const pulse=0.55+Math.sin(t*1.4)*0.45;
    const pulse2=0.55+Math.sin(t*2.2+1)*0.45;

    // Rotação dos anéis do portal — sempre visível, mais intenso perto
    const proximity=dist>500 ? 0.25 : 1-dist/500*0.75;
    const rBase=54+pulse*14;
    const rMid=38+pulse2*10;

    // Anel exterior — arco-íris rotativo
    doorGlowGfx.lineStyle(3,0xffd700,proximity*0.5*pulse);
    doorGlowGfx.strokeCircle(door.x,door.y-18,rBase);
    doorGlowGfx.lineStyle(3,0xa060ff,proximity*0.45*pulse2);
    doorGlowGfx.strokeCircle(door.x,door.y-18,rBase+4);

    // Anel médio — laranja
    doorGlowGfx.lineStyle(4,0xff6b35,proximity*0.65*pulse);
    doorGlowGfx.strokeCircle(door.x,door.y-18,rMid);

    // Halo de fundo difuso
    doorGlowGfx.fillStyle(0xa060ff,proximity*0.12*pulse2);
    doorGlowGfx.fillCircle(door.x,door.y-18,rBase+10);
    doorGlowGfx.fillStyle(0xffd700,proximity*0.14*pulse);
    doorGlowGfx.fillCircle(door.x,door.y-18,rMid+6);
    doorGlowGfx.fillStyle(0xffffff,proximity*0.10*pulse2);
    doorGlowGfx.fillCircle(door.x,door.y-18,22);

    // Faíscas orbitais (4 pontos a rodar)
    if(proximity>0.3){
      const orbitR=rBase-6;
      for(let k=0;k<4;k++){
        const a=t*1.8+k*Math.PI/2;
        const sx=door.x+Math.cos(a)*orbitR;
        const sy=(door.y-18)+Math.sin(a)*orbitR*0.55; // elipse
        const sparkAlpha=proximity*pulse*0.85;
        const sparkColors=[0xffd700,0xff6b35,0x80d0ff,0xff80c0];
        doorGlowGfx.fillStyle(sparkColors[k],sparkAlpha);
        doorGlowGfx.fillCircle(sx,sy,4+pulse*2);
      }
    }

    // Texto flutuante quando entra na zona pela primeira vez
    if(dist<320 && !doorGlowGfx._hintShown){
      doorGlowGfx._hintShown=true;
      const hint=scene.add.text(door.x, door.y-100, "✨ Vai ao Portal! ✨", {
        fontSize:"18px", fontStyle:"900", color:"#ffd700",
        stroke:"#200040", strokeThickness:5
      }).setOrigin(0.5).setDepth(20);
      scene.tweens.add({targets:hint, y:door.y-140, alpha:{from:1,to:0},
        duration:1800, ease:"Sine.easeOut", onComplete:()=>hint.destroy()});
    }
  }

  function drawCloud(gfx, x, y, sc, alpha, type) {
    gfx.clear();
    if (!type || type === "cumulo") {
      // Nuvem cúmulo clássica — volumosa, com sombra e brilho
      gfx.fillStyle(0x8090b0, alpha * 0.15);
      gfx.fillEllipse(x + 5*sc, y + 9*sc, 84*sc, 22*sc); // sombra
      // Corpo branco-azulado (ligeiramente azul para dar profundidade)
      gfx.fillStyle(0xddeeff, alpha * 0.6);
      gfx.fillEllipse(x,       y,      56*sc, 34*sc);
      gfx.fillEllipse(x+22*sc, y-13*sc,46*sc, 32*sc);
      gfx.fillEllipse(x-19*sc, y-5*sc, 38*sc, 26*sc);
      gfx.fillEllipse(x+42*sc, y-3*sc, 36*sc, 24*sc);
      // Camada branca por cima
      gfx.fillStyle(0xffffff, alpha);
      gfx.fillEllipse(x+2*sc,   y-2*sc, 50*sc, 29*sc);
      gfx.fillEllipse(x+22*sc,  y-15*sc,40*sc, 27*sc);
      gfx.fillEllipse(x-17*sc,  y-6*sc, 32*sc, 22*sc);
      gfx.fillEllipse(x+42*sc,  y-4*sc, 30*sc, 20*sc);
      // Brilho topo
      gfx.fillStyle(0xffffff, alpha * 0.65);
      gfx.fillEllipse(x+8*sc, y-16*sc, 24*sc, 13*sc);
      // Franja escura na base
      gfx.fillStyle(0xc0d0e8, alpha * 0.35);
      gfx.fillEllipse(x+10*sc, y+10*sc, 50*sc, 14*sc);

    } else if (type === "cirro") {
      // Nuvem cirro — fina, alongada, semi-transparente (altitude alta)
      gfx.fillStyle(0xffffff, alpha * 0.45);
      gfx.fillEllipse(x,       y,      90*sc, 12*sc);
      gfx.fillEllipse(x+20*sc, y-4*sc, 60*sc, 8*sc);
      gfx.fillEllipse(x-20*sc, y+2*sc, 50*sc, 7*sc);
      // Filamentos
      gfx.fillStyle(0xffffff, alpha * 0.25);
      gfx.fillEllipse(x+50*sc, y+1*sc, 40*sc, 5*sc);
      gfx.fillEllipse(x-35*sc, y+3*sc, 30*sc, 4*sc);

    } else if (type === "coracao") {
      // Nuvem em forma de coração 🩷 — decorativa
      const cx = x, cy = y;
      const r = 13 * sc;
      gfx.fillStyle(0xffb0c8, alpha * 0.7);
      gfx.fillCircle(cx - r*0.55, cy - r*0.2, r);
      gfx.fillCircle(cx + r*0.55, cy - r*0.2, r);
      // Triângulo base do coração
      gfx.fillTriangle(
        cx - r*1.4, cy - r*0.1,
        cx + r*1.4, cy - r*0.1,
        cx,         cy + r*1.3
      );
      // Brilho
      gfx.fillStyle(0xffd8e8, alpha * 0.55);
      gfx.fillCircle(cx - r*0.3, cy - r*0.5, r * 0.5);

    } else if (type === "estrela") {
      // Nuvem em forma de estrela ⭐ — decorativa
      const cx = x, cy = y;
      const ro = 18 * sc, ri = 8 * sc;
      const pts = 5;
      gfx.fillStyle(0xfff0a0, alpha * 0.80);
      // Desenhar estrela de 5 pontas
      const starPts = [];
      for (let pi = 0; pi < pts * 2; pi++) {
        const angle = (Math.PI / pts) * pi - Math.PI / 2;
        const r = pi % 2 === 0 ? ro : ri;
        starPts.push(cx + Math.cos(angle) * r);
        starPts.push(cy + Math.sin(angle) * r);
      }
      // Phaser Graphics não tem fillPoints nativo fácil; usar fillTriangle a partir do centro
      for (let pi = 0; pi < pts * 2; pi++) {
        const i0 = pi * 2, i1 = ((pi + 1) % (pts * 2)) * 2;
        gfx.fillTriangle(cx, cy, starPts[i0], starPts[i0+1], starPts[i1], starPts[i1+1]);
      }
      // Brilho central
      gfx.fillStyle(0xffffff, alpha * 0.55);
      gfx.fillCircle(cx - ro*0.15, cy - ro*0.18, ro * 0.30);
    }
  }

  // ── Sol animado ────────────────────────────────────────────────
  const SUN_X=160, SUN_Y=72, SUN_R=38;
  function drawSun(angle){
    if(!sunGraphics) return;
    sunGraphics.clear();
    // Halo exterior suave
    sunGraphics.fillStyle(0xffe080,0.10); sunGraphics.fillCircle(SUN_X,SUN_Y,SUN_R+30);
    sunGraphics.fillStyle(0xffe080,0.18); sunGraphics.fillCircle(SUN_X,SUN_Y,SUN_R+22);
    sunGraphics.fillStyle(0xffd700,0.26); sunGraphics.fillCircle(SUN_X,SUN_Y,SUN_R+13);
    // Raios longos (12)
    sunGraphics.lineStyle(3,0xffd700,0.55);
    for(let ri=0;ri<12;ri++){
      const a=angle+Math.PI*2*ri/12;
      sunGraphics.beginPath();
      sunGraphics.moveTo(SUN_X+Math.cos(a)*(SUN_R+15),SUN_Y+Math.sin(a)*(SUN_R+15));
      sunGraphics.lineTo(SUN_X+Math.cos(a)*(SUN_R+30),SUN_Y+Math.sin(a)*(SUN_R+30));
      sunGraphics.strokePath();
    }
    // Raios curtos intercalados
    sunGraphics.lineStyle(2,0xffd700,0.30);
    for(let ri=0;ri<12;ri++){
      const a=angle+Math.PI*2*ri/12+Math.PI/12;
      sunGraphics.beginPath();
      sunGraphics.moveTo(SUN_X+Math.cos(a)*(SUN_R+15),SUN_Y+Math.sin(a)*(SUN_R+15));
      sunGraphics.lineTo(SUN_X+Math.cos(a)*(SUN_R+22),SUN_Y+Math.sin(a)*(SUN_R+22));
      sunGraphics.strokePath();
    }
    // Disco principal
    sunGraphics.fillStyle(0xfff8b0,1); sunGraphics.fillCircle(SUN_X,SUN_Y,SUN_R);
    sunGraphics.fillStyle(0xffd700,1); sunGraphics.fillCircle(SUN_X,SUN_Y,SUN_R-6);
    // Brilho superior esquerdo
    sunGraphics.fillStyle(0xffe040,0.55); sunGraphics.fillCircle(SUN_X-11,SUN_Y-11,SUN_R*0.42);
    sunGraphics.fillStyle(0xffffff,0.22); sunGraphics.fillCircle(SUN_X-14,SUN_Y-14,SUN_R*0.22);
    // ── Face fofa do sol ────────────────────────────────────────
    // Olhos
    sunGraphics.fillStyle(0x7a4000,1);
    sunGraphics.fillCircle(SUN_X-10, SUN_Y-5, 4.5);
    sunGraphics.fillCircle(SUN_X+10, SUN_Y-5, 4.5);
    // Brilho nos olhos
    sunGraphics.fillStyle(0xffffff,0.8);
    sunGraphics.fillCircle(SUN_X-8,  SUN_Y-7, 1.8);
    sunGraphics.fillCircle(SUN_X+12, SUN_Y-7, 1.8);
    // Sorriso (arco)
    sunGraphics.lineStyle(3, 0x7a4000, 1);
    sunGraphics.beginPath();
    sunGraphics.arc(SUN_X, SUN_Y+2, 11, 0.25, Math.PI-0.25);
    sunGraphics.strokePath();
    // Bochechas coradas
    sunGraphics.fillStyle(0xff8060, 0.28);
    sunGraphics.fillCircle(SUN_X-16, SUN_Y+4, 7);
    sunGraphics.fillCircle(SUN_X+16, SUN_Y+4, 7);
  }

  // ── Estrelas noturnas (temas 4+) ───────────────────────────────
  let starSeed = [];
  function drawStars(themeIdx, worldW){
    if(!starGraphics) return;
    starGraphics.clear();
    if(!NIGHT_THEMES.has(themeIdx)) return; // só em temas escuros/noturnos
    // Gerar seed consistente por worldW
    if(starSeed.length===0||starSeed._w!==worldW){
      starSeed=[]; starSeed._w=worldW;
      const count=80+Math.floor(worldW/40);
      for(let i=0;i<count;i++)
        starSeed.push({ x:Math.random()*worldW, y:10+Math.random()*280,
                        r:0.8+Math.random()*1.8, phase:Math.random()*Math.PI*2 });
    }
    const t=Date.now()*0.0008;
    starSeed.forEach(s=>{
      const a=0.4+Math.sin(t+s.phase)*0.35;
      starGraphics.fillStyle(0xffffff,a);
      starGraphics.fillCircle(s.x,s.y,s.r);
    });
  }

  // ── Lua (temas noturnos 4+) ────────────────────────────────────
  function drawMoon(themeIdx){
    if(!moonGraphics) return;
    moonGraphics.clear();
    if(!NIGHT_THEMES.has(themeIdx)) return;
    const mx=820, my=70, mr=30;
    // Halo duplo suave
    moonGraphics.fillStyle(0xfffbe0,0.07); moonGraphics.fillCircle(mx,my,mr+26);
    moonGraphics.fillStyle(0xfffbe0,0.14); moonGraphics.fillCircle(mx,my,mr+14);
    moonGraphics.fillStyle(0xfffbe0,0.22); moonGraphics.fillCircle(mx,my,mr+6);
    // Disco cheio da lua
    moonGraphics.fillStyle(0xfff8d0,1); moonGraphics.fillCircle(mx,my,mr);
    // Sombra crescente — círculo deslocado mais escuro por cima
    moonGraphics.fillStyle(0x1a0840,1); moonGraphics.fillCircle(mx+mr*0.55, my-mr*0.10, mr*0.88);
    // Rebordo brilhante do crescente
    moonGraphics.fillStyle(0xfff0b0,0.30); moonGraphics.fillCircle(mx,my,mr);
    moonGraphics.fillStyle(0x1a0840,1); moonGraphics.fillCircle(mx+mr*0.60, my-mr*0.08, mr*0.88);
    // Crateras na parte visível (esquerda/baixo)
    [[mx-10,my+6,4.5],[mx-18,my-4,3],[mx-6,my+16,2.5]].forEach(([cx,cy,cr])=>{
      moonGraphics.fillStyle(0xe8d898,0.50); moonGraphics.fillCircle(cx,cy,cr);
      moonGraphics.fillStyle(0xc0a848,0.28); moonGraphics.fillCircle(cx+1,cy+1,cr-1);
    });
    // Brilho topo-esquerdo
    moonGraphics.fillStyle(0xffffff,0.45); moonGraphics.fillEllipse(mx-12,my-12,10,7);
    // Pequenas estrelas decorativas à volta da lua
    [[mx+46,my-18,2.2],[mx+38,my+26,1.6],[mx-36,my-22,1.4],[mx+58,my+8,1.8]].forEach(([sx,sy,sr])=>{
      moonGraphics.fillStyle(0xffffff,0.70); moonGraphics.fillCircle(sx,sy,sr);
      moonGraphics.fillStyle(0xffffff,0.35); moonGraphics.fillCircle(sx,sy,sr+2);
    });
  }

  // ── Camada parallax profunda: edifícios em todos os níveis ──────
  function drawFarLayer(themeIdx, worldW){
    if(!farGraphics) return;
    farGraphics.clear();
    // Paletas de cor dos edifícios por tema (20 — uma por nível)
    const BUILD_PALETTES = [
      { walls:[0x1a3060,0x0a2050,0x162848,0x0e1e3a], wins:[0xffd700,0x80d0ff,0xffe880,0xff8040] }, //  0 azul rico
      { walls:[0x5a2800,0x3a1800,0x6a3010,0x2e1200], wins:[0xffd700,0xffe880,0xff8040,0xffc060] }, //  1 crepúsculo
      { walls:[0x005040,0x003830,0x006858,0x002e28], wins:[0x80ffe0,0x40d4b8,0xffd700,0xb0fff0] }, //  2 aqua
      { walls:[0x5a1030,0x3e0820,0x6e1840,0x2e0818], wins:[0xff80c0,0xffd700,0xffb0d0,0xff6090] }, //  3 rosa
      { walls:[0x1a0840,0x0a1a40,0x200830,0x0a2040], wins:[0xffd700,0xffe880,0x80d0ff,0xff8040] }, //  4 lilás noturno
      { walls:[0x103820,0x082810,0x185030,0x062010], wins:[0xa0ffb0,0x40c060,0xffd700,0x80ff90] }, //  5 turquesa
      { walls:[0x5a1800,0x401000,0x682000,0x300c00], wins:[0xffa060,0xffd700,0xff8040,0xffb880] }, //  6 laranja
      { walls:[0x083060,0x042048,0x0c3870,0x021838], wins:[0x80d0ff,0x2898e0,0xffd700,0xb0e8ff] }, //  7 azul noturno
      { walls:[0x500828,0x380518,0x601030,0x280410], wins:[0xffa0c8,0xffd700,0xff80c0,0xffc8de] }, //  8 magenta
      { walls:[0x104020,0x082e10,0x185028,0x061c08], wins:[0xb0ff80,0x30a050,0xffd700,0xd0ffb0] }, //  9 floresta
      { walls:[0x1e4000,0x103000,0x286000,0x0a2800], wins:[0xc0ff40,0x80e000,0xffd700,0xa0f030] }, // 10 verde lima
      { walls:[0x7a3a00,0x5a2a00,0x8a4a10,0x3e1c00], wins:[0xffd700,0xfff0a0,0xff9040,0xffe880] }, // 11 âmbar
      { walls:[0x002050,0x001030,0x003070,0x001828], wins:[0x60d0ff,0x2080e0,0xffd700,0xa0e0ff] }, // 12 oceano
      { walls:[0x3a0060,0x280040,0x500080,0x180030], wins:[0xe080ff,0xffd700,0xc040ff,0xf0b0ff] }, // 13 violeta
      { walls:[0x003830,0x002820,0x005040,0x001e18], wins:[0x40ffe0,0x00d0b0,0xffd700,0x80fff0] }, // 14 teal
      { walls:[0x600010,0x440008,0x780018,0x300008], wins:[0xff8080,0xffd700,0xff4040,0xffb0b0] }, // 15 escarlate
      { walls:[0x003060,0x002048,0x004080,0x001838], wins:[0x80d8ff,0x2898e0,0xffd700,0xb0e8ff] }, // 16 azul céu
      { walls:[0x1a0838,0x0e0428,0x260c50,0x080218], wins:[0xd080ff,0xffd700,0xa040e0,0xf0c0ff] }, // 17 índigo
      { walls:[0x003818,0x002410,0x005228,0x001808], wins:[0x60ff90,0x20d060,0xffd700,0xa0ffb0] }, // 18 verde floresta
      { walls:[0x7a3a00,0x5a2a00,0x8a4a10,0x3e1c00], wins:[0xffd700,0xfff0a0,0xff9040,0xffe880] }, // 19 final dourado
    ];
    const palette = BUILD_PALETTES[themeIdx % BUILD_PALETTES.length];
    const buildColors = palette.walls;
    const winColors   = palette.wins;
    const step=90;
    const groundBase=520;
    for(let i=0;i<Math.ceil(worldW/step)+2;i++){
      const bx=i*step+(i%3)*18;
      const bh=60+((i*37)%80);
      const bw=44+((i*23)%30);
      farGraphics.fillStyle(buildColors[i%buildColors.length],0.75);
      farGraphics.fillRect(bx,groundBase-bh,bw,bh);
      // Janelas iluminadas
      const wc=winColors[i%winColors.length];
      for(let wy=groundBase-bh+8;wy<groundBase-8;wy+=14){
        for(let wx=bx+6;wx<bx+bw-8;wx+=12){
          if(Math.abs(Math.sin(i*7+wy+wx))>0.3){
            farGraphics.fillStyle(wc,0.50+Math.abs(Math.sin(i+wy*0.1))*0.35);
            farGraphics.fillRect(wx,wy,7,8);
          }
        }
      }
      // Contorno topo
      farGraphics.fillStyle(0xffffff,0.07);
      farGraphics.fillRect(bx,groundBase-bh,bw,2);
    }
  }

  // ── Confetes de fundo nos últimos níveis (7+) ─────────────────
  function spawnBgConfetti(scene, themeIdx, worldW){
    bgConfetti.forEach(c=>{if(c.gfx)c.gfx.destroy();});
    bgConfetti=[];
    if(themeIdx < 7) return; // só nos últimos 3 níveis
    const emojis=["🎈","🌟","✨","🎊","⭐"];
    const count=18+Math.floor(worldW/200);
    for(let i=0;i<count;i++){
      const gfx=scene.add.text(
        Math.random()*worldW,
        50+Math.random()*380,
        emojis[i%emojis.length],
        {fontSize:"16px"}
      ).setDepth(-45).setScrollFactor(0.08).setAlpha(0.18+Math.random()*0.14);
      bgConfetti.push({gfx, baseY:parseFloat(gfx.y), speed:0.15+Math.random()*0.25, phase:Math.random()*Math.PI*2});
    }
  }


  // ── Cartazes pedagógicos no fundo ────────────────────────────
  // Cada nível pode ter um QUIZ_TIPS[quizTheme] associado.
  // Criamos 2-3 cartazes a diferentes alturas ao longo do nível,
  // com a dica-chave, para a criança chegar à porta "quente".
  let levelPosters = [];
  function spawnLevelPosters(scene, L){
    levelPosters.forEach(p=>{ if(p&&p.active) p.destroy(); });
    levelPosters = [];
    const theme = L.quizTheme || "historia";
    const tip   = QUIZ_TIPS[theme] || "";
    if (!tip) return;

    // Posições distribuídas ao longo do nível (evita spawn e porta)
    const worldW  = L.worldW || 2600;
    const doorX   = L.doorX  || worldW - 200;
    const spawnX  = L.spawn?.x || 120;
    const gap     = (doorX - spawnX - 200) / 3;
    const posX    = [spawnX + 140, spawnX + gap + 200, spawnX + gap * 2 + 160];
    const posY    = [360, 300, 360]; // alturas variadas, sempre acima do chão

    // Quebrar o tip em linhas de ~26 chars
    function wrapText(str, maxLen) {
      const words = str.split(" "); const lines = []; let cur = "";
      words.forEach(w => {
        if ((cur + " " + w).trim().length > maxLen) { lines.push(cur.trim()); cur = w; }
        else cur = (cur + " " + w).trim();
      });
      if (cur) lines.push(cur.trim());
      return lines;
    }
    const lines = wrapText(tip, 28);

    posX.forEach((px, i) => {
      const py = posY[i % posY.length];
      const w  = 200, lh = 16;
      const h  = 14 + lines.length * lh + 8;

      // Poste
      const gfx = scene.add.graphics().setDepth(-4).setScrollFactor(1.0);
      gfx.fillStyle(0x7a4a20, 0.90);
      gfx.fillRect(px - 4, py + h * 0.5, 8, 510 - py - h * 0.5);

      // Fundo do cartaz
      gfx.fillStyle(0x1a0440, 0.82);
      gfx.fillRoundedRect(px - w/2, py - h/2, w, h, 8);
      // Borda colorida
      const borderColors = [0xff6b35, 0xffd700, 0x80d0ff, 0xa0ff80];
      gfx.lineStyle(2, borderColors[i % borderColors.length], 0.90);
      gfx.strokeRoundedRect(px - w/2, py - h/2, w, h, 8);
      // Ícone de lâmpada no topo
      const icon = scene.add.text(px, py - h/2 - 10, "💡",
        { fontSize:"14px" }).setOrigin(0.5, 0.5).setDepth(-3).setScrollFactor(1.0).setAlpha(0.88);

      // Texto das linhas
      const textObjs = lines.map((line, li) => {
        const isFirst = li === 0;
        return scene.add.text(px, py - h/2 + 10 + li * lh, line, {
          fontSize: isFirst ? "11px" : "10px",
          fontStyle: isFirst ? "700" : "400",
          color: "#fff0d0",
          stroke: "#000020", strokeThickness: 2,
          wordWrap: { width: w - 14 }
        }).setOrigin(0.5, 0).setDepth(-3).setScrollFactor(1.0).setAlpha(0.92);
      });

      // Pulsar suave no ícone
      scene.tweens.add({ targets: icon, y: icon.y - 4, alpha: { from:0.88, to:1 },
        duration: 1100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

      levelPosters.push(gfx, icon, ...textObjs);
    });
  }

  function clearLevelPosters(){
    levelPosters.forEach(p=>{ if(p&&p.active) p.destroy(); });
    levelPosters = [];
  }

  // ── Decorações animadas nas plataformas ───────────────────────
  function spawnPlatformDecor(scene, platforms){
    platDecorData.forEach(d=>{if(d.gfx&&d.gfx.active)d.gfx.destroy();});
    platDecorData=[];
    if(!platDecorGfx) return;
    const flowerColors=[0xff6b35,0xffd700,0xff80c0,0x80d0ff,0xa0ff80,0xffffff,0xc080ff];
    platforms.getChildren().forEach((plat,pi)=>{
      if(!plat.body) return;
      const pw=plat.displayWidth, px=plat.body.left, py=plat.body.top;
      // Flores: 1 por cada 80px de plataforma
      const numFlowers=Math.max(1,Math.floor(pw/80));
      for(let fi=0;fi<numFlowers;fi++){
        const fx=px+30+fi*(pw-60)/Math.max(1,numFlowers-1);
        const fc=flowerColors[(pi*3+fi)%flowerColors.length];
        platDecorData.push({type:"flower", x:fx, y:py-4, color:fc, phase:Math.random()*Math.PI*2, gfx:null});
      }
      // Borboleta: 1 por cada 3 plataformas
      if(pi%3===0 && pw>100){
        const bx=px+pw*0.6;
        platDecorData.push({type:"butterfly", x:bx, y:py-12, color:flowerColors[pi%flowerColors.length], phase:Math.random()*Math.PI*2, gfx:null});
      }
    });
  }

  function updatePlatformDecor(scene){
    if(!platDecorGfx||platDecorData.length===0) return;
    platDecorGfx.clear();
    const t=scene.time.now*0.001;
    platDecorData.forEach(d=>{
      const sway=Math.sin(t*1.4+d.phase)*2.5; // balanço suave
      if(d.type==="flower"){
        const fy=d.y+sway*0.3;
        // Caule
        platDecorGfx.lineStyle(1.2,0x228830,0.70);
        platDecorGfx.beginPath(); platDecorGfx.moveTo(d.x,fy+6); platDecorGfx.lineTo(d.x+sway*0.5,fy-2); platDecorGfx.strokePath();
        // Pétalas
        platDecorGfx.fillStyle(d.color,0.75);
        platDecorGfx.fillCircle(d.x+sway*0.5,fy-5,3.5);
        platDecorGfx.fillCircle(d.x+sway*0.5+3,fy-2,3.5);
        platDecorGfx.fillCircle(d.x+sway*0.5-3,fy-2,3.5);
        platDecorGfx.fillCircle(d.x+sway*0.5,fy+1,3.5);
        // Centro
        platDecorGfx.fillStyle(0xffd700,0.9);
        platDecorGfx.fillCircle(d.x+sway*0.5,fy-2,2);
      } else if(d.type==="butterfly"){
        const flutter=Math.sin(t*6+d.phase)*0.5; // bater de asas rápido
        const bx=d.x+Math.sin(t*0.8+d.phase)*18; // deriva horizontal
        const by=d.y+Math.sin(t*0.5+d.phase)*8;
        const wOpen=5+Math.abs(flutter)*4;
        // Asas
        platDecorGfx.fillStyle(d.color,0.65);
        platDecorGfx.fillEllipse(bx-wOpen,by,wOpen*2,6);
        platDecorGfx.fillEllipse(bx+wOpen,by,wOpen*2,6);
        platDecorGfx.fillEllipse(bx-wOpen*0.7,by+4,wOpen*1.4,5);
        platDecorGfx.fillEllipse(bx+wOpen*0.7,by+4,wOpen*1.4,5);
        // Corpo
        platDecorGfx.fillStyle(0x1a1a1a,0.55);
        platDecorGfx.fillEllipse(bx,by+1,3,10);
      }
    });
  }

  // Temas "noturnos" — céu escuro (lua + estrelas + aurora boreal)
  // tema 4  → Nível  5 (lilás noturno)
  // tema 6  → Nível  7 (azul noturno profundo)
  // tema 7  → Nível  8 (magenta)
  // tema 11 → Nível 12 (azul oceano)
  // tema 12 → Nível 13 (violeta mágico)
  // tema 13 → Nível 14 (teal escuro)
  // tema 16 → Nível 17 (índigo cósmico)
  // tema 17 → Nível 18 (verde floresta)
  // tema 18 → Nível 19 (vermelho escarlate)
  const NIGHT_THEMES = new Set([4, 6, 7, 11, 12, 13, 16, 17, 18]);

  function applyBackground(scene,themeIdx,worldW,hazardDefs=[]){
    const T=THEMES[themeIdx]||THEMES[0];
    const isNight = NIGHT_THEMES.has(themeIdx);

    // ── CÉU com gradiente triplo mais rico ────────────────────────
    bgGraphics.clear();
    // Camada base — gradiente superior/inferior
    bgGraphics.fillGradientStyle(T.skyTop,T.skyTop,T.skyBot,T.skyBot,1);
    bgGraphics.fillRect(0,0,worldW,540);

    // Faixa de horizonte — tom mais quente/suave no meio
    const horizColor = isNight ? 0x1a0840 : 0xfff0a0;
    bgGraphics.fillStyle(horizColor, isNight ? 0.26 : 0.30);
    bgGraphics.fillRect(0, 300, worldW, 150);

    if (!isNight) {
      // ── RAIOS DE LUZ (god rays) — só temas diurnos ──────────────
      const rayColors = [0xffffff, 0xffe8a0, 0xffd070];
      const numRays = 7;
      for (let ri = 0; ri < numRays; ri++) {
        const rx = SUN_X + (ri - numRays/2) * 38;
        const spread = 180 + ri * 40;
        bgGraphics.fillStyle(rayColors[ri % rayColors.length], 0.025 + (ri%3)*0.010);
        // Triângulo fino do sol até ao chão
        bgGraphics.fillTriangle(SUN_X, SUN_Y, rx - spread*0.5, 540, rx + spread*0.5, 540);
      }
      // Reflexo de luz no chão (halo laranja-amarelo)
      bgGraphics.fillStyle(0xffd070, 0.08);
      bgGraphics.fillEllipse(SUN_X, 490, 400, 80);
    } else {
      // ── AURORA BOREAL — temas noturnos ───────────────────────────
      const auroraColors = [
        [0x00ff80, 0x0080ff],  // índigo-cósmico (tema 4 — lilás)
        [0x00c8ff, 0x0040ff],  // azul noturno vivo (tema 7)
        [0xff40c0, 0x8000ff],  // magenta (tema 8)
        [0x40ff80, 0x00c0ff],  // floresta verde (tema 9)
        [0x00ffcc, 0x4040ff],  // oceano profundo (tema 12)
        [0xc040ff, 0x8000ff],  // violeta mágico (tema 13)
        [0xa040ff, 0x0040e0],  // índigo cósmico (tema 17)
        [0x40ff80, 0x00a040],  // verde floresta brilhante (tema 18)
      ];
      const nightList = [...NIGHT_THEMES].sort((a,b)=>a-b);
      const nightPos  = nightList.indexOf(themeIdx);
      const ac = auroraColors[nightPos % auroraColors.length];
      const auroraCount = 5;
      for (let ai = 0; ai < auroraCount; ai++) {
        const ax = worldW * (0.1 + ai * 0.18);
        const aw = 120 + ai * 60;
        const ah = 80 + ai * 30;
        const alpha = 0.06 + (ai % 3) * 0.03;
        // Faixa vertical ondulada (simulada com elipses inclinadas)
        bgGraphics.fillStyle(ac[ai % 2], alpha);
        bgGraphics.fillEllipse(ax, 180 + ai * 20, aw * 0.35, ah);
        bgGraphics.fillStyle(ac[(ai+1) % 2], alpha * 0.6);
        bgGraphics.fillEllipse(ax + aw * 0.15, 160 + ai * 15, aw * 0.25, ah * 0.7);
      }
    }

    // ── CAMADA PARALLAX PROFUNDA (montanhas/edifícios) ────────────
    drawFarLayer(themeIdx, worldW);

    // ── LUA (temas noturnos) ──────────────────────────────────────
    drawMoon(themeIdx);

    // ── SOL — desenhado em sunGraphics (animado no update) ────────
    // Esconder o sol em temas noturnos
    if(sunGraphics) sunGraphics.setAlpha(NIGHT_THEMES.has(themeIdx) ? 0 : 1);

    // ── ESTRELAS (temas noturnos, redesenhadas no update) ─────────
    starSeed=[]; // forçar reseed
    drawStars(themeIdx, worldW);

    // ── COLINAS ────────────────────────────────────────────────────
    hillsGraphics.clear();
    // Colinas traseiras — tom derivado do tema (não sempre verde)
    const backHillColor = isNight
      ? Phaser.Display.Color.IntegerToColor(T.skyTop).darken(10).color
      : Phaser.Display.Color.IntegerToColor(T.hillColor).lighten(25).color;
    hillsGraphics.fillStyle(backHillColor, isNight ? 0.22 : 0.18);
    for(let i=0;i<Math.ceil(worldW/340)+1;i++)
      hillsGraphics.fillEllipse(i*340+170+(i%2)*40,445,400,200);
    // Colinas da frente — scrollFactor médio
    hillsGraphics.fillStyle(T.hillColor,0.48);
    for(let i=0;i<Math.ceil(worldW/260)+1;i++)
      hillsGraphics.fillEllipse(i*260+130+(i%3)*30,462,320,170);

    // ── ÁRVORES ────────────────────────────────────────────────────
    // Posições alternadas com as casas para não sobrepor
    const treeColors=[0x2d8a40,0x3aaa50,0x228830,0x44cc55];
    // Árvores nos intervalos entre casas: 160, 500, 820, 1220, 1580, 1940, 2280, 2620…
    const treePositions=[];
    for(let i=0;i<Math.ceil(worldW/220);i++)
      treePositions.push(160+i*220+(i%2)*30);

    treePositions.filter(tx=>tx<worldW-40).forEach((tx,ti)=>{
      const tc  = treeColors[ti%treeColors.length];
      const tcL = treeColors[(ti+1)%treeColors.length]; // camada mais clara
      const base= 510;          // Y do chão
      const th  = 60+((ti*41)%30); // altura total 60-90 px
      const tw  = 24+((ti*17)%10); // meia-largura base 24-34

      // 1. Tronco — desenhado primeiro (fica atrás da copa)
      const trunkW=8, trunkH=Math.round(th*0.28);
      hillsGraphics.fillStyle(0x7a4a20,1);
      hillsGraphics.fillRect(tx-trunkW/2, base-trunkH, trunkW, trunkH);
      // Sombra lateral do tronco
      hillsGraphics.fillStyle(0x4a2a08,0.5);
      hillsGraphics.fillRect(tx+trunkW/2-3, base-trunkH, 3, trunkH);

      // Base do tronco onde encontra o chão
      hillsGraphics.fillStyle(0x5a3010,0.6);
      hillsGraphics.fillEllipse(tx, base, trunkW+6, 5);

      // 2. Copa — 3 triângulos sobrepostos, de baixo para cima
      // Camada 1 — base (mais larga, mais escura)
      const y1b = base - trunkH + 4;  // topo desta camada
      const y1t = base - trunkH - Math.round(th*0.28);
      hillsGraphics.fillStyle(tc, 0.9);
      hillsGraphics.fillTriangle(tx-tw, y1b, tx+tw, y1b, tx, y1t);

      // Camada 2 — meio (média largura)
      const y2b = y1t + Math.round(th*0.10);
      const y2t = y2b - Math.round(th*0.28);
      hillsGraphics.fillStyle(tcL, 0.85);
      hillsGraphics.fillTriangle(tx-tw*0.78, y2b, tx+tw*0.78, y2b, tx, y2t);

      // Camada 3 — topo (mais estreita, mais clara)
      const y3b = y2t + Math.round(th*0.10);
      const y3t = y3b - Math.round(th*0.26);
      hillsGraphics.fillStyle(0x44dd66, 0.9);
      hillsGraphics.fillTriangle(tx-tw*0.52, y3b, tx+tw*0.52, y3b, tx, y3t);

      // Brilho no topo da copa
      hillsGraphics.fillStyle(0xaaffaa, 0.30);
      hillsGraphics.fillEllipse(tx-4, y3t+6, 12, 8);
    });

    // ── CASINHAS ──────────────────────────────────────────────────
    const houseColors=[0xf4a090,0x90c0f0,0xf5d080,0xa8d8a0,0xd0a8f0];
    const roofColors =[0xb02020,0x1a6ab0,0xc07800,0x2a8040,0x7020b0];
    const houseX=[340,680,1050,1420,1780,2120,2460];
    houseX.filter(hx=>hx<worldW-80).forEach((hx,hi)=>{
      const hc  = houseColors[hi%houseColors.length];
      const rc  = roofColors[hi%roofColors.length];
      const hw  = 48;           // largura parede
      const hh  = 36;           // altura parede
      const base= 510;          // Y do chão
      const hy  = base - hh;    // Y topo da parede
      const cx  = hx + hw/2;    // centro horizontal

      // --- Sombra no chão ---
      hillsGraphics.fillStyle(0x000000,0.10);
      hillsGraphics.fillEllipse(cx, base+2, hw+8, 6);

      // --- CHAMINÉ — desenhada ANTES do telhado para ficar por baixo ---
      const chimX = cx + 10;
      const chimTop = hy - 22;   // topo visível da chaminé (acima do telhado)
      const chimBot = hy - 4;    // base (enterrada no telhado)
      hillsGraphics.fillStyle(0x9a7055,1);
      hillsGraphics.fillRect(chimX-4, chimTop, 9, chimBot-chimTop);
      // Topo da chaminé (chapéu)
      hillsGraphics.fillStyle(0x6a4a28,1);
      hillsGraphics.fillRect(chimX-6, chimTop-3, 13, 4);

      // --- TELHADO (triângulo) ---
      const roofPeak = hy - 22;  // pico do telhado, mesmo nível do topo visível da chaminé
      hillsGraphics.fillStyle(rc, 1);
      hillsGraphics.fillTriangle(hx-4, hy, hx+hw+4, hy, cx, roofPeak);
      // Face escura (sombra lado esquerdo)
      hillsGraphics.fillStyle(0x000000,0.18);
      hillsGraphics.fillTriangle(cx, roofPeak, hx-4, hy, cx, hy);
      // Beirado (linha branca fina no fundo do telhado)
      hillsGraphics.fillStyle(0xffffff,0.25);
      hillsGraphics.fillRect(hx-4, hy-2, hw+8, 3);

      // --- PAREDE ---
      hillsGraphics.fillStyle(hc, 1);
      hillsGraphics.fillRect(hx, hy, hw, hh);
      // Sombra lateral direita
      hillsGraphics.fillStyle(0x000000,0.08);
      hillsGraphics.fillRect(hx+hw-5, hy, 5, hh);

      // --- JANELAS (2) ---
      const winY = hy + 7;
      [[hx+6, winY],[hx+hw-17, winY]].forEach(([wx,wy])=>{
        // Moldura
        hillsGraphics.fillStyle(0xffffff,0.6);
        hillsGraphics.fillRect(wx-1,wy-1,13,12);
        // Vidro
        hillsGraphics.fillStyle(0xc8eaff,0.9);
        hillsGraphics.fillRect(wx,wy,12,11);
        // Cruz da janela
        hillsGraphics.fillStyle(0xffffff,0.7);
        hillsGraphics.fillRect(wx,wy+4,12,2);
        hillsGraphics.fillRect(wx+5,wy,2,11);
        // Reflexo
        hillsGraphics.fillStyle(0xffffff,0.35);
        hillsGraphics.fillRect(wx+1,wy+1,4,4);
      });

      // --- PORTA ---
      const doorW=12, doorH=18;
      const doorX=cx-doorW/2, doorY=base-doorH;
      // Moldura
      hillsGraphics.fillStyle(0x5a3010,1);
      hillsGraphics.fillRect(doorX-1,doorY-1,doorW+2,doorH+1);
      // Porta
      hillsGraphics.fillStyle(0x8b5a2a,1);
      hillsGraphics.fillRect(doorX,doorY,doorW,doorH);
      // Arco
      hillsGraphics.fillStyle(0x8b5a2a,1);
      hillsGraphics.fillEllipse(cx,doorY,doorW,8);
      hillsGraphics.fillStyle(0x5a3010,0.4);
      hillsGraphics.fillEllipse(cx,doorY,doorW+2,8);
      // Maçaneta
      hillsGraphics.fillStyle(0xffd700,1);
      hillsGraphics.fillCircle(doorX+doorW-3,doorY+doorH/2,2);
    });

    // ── CHÃO com relva temática ────────────────────────────────────
    groundGraphics.clear();
    // Cor da relva adaptada ao tema
    const grassMain = T.grassTop || 0x3aaa50;
    const grassLight = Phaser.Display.Color.IntegerToColor(grassMain);
    // Helper: verifica se uma posição X está dentro de uma zona de hazard
    const inHazard = (x, margin=0) => hazardDefs.some(h => {
      const half = h.w / 2;
      return x >= h.x - half - margin && x <= h.x + half + margin;
    });
    // Camada de terra — comum a tudo (a lava fica por cima nas zonas de perigo)
    groundGraphics.fillStyle(isNight ? 0x180830 : 0x6b3a1f, 1);
    groundGraphics.fillRect(0,518,worldW,22);
    // Faixa de relva — apenas nas zonas sem hazard
    groundGraphics.fillStyle(grassMain, 1);
    if (!hazardDefs.length) {
      groundGraphics.fillRect(0,510,worldW,12);
    } else {
      // Desenhar relva em segmentos, pulando as zonas de lava
      let sx = 0;
      while (sx < worldW) {
        if (!inHazard(sx + 7)) {
          // encontrar fim do segmento seguro
          let ex = sx;
          while (ex < worldW && !inHazard(ex + 7)) ex += 7;
          groundGraphics.fillRect(sx,510,ex-sx,12);
          sx = ex;
        } else {
          sx += 7;
        }
      }
    }
    // Relva detalhada — tufos triangulares apenas onde não há lava
    const grassHighlight = Phaser.Display.Color.IntegerToColor(grassMain);
    groundGraphics.fillStyle(
      Phaser.Display.Color.GetColor(
        Math.min(255, grassHighlight.r + 30),
        Math.min(255, grassHighlight.g + 30),
        Math.min(255, grassHighlight.b + 20)
      ), 0.85
    );
    for(let gi=0;gi<Math.floor(worldW/14);gi++){
      const gx=gi*14+(gi%3)*2;
      if(inHazard(gx+3, 4)) continue; // pular tufos sobre lava
      groundGraphics.fillTriangle(gx,510, gx+7,510, gx+3,500);
      if(gi%2===0) groundGraphics.fillTriangle(gx+4,510,gx+10,510,gx+7,503);
    }
    // Linha de brilho topo relva — apenas fora das zonas de lava
    groundGraphics.fillStyle(isNight ? 0x8080ff : 0x80ff90, isNight ? 0.18 : 0.32);
    if (!hazardDefs.length) {
      groundGraphics.fillRect(0,510,worldW,3);
    } else {
      let sx2 = 0;
      while (sx2 < worldW) {
        if (!inHazard(sx2 + 4)) {
          let ex2 = sx2;
          while (ex2 < worldW && !inHazard(ex2 + 4)) ex2 += 4;
          groundGraphics.fillRect(sx2,510,ex2-sx2,3);
          sx2 = ex2;
        } else {
          sx2 += 4;
        }
      }
    }
    // Linha sombra base
    groundGraphics.fillStyle(0x000000,0.14);
    groundGraphics.fillRect(0,536,worldW,4);
    // Pedra escura nas zonas de hazard — substitui visualmente a relva por chão de rocha calcinada
    if (hazardDefs.length) {
      hazardDefs.forEach(h => {
        const half = h.w / 2;
        // Base de rocha escura
        groundGraphics.fillStyle(0x2a1a0a, 1);
        groundGraphics.fillRect(h.x - half, 510, h.w, 30);
        // Crachas/fissuras na pedra
        groundGraphics.fillStyle(0x1a0a00, 0.9);
        for(let ci=0; ci<Math.floor(h.w/18); ci++){
          const cx = h.x - half + 6 + ci*18 + (ci%3)*3;
          groundGraphics.fillRect(cx, 512, 2, 6 + (ci%3)*3);
          groundGraphics.fillRect(cx+5, 515, 1, 4);
        }
        // Borda superior avermelhada (calor da lava)
        groundGraphics.fillStyle(0x8b2200, 0.85);
        groundGraphics.fillRect(h.x - half, 510, h.w, 4);
        // Pontos de brasa incandescente
        groundGraphics.fillStyle(0xff4400, 0.6);
        for(let bi=0; bi<Math.floor(h.w/22); bi++){
          const bx = h.x - half + 8 + bi*22 + (bi%4)*3;
          groundGraphics.fillCircle(bx, 511, 2);
        }
      });
    }

    // ── FLORES no chão ─────────────────────────────────────────────
    decorGraphics.clear();
    const fc=[0xff6b35,0xffd700,0xff80c0,0x80d0ff,0xa0ff80,0xffffff];
    for(let fi=0;fi<Math.floor(worldW/38);fi++){
      const fx=18+fi*38+(fi%4)*5, fy=507+(fi%2)*2;
      if(inHazard(fx, 8)) continue; // não colocar flores sobre zonas de lava/ácido/abismo
      const cc=fc[fi%fc.length];
      // Pétalas
      decorGraphics.fillStyle(cc,0.85);
      decorGraphics.fillCircle(fx,fy-3,4);
      decorGraphics.fillCircle(fx+3,fy,4);
      decorGraphics.fillCircle(fx-3,fy,4);
      decorGraphics.fillCircle(fx,fy+3,4);
      // Centro amarelo
      decorGraphics.fillStyle(0xffd700,1);
      decorGraphics.fillCircle(fx,fy,2.5);
    }

    // Respawnar nuvens com nova worldW
    if(clouds.length>0) spawnClouds(scene,worldW);

    // Confetes de fundo (últimos níveis)
    spawnBgConfetti(scene, themeIdx, worldW);
  }

  // ===== Botões UI =====
  btnMute.onclick=()=>{muted=!muted;btnMute.textContent=muted?"🔇 Som: OFF":"🔊 Som: ON";if(!muted){ensureAudio();SFX.coin();}saveGame();};

  // Botão 📱 Botões — disponível antes e durante o jogo
  // touchState exposto em window para createTouchInput poder consultar
  window._dc_touchState = "auto";
  (()=>{
    const applyTouchState = (state) => {
      window._dc_touchState = state;
      document.body.classList.toggle("force-touch", state === "on");
      document.body.classList.toggle("hide-touch",  state === "off");
      const lbl =
        state === "on"  ? "📱 Botões: ON"  :
        state === "off" ? "📱 Botões: OFF" : "📱 Botões: AUTO";
      ["btnTouchToggle","mBtnTouch","btnTouchToggleStart"].forEach(id => {
        const el = document.getElementById(id); if (el) el.textContent = lbl;
      });
    };
    const handleClick = () => {
      const tc = document.getElementById("touchControls");
      const autoVisible = tc && getComputedStyle(tc).display !== "none";
      const cur = window._dc_touchState;
      let next;
      if (cur === "auto") { next = autoVisible ? "off" : "on"; }
      else if (cur === "on") { next = "off"; }
      else { next = "auto"; }
      applyTouchState(next);
    };
    ["btnTouchToggle","mBtnTouch","btnTouchToggleStart"].forEach(id => {
      const el = document.getElementById(id); if (el) el.onclick = handleClick;
    });
  })();
  btnHow.onclick=()=>howOverlay.classList.remove("hidden");
  btnCloseHow.onclick=()=>howOverlay.classList.add("hidden");

  // ===== Ecrã todo =====
  const isIOS=/iP(hone|ad|od)/.test(navigator.userAgent);

  function toggleFullscreen(){
    if(isIOS){ alert("No iPhone/iPad usa 'Partilhar' → 'Adicionar ao ecrã de início'."); return; }
    if(!document.fullscreenElement&&!document.webkitFullscreenElement){
      const el=document.documentElement;
      if(el.requestFullscreen) el.requestFullscreen();
      else if(el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } else {
      if(document.exitFullscreen) document.exitFullscreen();
      else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }
  function updateFsButtons(full){
    const lbl=full?"✕ Ecrã normal":"⛶ Ecrã todo";
    const b1=document.getElementById("btnFullscreen");
    const b2=document.getElementById("btnFullscreenGame");
    if(b1) b1.textContent=lbl;
    if(b2) b2.textContent=lbl;
  }
  document.addEventListener("fullscreenchange",()=>updateFsButtons(!!document.fullscreenElement));
  document.addEventListener("webkitfullscreenchange",()=>updateFsButtons(!!document.webkitFullscreenElement));
  const btnFs=document.getElementById("btnFullscreen");
  const btnFsGame=document.getElementById("btnFullscreenGame");
  if(btnFs) btnFs.onclick=toggleFullscreen;
  if(btnFsGame) btnFsGame.onclick=toggleFullscreen;
  window.addEventListener("keydown",e=>{ if(e.key?.toLowerCase()==="f"&&!e.target.matches("input")) toggleFullscreen(); });

  // ===== Alto Contraste — tecla H =====
  (()=>{
    let hcOn = false;
    function applyHC(on) {
      hcOn = on;
      document.body.classList.toggle("hc-mode", on);
      try { localStorage.setItem("vanbertos_hc", on ? "1" : "0"); } catch {}
    }
    // Restaurar preferência guardada
    try { if (localStorage.getItem("vanbertos_hc") === "1") applyHC(true); } catch {}
    // Tecla H
    window.addEventListener("keydown", e => {
      if (e.key?.toLowerCase() === "h" && !e.target.matches("input")) {
        applyHC(!hcOn);
      }
    });
  })();

  btnStart.onclick=()=>{
    ensureAudio();SFX.coin();
    playerName=(playerNameInput?.value||"").trim();
    currentLevel=0;score=0;lives=3;livesLostThisLevel=0;
    resetQuizStats();
    try{localStorage.removeItem(SAVE_KEY);}catch{}
    startOverlay.classList.add("hidden");
    document.body.classList.add("game-started");
    if (!window.__dc_game) {
      initPhaser();
      // Wait for Phaser scene to be ready
      const waitScene = setInterval(() => {
        if (sceneRef) {
          clearInterval(waitScene);
          // Mostrar nome no elemento HTML
          if(playerNameHUD){
            playerNameHUD.textContent = playerName ? `⭐ ${playerName}` : "";
            playerNameHUD.style.display = playerName ? "block" : "none";
          }
          playLevelTransition(sceneRef, 0, () => {
            loadLevel(sceneRef, 0);
            showHistory(0, () => {
              if(!pausedByTeacher) sceneRef.physics.resume();
            });
            saveGame();
          });
        }
      }, 50);
    } else if (sceneRef) {
      playLevelTransition(sceneRef, 0, () => {
        loadLevel(sceneRef, 0);
        showHistory(0, () => {
          if(!pausedByTeacher) sceneRef.physics.resume();
        });
        saveGame();
      });
    }
  };

  const btnRetry=document.getElementById("btnRetry"), btnExit=document.getElementById("btnExit");
  if(btnRetry) btnRetry.onclick=()=>{
    gameOverOverlay.classList.add("hidden");
    lives=3;score=0;resetQuizStats();livesLostThisLevel=0;
    Object.keys(usedQuizByLevel).forEach(k=>usedQuizByLevel[k].clear());
    Object.keys(usedQuizByTheme).forEach(k=>usedQuizByTheme[k].clear());
    scoreText.setText(`🌟 Pontos: ${score}`);updateHearts();
    loadLevel(sceneRef,0);
    showHistory(0, () => { if(!pausedByTeacher) sceneRef.physics.resume(); });
    saveGame();
  };
  if(btnExit) btnExit.onclick=()=>{
    gameOverOverlay.classList.add("hidden");try{sceneRef.physics.pause();}catch{}
    lives=3;score=0;resetQuizStats();livesLostThisLevel=0;
    startOverlay.classList.remove("hidden");
  };

  const btnWinRestart=document.getElementById("btnWinRestart");
  if(btnWinRestart) btnWinRestart.onclick=()=>{
    winOverlay.classList.add("hidden");
    document.getElementById("confetti")?.classList.add("hidden");
    lives=3;score=0;currentLevel=0;resetQuizStats();livesLostThisLevel=0;
    Object.keys(usedQuizByLevel).forEach(k=>usedQuizByLevel[k].clear());
    Object.keys(usedQuizByTheme).forEach(k=>usedQuizByTheme[k].clear());
    awaitingQuiz=false;
    try{sceneRef.physics.pause();}catch{}
    startOverlay.classList.remove("hidden");
    document.body.classList.remove("game-started");
    saveGame();
  };
});

// Resize
window.addEventListener("resize",()=>{try{if(window.__dc_game?.scale)window.__dc_game.scale.refresh();}catch{}});

// Pausa automática ao mudar de separador
document.addEventListener("visibilitychange",()=>{
  try{
    const game=window.__dc_game; if(!game) return;
    const scene=game.scene.scenes[0]; if(!scene) return;
    if(document.hidden){
      scene.physics.pause();
      // Parar melodia da estrela para não continuar em background
      if(window._dc_starMelodyInterval){
        clearInterval(window._dc_starMelodyInterval); window._dc_starMelodyInterval=null;
      }
    } else{
      const overlays=["startOverlay","quizOverlay","historyOverlay","gameOverOverlay","winOverlay"];
      const anyOpen=overlays.some(id=>{const el=document.getElementById(id);return el&&!el.classList.contains("hidden");});
      const isPaused=!!(document.getElementById("btnPause")?.textContent?.includes("Continuar"));
      // Não retomar durante animação da porta ou quiz (awaitingQuiz cobre ambos)
      const isAwaitingQuiz = typeof awaitingQuiz !== "undefined" && awaitingQuiz;
      if(!anyOpen&&!isPaused&&!isAwaitingQuiz) scene.physics.resume();
    }
  }catch{}
});
