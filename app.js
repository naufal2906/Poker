// State Aplikasi
let opponentsCount = 8;
let heroHand = [null, null];
let boardCards = [null, null, null, null, null];
let selectedRange = new Set();
let activeSlot = null;

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = [
  { symbol: '♠', class: 'black' },
  { symbol: '♥', class: 'red' },
  { symbol: '♦', class: 'red' },
  { symbol: '♣', class: 'black' }
];

// Daftar Hand GTO Preflop Standard
const GTO_RAISE = new Set([
  'AA','KK','QQ','JJ','TT','99',
  'AKs','AQs','AJs','ATs','A9s','A8s','A7s','A6s','A5s','A4s','A3s','A2s',
  'AKo','AQo','KQs','KJs','KTs','K9s','QJs','QTs','JTs','T9s','98s','87s','76s','65s','54s'
]);

const GTO_CALL = new Set([
  '88','77','66','55','44','33','22',
  'K8s','K7s','K6s','K5s','Q9s','Q8s','J9s','J8s','T8s','97s','86s','75s','64s','53s',
  'AJo','ATo','KQo','KJo','QJo','JTo'
]);

// 1. Inisialisasi Matriks GTO Color
function initRangeGrid() {
  const gridContainer = document.getElementById('range-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      let cellText = '';
      if (i === j) {
        cellText = RANKS[i] + RANKS[j];
      } else if (i < j) {
        cellText = RANKS[i] + RANKS[j] + 's';
      } else {
        cellText = RANKS[j] + RANKS[i] + 'o';
      }

      let cellClass = 'range-cell';
      if (GTO_RAISE.has(cellText)) {
        cellClass += ' gto-raise';
      } else if (GTO_CALL.has(cellText)) {
        cellClass += ' gto-call';
      } else {
        cellClass += ' gto-fold';
      }

      const cell = document.createElement('div');
      cell.className = cellClass;
      cell.textContent = cellText;
      cell.dataset.hand = cellText;
      cell.id = `cell-${cellText}`;

      cell.addEventListener('click', () => {
        if (selectedRange.has(cellText)) {
          selectedRange.delete(cellText);
          cell.style.opacity = '0.3';
        } else {
          selectedRange.add(cellText);
          cell.style.opacity = '1';
        }
      });

      selectedRange.add(cellText);
      gridContainer.appendChild(cell);
    }
  }
}

// Sorot Hand Hero di dalam Matriks
function updateHeroHandHighlight() {
  document.querySelectorAll('.range-cell').forEach(c => c.classList.remove('hero-highlight'));

  if (heroHand[0] && heroHand[1]) {
    let r1 = heroHand[0].rank === '10' ? 'T' : heroHand[0].rank;
    let r2 = heroHand[1].rank === '10' ? 'T' : heroHand[1].rank;
    let s1 = heroHand[0].suit;
    let s2 = heroHand[1].suit;

    let idx1 = RANKS.indexOf(r1);
    let idx2 = RANKS.indexOf(r2);

    let handKey = '';
    if (idx1 === idx2) {
      handKey = r1 + r2;
    } else if (idx1 < idx2) {
      handKey = (s1 === s2) ? (r1 + r2 + 's') : (r1 + r2 + 'o');
    } else {
      handKey = (s1 === s2) ? (r2 + r1 + 's') : (r2 + r1 + 'o');
    }

    const targetCell = document.getElementById(`cell-${handKey}`);
    if (targetCell) {
      targetCell.classList.add('hero-highlight');
    }
  }
}

function applyPresetRange(percent) {
  selectedRange.clear();
  const cells = document.querySelectorAll('.range-cell');
  const countToSelect = Math.round((percent / 100) * cells.length);

  cells.forEach((cell, idx) => {
    if (idx < countToSelect) {
      selectedRange.add(cell.dataset.hand);
      cell.style.opacity = '1';
    } else {
      cell.style.opacity = '0.3';
    }
  });
}

function initCardPicker() {
  const pickerGrid = document.getElementById('picker-cards-grid');
  if (!pickerGrid) return;
  pickerGrid.innerHTML = '';

  const cardRanks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

  for (let suitObj of SUITS) {
    for (let rank of cardRanks) {
      const cardDiv = document.createElement('div');
      cardDiv.className = `card-option ${suitObj.class}`;
      cardDiv.innerHTML = `<span>${rank}</span><span>${suitObj.symbol}</span>`;
      cardDiv.dataset.rank = rank;
      cardDiv.dataset.suit = suitObj.symbol;

      cardDiv.addEventListener('click', () => {
        selectCardForActiveSlot(rank, suitObj.symbol, suitObj.class);
      });

      pickerGrid.appendChild(cardDiv);
    }
  }
}

function openPicker(type, index) {
  activeSlot = { type, index };
  updatePickerDisabledCards();
  document.getElementById('card-picker-modal').classList.add('active');
}

function closePicker() {
  document.getElementById('card-picker-modal').classList.remove('active');
  activeSlot = null;
}

function updatePickerDisabledCards() {
  const usedCards = new Set();
  heroHand.forEach(c => { if (c) usedCards.add(c.text); });
  boardCards.forEach(c => { if (c) usedCards.add(c.text); });

  const options = document.querySelectorAll('.card-option');
  options.forEach(opt => {
    const cardText = `${opt.dataset.rank}${opt.dataset.suit}`;
    if (usedCards.has(cardText)) {
      opt.classList.add('disabled');
    } else {
      opt.classList.remove('disabled');
    }
  });
}

