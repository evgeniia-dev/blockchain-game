import { SUITS, SUIT_SYMBOLS, RANKS, RANK_VALUES, PLAYERS, BOARD, START_COINS } from './constants.js'

export function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function createStandardDeck() {
  return shuffle(
    SUITS.flatMap((suit) =>
      RANKS.map((rank) => ({
        kind: 'standard',
        rank,
        suit,
        value: RANK_VALUES[rank],
        title: `${rank}${SUIT_SYMBOLS[suit]}`
      }))
    )
  )
}

export function createIncomeDeck() {
  const effects = [
    { title: 'Shell Sale', text: 'Receive 4 Istoken from the player on your left.', effect: 'leftPays', amount: 4 },
    { title: 'Fishing Profit', text: 'Receive 4 Istoken from the player on your right.', effect: 'rightPays', amount: 4 },
    { title: 'Pearl Trade', text: 'Receive 5 Istoken from the bank.', effect: 'bankGain', amount: 5 },
    { title: 'Market Bonus', text: 'Each other player gives you 2 Istoken.', effect: 'allPay', amount: 2 }
  ]
  return shuffle(Array.from({ length: 26 }, (_, i) => ({
    ...effects[i % effects.length],
    kind: 'income',
    rank: RANKS[i % RANKS.length],
    suit: SUITS[i % SUITS.length]
  })))
}

export function createExpenseDeck() {
  const effects = [
    { title: 'Boat Repair', text: 'Pay 5 Istoken to the player on your left.', effect: 'payLeft', amount: 5 },
    { title: 'Broken Tools', text: 'Pay 5 Istoken to the player on your right.', effect: 'payRight', amount: 5 },
    { title: 'Storm Damage', text: 'Pay 4 Istoken to the bank.', effect: 'bankLoss', amount: 4 },
    { title: 'Shared Cost', text: 'Pay 2 Istoken to each other player.', effect: 'payAll', amount: 2 }
  ]
  return shuffle(Array.from({ length: 26 }, (_, i) => ({
    ...effects[i % effects.length],
    kind: 'expense',
    rank: RANKS[(i + 4) % RANKS.length],
    suit: SUITS[(i + 1) % SUITS.length]
  })))
}

export function createActionDeck() {
  const effects = [
    { title: 'Jellyfish', text: 'You will skip the next mining round.', action: 'jellyfish', rank: 'J', suit: 'hearts' },
    { title: 'Fire', text: 'Each other player gives you 1 Istoken.', action: 'fire', rank: 'Q', suit: 'diamonds' },
    { title: 'Totem', text: 'From next turn on, you cannot participate in mining.', action: 'totem', rank: 'K', suit: 'clubs' },
    { title: 'Axe', text: 'In this mining turn, draw two standard cards and choose one.', action: 'axe', rank: 'A', suit: 'spades' }
  ]
  return shuffle(Array.from({ length: 54 }, (_, i) => ({ ...effects[i % effects.length], kind: 'action' })))
}

export function drawCard(deck, fallback) {
  const safeDeck = deck.length ? deck : fallback()
  return { card: safeDeck[0], deck: safeDeck.slice(1) }
}

export function drawStandardCards(deck, count) {
  let current = deck.length ? deck : createStandardDeck()
  const cards = []
  for (let i = 0; i < count; i += 1) {
    if (!current.length) current = createStandardDeck()
    cards.push(current[0])
    current = current.slice(1)
  }
  return { cards, deck: current }
}

export function createPlayers(names) {
  return PLAYERS.map((playerTemplate, index) => ({
    ...playerTemplate,
    name: names[index] || playerTemplate.label,
    coins: START_COINS,
    position: 0,
    active: true,
    skipNextMining: false,
    blockedForever: false,
    blockedThisRound: false,
    transactionCard: null,
    miningCard: null,
    lastRoll: null
  }))
}

export function movePlayer(player, roll) {
  let position = player.position
  let crossedStart = false
  for (let i = 0; i < roll; i += 1) {
    position = (position + 1) % BOARD.length
    if (position === 0) crossedStart = true
  }
  return { ...player, position, crossedStart, lastRoll: roll }
}

export function getLeftPlayerIndex(players, index) {
  for (let i = 1; i < players.length; i += 1) {
    const target = (index - i + players.length) % players.length
    if (players[target].active) return target
  }
  return -1
}

export function getRightPlayerIndex(players, index) {
  for (let i = 1; i < players.length; i += 1) {
    const target = (index + i) % players.length
    if (players[target].active) return target
  }
  return -1
}

export function calculateMiningScore(card, visibleCards) {
  return visibleCards.reduce((total, other) => {
    if (!other) return total
    return total + (card.rank === other.rank ? 1 : 0) + (card.suit === other.suit ? 1 : 0)
  }, 0)
}

export function getCardFace(card) {
  if (!card) return '—'
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1
}

