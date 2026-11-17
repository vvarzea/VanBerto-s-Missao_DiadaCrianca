// ===== Sistemas de progressão: mapa, artefactos, conquistas =====
// MAP_REGIONS, ARTEFACTS, ARTEFACT_SETS, SET_REACTIONS, ACHIEVEMENTS_DEFS

// Reorganizado pelos 4 pilares da Convenção sobre os Direitos da Criança
// (Sobrevivência / Desenvolvimento / Proteção / Participação — UNICEF),
// mantendo os 20 níveis e a sua dificuldade intactos (só o TEMA de cada
// nível mudou de posição, ver data-levels.js). Sobrevivência só tem 1 nível
// próprio (Saúde) no conteúdo atual do jogo, por isso fica junto ao
// prólogo histórico no 1º mundo, em vez de sozinho num "mundo" de 1 nível.
export const MAP_REGIONS = [
  { id:"origens",        icon:"📜", name:"Reino das Origens",       sub:"A história dos direitos — e a Saúde",     levels:[0,1,2,3,4] },
  { id:"desenvolvimento",icon:"📚", name:"Vale do Desenvolvimento", sub:"Brincar, futuro, cultura e educação",     levels:[5,6,7,8] },
  { id:"protecao",       icon:"🛡️", name:"Fortaleza da Proteção",   sub:"Família, refúgio, trabalho e ambiente",   levels:[9,10,11,12,13,14] },
  { id:"participacao",   icon:"🗣️", name:"Cidade da Participação",  sub:"Identidade, privacidade e expressão",     levels:[15,16,17,18,19] },
  { id:"base",           icon:"🏠", name:"Base do VanBerto's",       sub:"O teu ponto de partida",                  levels:[] },
];

export const ARTEFACTS = [
  // idx 0-4 — Conjunto: Origens
  { emoji:"🎈", name:"Balão da Celebração",  short:"Dia da Criança",   color:"#ff6b35", glow:"rgba(255,107,53,0.6)",  vanberto:"Que dia especial! 1 de junho é NOSSO!", set:0 },
  { emoji:"📜", name:"Rolo da Declaração",   short:"Declaração 1959",  color:"#ffd700", glow:"rgba(255,215,0,0.6)",   vanberto:"1959! O mundo disse: crianças têm direitos!", set:0 },
  { emoji:"🌍", name:"Globo da Convenção",   short:"Convenção 1989",   color:"#40d0ff", glow:"rgba(64,208,255,0.6)",  vanberto:"Quase todo o mundo assinou! Incrível!", set:0 },
  { emoji:"⚽", name:"Bola do Brincar",      short:"Direito ao Brincar",color:"#ff80c0", glow:"rgba(255,128,192,0.6)",vanberto:"Brincar é aprender! Nunca pares!", set:0 },
  { emoji:"📚", name:"Livro do Saber",       short:"Direito à Educação",color:"#a0e0ff", glow:"rgba(160,224,255,0.6)",vanberto:"O conhecimento é o maior tesouro!", set:0 },
  // idx 5-9 — Conjunto: Bem-estar
  { emoji:"💊", name:"Cristal da Saúde",     short:"Direito à Saúde",  color:"#80ffb0", glow:"rgba(128,255,176,0.6)",vanberto:"Saudável e feliz — assim devemos ser!", set:1 },
  { emoji:"🛡️", name:"Escudo Protetor",      short:"Direito à Proteção",color:"#c0a0ff",glow:"rgba(192,160,255,0.6)",vanberto:"Nenhuma criança deve ter medo!", set:1 },
  { emoji:"🗣️", name:"Corneta da Voz",       short:"Direito a Ser Ouvido",color:"#ffa040",glow:"rgba(255,160,64,0.6)",vanberto:"A tua opinião importa SEMPRE!", set:1 },
  { emoji:"🌱", name:"Semente do Futuro",    short:"Futuro Sustentável",color:"#60e060", glow:"rgba(96,224,96,0.6)", vanberto:"Juntos construímos um futuro melhor!", set:1 },
  { emoji:"🌟", name:"Estrela da UNICEF",    short:"A Guardiã UNICEF",  color:"#ffe060", glow:"rgba(255,224,96,0.6)",vanberto:"A UNICEF protege crianças em todo o mundo!", set:1 },
  // idx 10-14 — Conjunto: Identidade
  { emoji:"🪪", name:"Medalha da Identidade",short:"Direito à Identidade",color:"#ff9060",glow:"rgba(255,144,96,0.6)",vanberto:"O teu nome é o primeiro direito que tens!", set:2 },
  { emoji:"🏠", name:"Lar da Família",       short:"Direito à Família", color:"#ffc060", glow:"rgba(255,192,96,0.6)",vanberto:"A família é o nosso porto seguro!", set:2 },
  { emoji:"✈️", name:"Asa dos Refugiados",   short:"Crianças Refugiadas",color:"#80c8ff",glow:"rgba(128,200,255,0.6)",vanberto:"Refugiado não significa sem direitos!", set:2 },
  { emoji:"🚫", name:"Corrente Partida",     short:"Sem Trabalho Infantil",color:"#ff6060",glow:"rgba(255,96,96,0.6)",vanberto:"Crianças têm direito a ser crianças!", set:2 },
  { emoji:"🗽", name:"Tocha da Expressão",   short:"Liberdade de Expressão",color:"#ffd080",glow:"rgba(255,208,128,0.6)",vanberto:"A tua voz é poderosa! Usa-a!", set:2 },
  // idx 15-19 — Conjunto: Mundo Moderno
  { emoji:"🔒", name:"Cadeado da Privacidade",short:"Direito à Privacidade",color:"#c080ff",glow:"rgba(192,128,255,0.6)",vanberto:"Os teus segredos são teus! Cuida-os!", set:3 },
  { emoji:"🎭", name:"Máscara da Cultura",   short:"Cultura e Língua",  color:"#ff80a0", glow:"rgba(255,128,160,0.6)",vanberto:"7000 línguas! Cada uma é um tesouro!", set:3 },
  { emoji:"♿", name:"Roda da Inclusão",     short:"Direito à Inclusão", color:"#60d0ff", glow:"rgba(96,208,255,0.6)", vanberto:"Juntos somos mais fortes!", set:3 },
  { emoji:"🌿", name:"Folha do Ambiente",    short:"Ambiente Saudável",  color:"#80ff80", glow:"rgba(128,255,128,0.6)",vanberto:"O planeta precisa de ti! Age já!", set:3 },
  { emoji:"💻", name:"Chip Digital",         short:"Direitos Digitais",  color:"#60ffff", glow:"rgba(96,255,255,0.6)", vanberto:"Online também tens direitos!", set:3 },
];

