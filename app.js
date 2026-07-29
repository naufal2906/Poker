let heroHand = [null, null];
let boardCards = [null, null, null, null, null];
let activeSlot = null;
let selectedRange = new Set();
let opponentsCount = 8;
let simulationWorker = null;

const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = [
  { symbol: '♠', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' }
];

const PRESETS = {
  top5: ['AA', 'KK', 'QQ', 'JJ', 'AKs'],
  top10: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AQs', 'AJs', 'AKo'],
  top20: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', 'AKs', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'AKo', 'AQo'],
  top50: [
    'AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', '55',
    'AKs', 'AQs', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s',
    'KQs', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'JTs', 'T9s', '98s', '87s', '76s', '65s',
    'AKo', 'AQo', 'AJo', 'ATo', 'KQo', 'KJo', 'QJo'
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  generateRangeGrid();
  generateCardPicker();
  setupEventListeners();
  selectPreset('100');
});

function generateRangeGrid() {
  const grid = document.getElementById('range-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      let r1 = RANKS[r], r2 = RANKS[c];
      let code = (r === c) ? `${r1}${r2}` : (r < c) ? `${r1}${r2}s` : `${r2}${r1}o`;
      let type = (r === c) ? 'pair' : (r < c) ? 'suited' : 'offsuited';

      const cell = document.createElement('div');
      cell.className = `range-cell ${type}`;
      cell.dataset.code = code;
      cell.innerText = code;

      cell.addEventListener('click', () => {
        if (selectedRange.has(code)) {
          selectedRange.delete(code);
          cell.classList.remove('selected');
        } else {
          selectedRange.add(code);
          cell.classList.add('selected');
        }
      });

      grid.appendChild(cell);
    }
  }
}

function selectPreset(presetKey) {
  selectedRange.clear();
  const cells = document.querySelectorAll('.range-cell');

  if (presetKey === '100') {
    cells.forEach(cell => {
      selectedRange.add(cell.dataset.code);
      cell.classList.add('selected');
    });
  } else if (PRESETS[presetKey]) {
    const targetCodes = new Set(PRESETS[presetKey]);
    cells.forEach(cell => {
      if (targetCodes.has(cell.dataset.code)) {
        selectedRange.add(cell.dataset.code);
        cell.classList.add('selected');
      } else {
        cell.classList.remove('selected');
      }
    });
  }

  ['btn-p5', 'btn-p10', 'btn-p20', 'btn-p50', 'btn-p100'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  
  const activeMap = { 'top5': 'btn-p5', 'top10': 'btn-p10', 'top20': 'btn-p20', 'top50': 'btn-p50', '100': 'btn-p100' };
  document.getElementById(activeMap[presetKey])?.classList.add('active');
}

function generateCardPicker() {
  const container = document.getElementById('picker-cards-grid');
  if (!container) return;
  container.innerHTML = '';

  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      const cardEl = document.createElement('div');
      cardEl.className = `card-option ${suit.color}`;
      cardEl.dataset.text = `${rank}${suit.symbol}`;
      cardEl.innerHTML = `<span>${rank}</span><span>${suit.symbol}</span>`;

      cardEl.addEventListener('click', () => selectCardForSlot(rank, suit.symbol));
      container.appendChild(cardEl);
    });
  });
}

function openPicker(type, index) {
  activeSlot = { type, index };
  const modal = document.getElementById('card-picker-modal');
  if (modal) {
    modal.classList.add('active');
    updatePickerState();
  }
}

function closePicker() {
  const modal = document.getElementById('card-picker-modal');
  if (modal) modal.classList.remove('active');
  activeSlot = null;
}

function updatePickerState() {
  const usedTexts = new Set();
  heroHand.forEach(c => c && usedTexts.add(c.text));
  boardCards.forEach(c => c && usedTexts.add(c.text));

  document.querySelectorAll('.card-option').forEach(el => {
    if (usedTexts.has(el.dataset.text)) {
      el.classList.add('disabled');
    } else {
      el.classList.remove('disabled');
    }
  });
}

function selectCardForSlot(rank, suitSymbol) {
  if (!activeSlot) return;
  const suitObj = SUITS.find(s => s.symbol === suitSymbol);
  const cardObj = { rank, suit: suitSymbol, color: suitObj.color, text: `${rank}${suitSymbol}` };

  if (activeSlot.type === 'hero') heroHand[activeSlot.index] = cardObj;
  else boardCards[activeSlot.index] = cardObj;

  renderSlots();
  closePicker();
}

function removeCard(type, index) {
  if (type === 'hero') heroHand[index] = null;
  else boardCards[index] = null;
  renderSlots();
}

