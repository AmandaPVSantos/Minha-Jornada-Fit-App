// Seleção de elementos
const pesoForm = document.getElementById('form-peso');
const pesoInput = document.getElementById('peso-input');
const graficoPeso = document.getElementById('grafico-peso');

const exercicioForm = document.getElementById('form-exercicio');
const exercicioInput = document.getElementById('exercicio-input');
const exercicioData = document.getElementById('exercicio-data');
const listaExercicios = document.getElementById('lista-exercicios');

const metaForm = document.getElementById('form-meta');
const metaTreino = document.getElementById('meta-treino');
const metaPeso = document.getElementById('meta-peso');
const mensagemMeta = document.getElementById('mensagem-meta');

const calendarioContainer = document.getElementById('calendario-container');

// Dados salvos no LocalStorage
let pesos = JSON.parse(localStorage.getItem('pesos')) || [];
let exercicios = JSON.parse(localStorage.getItem('exercicios')) || [];
let metas = JSON.parse(localStorage.getItem('metas')) || { treino: 0, peso: 0, progresso: 0 };

// Atualiza os dados do LocalStorage
const salvarDados = () => {
  localStorage.setItem('pesos', JSON.stringify(pesos));
  localStorage.setItem('exercicios', JSON.stringify(exercicios));
  localStorage.setItem('metas', JSON.stringify(metas));
};

// Atualiza o gráfico de peso
const atualizarGraficoPeso = () => {
  const ctx = graficoPeso.getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: pesos.map(p => p.data),
      datasets: [{
        label: 'Peso (kg)',
        data: pesos.map(p => p.peso),
        borderColor: '#007bff',
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
};

// Adicionar novo peso
pesoForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const peso = parseFloat(pesoInput.value);
  const data = new Date().toLocaleDateString();

  if (!isNaN(peso)) {
    pesos.push({ peso, data });
    salvarDados();
    atualizarGraficoPeso();
    pesoInput.value = '';
  }
});

// Exibe os exercícios realizados
const atualizarExercicios = () => {
  listaExercicios.innerHTML = exercicios
    .map(e => `<li>${e.exercicio} - ${e.data}</li>`)
    .join('');
};

// Adicionar novo exercício
exercicioForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const exercicio = exercicioInput.value;
  const data = exercicioData.value;

  if (exercicio && data) {
    exercicios.push({ exercicio, data });
    salvarDados();
    atualizarExercicios();
    exercicioInput.value = '';
    exercicioData.value = '';
  }
});

// Exibir mensagens motivacionais
const verificarProgresso = () => {
  const treinosSemana = exercicios.filter(e => {
    const dataAtual = new Date();
    const dataExercicio = new Date(e.data);
    return (dataAtual - dataExercicio) / (1000 * 60 * 60 * 24) <= 7;
  }).length;

  metas.progresso = treinosSemana;
  if (treinosSemana >= metas.treino && pesos[pesos.length - 1]?.peso <= metas.peso) {
    mensagemMeta.textContent = 'Parabéns, você foi incrível e alcançou a meta! Mas continue se esforçando!';
  } else if (treinosSemana >= metas.treino) {
    mensagemMeta.textContent = 'Parabéns, falta pouco para atingir sua meta! Não desista!';
  } else if (treinosSemana > 0) {
    mensagemMeta.textContent = 'Você está com um pouco de dificuldade, mas não desista! Vamos conquistar juntos!';
  } else {
    mensagemMeta.textContent = 'Não desista, você consegue recuperar sua meta! Você é incrível!';
  }
};

// Configurar meta pessoal
metaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  metas.treino = parseInt(metaTreino.value);
  metas.peso = parseFloat(metaPeso.value);
  salvarDados();
  verificarProgresso();
});

// Inicializar calendário
const criarCalendario = () => {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const dataAtual = new Date();
  const diasNoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
  const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).getDay();

  let html = '<div class="calendario-grid">';
  diasSemana.forEach(dia => html += `<div class="calendario-header">${dia}</div>`);

  for (let i = 0; i < primeiroDia; i++) {
    html += `<div class="calendario-vazio"></div>`;
  }

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia).toISOString().split('T')[0];
    const ativo = exercicios.some(e => e.data === data) ? 'calendario-ativo' : '';
    html += `<div class="calendario-dia ${ativo}" data-data="${data}">${dia}</div>`;
  }

  html += '</div>';
  calendarioContainer.innerHTML = html;
};

// Eventos no calendário
calendarioContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('calendario-dia')) {
    const data = e.target.getAttribute('data-data');
    if (!exercicios.some(e => e.data === data)) {
      exercicios.push({ exercicio: 'Treino', data });
    } else {
      exercicios = exercicios.filter(e => e.data !== data);
    }
    salvarDados();
    criarCalendario();
  }
});

// Inicialização
const inicializar = () => {
  atualizarGraficoPeso();
  atualizarExercicios();
  criarCalendario();
  verificarProgresso();
};
inicializar();
