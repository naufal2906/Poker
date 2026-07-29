importScripts('evaluator.js');

self.onmessage = function (e) {
  const { heroHand, board, opponents, selectedRange, simulations } = e.data;

  let wins = 0;
  let ties = 0;
  let losses = 0;

  let heroComboCounts = {};
  let villainWinsCards = {};

  const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const SUITS = ['♠', '♥', '♦', '♣'];

  function buildFullDeck() {
    let deck = [];
    for (let r of RANKS) {
      for (let s of SUITS) {
        deck.push({ rank: r, suit: s, text: `${r}${s}` });
      }
    }
    return deck;
  }

  const baseDeck = buildFullDeck();
  const usedTexts = new Set([
    heroHand[0].text, heroHand[1].text,
    ...board.map(b => b.text)
  ]);

  const availableDeck = baseDeck.filter(c => !usedTexts.has(c.text));

  for (let i = 0; i < simulations; i++) {
    let currentDeck = [...availableDeck];

    // Shuffle Deck
    for (let j = currentDeck.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [currentDeck[j], currentDeck[k]] = [currentDeck[k], currentDeck[j]];
    }

    // Fill Board
    let simBoard = [...board];
    while (simBoard.length < 5) {
      simBoard.push(currentDeck.pop());
    }

    let heroEval = self.PokerEvaluator.evaluateHand([...heroHand, ...simBoard]);
    heroComboCounts[heroEval.category] = (heroComboCounts[heroEval.category] || 0) + 1;

    let maxVillainScore = null;
    let winningVillainInfo = null;

    for (let opp = 0; opp < opponents; opp++) {
      if (currentDeck.length < 2) break;
      let v1 = currentDeck.pop();
      let v2 = currentDeck.pop();

      let vEval = self.PokerEvaluator.evaluateHand([v1, v2, ...simBoard]);
      if (!maxVillainScore || vEval.rankScore > maxVillainScore) {
        maxVillainScore = vEval.rankScore;
        // Gabungkan Kategori + Kartu Lawan
        winningVillainInfo = `${vEval.category}|${v1.rank}${v1.suit} ${v2.rank}${v2.suit}`;
      }
    }

    if (!maxVillainScore || heroEval.rankScore > maxVillainScore) {
      wins++;
    } else if (heroEval.rankScore === maxVillainScore) {
      ties++;
    } else {
      losses++;
      if (winningVillainInfo) {
        villainWinsCards[winningVillainInfo] = (villainWinsCards[winningVillainInfo] || 0) + 1;
      }
    }
  }

  let heroCombosResult = {};
  for (let key in heroComboCounts) {
    heroCombosResult[key] = ((heroComboCounts[key] / simulations) * 100).toFixed(1);
  }

  let villainCombosResult = {};
  let sortedVillain = Object.keys(villainWinsCards)
    .sort((a, b) => villainWinsCards[b] - villainWinsCards[a])
    .slice(0, 8);

  sortedVillain.forEach(k => {
    villainCombosResult[k] = ((villainWinsCards[k] / simulations) * 100).toFixed(1);
  });

  self.postMessage({
    heroEquity: ((wins / simulations) * 100).toFixed(1),
    tieEquity: ((ties / simulations) * 100).toFixed(1),
    villainEquity: ((losses / simulations) * 100).toFixed(1),
    heroCombos: heroCombosResult,
    villainCombos: villainCombosResult
  });
};
