// State Aplikasi
let opponentsCount = 8;
let heroHand = [null, null]; // [slot0, slot1]
let boardCards = [null, null, null, null, null]; // [flop1, flop2, flop3, turn, river]
let selectedRange = new Set(); // Menyimpan hand dari matriks (contoh: 'AA', 'AKs')
let activeSlot = null; // Menyimpan slot mana yang sedang diisi kartu ({type: 'hero'|'board', index: number})

// Evaluator Data untuk Matriks 13x13
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = [
  { symbol: '♠', class: 'black' },
  { symbol: '♥', class: 'red' },
  { symbol: '♦', class: 'red' },
  { symbol: '♣', class: 'black' }
];

// 1. Inisialisasi Matriks 13x13 Range
function initRangeGrid() {
  const gridContainer = document.getElementById('range-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  for (let i = 0; i < 13; i++) {
    for (let j = 0; j < 13; j++) {
      let cellText = '';
      let cellClass = 'range-cell';

      if (i === j) {
        cellText = RANKS[i] + RANKS[j];
        cellClass += ' pair';
      } else if (i < j) {
        cellText = RANKS[i] + RANKS[j] + 's';
        cellClass += ' suited';
      } else {
        cellText = RANKS[j] + RANKS[i] + 'o';
        cellClass += ' offsuit';
      }

      const cell = document.createElement('div');
      cell.className = cellClass;
      cell.textContent = cellText;
      cell.dataset.hand = cellText;

      cell.addEventListener('click', () => {
        if (selectedRange.has(cellText)) {
          selectedRange.delete(cellText);
          cell.classList.remove('selected');
        } else {
          selectedRange.add(cellText);
          cell.classList.add('selected');
        }
      });

      gridContainer.appendChild(cell);
    }
  }
}

// 2. Kontrol Preset Range
function applyPresetRange(percent) {
  selectedRange.clear();
  const cells = document.querySelectorAll('.range-cell');
  
  // Ambil persentase sel berdasarkan urutan rank
  const totalCells = cells.length; // 169
  const countToSelect = Math.round((percent / 100) * totalCells);

  cells.forEach((cell, idx) => {
    if (idx < countToSelect) {
      selectedRange.add(cell.dataset.hand);
      cell.classList.add('selected');
    } else {
      cell.classList.remove('selected');
    }
  });
}

// 3. Modal Card Picker Visual
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
  } else if (elementId.startsWith('board')) {
    const idx = parseInt(elementId.replace('board-', ''));
    boardCards[idx] = null;
  }
  renderSlotUI(elementId, null);
};

// 4. Simulasi Monte Carlo lewat Web Worker
function runSimulation() {
  // Validasi Kartu Hero
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

// Menampilkan Kategori + Kartu Lawan yang Mengalahkan (UI Rapi)
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

// 5. Event Listeners & Inisialisasi Utama
document.addEventListener('DOMContentLoaded', () => {
  initRangeGrid();
  initCardPicker();
  applyPresetRange(100); // Default 100%

  // Slot Hand Click
  document.getElementById('hero-0').addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openPicker('hero', 0);
  });
  document.getElementById('hero-1').addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON') openPicker('hero', 1);
  });

  // Slot Board Click
  for (let i = 0; i < 5; i++) {
    document.getElementById(`board-${i}`).addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') openPicker('board', i);
    });
  }

  // Tombol Tutup Picker
  document.getElementById('btn-close-picker').addEventListener('click', closePicker);

  // Selector Opponents
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

  // Preset Buttons
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

  // Run Simulation
  document.getElementById('btn-run-sim').addEventListener('click', runSimulation);

  // Reset All
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    heroHand = [null, null];
    boardCards = [null, null, null, null, null];
    for (let i = 0; i < 2; i++) renderSlotUI(`hero-${i}`, null);
    for (let i = 0; i < 5; i++) renderSlotUI(`board-${i}`, null);
    document.getElementById('hero-equity').textContent = '0.0%';
    document.getElementById('tie-equity').textContent = '0.0%';
    document.getElementById('villain-equity').textContent = '0.0%';
    document.getElementById('possible-combos-box').innerHTML = '';
    document.getElementById('villain-combos-box').innerHTML = '';
  });
});
