:root {
  --bg-main: #0f172a;
  --bg-card: #1e293b;
  --bg-slot: #334155;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --text-main: #f8fafc;
  --text-sub: #94a3b8;
  --green: #10b981;
  --red: #ef4444;
  --yellow: #f59e0b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

body {
  background-color: var(--bg-main);
  color: var(--text-main);
  display: flex;
  justify-content: center;
  padding: 12px;
  min-height: 100vh;
}

.app {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2 {
  text-align: center;
  font-size: 1.1rem;
  letter-spacing: 1px;
  color: var(--primary);
  margin-bottom: 4px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-sub);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

/* Opponents Selector */
.opponents-selector {
  background: var(--bg-card);
  padding: 10px 14px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.opp-btn {
  background: var(--bg-slot);
  color: #fff;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

/* Card Slots Layout */
.card-group {
  display: flex;
  gap: 8px;
}

.card-slot {
  flex: 1;
  height: 48px;
  background: var(--bg-card);
  border: 1px dashed var(--bg-slot);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.card-slot.filled {
  border: 1px solid var(--primary);
  background: #ffffff;
  font-size: 1.1rem;
  font-weight: 800;
}

.card-slot.filled.red { color: #dc2626; }
.card-slot.filled.black { color: #0f172a; }

.remove-btn {
  position: absolute;
  top: 2px;
  right: 4px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

/* Preset Range Buttons */
.preset-buttons {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.preset-btn {
  flex: 1;
  padding: 6px 8px;
  background: var(--bg-card);
  border: 1px solid var(--bg-slot);
  color: var(--text-sub);
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  cursor: pointer;
}

.preset-btn.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
  font-weight: 600;
}

/* Grid Matriks 13x13 Range */
.range-grid {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 2px;
  background: var(--bg-card);
  padding: 4px;
  border-radius: 8px;
}

.range-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  font-weight: 700;
  border-radius: 2px;
  cursor: pointer;
  background: #1e293b;
  color: #475569;
  user-select: none;
}

.range-cell.pair { color: #93c5fd; }
.range-cell.suited { color: #cbd5e1; }

.range-cell.selected {
  background: var(--primary) !important;
  color: #ffffff !important;
}

/* Output Display Box */
.equity-box {
  background: var(--bg-card);
  padding: 12px;
  border-radius: 8px;
  display: flex;
  justify-content: space-around;
  text-align: center;
}

.equity-item span {
  display: block;
  font-size: 0.7rem;
  color: var(--text-sub);
}

.equity-item strong {
  font-size: 1.2rem;
}

/* Primary Action Buttons */
.btn-calc {
  background: var(--green);
  color: #fff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  width: 100%;
}

.btn-reset {
  background: transparent;
  border: 1px solid var(--bg-slot);
  color: var(--text-sub);
  padding: 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  width: 100%;
}

/* Modal Picker Visual Kartu */
.picker-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
}

.picker-overlay.active {
  display: flex;
}

.picker-box {
  background: var(--bg-main);
  padding: 16px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(13, 1fr);
  gap: 4px;
}

.card-option {
  aspect-ratio: 0.75;
  background: #ffffff;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 800;
  cursor: pointer;
}

.card-option.red { color: #dc2626; }
.card-option.black { color: #0f172a; }

.card-option.disabled {
  opacity: 0.2;
  pointer-events: none;
  background: #64748b;
}

/* Combo Statistics Grid Output */
.combo-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
}

.combo-stat-item {
  background: var(--bg-card);
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
}