function renderSlots() {
  for (let i = 0; i < 2; i++) {
    const slot = document.getElementById(`hero-${i}`);
    if (!slot) continue;
    const card = heroHand[i];
    if (card) {
      slot.className = `card-slot filled ${card.color}`;
      slot.innerHTML = `<span>${card.rank}${card.suit}</span><button class="remove-btn" onclick="event.stopPropagation(); removeCard('hero', ${i})">×</button>`;
    } else {
      slot.className = 'card-slot empty';
      slot.innerHTML = `+ Pilih`;
    }
  }

  const names = ['Flop 1', 'Flop 2', 'Flop 3', 'Turn', 'River'];
  for (let i = 0; i < 5; i++) {
    const slot = document.getElementById(`board-${i}`);
    if (!slot) continue;
    const card = boardCards[i];
    if (card) {
      slot.className = `card-slot filled ${card.color}`;
      slot.innerHTML = `<span>${card.rank}${card.suit}</span><button class="remove-btn" onclick="event.stopPropagation(); removeCard('board', ${i})">×</button>`;
    } else {
      slot.className = 'card-slot empty';
      slot.innerHTML = names[i];
    }
  }
}

function setupEventListeners() {
  document.getElementById('hero-0')?.addEventListener('click', () => openPicker('hero', 0));
  document.getElementById('hero-1')?.addEventListener('click', () => openPicker('hero', 1));

  for (let i = 0; i < 5; i++) {
    document.getElementById(`board-${i}`)?.addEventListener('click', () => openPicker('board', i));
  }

  document.getElementById('btn-close-picker')?.addEventListener('click', closePicker);
  document.getElementById('btn-reset-all')?.addEventListener('click', resetAll);
  document.getElementById('btn-run-sim')?.addEventListener('click', runSimulation);

  document.getElementById('btn-opp-minus')?.addEventListener('click', () => {
    if (opponentsCount > 1) { opponentsCount--; updateOpponentUI(); }
  });

  document.getElementById('btn-opp-plus')?.addEventListener('click', () => {
    if (opponentsCount < 9) { opponentsCount++; updateOpponentUI(); }
  });

  document.getElementById('btn-p5')?.addEventListener('click', () => selectPreset('top5'));
  document.getElementById('btn-p10')?.addEventListener('click', () => selectPreset('top10'));
  document.getElementById('btn-p20')?.addEventListener('click', () => selectPreset('top20'));
  document.getElementById('btn-p50')?.addEventListener('click', () => selectPreset('top50'));
  document.getElementById('btn-p100')?.addEventListener('click', () => selectPreset('100'));
}

function updateOpponentUI() {
  const lbl = document.getElementById('opp-count');
  if (lbl) lbl.innerText = `${opponentsCount} Lawan (${opponentsCount + 1} Max Table)`;
}

function resetAll() {
  heroHand = [null, null];
  boardCards = [null, null, null, null, null];
  renderSlots();
  document.getElementById('hero-equity').innerText = '0.0%';
  document.getElementById('tie-equity').innerText = '0.0%';
  document.getElementById('villain-equity').innerText = '0.0%';
  document.getElementById('possible-combos-box').innerHTML = '';
  document.getElementById('villain-combos-box').innerHTML = '';
}

function runSimulation() {
  if (!heroHand[0] || !heroHand[1]) {
    alert('Harap pilih 2 kartu kamu (Hero) terlebih dahulu!');
    return;
  }

  const validBoard = boardCards.filter(c => c !== null);
  const selectedRangeArray = Array.from(selectedRange);

  document.getElementById('hero-equity').innerText = '...';
  document.getElementById('villain-equity').innerText = '...';

  if (simulationWorker) simulationWorker.terminate();

  simulationWorker = new Worker('worker.js');
  simulationWorker.postMessage({
    heroHand: heroHand,
    board: validBoard,
    opponents: opponentsCount,
    selectedRange: selectedRangeArray,
    simulations: 5000
  });

  simulationWorker.onmessage = function (e) {
    const { heroEquity, villainEquity, tieEquity, heroCombos, villainCombos } = e.data;
    document.getElementById('hero-equity').innerText = `${heroEquity}%`;
    document.getElementById('villain-equity').innerText = `${villainEquity}%`;
    document.getElementById('tie-equity').innerText = `${tieEquity}%`;

    renderHeroCombos(heroCombos);
    renderVillainPossibleCards(villainCombos);
  };
}

function renderHeroCombos(hCombos) {
  const container = document.getElementById('possible-combos-box');
  if (!container || !hCombos) return;
  let html = '<div class="section-title">KATEGORI HAND KAMU</div><div class="combo-stats-grid">';
  for (let key in hCombos) {
    if (parseFloat(hCombos[key]) > 0) {
      html += `<div class="combo-stat-item hero"><span>${key}</span><strong>${hCombos[key]}%</strong></div>`;
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

function renderVillainPossibleCards(vCombos) {
  const container = document.getElementById('villain-combos-box');
  if (!container || !vCombos) return;
  let html = '<div class="section-title">KARTU LAWAN YANG MENGALAHKANMU</div><div class="combo-stats-grid">';
  for (let key in vCombos) {
    if (parseFloat(vCombos[key]) > 0) {
      html += `<div class="combo-stat-item villain"><span>${key}</span><strong style="color:var(--red, #ef4444);">${vCombos[key]}%</strong></div>`;
    }
  }
  html += '</div>';
  container.innerHTML = html;
}
