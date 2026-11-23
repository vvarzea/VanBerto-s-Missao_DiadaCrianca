// ===== Definições dos Bosses temáticos — Fase 3 =====
// Ficheiro puramente de dados — zero acoplamento ao motor do jogo.
// "afterLevel" é o índice (0-based) do nível DEPOIS do qual o boss aparece,
// exactamente como currentLevel já é usado em LEVELS — NUNCA altera o array LEVELS.
//
// quizTheme tem de corresponder a uma chave existente em QUIZ_BY_THEME (data-quiz.js).
// Confirma os nomes exactos das chaves aí antes de ativar cada boss.

export const BOSSES = [
  {
    id: "monstro_ignorancia",
    afterLevel: 8,           // MOVIDO: era o boss do Mundo 1 (após o nível 4); passa a ser o
                              // 2º boss, a fechar o pilar Desenvolvimento (Níveis 6-9 —
                              // brincar, futuro, cultura, educação). quizTheme/rightRecovered
                              // já eram "educacao", que continua a ser o último nível do bloco.
    name: "Monstro da Ignorância",
    emoji: "👾",
    color: 0x8a5cff,
    // ===== Redesenho "Boss clássico à Mario" (nova) =====
    // Filosofia: arena do tamanho da janela (sem scroll), poucas plataformas,
    // e uma mecânica só — saltar-lhe em cima 3 vezes. Nada de fases, nada de
    // ataque especial, nada de fase de recolha à parte. Simples, rápido,
    // divertido. stompBoss=true liga este modo dedicado no motor do jogo;
    // os outros 3 bosses (ainda sem stompBoss) continuam exactamente iguais.
    stompBoss: true,
    shield: { type: "cloak", up: 2200, down: 2700, msg: "🌫️ Está escondido no nevoeiro! Espera que apareça" },
    stompLabel: "📚 Ignorância vencida",
    rageLines: { angry: "Não vou deixar-vos aprender!", desperate: "A educação… está a vencer!" },
    stompsToDefeat: 3,       // 3 saltos na cabeça = derrotado (reaproveita def.hp)
    // Melhorias "mais género Mario" (pedido), sem nenhum perigo novo no
    // chão — ver spawnBossSprite/damageBoss/doBossRollQmark em
    // dia-crianca.js: entrada dramática (cresce até ao tamanho final),
    // golpe final mais espetacular (hitstop + flash + explosão maior no
    // 3º salto) e ataque duplo quando está na fúria máxima.
    entranceGrow: true,
    epicDefeat: true,
    doubleThrowAtMaxRage: true,
    movementType: "patrol",  // anda devagar de um lado para o outro — nunca teletransporta, nunca desaparece
    patrolSpeed: 55,
    hopEvery: 2400,          // de vez em quando dá um pequeno salto (só visual)
    qmarkEvery: 2200,        // atira uma bola ❓ que salta devagar pelo chão
    // Chão ao mesmo nível dos níveis normais (plataforma principal com topo
    // em y=506, tal como o chão de qualquer nível — ver data-levels.js) —
    // antes desta arena tinha o chão 21px mais alto (topo em y=485, igual
    // aos outros 2 bosses), o que o destacava visualmente dos níveis normais
    // que vêm mesmo antes/depois do combate.
    //
    // bossY: centro do sprite, NÃO os pés — tem de descontar a metade do
    // corpo desenhado (canvas 116px, escala 1.5, pés ~49px abaixo do centro
    // → 49*1.5≈73px) até à superfície do chão da arena (plataforma principal
    // agora em y=521 com 30px de altura → topo em y=506). 506-73=433.
    bossY: 433,
    bossScale: 0.75,         // as imagens novas têm 232 px (o dobro dos desenhos antigos): 0.75 dá o mesmo tamanho no ecrã que 1.5 dava aos antigos
    // A textura (116x116) tem bastante espaço vazio por cima da cabeça (o
    // corpo começa só a ~1/5 do canvas) — sem isto a barra de vida usava a
    // conta genérica (baseada no canvas inteiro) e ficava muito afastada da
    // cabeça. 72px do centro chega perto o suficiente, com uma pequena folga.
    hpBarOffset: 72,
    // Letreiro do objetivo (ver startBossFight): fica perto do chão, junto
    // ao ponto de partida do jogador — 486 é o mesmo valor por omissão dos
    // níveis normais, por isso não precisa de ajuste com a mudança de chão.
    signY: 486,
    // signX (opt-in): sem isto, o letreiro do objetivo usava playerStartX+80
    // (=480) por omissão — como este boss tem playerStartX deslocado para o
    // centro (ver arena.playerStartX, mais abaixo), isso caía mesmo no vão
    // ABERTO entre as duas plataformas baixas (155-305 e 655-805), a flutuar
    // no ar em vez de ficar por baixo de alguma delas. 230 é o centro da
    // plataforma baixa esquerda — reposiciona o letreiro para ficar
    // visualmente "pousado" por baixo dela. Os outros 3 bosses têm o mesmo
    // problema (playerStartX também em 400, ver comentário nas respetivas
    // arenas) e por isso têm o seu próprio signX explícito, cada um com o
    // centro da sua plataforma baixa esquerda.
    signX: 230,
    intro: "Sem saber, não há poder! Vou apagar tudo o que aprendeste!",
    defeatLine: "Nãoo! O conhecimento é mais forte!",
    quizTheme: "educacao",
    hp: 3,
    // Tema próprio (em vez do índigo/roxo-noturno nº16, que se confundia
    // com o próprio Monstro — também roxo): castanho-ouro quente, para o
    // vilão roxo se destacar claramente do fundo.
    themeIdx: 15,
    rightRecovered: { emoji: "📚", name: "Direito à Educação" },
    // Arena simples: do tamanho da janela (960x540, sem scroll), chão
    // principal + só 2 plataformas baixas para dar alguma variedade ao salto.
    arena: {
      worldW: 960,
      // 514 = mesmo limite físico usado por omissão pelos níveis normais e
      // pelos outros bosses (ver startBossFight em dia-crianca.js) — o chão
      // principal (topo em y=506) fica ligeiramente acima deste limite,
      // exactamente como acontece nos níveis normais, por isso não precisa
      // de um valor próprio.
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506, igual aos níveis normais
        [230,421,150,20],   // plataforma baixa esquerda (deslocada 21px para baixo, junto com o chão)
        [730,421,150,20]    // plataforma baixa direita (idem)
      ],
      // Pedido: o VanBerto's começava sempre bem junto à margem esquerda
      // (120px, o valor por omissão). 400px fica bem mais ao centro da arena
      // (960px de largura), mas ainda fora do alcance das duas plataformas
      // baixas (155-305 e 655-805) — continua a aterrar no chão principal,
      // tal como antes, só que mais perto do meio do ecrã.
      playerStartX: 400,
      decor: [
        { emoji:"📖", x:90,  y:150 },
        { emoji:"📕", x:870, y:170 },
        { emoji:"❓", x:480, y:120 }
      ]
    }
  },
  {
    id: "virus_gigante",
    afterLevel: 4,            // MOVIDO: era o boss do Mundo 2 (após o nível 9/identidade);
                               // passa a ser o 1º boss do jogo, a fechar o pilar Sobrevivência
                               // (Nível 5 — Saúde, o único nível desse pilar).
    name: "Vírus Gigante",
    emoji: "🦠",
    color: 0xe0409a,
    // Convertido para o mesmo "boss clássico à Mario" do Monstro da
    // Ignorância (ver esse comentário para a filosofia completa): arena do
    // tamanho da janela, sem scroll, e uma mecânica só — saltar-lhe em cima
    // 3 vezes. Mantém o seu próprio movimento em onda (flutua, pulsa) e a
    // bola ❓ (aqui retintada a rosa) como única diferença de personalidade.
    stompBoss: true,
    shield: { type: "bubble", up: 2200, down: 2700, msg: "🫧 Bolha protetora! Espera que baixe" },
    stompLabel: "🦠 Vírus travados",
    rageLines: { angry: "Vou espalhar-me outra vez!", desperate: "A saúde… está a vencer!" },
    stompsToDefeat: 3,
    // Melhorias "mais género Mario" (ver comentário completo no Monstro
    // da Ignorância, acima) — mesmo pacote, sem perigo novo no chão.
    entranceGrow: true,
    epicDefeat: true,
    doubleThrowAtMaxRage: true,
    movementType: "wave",    // continua a flutuar em onda, pulsando de tamanho — só a forma de o vencer mudou
    // REBALANCEADO OUTRA VEZ (pedido: "o boss da saúde tem de ser mais fácil
    // porque é o primeiro") — ao passar a ser o 1º boss do jogo (antes era o
    // 2º), o pico de ~168px/s herdado do rebalanceamento anterior (ver
    // histórico abaixo) deixou de fazer sentido: é a primeira vez que a
    // criança vê este tipo de combate, e o movimento em onda (contínuo,
    // sinusoidal) já é menos previsível do que a patrulha simples do Monstro
    // da Ignorância (que continua a ser 55px/s, constante). waveSpeedMult
    // desceu de 0.5 para 0.3 — o pico cai para ~100px/s, bem mais perto do
    // ritmo "primeiro contacto" do outro boss inicial, mantendo waveRange
    // igual para não perder a cobertura da arena (só fica mais lento a
    // percorrê-la, não mais pequeno).
    //
    // Histórico do rebalanceamento anterior (já não se aplica ao contexto
    // atual, mas mantido para registo): "o 2º Boss estava demasiado
    // rápido/frustrante para o 4º ano" → waveSpeedMult reduzido ~32%; depois
    // "ainda instável, movimentos estranhos e muito rápidos" → waveRange
    // encurtado de ~360px para 210px e waveSpeedMult descido para 0.5,
    // chegando ao pico de ~168px/s (próximo dos 110-150px/s dos outros
    // bosses de então). Essa referência ("outros bosses") já não é o padrão
    // certo agora que este é o boss de abertura.
    waveSpeedMult: 0.3,
    waveRange: 210,
    // NOVO (pedido: "morre quase logo ao começar" — arranca demasiado
    // perto do ponto de partida do VanBerto's): sem isto, o boss começava
    // a onda mesmo no centro da arena (480), a só ~80px do spawn (400).
    // Math.PI/2 arranca-o antes no extremo mais longe do spawn (~690px,
    // quase 290px de distância) — ver updateBossFight em dia-crianca.js.
    wavePhaseOffset: Math.PI / 2,
    // qmarkEvery subiu de 2900 → 3400ms (era 2400 antes disso) — como 1º
    // boss do jogo, a criança precisa de mais tempo só para perceber o
    // movimento em onda antes do 1º ataque a sério chegar.
    qmarkEvery: 3400,
    forceFirstOrbRight: true, // pedido: o 1º ataque deste boss vai sempre para a direita — só a partir do 2º persegue mesmo o VanBerto's
    orbTexture: "boss_proj_germ", // micróbio com espigões — antes reutilizava a bola "?" do Monstro, sem sentido temático para um vírus
    orbTint: 0xe0409a,       // rosa, a condizer com o próprio Vírus
    // bossY: mesmo raciocínio do Monstro — chão da arena (topo em y=506)
    // menos metade do corpo desenhado. O Vírus é uma esfera com espigões,
    // sem "pés": medi o pixel mais baixo do desenho (~44px abaixo do centro
    // do canvas de 116px) em vez de adivinhar, tal como fiz para o Monstro.
    // 506 - 44*1.5 = 440.
    bossY: 440,
    bossScale: 0.75,
    hpBarOffset: 88,          // idem — medido a partir do topo real do desenho, não do canvas inteiro
    signY: 486,
    // signX: centro da plataforma baixa esquerda (x=200, ver arena.platforms
    // abaixo) — mesma lógica aplicada ao Monstro da Ignorância: o letreiro
    // fica explicitamente "pousado" por baixo dela, em vez de depender do
    // cálculo por omissão (playerStartX+80, que com o playerStartX agora em
    // 400 daria 480 e cairia no vão aberto entre as plataformas).
    signX: 200,
    intro: "Vou espalhar-me por todo o lado!",
    defeatLine: "Argh! Vacinado... derrotado!",
    quizTheme: "saude", // voltou a "saude" — com a reordenação dos pilares, o Nível 5 (o último antes deste boss) é outra vez sobre saúde
    hp: 3,                     // 4→3: agora são sempre 3 saltos na cabeça, como os outros bosses "stomp"
    themeIdx: 13,              // teal escuro noturno — combina com o verde-água do boss
    rightRecovered: { emoji: "💊", name: "Direito à Saúde" },
    // Arena do tamanho do ecrã (960x540, sem scroll) — chão principal +
    // 2 plataformas baixas, tal como o Monstro da Ignorância.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [200,421,140,20],   // plataforma baixa esquerda
        [760,421,140,20]    // plataforma baixa direita
      ],
      // Mesma lógica do Monstro da Ignorância: o VanBerto's deve começar
      // sempre no mesmo sítio em todos os bosses, em vez do 120 por omissão
      // (que ficaria colado à margem esquerda) — 400 fica fora do alcance
      // das duas plataformas baixas (130-270 e 690-830), continuando a
      // aterrar no chão principal.
      playerStartX: 400,
      decor: [
        { emoji:"💧", x:90,  y:150 },
        { emoji:"🧬", x:480, y:110 },
        { emoji:"💧", x:870, y:170 }
      ]
    }
  },
  {
    id: "guardiao_sombras",
    afterLevel: 18,          // MOVIDO: era o boss do Mundo 3 (após o nível 14); passa a ser o
                              // último boss, a fechar o pilar Participação (Níveis 16-19 —
                              // participação, identidade, privacidade, expressão), com o
                              // Nível 20 (Direitos Digitais) como epílogo depois dele, tal
                              // como o Poluidor Mecânico tinha antes.
    name: "Guardião das Sombras",
    emoji: "🌑",
    color: 0x3a3a5c,
    // Mesma conversão para stompBoss — mantém o teletransporte entre 3
    // pontos (agora sempre à altura do chão, ver bossY/doBossTeleport em
    // dia-crianca.js) como a sua marca própria, mais difícil de apanhar
    // no ar do que um boss que só anda.
    stompBoss: true,
    shield: { type: "notif", up: 2200, down: 2700, msg: "🌑 Anel de sombras! Espera que desapareça" },
    stompLabel: "🌑 Sombras expostas",
    rageLines: { angry: "As sombras ficam mais fundas!", desperate: "A vossa voz… está a vencer-me!" },
    stompsToDefeat: 3,
    // Melhorias "mais género Mario" — este boss usa entranceMaterialize em
    // vez de entranceGrow (ver spawnBossSprite em dia-crianca.js): em vez
    // de crescer, materializa-se a partir de sombras, condizente com a
    // sua identidade de teletransporte/desaparecimento.
    entranceMaterialize: true,
    epicDefeat: true,
    doubleThrowAtMaxRage: true,
    movementType: "teleport",
    teleportDelay: 1700,       // mais rápido que o valor por omissão (2400) — mais difícil de prever
    qmarkEvery: 2000,
    orbTexture: "boss_proj_shadow", // orbe sombrio próprio — antes reutilizava a bola "?" do Monstro só retintada, sem sentido temático para um guardião das sombras
    orbTint: 0x6a3fb5,
    // Momento "último fôlego" (nova, opt-in — só este boss): ao ficar a só 1
    // salto de ser derrotado (bossState.hp===1), lança 2 sombras vindas dos
    // extremos da arena, à altura da cabeça — só se evitam agachado (ver
    // startBossFinalStandBurst em dia-crianca.js). Um pequeno clímax visual
    // para o combate final, sem tocar no hp nem na dificuldade geral.
    finalStandBurst: true,
    // bossY: o Guardião é uma capa/robe sem pernas — medi o pixel mais baixo
    // da bainha (~43px abaixo do centro do canvas). 506 - 43*1.5 = 442.
    bossY: 442,
    bossScale: 0.75,
    hpBarOffset: 82,
    signY: 486,
    // signX: centro da plataforma baixa esquerda (x=220, ver arena.platforms
    // abaixo) — mesma lógica dos outros bosses (ver comentário no Monstro
    // da Ignorância).
    signX: 220,
    intro: "Nas sombras, ninguém te protege!",
    defeatLine: "A luz da tua voz venceu!",
    quizTheme: "expressao", // continua "expressao" — com a reordenação, o Nível 19 (o último antes deste boss) ainda é sobre expressão
    hp: 3,                     // 4→3: agora são sempre 3 saltos na cabeça
    themeIdx: 11,              // azul oceano noturno — fortaleza escura, sem exagerar no preto
    // Recompensa atualizada de "Proteção" para "Expressão" — este boss deixou
    // de fechar o pilar Proteção e passou a fechar o pilar Participação; o
    // Nível 19 (o último antes dele) é sobre expressão, por isso a recompensa
    // passa a refletir isso especificamente, em vez do pilar genérico.
    rightRecovered: { emoji: "🗣️", name: "Direito à Expressão" },
    // Arena do tamanho do ecrã, tal como o Monstro — 3 pontos de teletransporte
    // (spawnSpots) ajustados à nova largura de 960px em vez de 1600px.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [220,421,120,20],   // plataforma baixa esquerda
        [740,421,120,20]    // plataforma baixa direita
      ],
      // Mesma lógica do Monstro da Ignorância: o VanBerto's deve começar
      // sempre no mesmo sítio em todos os bosses, em vez do 120 por omissão
      // — 400 fica fora do alcance das duas plataformas baixas (160-280 e
      // 680-800), continuando a aterrar no chão principal.
      playerStartX: 400,
      spawnSpots: [220, 480, 740]
    }
  },
  {
    id: "poluidor_mecanico",
    afterLevel: 14,          // MOVIDO: era o boss do Mundo 4; passa a ser o 3º boss, a fechar
                             // o pilar Proteção (Níveis 10-15 — proteção, família, refugiados,
                             // trabalho infantil, inclusão, ambiente). quizTheme/rightRecovered
                             // já eram "ambiente", que continua a ser o último nível do bloco.
    name: "Poluidor Mecânico",
    emoji: "🏭",
    color: 0x7a8a5c,
    // Mesma conversão para stompBoss — mantém a patrulha rápida (sensação
    // industrial) mas larga as plataformas móveis e a arena poluída, para
    // caber num único ecrã sem scroll, tal como os outros 3 bosses.
    stompBoss: true,
    shield: { type: "firewall", up: 2200, down: 2700, msg: "⚙️ Engrenagens ligadas! Espera que parem" },
    stompLabel: "🏭 Chaminés travadas",
    rageLines: { angry: "Mais fumo! Mais lixo!", desperate: "O planeta… está a vencer!" },
    stompsToDefeat: 3,
    // Melhorias "mais género Mario" (ver comentário completo no Monstro
    // da Ignorância) — mesmo pacote, sem perigo novo no chão.
    entranceGrow: true,
    epicDefeat: true,
    doubleThrowAtMaxRage: true,
    movementType: "patrol",
    patrolSpeed: 150,        // mais rápido — sensação industrial
    hopEvery: 2000,
    qmarkEvery: 2000,
    orbTexture: "boss_proj_bolt", // parafuso/porca dourada próprio — antes reutilizava a bola "?" do Monstro, sem sentido temático para uma fábrica
    orbTint: 0xffd700,       // dourado, a condizer com as engrenagens
    // bossY: o Poluidor é uma caixa mecânica larga mas mais baixa que os
    // outros — medi o pixel mais baixo do corpo (~26px abaixo do centro do
    // canvas, bem menos que os outros porque não tem "cabeça" alta, só caixa
    // + chaminé). 506 - 26*1.5 = 467.
    bossY: 467,
    bossScale: 0.75,
    hpBarOffset: 82,
    signY: 486,
    // signX: centro da plataforma baixa esquerda (x=200, ver arena.platforms
    // abaixo) — mesma lógica dos outros bosses (ver comentário no Monstro
    // da Ignorância).
    signX: 200,
    intro: "O planeta é meu para sujar!",
    defeatLine: "O verde venceu o cinzento!",
    quizTheme: "ambiente",
    hp: 3,                     // 5→3: agora são sempre 3 saltos na cabeça
    themeIdx: 9,                // âmbar dourado enevoado — céu poluído, ainda de dia
    rightRecovered: { emoji: "🌿", name: "Ambiente Saudável" },
    // Arena do tamanho do ecrã, tal como o Monstro.
    arena: {
      worldW: 960,
      worldH: 514,
      platforms: [
        [480,521,960,30],   // chão principal, de ponta a ponta — topo em y=506
        [200,421,150,20],   // plataforma baixa esquerda
        [760,421,150,20]    // plataforma baixa direita
      ],
      // Mesma lógica do Monstro da Ignorância: o VanBerto's deve começar
      // sempre no mesmo sítio em todos os bosses, em vez do 120 por omissão
      // — 400 fica fora do alcance das duas plataformas baixas (125-275 e
      // 685-835), continuando a aterrar no chão principal.
      playerStartX: 400,
      decor: [
        { emoji:"🏭", x:90,  y:140 },
        { emoji:"⚙️", x:480, y:110 },
        { emoji:"☁️", x:870, y:160 }
      ]
    }
  }
];

// Lookup rápido por índice de nível — usado em nextLevel()
export const BOSS_BY_LEVEL = Object.fromEntries(BOSSES.map(b => [b.afterLevel, b]));
