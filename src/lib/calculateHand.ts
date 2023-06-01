import { Card } from './deck';

export function getCardValues(cValue: Card['number']): number[] {
  switch (cValue) {
    case 'A':
      return [1, 11];
    case '2':
      return [2];
    case '3':
      return [3];
    case '4':
      return [4];
    case '5':
      return [5];
    case '6':
      return [6];
    case '7':
      return [7];
    case '8':
      return [8];
    case '9':
      return [9];
    case '10':
    case 'J':
    case 'Q':
    case 'K':
      return [10];
    default:
      throw new Error(`Unknown card: ${cValue}`);
  }
}
export function calculateHand(hand: Card[] | Card['number'][]) {
  let totals = [0];
  if (hand.length === 0) {
    throw new Error('Hand must have at least one card');
  }
  // let handValues: Card['value'][];

  if (typeof hand[0] === 'object') {
    hand = (hand as Card[]).map(card => card.number);
  } else {
    hand = hand as Card['number'][];
  }

  for (const card of hand) {
    const newTotals = [];
    const cardValues = getCardValues(card);
    for (const total of totals) {
      for (const value of cardValues) {
        newTotals.push(total + value);
      }
    }
    // remove duplicates and sort
    totals = Array.from(new Set(newTotals)).sort((a, b) => a - b);
  }
  const validTotals = totals.filter(total => total <= 21).sort((a, b) => b - a); // reverse sort
  return {
    validCounts: validTotals,
    bustCount: totals[0],
  };
}