export function drawCardForTile(tile, decks) {
  if (tile.type === 'income' || tile.type === 'fire-corner') {
    const result = drawCard(decks.income, createIncomeDeck)
    decks.income = result.deck
    return result.card
  }
  if (tile.type === 'expense' || tile.type === 'jellyfish-corner') {
    const result = drawCard(decks.expense, createExpenseDeck)
    decks.expense = result.deck
    return result.card
  }
  const result = drawCard(decks.action, createActionDeck)
  decks.action = result.deck
  return result.card
}

export function processPlayerTurn(player, roll, decks) {
  let moved = movePlayer(player, roll)
  const tile = BOARD[moved.position]
  const card = drawCardForTile(tile, decks)
  const logs = []

  if (moved.crossedStart) {
    moved.coins += 4
    logs.push(`${moved.name} crossed Start and received 4 Istoken.`)
  }
  if (tile.type === 'jellyfish-corner') {
    moved.coins -= 1
    logs.push(`${moved.name} landed on Jellyfish Corner and paid 1 extra Istoken.`)
  }
  if (tile.type === 'fire-corner') {
    moved.coins += 1
    logs.push(`${moved.name} landed on Fire Corner and received 1 extra Istoken.`)
  }
  if (tile.type === 'totem-corner') {
    moved.blockedThisRound = true
    logs.push(`${moved.name} landed on Totem Corner and cannot mine this round.`)
  }

  moved.transactionCard = card
  logs.push(`${moved.name} rolled ${roll}, landed on ${tile.name}, and drew a hidden ${card.kind} card.`)

  return {
    moved,
    logs,
    event: {
      title: `${moved.label} / ${moved.colorName}: ${moved.name}`,
      icon: tile.icon,
      text: `${moved.name} rolled ${roll} and moved to ${tile.name}.`,
      note: `${moved.name} drew a hidden ${card.kind.toUpperCase()} card.`,
      privateNote: `${card.title}: ${card.text} (${getCardFace(card)})`,
      card
    }
  }
}

export function applyTransactionEffects(updated, adjustCoins, card, index) {
  if (card.effect === 'bankGain') adjustCoins(index, card.amount)
  if (card.effect === 'bankLoss') adjustCoins(index, -card.amount)

  if (card.effect === 'leftPays') {
    const target = getLeftPlayerIndex(updated, index)
    if (target >= 0) { adjustCoins(target, -card.amount); adjustCoins(index, card.amount) }
  }
  if (card.effect === 'rightPays') {
    const target = getRightPlayerIndex(updated, index)
    if (target >= 0) { adjustCoins(target, -card.amount); adjustCoins(index, card.amount) }
  }
  if (card.effect === 'payLeft') {
    const target = getLeftPlayerIndex(updated, index)
    if (target >= 0) { adjustCoins(index, -card.amount); adjustCoins(target, card.amount) }
  }
  if (card.effect === 'payRight') {
    const target = getRightPlayerIndex(updated, index)
    if (target >= 0) { adjustCoins(index, -card.amount); adjustCoins(target, card.amount) }
  }
  if (card.effect === 'allPay') {
    updated.forEach((otherPlayer, i) => {
      if (i !== index && otherPlayer.active) { adjustCoins(i, -card.amount); adjustCoins(index, card.amount) }
    })
  }
  if (card.effect === 'payAll') {
    updated.forEach((otherPlayer, i) => {
      if (i !== index && otherPlayer.active) { adjustCoins(index, -card.amount); adjustCoins(i, card.amount) }
    })
  }
  if (card.action === 'jellyfish') updated[index].skipNextMining = true
  if (card.action === 'fire') {
    updated.forEach((otherPlayer, i) => {
      if (i !== index && otherPlayer.active) { adjustCoins(i, -1); adjustCoins(index, 1) }
    })
  }
  if (card.action === 'totem') updated[index].blockedForever = true
}

export function resolveMiningWinner(miners) {
  let finalists = [...miners].sort((a, b) => b.miningScore - a.miningScore || b.miningCard.value - a.miningCard.value)
  const bestScore = finalists[0].miningScore
  finalists = finalists.filter((miner) => miner.miningScore === bestScore)
  const bestValue = Math.max(...finalists.map((miner) => miner.miningCard.value))
  finalists = finalists.filter((miner) => miner.miningCard.value === bestValue)
  let miningWinner = finalists[0]
  if (finalists.length > 1) {
    miningWinner = finalists.map((miner) => ({ ...miner, tieRoll: rollDice() })).sort((a, b) => b.tieRoll - a.tieRoll)[0]
  }
  return { miningWinner, newWinningCard: miningWinner.miningCard }
}

export function createRoundBlock(round, miningWinner, newWinningCard) {
  return {
    id: `block-${round}-${Date.now()}`,
    title: `Block ${round}`,
    miner: miningWinner.name,
    reward: MINING_REWARD,
    card: newWinningCard
  }
}

export function checkWinConditions(active, round) {
  if (active.length <= 1) {
    return active[0] ? `${active[0].name} wins because only one player remains.` : 'Game over.'
  }
  if (round >= ROUND_LIMIT) {
    const richest = [...active].sort((a, b) => b.coins - a.coins)[0]
    return `${richest.name} wins after ${ROUND_LIMIT} rounds with the most Istoken.`
  }
  return null
}