export const ARTEFACT_SETS = [
  { name:"Origens dos Direitos",    icon:"📜", bonus:150 },
  { name:"Bem-estar das Crianças",  icon:"💚", bonus:150 },
  { name:"Identidade e Mundo",      icon:"🌍", bonus:150 },
  { name:"Mundo Moderno",           icon:"💻", bonus:200 },
];

export const SET_REACTIONS = [
  "🎉 Conjunto ORIGENS completo! És um verdadeiro historiador!",
  "💚 Conjunto BEM-ESTAR completo! O teu coração é enorme!",
  "🌍 Conjunto IDENTIDADE completo! Conheces o mundo inteiro!",
  "💻 Conjunto COMPLETO! GUARDIÃO SUPREMO dos Direitos!",
];

export const ACHIEVEMENTS_DEFS = [
  { id:"primeiros_passos", tier:"🥉", name:"Primeiros Passos",      desc:"Completa o primeiro nível." },
  { id:"curioso",          tier:"🥉", name:"Curioso",                desc:"Lê 10 curiosidades." },
  { id:"explorador",       tier:"🥈", name:"Explorador",             desc:"Encontra todos os segredos de um nível." },
  { id:"sabio",            tier:"🥈", name:"Sábio",                  desc:"Acerta 20 perguntas." },
  { id:"caca_tesouros",    tier:"🏆", name:"Caçador de Tesouros",    desc:"Encontra todas as salas secretas do jogo." },
  { id:"guardiao",         tier:"🥇", name:"Guardião dos Direitos",  desc:"Completa o jogo." },
  { id:"mestre",           tier:"🥇", name:"Mestre VanBerto's",      desc:"Acerta todas as perguntas à primeira tentativa." },
  { id:"lenda",            tier:"🏆", name:"Lenda dos Direitos",     desc:"100% de conclusão — todos os níveis e todas as estrelas." },
];

