import express from 'express'
import cors from 'cors'
import crypto from 'crypto'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const START_BALANCE = 50
const MINING_COST = 1
const MINING_REWARD = 5
const BOARD_SIZE = 20

const BOARD_TILES = [
  { type: 'start', label: 'Start' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'jellyfish', label: 'Jellyfish' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' },
  { type: 'fire', label: 'Fire' },
  { type: 'income', label: 'Income' },
  { type: 'action', label: 'Action' },
  { type: 'expense', label: 'Expense' },
  { type: 'income', label: 'Income' },
  { type: 'totem', label: 'Totem' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' }
]

const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS = [
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 }
]

const INCOME_CARDS = [
  { id: 'i1', category: 'income', title: 'Fishing Reward', amount: 4, mode: 'bank', suit: 'hearts', rank: '4' },
  { id: 'i2', category: 'income', title: 'Fruit Trade', amount: 3, mode: 'bank', suit: 'clubs', rank: '3' },
  { id: 'i3', category: 'income', title: 'Tool Repair Payment', amount: 5, mode: 'bank', suit: 'diamonds', rank: '5' },
  { id: 'i4', category: 'income', title: 'Receive from Left', amount: 4, mode: 'leftPays', suit: 'spades', rank: '4' },
  { id: 'i5', category: 'income', title: 'Receive from Right', amount: 4, mode: 'rightPays', suit: 'hearts', rank: '6' },
  { id: 'i6', category: 'income', title: 'Community Bonus', amount: 2, mode: 'allPay', suit: 'clubs', rank: '2' }
]

const EXPENSE_CARDS = [
  { id: 'e1', category: 'expense', title: 'Broken Net', amount: 3, mode: 'bank', suit: 'diamonds', rank: '3' },
  { id: 'e2', category: 'expense', title: 'Storm Damage', amount: 4, mode: 'bank', suit: 'spades', rank: '4' },
  { id: 'e3', category: 'expense', title: 'Pay Left Player', amount: 5, mode: 'leftReceives', suit: 'hearts', rank: '5' },
  { id: 'e4', category: 'expense', title: 'Pay Right Player', amount: 5, mode: 'rightReceives', suit: 'clubs', rank: '5' },
  { id: 'e5', category: 'expense', title: 'Shared Camp Cost', amount: 2, mode: 'allReceive', suit: 'diamonds', rank: '2' },
  { id: 'e6', category: 'expense', title: 'Lost Supplies', amount: 3, mode: 'bank', suit: 'spades', rank: '6' }
]

const ACTION_CARDS = [
  { id: 'a1', category: 'action', actionType: 'jellyfish', title: 'Jellyfish', text: 'Skip next mining round.', suit: 'hearts', rank: 'J' },
  { id: 'a2', category: 'action', actionType: 'fire', title: 'Fire', text: 'Each other player gives you 1 Istoken.', suit: 'diamonds', rank: 'Q' },
  { id: 'a3', category: 'action', actionType: 'totem', title: 'Totem', text: 'You become permanently blocked from mining.', suit: 'clubs', rank: 'K' },
  { id: 'a4', category: 'action', actionType: 'axe', title: 'Axe', text: 'Draw two mining cards and keep the better one.', suit: 'spades', rank: 'A' }
]

let game = null

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function createStandardDeck() {
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

function drawFromDeck(deck, refillFactory) {
  if (deck.length > 0) {
    return { card: deck[0], nextDeck: deck.slice(1) }
  }
  const refreshed = refillFactory()
  return { card: refreshed[0], nextDeck: refreshed.slice(1) }
}

function createHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

function createGenesisBlock() {
  const blockData = {
    index: 0,
    round: 0,
    timestamp: new Date().toISOString(),
    previousHash: '0',
    miner: 'Genesis',
    transactions: [],
    balances: {}
  }
  return {
    ...blockData,
    hash: createHash(blockData)
  }
}

function buildPlayer(id, name, color, isHuman = false) {
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

function leftIndex(players, index) {
  return (index - 1 + players.length) % players.length
}

function rightIndex(players, index) {
  return (index + 1) % players.length
}

function calculateMiningScore(miningCard, visibleCards) {
  let score = 0
  for (const card of visibleCards) {
    if (!card) continue
    if (card.rank && card.rank === miningCard.rank) score += 1
    if (card.suit && card.suit === miningCard.suit) score += 1
  }
  return score
}

function getLedger() {
  const ledger = {}
  for (const player of game.players) {
    ledger[player.name] = player.istokens
  }
  return ledger
}

function sanitizeState() {
  return {
    round: game.round,
    phase: game.phase,
    boardTiles: BOARD_TILES,
    players: game.players,
    winningCard: game.winningCard,
    chain: game.chain,
    ledger: getLedger(),
    gameOver: game.gameOver,
    winnerName: game.winnerName,
    lastRound: game.lastRound
  }
}

function resetRoundFields() {
  game.players = game.players.map((player) => ({
    ...player,
    currentCard: null,
    miningCard: null,
    miningScore: null,
    blockedThisRound: false,
    lastDice: null
  }))
}

function moveAndDraw(playerId, dice) {
  const playerIndex = game.players.findIndex((player) => player.id === playerId)
  const player = game.players[playerIndex]

  if (!player || !player.active) return null

  let newPosition = player.position
  let crossedStart = false

  for (let step = 0; step < dice; step += 1) {
    newPosition = (newPosition + 1) % BOARD_SIZE
    if (newPosition === 0) crossedStart = true
  }

  player.position = newPosition
  player.lastDice = dice

  if (crossedStart) {
    player.istokens += 4
  }

  const tile = BOARD_TILES[newPosition]
  let drawnCard = null

  if (tile.type === 'income') {
    const drawn = drawFromDeck(game.incomeDeck, () => shuffle(INCOME_CARDS))
    game.incomeDeck = drawn.nextDeck
    drawnCard = drawn.card
  }

  if (tile.type === 'expense') {
    const drawn = drawFromDeck(game.expenseDeck, () => shuffle(EXPENSE_CARDS))
    game.expenseDeck = drawn.nextDeck
    drawnCard = drawn.card
  }

  if (tile.type === 'action') {
    const drawn = drawFromDeck(game.actionDeck, () => shuffle(ACTION_CARDS))
    game.actionDeck = drawn.nextDeck
    drawnCard = drawn.card
  }

  if (tile.type === 'jellyfish') {
    const drawn = drawFromDeck(game.expenseDeck, () => shuffle(EXPENSE_CARDS))
    game.expenseDeck = drawn.nextDeck
    drawnCard = drawn.card
    player.istokens -= 1
  }

  if (tile.type === 'fire') {
    const drawn = drawFromDeck(game.incomeDeck, () => shuffle(INCOME_CARDS))
    game.incomeDeck = drawn.nextDeck
    drawnCard = drawn.card
    player.istokens += 1
  }

  if (tile.type === 'totem') {
    const drawn = drawFromDeck(game.actionDeck, () => shuffle(ACTION_CARDS))
    game.actionDeck = drawn.nextDeck
    drawnCard = drawn.card
    player.blockedThisRound = true
  }

  if (tile.type === 'start') {
    const drawn = drawFromDeck(game.actionDeck, () => shuffle(ACTION_CARDS))
    game.actionDeck = drawn.nextDeck
    drawnCard = drawn.card
  }

  player.currentCard = drawnCard
  game.players[playerIndex] = player

  return {
    name: player.name,
    dice,
    tile: tile.label,
    card: drawnCard
  }
}

function drawMiningCard(player) {
  const firstDraw = drawFromDeck(game.standardDeck, createStandardDeck)
  game.standardDeck = firstDraw.nextDeck
  let chosen = firstDraw.card

  if (player.currentCard?.actionType === 'axe') {
    const secondDraw = drawFromDeck(game.standardDeck, createStandardDeck)
    game.standardDeck = secondDraw.nextDeck
    chosen = [firstDraw.card, secondDraw.card].sort((a, b) => b.value - a.value)[0]
  }

  return chosen
}

function adjustBalance(playerId, amount) {
  const player = game.players.find((item) => item.id === playerId)
  if (player) {
    player.istokens += amount
  }
}

function executeCardEffects(roundEvents, transactions) {
  for (let index = 0; index < game.players.length; index += 1) {
    const player = game.players[index]
    if (!player.active || !player.currentCard) continue

    const card = player.currentCard

    if (card.category === 'income') {
      if (card.mode === 'bank') {
        adjustBalance(player.id, card.amount)
        roundEvents.push(`${player.name} received ${card.amount} Istokens from the bank.`)
        transactions.push({ type: 'income', from: 'Bank', to: player.name, amount: card.amount, reason: card.title })
      }

      if (card.mode === 'leftPays') {
        const other = game.players[leftIndex(game.players, index)]
        if (other.active) {
          adjustBalance(other.id, -card.amount)
          adjustBalance(player.id, card.amount)
          roundEvents.push(`${other.name} paid ${card.amount} Istokens to ${player.name}.`)
          transactions.push({ type: 'transfer', from: other.name, to: player.name, amount: card.amount, reason: card.title })
        }
      }

      if (card.mode === 'rightPays') {
        const other = game.players[rightIndex(game.players, index)]
        if (other.active) {
          adjustBalance(other.id, -card.amount)
          adjustBalance(player.id, card.amount)
          roundEvents.push(`${other.name} paid ${card.amount} Istokens to ${player.name}.`)
          transactions.push({ type: 'transfer', from: other.name, to: player.name, amount: card.amount, reason: card.title })
        }
      }

      if (card.mode === 'allPay') {
        for (const other of game.players) {
          if (other.id !== player.id && other.active) {
            adjustBalance(other.id, -card.amount)
            adjustBalance(player.id, card.amount)
            transactions.push({ type: 'transfer', from: other.name, to: player.name, amount: card.amount, reason: card.title })
          }
        }
        roundEvents.push(`${player.name} received ${card.amount} Istokens from each other active player.`)
      }
    }

    if (card.category === 'expense') {
      if (card.mode === 'bank') {
        adjustBalance(player.id, -card.amount)
        roundEvents.push(`${player.name} paid ${card.amount} Istokens to the bank.`)
        transactions.push({ type: 'expense', from: player.name, to: 'Bank', amount: card.amount, reason: card.title })
      }

      if (card.mode === 'leftReceives') {
        const other = game.players[leftIndex(game.players, index)]
        if (other.active) {
          adjustBalance(player.id, -card.amount)
          adjustBalance(other.id, card.amount)
          roundEvents.push(`${player.name} paid ${card.amount} Istokens to ${other.name}.`)
          transactions.push({ type: 'transfer', from: player.name, to: other.name, amount: card.amount, reason: card.title })
        }
      }

      if (card.mode === 'rightReceives') {
        const other = game.players[rightIndex(game.players, index)]
        if (other.active) {
          adjustBalance(player.id, -card.amount)
          adjustBalance(other.id, card.amount)
          roundEvents.push(`${player.name} paid ${card.amount} Istokens to ${other.name}.`)
          transactions.push({ type: 'transfer', from: player.name, to: other.name, amount: card.amount, reason: card.title })
        }
      }

      if (card.mode === 'allReceive') {
        for (const other of game.players) {
          if (other.id !== player.id && other.active) {
            adjustBalance(player.id, -card.amount)
            adjustBalance(other.id, card.amount)
            transactions.push({ type: 'transfer', from: player.name, to: other.name, amount: card.amount, reason: card.title })
          }
        }
        roundEvents.push(`${player.name} paid ${card.amount} Istokens to each other active player.`)
      }
    }

    if (card.category === 'action') {
      if (card.actionType === 'jellyfish') {
        player.skipNextMining = true
        roundEvents.push(`${player.name} will skip the next mining round.`)
        transactions.push({ type: 'action', actor: player.name, effect: 'skip_next_mining', reason: card.title })
      }

      if (card.actionType === 'fire') {
        for (const other of game.players) {
          if (other.id !== player.id && other.active) {
            adjustBalance(other.id, -1)
            adjustBalance(player.id, 1)
            transactions.push({ type: 'transfer', from: other.name, to: player.name, amount: 1, reason: card.title })
          }
        }
        roundEvents.push(`${player.name} used Fire and got 1 Istoken from each other active player.`)
      }

      if (card.actionType === 'totem') {
        player.permanentlyBlocked = true
        roundEvents.push(`${player.name} became permanently blocked from mining.`)
        transactions.push({ type: 'action', actor: player.name, effect: 'permanently_blocked', reason: card.title })
      }
    }
  }
}

function eliminatePlayers(roundEvents) {
  for (const player of game.players) {
    if (player.active && player.istokens < 0) {
      player.active = false
      roundEvents.push(`${player.name} dropped below zero and is out of the game.`)
    }
  }
}

function resolveEndGame() {
  const activePlayers = game.players.filter((player) => player.active)

  if (activePlayers.length === 1) {
    game.gameOver = true
    game.winnerName = activePlayers[0].name
    game.phase = 'finished'
    return
  }

  if (activePlayers.length === 0) {
    game.gameOver = true
    game.winnerName = 'No one'
    game.phase = 'finished'
    return
  }

  const minersAvailable = activePlayers.some(
    (player) => !player.permanentlyBlocked && !player.skipNextMining
  )

  if (!minersAvailable) {
    const winner = [...activePlayers].sort((a, b) => b.istokens - a.istokens)[0]
    game.gameOver = true
    game.winnerName = winner.name
    game.phase = 'finished'
  }
}

function processAiPlayers() {
  const moves = game.lastRound.moves
  const aiActions = game.lastRound.aiActions

  for (const player of game.players) {
    if (!player.active || player.isHuman) continue

    const dice = Math.floor(Math.random() * 6) + 1
    const move = moveAndDraw(player.id, dice)
    if (move) {
      moves.push(move)
    }

    if (player.permanentlyBlocked) {
      aiActions.push(`${player.name} is permanently blocked from mining.`)
      continue
    }

    if (player.skipNextMining) {
      aiActions.push(`${player.name} skips mining this round.`)
      player.skipNextMining = false
      continue
    }

    if (player.blockedThisRound) {
      aiActions.push(`${player.name} is blocked from mining this round.`)
      continue
    }

    if (player.istokens <= MINING_COST) {
      aiActions.push(`${player.name} cannot afford mining.`)
      continue
    }

    const willMine = Math.random() > 0.3

    if (!willMine) {
      aiActions.push(`${player.name} decided not to mine.`)
      continue
    }

    player.istokens -= MINING_COST
    player.miningCard = drawMiningCard(player)
    aiActions.push(`${player.name} joined mining.`)
  }
}

function resolveRound(humanWillMine) {
  const roundEvents = []
  const transactions = []

  const human = game.players.find((player) => player.isHuman)

  if (human && human.active) {
    if (human.permanentlyBlocked) {
      roundEvents.push(`${human.name} is permanently blocked from mining.`)
    } else if (human.skipNextMining) {
      roundEvents.push(`${human.name} skips mining this round.`)
      human.skipNextMining = false
    } else if (human.blockedThisRound) {
      roundEvents.push(`${human.name} is blocked from mining this round.`)
    } else if (humanWillMine && human.istokens > MINING_COST) {
      human.istokens -= MINING_COST
      human.miningCard = drawMiningCard(human)
      roundEvents.push(`${human.name} joined mining and paid 1 Istoken.`)
      transactions.push({ type: 'mining_cost', from: human.name, to: 'Network', amount: 1 })
    } else {
      roundEvents.push(`${human.name} did not mine this round.`)
    }
  }

  processAiPlayers()

  const visibleCards = [game.winningCard, ...game.players.map((player) => player.currentCard).filter(Boolean)]
  const miners = game.players.filter((player) => player.active && player.miningCard)

  for (const player of miners) {
    player.miningScore = calculateMiningScore(player.miningCard, visibleCards)
  }

  let roundWinner = null

  if (miners.length > 0) {
    const sorted = [...miners].sort((a, b) => {
      if (b.miningScore !== a.miningScore) return b.miningScore - a.miningScore
      return b.miningCard.value - a.miningCard.value
    })

    const topScore = sorted[0].miningScore
    const tied = sorted.filter((player) => player.miningScore === topScore)

    if (tied.length === 1) {
      roundWinner = tied[0]
    } else {
      const bestCardValue = Math.max(...tied.map((player) => player.miningCard.value))
      const finalists = tied.filter((player) => player.miningCard.value === bestCardValue)
      roundWinner = finalists[Math.floor(Math.random() * finalists.length)]
    }

    roundWinner.istokens += MINING_REWARD
    game.winningCard = roundWinner.miningCard
    roundEvents.push(`${roundWinner.name} won mining and received ${MINING_REWARD} Istokens.`)
    transactions.push({ type: 'mining_reward', from: 'Network', to: roundWinner.name, amount: MINING_REWARD })
  } else {
    roundEvents.push('No one mined this round.')
  }

  executeCardEffects(roundEvents, transactions)
  eliminatePlayers(roundEvents)

  const previousBlock = game.chain[game.chain.length - 1]
  const blockData = {
    index: game.chain.length,
    round: game.round,
    timestamp: new Date().toISOString(),
    previousHash: previousBlock.hash,
    miner: roundWinner ? roundWinner.name : 'No miner',
    transactions,
    balances: getLedger(),
    winningCard: game.winningCard
  }

  const block = {
    ...blockData,
    hash: createHash(blockData)
  }

  game.chain.push(block)
  game.lastRound.events = roundEvents
  resolveEndGame()

  if (!game.gameOver) {
    game.round += 1
    game.phase = 'awaiting_roll'
  }
}

app.post('/api/game/start', (req, res) => {
  const { playerCount, names } = req.body

  if (![2, 3, 4].includes(playerCount)) {
    return res.status(400).json({ error: 'Player count must be 2, 3, or 4.' })
  }

  const safeNames = Array.isArray(names) ? names : []
  const players = Array.from({ length: playerCount }, (_, index) => {
    const defaultName = index === 0 ? 'Player 1' : `AI ${index + 1}`
    const name = typeof safeNames[index] === 'string' && safeNames[index].trim()
      ? safeNames[index].trim()
      : defaultName

    return buildPlayer(index + 1, name, PLAYER_COLORS[index], index === 0)
  })

  const standardDeck = createStandardDeck()
  const winningCard = standardDeck[0]

  game = {
    round: 1,
    phase: 'awaiting_roll',
    players,
    winningCard,
    standardDeck: standardDeck.slice(1),
    incomeDeck: shuffle(INCOME_CARDS),
    expenseDeck: shuffle(EXPENSE_CARDS),
    actionDeck: shuffle(ACTION_CARDS),
    chain: [createGenesisBlock()],
    gameOver: false,
    winnerName: null,
    lastRound: {
      moves: [],
      aiActions: [],
      events: []
    }
  }

  return res.json({ state: sanitizeState() })
})

app.get('/api/game/state', (req, res) => {
  if (!game) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  return res.json({ state: sanitizeState() })
})

app.post('/api/game/player-roll', (req, res) => {
  if (!game) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  if (game.gameOver) {
    return res.status(400).json({ error: 'Game is already over.' })
  }

  if (game.phase !== 'awaiting_roll') {
    return res.status(400).json({ error: 'It is not the roll phase.' })
  }

  resetRoundFields()
  game.lastRound = {
    moves: [],
    aiActions: [],
    events: []
  }

  const human = game.players.find((player) => player.isHuman)

  if (!human || !human.active) {
    return res.status(400).json({ error: 'Human player is not active.' })
  }

  const dice = Math.floor(Math.random() * 6) + 1
  const move = moveAndDraw(human.id, dice)

  if (move) {
    game.lastRound.moves.push(move)
  }

  game.phase = 'awaiting_mine_choice'
  return res.json({ state: sanitizeState() })
})

app.post('/api/game/player-mine', (req, res) => {
  if (!game) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  if (game.gameOver) {
    return res.status(400).json({ error: 'Game is already over.' })
  }

  if (game.phase !== 'awaiting_mine_choice') {
    return res.status(400).json({ error: 'It is not the mining choice phase.' })
  }

  const { willMine } = req.body
  resolveRound(Boolean(willMine))
  return res.json({ state: sanitizeState() })
})

app.listen(PORT, () => {
  console.log(`Market Island server running on http://localhost:${PORT}`)
})