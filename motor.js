/* ═══════════════════════════════════════════════════════════════
   RECONECTAR — Motor do quiz
   Escada emocional: cada resposta pontua eixos, as perguntas
   seguintes se adaptam ao eixo dominante e o relatório final
   devolve à pessoa o que ela mesma descreveu.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
'use strict';

/* ─── Os 4 loops ──────────────────────────────────────────────── */
const LOOPS = {
  silencio: {
    id: 'silencio',
    nome: 'Loop do Silêncio',
    resumo: 'Vocês pararam de brigar — e isso não é paz, é desistência de conversar.',
    mecanismo: [
      'Alguém levanta um assunto difícil.',
      'O outro se fecha, muda de assunto ou sai da sala.',
      'Quem levantou aprende que não vale a pena. E guarda.',
      'O assunto some da conversa — mas não some de dentro.'
    ],
    verdade: 'O silêncio não resolveu nada. Ele só tirou o conflito da mesa e colocou dentro de cada um. É por isso que a casa fica calma e vocês ficam cada vez mais longe.',
    custo: 'Casais nesse loop costumam descrever o momento da separação como "não teve briga, a gente só parou de existir um pro outro".'
  },
  escalada: {
    id: 'escalada',
    nome: 'Loop da Escalada',
    resumo: 'A mesma discussão volta com outra roupa — e cada rodada começa mais alto que a anterior.',
    mecanismo: [
      'Um assunto pequeno abre uma porta antiga.',
      'A discussão deixa de ser sobre o assunto e vira sobre quem tem razão.',
      'Alguém fala algo que não dá pra desdizer.',
      'Vocês fazem as pazes sem resolver — e a conta fica aberta pra próxima.'
    ],
    verdade: 'Vocês não estão brigando por causa da louça, do dinheiro ou do horário. Estão brigando pela mesma ferida não resolvida, com um disfarce diferente a cada vez. Por isso "conversar" não encerra: a conversa nunca chega no assunto real.',
    custo: 'A escalada desgasta pelo acúmulo. Não é a briga que separa — é a centésima repetição dela.'
  },
  invisibilidade: {
    id: 'invisibilidade',
    nome: 'Loop da Invisibilidade',
    resumo: 'Vocês dividem a casa, a rotina e a cama — e mesmo assim você se sente sozinho(a).',
    mecanismo: [
      'Você sinaliza que precisa de atenção — do seu jeito.',
      'O sinal não é lido, ou é lido como cobrança.',
      'Você recua pra não parecer carente.',
      'O outro entende o recuo como "está tudo bem" — e a distância vira rotina.'
    ],
    verdade: 'Não é falta de amor. É falta de tradução. Vocês estão pedindo a mesma coisa em idiomas diferentes e os dois estão concluindo que não são desejados. A solidão a dois é mais pesada que a solidão sozinho, porque a pessoa que poderia te tirar dela está a um metro de distância.',
    custo: 'É o loop que mais vira infidelidade emocional — não por má intenção, mas porque alguém finalmente se sentiu visto em outro lugar.'
  },
  desistencia: {
    id: 'desistencia',
    nome: 'Loop da Desistência',
    resumo: 'Você parou de tentar. E parou justamente pra não se machucar de novo.',
    mecanismo: [
      'Você tentou — várias vezes, do seu jeito.',
      'Não veio resposta, ou veio tarde demais.',
      'Você concluiu que tentar dói mais do que aceitar.',
      'Aí você recuou por dentro. E por fora ninguém percebeu.'
    ],
    verdade: 'O mais perigoso desse loop é que ele parece calmo. A casa funciona, a rotina anda, ninguém discute. Mas quem desistiu por dentro já começou a ir embora — só não marcou a data. E quando essa pessoa finalmente fala, o outro escuta como se fosse do nada. Não é do nada. É o acúmulo de tudo o que ela parou de dizer.',
    custo: 'É o loop com o ponto de virada mais curto. Quem recuou por dentro raramente volta depois que se acostuma com a ausência.'
  }
};

