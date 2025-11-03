import { createClient } from '@supabase/supabase-js'

// 🔗 Conexão com Supabase (substitua com as suas credenciais)
const SUPABASE_URL = 'https://xsetrmgmynmrebiwkkya.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzZXRybWdteW5tcmViaXdra3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDQyOTEsImV4cCI6MjA3Nzc4MDI5MX0.DFs9aID-cp693Ow5cwE-GF9cGLtIZQ761z2cCp8dlxw'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// 🎯 Lista de perguntas (use a sua completa aqui)
import { perguntas } from './perguntas' // ou cole direto no arquivo se preferir

// 🧠 Variáveis globais
let jogador = ''
let pontuacao = 0
let questoesSelecionadas = []
let indiceQuestao = 0

// 🔘 Elementos
const telas = document.querySelectorAll('.tela')
const btnComecar = document.getElementById('btn-comecar')
const btnIniciar = document.getElementById('btn-iniciar')
const btnReiniciar = document.getElementById('btn-reiniciar')
const nomeInput = document.getElementById('nome-jogador')
const nomeExibir = document.getElementById('nome-exibir')
const pontuacaoEl = document.getElementById('pontuacao')
const numQuestaoEl = document.getElementById('num-questao')
const perguntaEl = document.getElementById('pergunta')
const alternativasEl = document.getElementById('alternativas')
const dicaEl = document.getElementById('dica')
const pontuacaoFinalEl = document.getElementById('pontuacao-final')
const rankingList = document.getElementById('ranking-list')

// 🚀 Fluxo de telas
btnComecar.onclick = () => mostrarTela('tela-nome')
btnIniciar.onclick = iniciarJogo
btnReiniciar.onclick = () => location.reload()

function mostrarTela(id) {
  telas.forEach(t => t.classList.remove('ativa'))
  document.getElementById(id).classList.add('ativa')
}

// 🎮 Lógica do jogo
function iniciarJogo() {
  jogador = nomeInput.value.trim()
  if (!jogador) return alert('Digite seu nome!')

  pontuacao = 0
  indiceQuestao = 0
  nomeExibir.textContent = jogador
  pontuacaoEl.textContent = pontuacao

  // Seleciona 10 perguntas aleatórias
  questoesSelecionadas = [...perguntas].sort(() => Math.random() - 0.5).slice(0, 10)

  mostrarTela('tela-jogo')
  carregarQuestao()
}

function carregarQuestao() {
  if (indiceQuestao >= questoesSelecionadas.length) return finalizarJogo()

  const q = questoesSelecionadas[indiceQuestao]
  numQuestaoEl.textContent = indiceQuestao + 1
  perguntaEl.textContent = q.pergunta
  dicaEl.textContent = ''

  alternativasEl.innerHTML = ''
  for (let [letra, texto] of Object.entries(q.alternativas)) {
    const btn = document.createElement('button')
    btn.textContent = texto
    btn.onclick = () => verificarResposta(letra, q)
    alternativasEl.appendChild(btn)
  }
}

function verificarResposta(letra, q) {
  if (letra === q.correta) {
    pontuacao += q.pontos
    pontuacaoEl.textContent = pontuacao
  } else {
    dicaEl.textContent = `💡 Dica: ${q.dica}`
  }

  setTimeout(() => {
    indiceQuestao++
    carregarQuestao()
  }, 1000)
}

async function finalizarJogo() {
  mostrarTela('tela-final')
  pontuacaoFinalEl.textContent = `${jogador}, sua pontuação foi ${pontuacao} pontos!`

  // Enviar pro banco
  await supabase.from('ranking').insert([{ nome: jogador, pontos: pontuacao }])
  carregarRanking()
}

async function carregarRanking() {
  const { data } = await supabase
    .from('ranking')
    .select('*')
    .order('pontos', { ascending: false })
    .limit(10)

  rankingList.innerHTML = ''
  data.forEach((r, i) => {
    const li = document.createElement('li')
    li.textContent = `${i + 1}. ${r.nome} - ${r.pontos} pts`
    rankingList.appendChild(li)
  })
}