function selectCardForActiveSlot(rank, suit, suitClass) {
  if (!activeSlot) return;

  const cardData = { rank, suit, suitClass, text: `${rank}${suit}` };

  if (activeSlot.type === 'hero') {
    heroHand[activeSlot.index] = cardData;
    renderSlotUI(`hero-${activeSlot.index}`, cardData);
    updateHeroHandHighlight();
  } else if (activeSlot.type === 'board') {
    boardCards[activeSlot.index] = cardData;
    renderSlotUI(`board-${activeSlot.index}`, cardData);
  }

  closePicker();
}

function renderSlotUI(elementId, cardData) {
  const slotEl = document.getElementById(elementId);
  if (!slotEl) return;

  if (cardData) {
    slotEl.className = `card-slot filled ${cardData.suitClass}`;
    slotEl.innerHTML = `${cardData.rank}${cardData.suit} <button class="remove-btn" onclick="clearSlot('${elementId}')">&times;</button>`;
  } else {
    slotEl.className = 'card-slot empty';
    slotEl.innerHTML = elementId.startsWith('hero') ? '+ Pilih' : elementId.replace('board-', 'Board ');
  }
}

window.clearSlot = function(elementId) {
  if (elementId.startsWith('hero')) {
    const idx = parseInt(elementId.replace('hero-', ''));
    heroHand[idx] = null;
    updateHeroHandHighlight();
  } else if (elementId.startsWith('board')) {
    const idx = parseInt(elementId.replace('board-', ''));
    boardCards[idx] = null;
  }
  renderSlotUI(elementId, null);
};

function runSimulation() {
  if (!heroHand[0] || !heroHand[1]) {
    alert('Silakan pilih 2 kartu Hero terlebih dahulu!');
    return;
  }

  const validBoard = boardCards.filter(c => c !== null);
  const btnCalc = document.getElementById('btn-run-sim');
  btnCalc.textContent = 'MENGHITUNG...';
  btnCalc.disabled = true;

  const worker = new Worker('worker.js');
  
  worker.postMessage({
    heroHand: heroHand,
    board: validBoard,
    opponents: opponentsCount,
    selectedRange: Array.from(selectedRange),
    simulations: 10000
  });

  worker.onmessage = function (e) {
    const { heroEquity, tieEquity, villainEquity, heroCombos, villainCombos } = e.data;

    document.getElementById('hero-equity').textContent = `${heroEquity}%`;
    document.getElementById('tie-equity').textContent = `${tieEquity}%`;
    document.getElementById('villain-equity').textContent = `${villainEquity}%`;

    renderHeroCombos(heroCombos);
    renderVillainPossibleCards(villainCombos);

    btnCalc.textContent = 'HITUNG SIMULASI MONTE CARLO';
    btnCalc.disabled = false;
    worker.terminate();
  };
}

function renderHeroCombos(combos) {
  const container = document.getElementById('possible-combos-box');
  if (!container || !combos) return;

  let html = '<div class="section-title">KATEGORI HAND KAMU</div><div class="combo-stats-grid">';
  for (let key in combos) {
    if (parseFloat(combos[key]) > 0) {
      html += `<div class="combo-stat-item">
        <span>${key}</span>
        <strong>${combos[key]}%</strong>
      </div>`;
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
      let parts = key.split('|');
      let category = parts[0] ? parts[0].trim() : 'Combo';
      let cards = parts[1] ? parts[1].trim() : key;

      html += `<div class="combo-stat-item villain" style="flex-direction:column; align-items:flex-start; gap:2px; padding: 8px;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <span style="font-weight:bold; color:var(--text-main); font-size:0.75rem;">${category}</span>
          <strong style="color:var(--red, #ef4444); font-size:0.75rem;">${vCombos[key]}%</strong>
        </div>
        <span style="font-size:0.7rem; color:var(--text-sub);">${cards}</span>
      </div>`;
    }
  }
  html += '</div>';
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  initRangeGrid();
  initCardPicker();

  document.getElementById('hero-0').addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openPicker('hero', 0);
  });
  document.getElementById('hero-1').addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openPicker('hero', 1);
  });

  for (let i = 0; i < 5; i++) {
    document.getElementById(`board-${i}`).addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') openPicker('board', i);
    });
  }

  document.getElementById('btn-close-picker').addEventListener('click', closePicker);

  document.getElementById('btn-opp-minus').addEventListener('click', () => {
    if (opponentsCount > 1) {
      opponentsCount--;
      document.getElementById('opp-count').textContent = `${opponentsCount} Lawan (${opponentsCount + 1} Max Table)`;
    }
  });

  document.getElementById('btn-opp-plus').addEventListener('click', () => {
    if (opponentsCount < 9) {
      opponentsCount++;
      document.getElementById('opp-count').textContent = `${opponentsCount} Lawan (${opponentsCount + 1} Max Table)`;
    }
  });

  const presets = [
    { id: 'btn-p5', pct: 5 },
    { id: 'btn-p10', pct: 10 },
    { id: 'btn-p20', pct: 20 },
    { id: 'btn-p50', pct: 50 },
    { id: 'btn-p100', pct: 100 }
  ];

  presets.forEach(p => {
    document.getElementById(p.id).addEventListener('click', (e) => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyPresetRange(p.pct);
    });
  });

  document.getElementById('btn-run-sim').addEventListener('click', runSimulation);

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    heroHand = [null, null];
    boardCards = [null, null, null, null, null];
    for (let i = 0; i < 2; i++) renderSlotUI(`hero-${i}`, null);
    for (let i = 0; i < 5; i++) renderSlotUI(`board-${i}`, null);
    updateHeroHandHighlight();
    document.getElementById('hero-equity').textContent = '0.0%';
    document.getElementById('tie-equity').textContent = '0.0%';
    document.getElementById('villain-equity').textContent = '0.0%';
    document.getElementById('possible-combos-box').innerHTML = '';
    document.getElementById('villain-combos-box').innerHTML = '';
  });
});