/* ─── Perguntas base ──────────────────────────────────────────── */
const BASE = [
  {
    id: 'q1',
    titulo: 'Há quanto tempo vocês estão juntos?',
    tipo: 'letra',
    opcoes: [
      { txt: 'Menos de 2 anos',   val: '<2',   w: {} },
      { txt: 'Entre 2 e 5 anos',  val: '2-5',  w: {} },
      { txt: 'Entre 5 e 10 anos', val: '5-10', w: {} },
      { txt: 'Mais de 10 anos',   val: '10+',  w: {} }
    ]
  },
  {
    id: 'q2',
    titulo: 'Como você descreveria o clima em casa hoje?',
    tipo: 'emoji',
    opcoes: [
      { txt: 'Tenso — brigas frequentes',          emoji: '😤', w: { escalada: 3 } },
      { txt: 'Frio e distante — silêncio pesado',  emoji: '❄️', w: { silencio: 3 } },
      { txt: 'Irregular — ora bem, ora muito mal', emoji: '🎢', w: { escalada: 2, invisibilidade: 1 } },
      { txt: 'Neutro — coexistência sem conexão',  emoji: '😐', w: { invisibilidade: 2, desistencia: 2 } }
    ]
  },
  {
    id: 'q3',
    titulo: 'Quando vocês têm uma discussão, o que mais acontece depois?',
    tipo: 'emoji',
    opcoes: [
      { txt: 'Um some emocionalmente por dias',        emoji: '🧊', w: { silencio: 3 } },
      { txt: 'Escala até explodir de vez',             emoji: '🌋', w: { escalada: 3 } },
      { txt: 'Fica tenso até "deixar passar"',         emoji: '😶', w: { silencio: 2, desistencia: 1 } },
      { txt: 'Voltamos ao normal, mas o assunto volta', emoji: '🔄', w: { escalada: 2 } }
    ]
  },
  {
    /* Discriminador de invisibilidade — sem esta pergunta o ramo
       fica inalcançável, porque q2/q3 só medem conflito x silêncio. */
    id: 'q4',
    titulo: 'Como isso tem afetado você por dentro?',
    hint: 'Seja sincero(a) — é isso que define seu relatório.',
    tipo: 'emoji',
    opcoes: [
      { txt: 'Me sinto sozinho(a) mesmo estando junto',   emoji: '🫥', w: { invisibilidade: 4 } },
      { txt: 'Sinto que não sou mais visto(a) nem desejado(a)', emoji: '🌫️', w: { invisibilidade: 4 } },
      { txt: 'Ando mais irritado(a) e cansado(a) no geral', emoji: '😮‍💨', w: { escalada: 2, desistencia: 1 } },
      { txt: 'Sinto que estou desistindo por dentro',      emoji: '💔', w: { desistencia: 4 } }
    ]
  },
  {
    id: 'qtent',
    titulo: 'O que você já tentou para melhorar a situação?',
    tipo: 'emoji',
    opcoes: [
      { txt: 'Já conversei várias vezes — sem resultado', emoji: '💬', val: 'conversa', w: { escalada: 1, desistencia: 1 } },
      { txt: 'Li livros / conteúdos de relacionamento',   emoji: '📚', val: 'conteudo',  w: {} },
      { txt: 'Já pensei em terapia, mas não fui',         emoji: '🛋️', val: 'terapia',  w: {} },
      { txt: 'Nada — prefiro guardar para mim',           emoji: '😶', val: 'nada',     w: { silencio: 2, desistencia: 2 } }
    ]
  }
];

/* ─── Perguntas dinâmicas (escada) ────────────────────────────── */
/* Q5 e Q6 mudam conforme o eixo líder — cada uma aprofunda e
   confirma a emoção já identificada, em vez de reabrir o leque.  */
