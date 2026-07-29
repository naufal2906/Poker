// Global Evaluator Module
(function(global) {
  const RANKS_MAP = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };

  function evaluateHand(cards) {
    if (!cards || cards.length < 5) {
      return { category: 'High Card', rankScore: 0 };
    }

    let parsed = cards.map(c => ({
      r: RANKS_MAP[c.rank] || 2,
      s: c.suit
    })).sort((a, b) => b.r - a.r);

    let suitCounts = {};
    let rankCounts = {};

    parsed.forEach(c => {
      suitCounts[c.s] = (suitCounts[c.s] || 0) + 1;
      rankCounts[c.r] = (rankCounts[c.r] || 0) + 1;
    });

    let flushSuit = Object.keys(suitCounts).find(s => suitCounts[s] >= 5);
    let isFlush = !!flushSuit;

    let uniqueRanks = [...new Set(parsed.map(c => c.r))].sort((a, b) => b - a);
    if (uniqueRanks.includes(14)) uniqueRanks.push(1); // Ace low for straight

    let straightRank = 0;
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      if (uniqueRanks[i] - uniqueRanks[i + 4] === 4) {
        straightRank = uniqueRanks[i];
        break;
      }
    }

    let counts = Object.entries(rankCounts).map(([r, c]) => ({ r: Number(r), c })).sort((a, b) => b.c - a.c || b.r - a.r);

    if (isFlush && straightRank) return { category: 'Straight Flush', rankScore: 8000 + straightRank };
    if (counts[0].c === 4) return { category: 'Four of a Kind', rankScore: 7000 + counts[0].r };
    if (counts[0].c === 3 && counts[1] && counts[1].c >= 2) return { category: 'Full House', rankScore: 6000 + counts[0].r };
    if (isFlush) return { category: 'Flush', rankScore: 5000 + parsed[0].r };
    if (straightRank) return { category: 'Straight', rankScore: 4000 + straightRank };
    if (counts[0].c === 3) return { category: 'Three of a Kind', rankScore: 3000 + counts[0].r };
    if (counts[0].c === 2 && counts[1] && counts[1].c === 2) return { category: 'Two Pair', rankScore: 2000 + counts[0].r };
    if (counts[0].c === 2) return { category: 'One Pair', rankScore: 1000 + counts[0].r };

    return { category: 'High Card', rankScore: parsed[0].r };
  }

  global.PokerEvaluator = { evaluateHand };
})(typeof self !== 'undefined' ? self : this);
