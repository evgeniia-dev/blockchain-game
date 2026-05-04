import crypto from 'crypto'
import { SUITS, RANKS, START_BALANCE } from './gameConstants.js'

export function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createStandardDeck() {
  const deck = []
  for (const suit of SUITS) {
    for (const item of RANKS) {
      deck.push({
        id: `${item.rank}-${suit}`,
        suit,
        rank: item.rank,
        value: item.value,
        category: 'standard',
        title: `${item.rank} of ${suit}`
      })
    }
  }
  return shuffle(deck)
}

export function drawCard(deck, refillFactory) {
  if (deck.length > 0) {
    return { card: deck[0], nextDeck: deck.slice(1) }
  }
  const refreshed = refillFactory()
  return { card: refreshed[0], nextDeck: refreshed.slice(1) }
}

export function createHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

export function createGenesisBlock() {
  const blockData = {
    index: 0,
    round: 0,
    timestamp: new Date().toISOString(),
    previousHash: '0',
    miner: 'Genesis',
    transactions: [],
    balances: {}
  }
  return { ...blockData, hash: createHash(blockData) }
}

export function createPlayer(id, name, color, isHuman = false) {
  return {
    id,
    name,
    color,
    isHuman,
    position: 0,
    istokens: START_BALANCE,
    currentCard: null,
    miningCard: null,
    miningScore: null,
    skipNextMining: false,
    blockedThisRound: false,
    permanentlyBlocked: false,
    active: true,
    lastDice: null
  }
}

export function getLeftPlayerIndex(players, index) {
  return (index - 1 + players.length) % players.length
}

export function getRightPlayerIndex(players, index) {
  return (index + 1) % players.length
}

export function calculateMiningScore(miningCard, visibleCards) {
  let score = 0
  for (const card of visibleCards) {
    if (!card) continue
    if (card.rank && card.rank === miningCard.rank) score += 1
    if (card.suit && card.suit === miningCard.suit) score += 1
  }
  return score
}