const RAMOS = {
  silencio: [
    {
      id: 'q5',
      titulo: 'Quando você pensa em puxar um assunto difícil, o que te para?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Sei como vai terminar — então nem começo', emoji: '🔮', w: { silencio: 3 } },
        { txt: 'Não quero estragar o clima que está bom',  emoji: '🤐', w: { silencio: 2, desistencia: 1 } },
        { txt: 'Já falei tanto que me sinto repetitivo(a)', emoji: '🔁', w: { desistencia: 3 } },
        { txt: 'Tenho medo da resposta que vou ouvir',      emoji: '😰', w: { silencio: 2, invisibilidade: 1 } }
      ]
    },
    {
      id: 'q6',
      titulo: 'Quantas coisas você deixou de dizer nos últimos meses?',
      hint: 'Não precisa lembrar de todas — só de como isso pesa.',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Poucas — ainda consigo falar quase tudo',  emoji: '🙂', w: {} },
        { txt: 'Várias — escolho minhas batalhas',          emoji: '⚖️', w: { silencio: 2 } },
        { txt: 'Muitas — virou automático engolir',         emoji: '🧱', w: { silencio: 3, desistencia: 2 } },
        { txt: 'Perdi a conta — quase não falo mais nada',  emoji: '🕳️', w: { silencio: 3, desistencia: 3 } }
      ]
    }
  ],
  escalada: [
    {
      id: 'q5',
      titulo: 'Nas discussões, em que ponto elas costumam sair do controle?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Quando alguém traz algo do passado',       emoji: '📜', w: { escalada: 3 } },
        { txt: 'Quando um se cala e o outro insiste',      emoji: '🔇', w: { escalada: 2, silencio: 2 } },
        { txt: 'Quando vira quem fez mais pelo outro',     emoji: '⚖️', w: { escalada: 3 } },
        { txt: 'Quando alguém fala pra machucar mesmo',    emoji: '🗡️', w: { escalada: 3, desistencia: 1 } }
      ]
    },
    {
      id: 'q6',
      titulo: 'Depois que as pazes são feitas, o assunto real fica resolvido?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Sim — conseguimos resolver de verdade',      emoji: '✅', w: {} },
        { txt: 'Mais ou menos — resolve na superfície',      emoji: '🩹', w: { escalada: 2 } },
        { txt: 'Não — só paramos de falar nele',             emoji: '📦', w: { escalada: 3, silencio: 1 } },
        { txt: 'Nunca — e volta igual na próxima briga',     emoji: '🔄', w: { escalada: 3, desistencia: 1 } }
      ]
    }
  ],
  invisibilidade: [
    {
      id: 'q5',
      titulo: 'Quando foi a última vez que você se sentiu realmente visto(a) por ele(a)?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Essa semana — ainda acontece',           emoji: '🌤️', w: {} },
        { txt: 'Faz algumas semanas',                     emoji: '📆', w: { invisibilidade: 2 } },
        { txt: 'Faz meses — preciso me esforçar pra lembrar', emoji: '🌫️', w: { invisibilidade: 3 } },
        { txt: 'Não lembro mais',                         emoji: '🕯️', w: { invisibilidade: 3, desistencia: 2 } }
      ]
    },
    {
      id: 'q6',
      titulo: 'Quando você precisa de atenção, o que costuma fazer?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Falo diretamente que preciso',           emoji: '🗣️', w: {} },
        { txt: 'Dou sinais e espero que percebam',       emoji: '🪧', w: { invisibilidade: 3 } },
        { txt: 'Me afasto pra ver se sentem falta',      emoji: '🚪', w: { invisibilidade: 2, desistencia: 2 } },
        { txt: 'Não faço nada — não quero parecer carente', emoji: '🤫', w: { invisibilidade: 3, silencio: 2 } }
      ]
    }
  ],
  desistencia: [
    {
      id: 'q5',
      titulo: 'Você ainda tenta, ou já parou?',
      hint: 'Ninguém vai julgar sua resposta aqui.',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Ainda tento, mesmo cansado(a)',          emoji: '🕯️', w: { desistencia: 1 } },
        { txt: 'Tento bem menos do que já tentei',       emoji: '📉', w: { desistencia: 2 } },
        { txt: 'Parei — cansei de ser o(a) único(a)',    emoji: '🛑', w: { desistencia: 3 } },
        { txt: 'Parei faz tempo. Só não falei em voz alta', emoji: '🤍', w: { desistencia: 3, silencio: 2 } }
      ]
    },
    {
      id: 'q6',
      titulo: 'O que te segura hoje no relacionamento?',
      tipo: 'emoji',
      opcoes: [
        { txt: 'Ainda amo — quero que dê certo',      emoji: '❤️', w: {} },
        { txt: 'Os filhos / a família',                emoji: '👨‍👩‍👧', w: { desistencia: 2 } },
        { txt: 'A vida construída, a casa, o tempo',   emoji: '🏠', w: { desistencia: 2 } },
        { txt: 'Sinceramente, não sei mais',           emoji: '🌫️', w: { desistencia: 3 } }
      ]
    }
  ]
};

