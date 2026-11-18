# VanBerto's — O Dia da Criança

Jogo de plataformas educativo (Phaser 3, módulos ES, sem build) sobre os Direitos das Crianças.
Motor da Missão Internet Segura v14 (chaves, blocos «?», plataformas que caem, feixes, vento, bosses com proteção, PWA offline) com o conteúdo do Dia da Criança: 20 níveis em 4 mundos, 4 bosses (Vírus Gigante, Monstro da Ignorância, Poluidor Mecânico, Guardião das Sombras), perguntas, artefactos e conquistas.

- Conteúdo: `data-levels.js`, `data-quiz.js`, `data-story.js`, `data-bosses.js`, `data-progression.js`, `data-flavor.js`.
- Motor: `game/`. Desenhos dos bosses e itens: `textures.js`.
- Difícil e Extremo usam o mesmo banco de perguntas do Fácil (`QUIZ_BY_THEME_AVANCADO` está vazio).
- Gravação: chave `vanbertos_dia_crianca_save_v1`.

- Versão: v1 (carimbo 20261118dc1, igual no sw.js, no index.html e nos imports).
- Ao publicar uma nova versão, muda esse carimbo em todos os ficheiros para os telemóveis largarem a cache antiga.
