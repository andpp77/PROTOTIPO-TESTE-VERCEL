// 🔗 Conexão com Supabase (via CDN)
const SUPABASE_URL = 'https://xsetrmgmynmrebiwkkya.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZXRybWdteW5tcmViaXdra3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDQyOTEsImV4cCI6MjA3Nzc4MDI5MX0.DFs9aID-cp693Ow5cwE-GF9cGLtIZQ761z2cCp8dlxw';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🧠 Perguntas (exemplo)
const perguntas = [
  {
    pergunta: "Quanto é 5 + 3?",
    alternativas: { a: "6", b: "7", c: "8", d: "9" },
    correta: "c",
    pontos: 10,
    dica: "É um número par.",
  },
  {
    pergunta: "Quanto é 9 - 4?",
    alternativas: { a: "3", b: "5", c: "6", d: "7" },
    correta: "b",
    pontos: 10,
    dica: "É um número ímpar.",
  },
  {
    pergunta: "Qual é o resultado de 6 × 2?",
    alternativas: { a: "12", b: "10", c: "14", d: "16" },
    correta: "a",
    pontos: 10,
    dica: "É o mesmo que somar 6 duas vezes.",
  },
  {
    pergunta: "Quanto é 15 ÷ 3?",
    alternativas: { a: "4", b: "5", c: "6", d: "3" },
    correta: "b",
    pontos: 10,
    dica: "É o número de vezes que o 3 cabe em 15.",
  },
];

// ⚙️ Variáveis globais
let jogador = '';
let pontuacao = 0;
let questoesSelecionadas = [];
let indiceQuestao = 0;
let tentativa = 1; // 1 = primeira tentativa, 2 = segunda tentativa

// 🎯 Elementos
const telas = document.querySelectorAll('.tela');
const btnComecar = document.getElementById('btn-comecar');
const btnIniciar = document.getElementById('btn-iniciar');
const btnReiniciar = document.getElementById('btn-reiniciar');
const nomeInput = document.getElementById('nome-jogador');
const nomeExibir = document.getElementById('nome-exibir');
const pontuacaoEl = document.getElementById('pontuacao');
const numQuestaoEl = document.getElementById('num-questao');
const perguntaEl = document.getElementById('pergunta');
const alternativasEl = document.getElementById('alternativas');
const dicaEl = document.getElementById('dica');
const pontuacaoFinalEl = document.getElementById('pontuacao-final');
const rankingList = document.getElementById('ranking-list');

// 🚀 Fluxo de telas
btnComecar.onclick = () => mostrarTela('tela-nome');
btnIniciar.onclick = iniciarJogo;
btnReiniciar.onclick = () => location.reload();

function mostrarTela(id) {
  telas.forEach(t => t.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
}

// 🎮 Lógica do jogo
function iniciarJogo() {
  jogador = nomeInput.value.trim();
  if (!jogador) return alert('Digite seu nome!');

  pontuacao = 0;
  indiceQuestao = 0;
  tentativa = 1;
  nomeExibir.textContent = jogador;
  pontuacaoEl.textContent = pontuacao;

  questoesSelecionadas = [...perguntas].sort(() => Math.random() - 0.5).slice(0, 10);

  mostrarTela('tela-jogo');
  carregarQuestao();
}

function carregarQuestao() {
  if (indiceQuestao >= questoesSelecionadas.length) return finalizarJogo();

  const q = questoesSelecionadas[indiceQuestao];
  numQuestaoEl.textContent = indiceQuestao + 1;
  perguntaEl.textContent = q.pergunta;
  dicaEl.textContent = '';
  tentativa = 1;

  renderizarAlternativas(q);
}

function renderizarAlternativas(q) {
  alternativasEl.innerHTML = '';

  // Se for a segunda tentativa, embaralha as alternativas
  let alternativas = Object.entries(q.alternativas);
  if (tentativa === 2) alternativas.reverse(); // simples inversão (pode usar sort(() => Math.random() - 0.5) se quiser aleatório)

  for (let [letra, texto] of alternativas) {
    const btn = document.createElement('button');
    btn.textContent = texto;
    btn.onclick = () => verificarResposta(letra, q);
    alternativasEl.appendChild(btn);
  }
}

function verificarResposta(letra, q) {
  if (letra === q.correta) {
    let pontosGanho = tentativa === 1 ? q.pontos : Math.floor(q.pontos / 2);
    pontuacao += pontosGanho;
    pontuacaoEl.textContent = pontuacao;

    dicaEl.textContent = tentativa === 1
      ? "✅ Resposta correta!"
      : `✅ Acertou na segunda tentativa! (+${pontosGanho} pontos)`;

    setTimeout(() => {
      indiceQuestao++;
      carregarQuestao();
    }, 1500);

  } else {
    if (tentativa === 1) {
      // Mostra dica e permite tentar novamente
      dicaEl.textContent = `❌ Errado! 💡 Dica: ${q.dica}`;
      tentativa = 2;

      // Mantém a dica por mais tempo (3 segundos)
      setTimeout(() => {
        renderizarAlternativas(q);
      }, 3000);
    } else {
      // Errou de novo — passa pra próxima
      dicaEl.textContent = "❌ Errou novamente! Vamos pra próxima.";
      setTimeout(() => {
        indiceQuestao++;
        carregarQuestao();
      }, 2000);
    }
  }
}

async function finalizarJogo() {
  mostrarTela('tela-final');
  pontuacaoFinalEl.textContent = `${jogador}, sua pontuação foi ${pontuacao} pontos!`;

  // Envia resultado para o banco
  await supabase.from('ranking').insert([{ nome: jogador, pontos: pontuacao }]);
  carregarRanking();
}

async function carregarRanking() {
  const { data, error } = await supabase
    .from('ranking')
    .select('*')
    .order('pontos', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Erro ao carregar ranking:', error);
    rankingList.innerHTML = '<li>Erro ao carregar ranking</li>';
    return;
  }

  rankingList.innerHTML = '';
  data.forEach((r, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${r.nome} - ${r.pontos} pts`;
    rankingList.appendChild(li);
  });
}