/* ─── Q7: projeção de futuro (comum, mas com peso) ────────────── */
const Q7 = {
  id: 'q7',
  titulo: 'Se nada mudar nos próximos 6 meses, o que você imagina?',
  tipo: 'emoji',
  opcoes: [
    { txt: 'Continuaremos nesse looping', emoji: '🔄', val: 'looping',   w: { escalada: 2 } },
    { txt: 'Viraremos dois estranhos morando juntos', emoji: '👻', val: 'estranhos', w: { silencio: 2, invisibilidade: 2 } },
    { txt: 'Um de nós vai propor separação', emoji: '💔', val: 'separacao', w: { desistencia: 3 } },
    { txt: 'Não sei — tenho medo de pensar nisso', emoji: '🤷', val: 'medo', w: { desistencia: 1 } }
  ]
};

/* ─── Q8: multi-select (usado como espelho de desejo) ─────────── */
const Q8 = {
  id: 'q8',
  titulo: 'O que identificar esse padrão significaria para você?',
  hint: 'Selecione tudo que se aplica',
  tipo: 'multi',
  opcoes: [
    { txt: 'Finalmente entender por que nada que tentei funcionou', val: 'entender' },
    { txt: 'Saber exatamente por onde começar', val: 'comecar' },
    { txt: 'Parar de me sentir culpado(a) — é um padrão, não minha falha', val: 'culpa' },
    { txt: 'Ter esperança real de que pode melhorar', val: 'esperanca' }
  ]
};

/* ─── Depoimentos por loop ────────────────────────────────────
   Prints reais, anonimizados (foto, nome, @ e primeiros nomes
   borrados). Mapeados pelo estado ANTERIOR que cada cliente
   descreve — é isso que gera reconhecimento em quem lê.
   ⚠️ 'desistencia' usa um depoimento genérico: nenhum dos quatro
   descreve o recuo por dentro. Substituir quando houver um real. */
const DEPOIMENTOS = {
  silencio:       { img: 'midias/dp1-anon.png', legenda: 'Casamento de 10 anos — "não existia mais diálogo, só brigas e silêncio"' },
  escalada:       { img: 'midias/dp2-anon.png', legenda: '"Eu ia cometer um erro que acabaria com meu relacionamento de anos"' },
  invisibilidade: { img: 'midias/dp4-anon.png', legenda: '22 anos juntos — "estávamos nos afastando cada vez mais"' },
  desistencia:    { img: 'midias/dp3-anon.png', legenda: 'De quem já tinha parado de esperar' }
};

/* ─── Motor ───────────────────────────────────────────────────── */
function criarEstado() {
  return {
    nome: '',
    respostas: {},          // id -> {txt, val, w}
    score: { silencio: 0, escalada: 0, invisibilidade: 0, desistencia: 0 },
    ramo: null
  };
}

function pontuar(estado, pergunta, opcao) {
  estado.respostas[pergunta.id] = {
    pergunta: pergunta.titulo,
    txt: opcao.txt,
    val: opcao.val || opcao.txt,
    emoji: opcao.emoji || ''
  };
  const w = opcao.w || {};
  for (const k in w) estado.score[k] = (estado.score[k] || 0) + w[k];
}

function eixoLider(estado) {
  let melhor = null, max = -1;
  // ordem de desempate: desistência > invisibilidade > silêncio > escalada
  const ordem = ['desistencia', 'invisibilidade', 'silencio', 'escalada'];
  for (const k of ordem) {
    if (estado.score[k] > max) { max = estado.score[k]; melhor = k; }
  }
  return melhor;
}

/** Monta a sequência: base → ramo dinâmico → q7 → q8 */
function proximaPergunta(estado, indice) {
  if (indice < BASE.length) return BASE[indice];

  // Define o ramo assim que a base termina
  if (!estado.ramo) estado.ramo = eixoLider(estado);

  const ramo = RAMOS[estado.ramo] || RAMOS.silencio;
  const i = indice - BASE.length;
  if (i < ramo.length) return ramo[i];
  if (i === ramo.length) return Q7;
  if (i === ramo.length + 1) return Q8;
  return null;
}

function totalPerguntas() {
  return BASE.length + 2 /* ramo */ + 2 /* q7 + q8 */;
}

/* ─── Intensidade: derivada das respostas, não inventada ──────── */
function intensidade(estado) {
  const s = estado.score;
  const total = s.silencio + s.escalada + s.invisibilidade + s.desistencia;
  const lider = s[eixoLider(estado)];
  // Concentração (o quanto UM padrão domina) + severidade (peso absoluto).
  // Divisor calibrado pelo teto real do questionário (~20) para que
  // "Crítico" exija respostas de fato extremas, não uma trilha comum.
  const conc = total > 0 ? lider / total : 0;
  const sev  = Math.min(lider / 20, 1);
  const idx  = Math.round((conc * 0.4 + sev * 0.6) * 100);
  let faixa;
  if (idx < 45)      faixa = { rot: 'Inicial',      cor: '#eab308', txt: 'O padrão está se formando, mas ainda não domina a relação. Esse é o melhor momento possível para interromper.' };
  else if (idx < 68) faixa = { rot: 'Estabelecido', cor: '#f97316', txt: 'O padrão já organiza boa parte do que acontece entre vocês — mas ainda existem exceções.' };
  else if (idx < 88) faixa = { rot: 'Avançado',     cor: '#ef4444', txt: 'O padrão virou a regra. São as exceções que surpreendem agora.' };
  else               faixa = { rot: 'Crítico',      cor: '#b91c1c', txt: 'O padrão tomou o lugar do relacionamento. O que sobrou é a rotina dele.' };
  return { idx, ...faixa };
}

/* ─── Relatório ───────────────────────────────────────────────── */
const PORQUE_FALHOU = {
  conversa: {
    t: 'Você já conversou várias vezes — e não funcionou.',
    p: 'Isso não é sinal de que vocês não têm jeito. É sinal de que a conversa estava acontecendo no lugar errado do problema. Conversar sobre o sintoma (a briga, a distância, a frieza) não alcança o mecanismo que produz o sintoma. Por isso a conversa alivia por alguns dias e depois tudo volta ao normal.'
  },
  conteudo: {
    t: 'Você já leu sobre relacionamento — e continuou no mesmo lugar.',
    p: 'Conteúdo genérico descreve casais em geral. Ele te dá vocabulário, mas não te dá sequência. Você entende o que está acontecendo e mesmo assim não sabe o que fazer na terça-feira à noite, quando a cena real acontece. Entender não quebra padrão. Interromper quebra.'
  },
  terapia: {
    t: 'Você pensou em terapia, mas não foi.',
    p: 'E provavelmente não foi por preguiça — foi porque envolvia convencer a outra pessoa, achar tempo, achar dinheiro, e admitir em voz alta que a coisa está séria. O problema é que enquanto essa decisão não é tomada, o padrão continua rodando sozinho. Ele não espera.'
  },
  nada: {
    t: 'Você não tentou nada — guardou pra você.',
    p: 'Faz sentido. Falar exige acreditar que vai adiantar, e você já não tem essa certeza. Só que guardar não é neutro: cada coisa engolida vira mais distância, e a distância é lida pelo outro como desinteresse. Você se protege e ele(a) se afasta — os dois achando que estão fazendo o certo.'
  }
};

const PROJECAO = {
  looping: 'Você imaginou os próximos 6 meses como mais do mesmo. Aqui vai o detalhe que quase ninguém enxerga: o loop não fica igual. Cada rodada custa um pouco mais de esperança do que a anterior. "Continuar igual" é, na prática, continuar descendo devagar.',
  estranhos: 'Você imaginou vocês virando dois estranhos morando juntos. Essa é a projeção mais precisa que alguém no seu padrão pode fazer — e ela costuma se cumprir não por uma decisão, mas por acúmulo de dias comuns em que ninguém fez nada.',
  separacao: 'Você imaginou que alguém vai propor separação. Quando essa frase já apareceu na sua cabeça, ela geralmente não é medo: é leitura. A parte que dói é que quem propõe raramente decide no dia — decide meses antes, em silêncio.',
  medo: 'Você disse que tem medo de pensar nisso. Esse medo costuma ser o sinal mais honesto do quiz inteiro. Você não evita imaginar o futuro porque ele é incerto. Evita porque, no fundo, você já faz ideia de para onde isso vai se ninguém mudar a rota.'
};

const ESPELHO_DESEJO = {
  entender:  'entender por que nada do que você tentou funcionou',
  comecar:   'saber exatamente por onde começar',
  culpa:     'parar de carregar isso como culpa sua',
  esperanca: 'ter esperança real de que dá pra melhorar'
};

function gerarRelatorio(estado) {
  const loop = LOOPS[eixoLider(estado)];
  const inten = intensidade(estado);
  const r = estado.respostas;
  const nome = estado.nome || '';

  // Espelho: as respostas que a pessoa realmente deu
  const espelho = [];
  if (r.q2) espelho.push({ rot: 'O clima em casa', val: r.q2.txt });
  if (r.q3) espelho.push({ rot: 'Depois de uma discussão', val: r.q3.txt });
  if (r.q4) espelho.push({ rot: 'Como isso te afeta por dentro', val: r.q4.txt });
  if (r.q5) espelho.push({ rot: r.q5.pergunta, val: r.q5.txt });
  if (r.q6) espelho.push({ rot: r.q6.pergunta, val: r.q6.txt });

  const tentativa = r.qtent ? PORQUE_FALHOU[r.qtent.val] : null;
  const projecao  = r.q7 ? PROJECAO[r.q7.val] : null;

  const desejos = (r.q8 && Array.isArray(r.q8.val) ? r.q8.val : [])
    .map(v => ESPELHO_DESEJO[v]).filter(Boolean);

  const depo = DEPOIMENTOS[loop.id] || null;

  return { loop, inten, nome, espelho, tentativa, projecao, desejos, depo, tempo: r.q1 ? r.q1.txt : null };
}

/* ─── Export ──────────────────────────────────────────────────── */
global.MotorQuiz = {
  LOOPS, BASE, RAMOS, Q7, Q8, DEPOIMENTOS,
  criarEstado, pontuar, eixoLider, proximaPergunta,
  totalPerguntas, intensidade, gerarRelatorio
};

})(window);
