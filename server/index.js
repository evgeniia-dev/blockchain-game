import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import http from 'http'
import { Server } from 'socket.io'

const app = express()
const PORT = 3001
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

const START_BALANCE = 50
const MINING_COST = 1
const MINING_REWARD = 5
const MAX_ROOM_PLAYERS = 3
const ROUND_LIMIT = 10

const BOARD_TILES = [
  { id: 0, type: 'start', label: 'Start' },
  { id: 1, type: 'income', label: 'Income' },
  { id: 2, type: 'expense', label: 'Expense' },
  { id: 3, type: 'action', label: 'Action' },
  { id: 4, type: 'jellyfish', label: 'Jellyfish' },
  { id: 5, type: 'income', label: 'Income' },
  { id: 6, type: 'action', label: 'Action' },
  { id: 7, type: 'expense', label: 'Expense' },
  { id: 8, type: 'fire', label: 'Fire' },
  { id: 9, type: 'income', label: 'Income' },
  { id: 10, type: 'expense', label: 'Expense' },
  { id: 11, type: 'action', label: 'Action' },
  { id: 12, type: 'totem', label: 'Totem' },
  { id: 13, type: 'expense', label: 'Expense' },
  { id: 14, type: 'income', label: 'Income' },
  { id: 15, type: 'action', label: 'Action' }
]

const PLAYER_COLORS = ['#7288ff', '#6ed9bd', '#c79cff']
const PLAYER_COLOR_NAMES = ['Blue', 'Mint', 'Lilac']
const SUITS = ['clubs', 'diamonds', 'hearts', 'spades']
const SUIT_SYMBOL = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }

const RANKS = [
  { rank: 'A', value: 14 },
  { rank: 'K', value: 13 },
  { rank: 'Q', value: 12 },
  { rank: 'J', value: 11 },
  { rank: '10', value: 10 },
  { rank: '9', value: 9 },
  { rank: '8', value: 8 },
  { rank: '7', value: 7 },
  { rank: '6', value: 6 },
  { rank: '5', value: 5 },
  { rank: '4', value: 4 },
  { rank: '3', value: 3 },
  { rank: '2', value: 2 }
]

const INCOME_CARDS = [
  { id: 'i1', kind: 'income', title: 'Shell Sale', text: 'Receive 4 Istoken from the player on your left.', effect: 'leftPays', amount: 4, suit: 'hearts', rank: '4' },
  { id: 'i2', kind: 'income', title: 'Fishing Profit', text: 'Receive 4 Istoken from the player on your right.', effect: 'rightPays', amount: 4, suit: 'clubs', rank: '4' },
  { id: 'i3', kind: 'income', title: 'Pearl Trade', text: 'Receive 5 Istoken from the bank.', effect: 'bankGain', amount: 5, suit: 'diamonds', rank: '5' },
  { id: 'i4', kind: 'income', title: 'Market Bonus', text: 'Each other player gives you 2 Istoken.', effect: 'allPay', amount: 2, suit: 'spades', rank: '2' }
]

const EXPENSE_CARDS = [
  { id: 'e1', kind: 'expense', title: 'Boat Repair', text: 'Pay 5 Istoken to the player on your left.', effect: 'payLeft', amount: 5, suit: 'hearts', rank: '5' },
  { id: 'e2', kind: 'expense', title: 'Broken Tools', text: 'Pay 5 Istoken to the player on your right.', effect: 'payRight', amount: 5, suit: 'clubs', rank: '5' },
  { id: 'e3', kind: 'expense', title: 'Storm Damage', text: 'Pay 4 Istoken to the bank.', effect: 'bankLoss', amount: 4, suit: 'diamonds', rank: '4' },
  { id: 'e4', kind: 'expense', title: 'Shared Cost', text: 'Pay 2 Istoken to each other player.', effect: 'payAll', amount: 2, suit: 'spades', rank: '2' }
]

const ACTION_CARDS = [
  { id: 'a1', kind: 'action', title: 'Jellyfish', text: 'Skip the next mining round.', action: 'jellyfish', suit: 'hearts', rank: 'J' },
  { id: 'a2', kind: 'action', title: 'Fire', text: 'Each other player gives you 1 Istoken.', action: 'fire', suit: 'diamonds', rank: 'Q' },
  { id: 'a3', kind: 'action', title: 'Totem', text: 'You cannot mine for the rest of the game.', action: 'totem', suit: 'clubs', rank: 'K' },
  { id: 'a4', kind: 'action', title: 'Axe', text: 'Draw two standard cards and choose one during mining.', action: 'axe', suit: 'spades', rank: 'A' }
]

const rooms = {}

function shuffle(array) {
  const copy = [...array]

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

function createRoomCode() {
  let code = ''

  do {
    code = Math.random().toString(36).slice(2, 8).toUpperCase()
  } while (rooms[code])

  return code
}

function createHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

function face(card) {
  if (!card) return '—'
  return `${card.rank}${SUIT_SYMBOL[card.suit] || ''}`
}

function createStandardDeck() {
  return shuffle(
    SUITS.flatMap((suit) =>
      RANKS.map((item) => ({
        id: `${item.rank}-${suit}`,
        kind: 'standard',
        rank: item.rank,
        suit,
        value: item.value,
        title: `${item.rank}${SUIT_SYMBOL[suit]}`
      }))
    )
  )
}

function drawFromDeck(deck, fallback) {
  if (deck.length > 0) {
    return { card: deck[0], deck: deck.slice(1) }
  }

  const refreshed = fallback()
  return { card: refreshed[0], deck: refreshed.slice(1) }
}

function buildRoomPlayer(socketPlayer, index) {
  return {
    id: socketPlayer.id,
    name: socketPlayer.name,
    color: PLAYER_COLORS[index],
    label: `Player ${index + 1}`,
    colorName: PLAYER_COLOR_NAMES[index],
    coins: START_BALANCE,
    position: 0,
    active: true,
    skipNextMining: false,
    blockedForever: false,
    blockedThisRound: false,
    transactionCard: null,
    miningCard: null,
    lastRoll: null
  }
}

function publicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    maxPlayers: MAX_ROOM_PLAYERS,
    players: room.players.map((player) => ({
      id: player.id,
      name: player.name,
      color: player.color,
      isHost: player.id === room.hostId
    })),
    game: room.game ? publicGame(room.game) : null
  }
}

function publicGame(game) {
  return {
    round: game.round,
    phase: game.phase,
    players: game.players,
    currentTurnId: game.players[game.currentTurnIndex]?.id || null,
    currentMinerId: game.players[game.currentMinerIndex]?.id || null,
    diceValue: game.diceValue,
    winningCard: game.winningCard,
    blocks: game.blocks,
    ledger: game.ledger,
    currentEvent: game.currentEvent,
    miningOffer: game.miningOffer,
    ledgerChanges: game.ledgerChanges,
    ledgerConfirmedBy: game.ledgerConfirmedBy,
    winner: game.winner
  }
}

function createRoomGame(room) {
  const standardDeck = createStandardDeck()
  const firstWinningCard = standardDeck[0]

  return {
    round: 1,
    phase: 'movement',
    players: room.players.map((player, index) => buildRoomPlayer(player, index)),
    currentTurnIndex: 0,
    currentMinerIndex: 0,
    diceValue: 1,
    winningCard: firstWinningCard,
    standardDeck: standardDeck.slice(1),
    incomeDeck: shuffle(Array.from({ length: 26 }, (_, i) => INCOME_CARDS[i % INCOME_CARDS.length])),
    expenseDeck: shuffle(Array.from({ length: 26 }, (_, i) => EXPENSE_CARDS[i % EXPENSE_CARDS.length])),
    actionDeck: shuffle(Array.from({ length: 54 }, (_, i) => ACTION_CARDS[i % ACTION_CARDS.length])),
    blocks: [
      {
        id: 'genesis',
        title: 'Genesis Block',
        miner: 'System',
        reward: 0,
        card: firstWinningCard,
        hash: createHash({ index: 0, card: firstWinningCard })
      }
    ],
    ledger: [
      `Initial Winning Card is ${face(firstWinningCard)}.`,
      'All players start with 50 Istoken.',
      'The shared scoreboard represents the synchronized blockchain ledger.'
    ],
    currentEvent: null,
    miningOffer: null,
    ledgerChanges: [],
    ledgerConfirmedBy: [],
    winner: ''
  }
}

function nextActiveIndex(players, fromIndex) {
  for (let i = fromIndex + 1; i < players.length; i += 1) {
    if (players[i].active) return i
  }

  return -1
}

function firstActiveIndex(players) {
  return players.findIndex((player) => player.active)
}

function leftIndex(players, index) {
  for (let i = 1; i < players.length; i += 1) {
    const target = (index - i + players.length) % players.length
    if (players[target].active) return target
  }

  return -1
}

function rightIndex(players, index) {
  for (let i = 1; i < players.length; i += 1) {
    const target = (index + i) % players.length
    if (players[target].active) return target
  }

  return -1
}

function addLedger(game, items) {
  game.ledger = [...items.reverse(), ...game.ledger].slice(0, 80)
}

function drawCardForTile(game, tile) {
  if (tile.type === 'income' || tile.type === 'fire') {
    const result = drawFromDeck(game.incomeDeck, () => shuffle(INCOME_CARDS))
    game.incomeDeck = result.deck
    return result.card
  }

  if (tile.type === 'expense' || tile.type === 'jellyfish') {
    const result = drawFromDeck(game.expenseDeck, () => shuffle(EXPENSE_CARDS))
    game.expenseDeck = result.deck
    return result.card
  }

  const result = drawFromDeck(game.actionDeck, () => shuffle(ACTION_CARDS))
  game.actionDeck = result.deck
  return result.card
}

function movePlayer(player, roll) {
  let position = player.position
  let crossedStart = false

  for (let i = 0; i < roll; i += 1) {
    position = (position + 1) % BOARD_TILES.length
    if (position === 0) crossedStart = true
  }

  return { ...player, position, crossedStart, lastRoll: roll }
}

function miningReason(player) {
  if (!player.active) return 'This player is disqualified.'
  if (player.skipNextMining) return 'Jellyfish effect: this player must skip this mining round.'
  if (player.blockedForever) return 'Totem effect: this player can no longer participate in mining.'
  if (player.blockedThisRound) return 'Totem corner: this player cannot mine this round.'
  if (player.coins < MINING_COST) return 'This player does not have enough Istoken to pay the mining cost.'
  return ''
}

function drawMiningOffer(game, player) {
  const count = player.transactionCard?.action === 'axe' ? 2 : 1
  const cards = []

  for (let i = 0; i < count; i += 1) {
    const result = drawFromDeck(game.standardDeck, createStandardDeck)
    game.standardDeck = result.deck
    cards.push(result.card)
  }

  return {
    playerId: player.id,
    cards,
    selected: cards[0],
    blocked: false,
    reason: ''
  }
}

function prepareMiningOffer(game) {
  const player = game.players[game.currentMinerIndex]

  if (!player) return

  const reason = miningReason(player)

  if (reason) {
    game.miningOffer = {
      playerId: player.id,
      cards: [],
      selected: null,
      blocked: true,
      reason
    }
    return
  }

  game.miningOffer = drawMiningOffer(game, player)
}

function scoreMiningCard(card, visibleCards) {
  return visibleCards.reduce((total, other) => {
    if (!other) return total

    return total + (card.rank === other.rank ? 1 : 0) + (card.suit === other.suit ? 1 : 0)
  }, 0)
}

function executeCards(game, logs) {
  const players = game.players.map((player) => ({ ...player }))

  const add = (index, amount) => {
    players[index].coins += amount
  }

  players.forEach((player, index) => {
    if (!player.active || !player.transactionCard) return

    const card = player.transactionCard

    if (card.effect === 'bankGain') add(index, card.amount)
    if (card.effect === 'bankLoss') add(index, -card.amount)

    if (card.effect === 'leftPays') {
      const target = leftIndex(players, index)

      if (target >= 0) {
        add(target, -card.amount)
        add(index, card.amount)
      }
    }

    if (card.effect === 'rightPays') {
      const target = rightIndex(players, index)

      if (target >= 0) {
        add(target, -card.amount)
        add(index, card.amount)
      }
    }

    if (card.effect === 'payLeft') {
      const target = leftIndex(players, index)

      if (target >= 0) {
        add(index, -card.amount)
        add(target, card.amount)
      }
    }

    if (card.effect === 'payRight') {
      const target = rightIndex(players, index)

      if (target >= 0) {
        add(index, -card.amount)
        add(target, card.amount)
      }
    }

    if (card.effect === 'allPay') {
      players.forEach((other, otherIndex) => {
        if (otherIndex !== index && other.active) {
          add(otherIndex, -card.amount)
          add(index, card.amount)
        }
      })
    }

    if (card.effect === 'payAll') {
      players.forEach((other, otherIndex) => {
        if (otherIndex !== index && other.active) {
          add(index, -card.amount)
          add(otherIndex, card.amount)
        }
      })
    }

    if (card.action === 'jellyfish') {
      players[index].skipNextMining = true
    }

    if (card.action === 'fire') {
      players.forEach((other, otherIndex) => {
        if (otherIndex !== index && other.active) {
          add(otherIndex, -1)
          add(index, 1)
        }
      })
    }

    if (card.action === 'totem') {
      players[index].blockedForever = true
    }

    logs.push(`${player.name} executes ${card.title}: ${card.text}`)
  })

  return players
}

function resolveMiningAndLedger(game) {
  const beforeBalances = game.players.map((player) => ({
    id: player.id,
    name: player.name,
    before: player.coins
  }))

  const logs = []
  const visibleCards = [
    game.winningCard,
    ...game.players.map((player) => player.transactionCard).filter(Boolean)
  ]

  const miners = game.players
    .filter((player) => player.active && player.miningCard)
    .map((player) => ({
      ...player,
      miningScore: scoreMiningCard(player.miningCard, visibleCards)
    }))

  let newWinningCard = game.winningCard
  let newBlock = null

  if (miners.length > 0) {
    let finalists = [...miners].sort((a, b) => b.miningScore - a.miningScore || b.miningCard.value - a.miningCard.value)
    const bestScore = finalists[0].miningScore
    finalists = finalists.filter((player) => player.miningScore === bestScore)
    const bestValue = Math.max(...finalists.map((player) => player.miningCard.value))
    finalists = finalists.filter((player) => player.miningCard.value === bestValue)

    const miningWinner = finalists[0]

    game.players = game.players.map((player) =>
      player.id === miningWinner.id
        ? { ...player, coins: player.coins + MINING_REWARD }
        : player
    )

    newWinningCard = miningWinner.miningCard
    newBlock = {
      id: `block-${game.round}-${Date.now()}`,
      title: `Block ${game.round}`,
      miner: miningWinner.name,
      reward: MINING_REWARD,
      card: newWinningCard,
      hash: createHash({
        round: game.round,
        miner: miningWinner.name,
        winningCard: newWinningCard
      })
    }

    logs.push(`${miningWinner.name} wins mining with ${face(miningWinner.miningCard)} and receives 5 Istoken.`)
  } else {
    logs.push('No player joined mining. No block reward was paid.')
  }

  game.winningCard = newWinningCard

  if (newBlock) {
    game.blocks = [newBlock, ...game.blocks]
  }

  game.players = executeCards(game, logs)
  game.players = game.players.map((player) =>
    player.coins < 0 ? { ...player, active: false } : player
  )

  game.ledgerChanges = game.players.map((player) => {
    const before = beforeBalances.find((item) => item.id === player.id)?.before ?? player.coins

    return {
      id: player.id,
      name: player.name,
      before,
      after: player.coins,
      difference: player.coins - before
    }
  })

  addLedger(game, logs)

  const activePlayers = game.players.filter((player) => player.active)

  if (activePlayers.length <= 1) {
    game.winner = activePlayers[0]
      ? `${activePlayers[0].name} wins because only one player remains.`
      : 'Game over.'
    game.phase = 'game-over'
    return
  }

  game.currentEvent = {
    title: 'Ledger Confirmation',
    text: newBlock
      ? `${newBlock.miner} validated the transactions and created a new block.`
      : 'No block was created this round.',
    note: 'Shared ledger updated.',
    privateNote: 'All players must confirm the same updated balances before the next round begins.',
    lesson: 'A blockchain ledger is a shared record. Everyone sees the same balance updates.'
  }

  game.ledgerConfirmedBy = []
  game.phase = 'ledger-confirmation'
}

function broadcastRoom(room) {
  io.to(room.code).emit('room-updated', publicRoom(room))
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id)

  socket.emit('server-message', {
    message: 'Connected to Market Island multiplayer server',
    socketId: socket.id
  })

  socket.on('create-room', ({ playerName }, callback) => {
    const safeName = typeof playerName === 'string' && playerName.trim()
      ? playerName.trim()
      : 'Player 1'

    const code = createRoomCode()

    rooms[code] = {
      code,
      hostId: socket.id,
      status: 'waiting',
      players: [
        {
          id: socket.id,
          name: safeName,
          color: PLAYER_COLORS[0]
        }
      ],
      game: null
    }

    socket.join(code)
    callback({ ok: true, room: publicRoom(rooms[code]) })
    broadcastRoom(rooms[code])
  })

  socket.on('join-room', ({ roomCode, playerName }, callback) => {
    const code = String(roomCode || '').trim().toUpperCase()
    const room = rooms[code]

    if (!room) return callback({ ok: false, error: 'Room not found.' })
    if (room.players.length >= MAX_ROOM_PLAYERS) return callback({ ok: false, error: 'Room is full.' })
    if (room.status !== 'waiting') return callback({ ok: false, error: 'Game already started.' })

    const safeName = typeof playerName === 'string' && playerName.trim()
      ? playerName.trim()
      : `Player ${room.players.length + 1}`

    if (!room.players.some((player) => player.id === socket.id)) {
      room.players.push({
        id: socket.id,
        name: safeName,
        color: PLAYER_COLORS[room.players.length]
      })
    }

    socket.join(code)
    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('start-room-game', ({ roomCode }, callback) => {
    const code = String(roomCode || '').trim().toUpperCase()
    const room = rooms[code]

    if (!room) return callback({ ok: false, error: 'Room not found.' })
    if (room.hostId !== socket.id) return callback({ ok: false, error: 'Only the host can start the game.' })
    if (room.players.length < 2) return callback({ ok: false, error: 'At least 2 players are needed.' })

    room.status = 'playing'
    room.game = createRoomGame(room)

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-roll-dice', ({ roomCode }, callback) => {
    const code = String(roomCode || '').trim().toUpperCase()
    const room = rooms[code]
    const game = room?.game

    if (!room || !game) return callback({ ok: false, error: 'Game not found.' })
    if (game.phase !== 'movement') return callback({ ok: false, error: 'It is not the movement phase.' })

    const player = game.players[game.currentTurnIndex]

    if (!player || player.id !== socket.id) {
      return callback({ ok: false, error: 'It is not your turn.' })
    }

    const roll = Math.floor(Math.random() * 6) + 1
    const moved = movePlayer(player, roll)
    const tile = BOARD_TILES[moved.position]
    const card = drawCardForTile(game, tile)
    const logs = []

    if (moved.crossedStart) {
      moved.coins += 4
      logs.push(`${moved.name} crossed Start and received 4 Istoken.`)
    }

    if (tile.type === 'jellyfish') {
      moved.coins -= 1
      logs.push(`${moved.name} landed on Jellyfish and paid 1 extra Istoken.`)
    }

    if (tile.type === 'fire') {
      moved.coins += 1
      logs.push(`${moved.name} landed on Fire and received 1 extra Istoken.`)
    }

    if (tile.type === 'totem') {
      moved.blockedThisRound = true
      logs.push(`${moved.name} landed on Totem and cannot mine this round.`)
    }

    moved.transactionCard = card
    game.players[game.currentTurnIndex] = moved
    game.diceValue = roll
    game.phase = 'card-reveal'

    game.currentEvent = {
      ownerId: moved.id,
      title: `${moved.label} / ${moved.colorName}: ${moved.name}`,
      text: `${moved.name} rolled ${roll} and moved to ${tile.label}.`,
      note: 'Transaction card picked up.',
      privateNote: `${card.title}: ${card.text} (${face(card)})`,
      card,
      lesson: 'This card is a transaction. It is picked up now, but its effect is applied after mining.'
    }

    addLedger(game, [
      `${moved.name} rolled ${roll}, moved to ${tile.label}, and picked up a hidden ${card.kind} card.`,
      ...logs
    ])

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-continue-after-card', ({ roomCode }, callback) => {
    const code = String(roomCode || '').trim().toUpperCase()
    const room = rooms[code]
    const game = room?.game

    if (!room || !game) return callback({ ok: false, error: 'Game not found.' })
    if (game.phase !== 'card-reveal') return callback({ ok: false, error: 'No card is waiting.' })

    const player = game.players[game.currentTurnIndex]

    if (!player || player.id !== socket.id) {
      return callback({ ok: false, error: 'Only the current player can continue.' })
    }

    const nextIndex = nextActiveIndex(game.players, game.currentTurnIndex)

    if (nextIndex >= 0) {
      game.currentTurnIndex = nextIndex
      game.phase = 'movement'
    } else {
      game.phase = 'mining'
      game.currentMinerIndex = firstActiveIndex(game.players)
      prepareMiningOffer(game)
    }

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-select-mining-card', ({ roomCode, cardId }, callback) => {
    const room = rooms[String(roomCode || '').trim().toUpperCase()]
    const game = room?.game

    if (!room || !game || !game.miningOffer) {
      return callback({ ok: false, error: 'Mining offer not found.' })
    }

    if (game.miningOffer.playerId !== socket.id) {
      return callback({ ok: false, error: 'This is not your mining choice.' })
    }

    const selected = game.miningOffer.cards.find((card) => card.id === cardId)

    if (!selected) return callback({ ok: false, error: 'Card not found.' })

    game.miningOffer.selected = selected

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-skip-mining', ({ roomCode }, callback) => {
    const room = rooms[String(roomCode || '').trim().toUpperCase()]
    const game = room?.game

    if (!room || !game || game.phase !== 'mining') {
      return callback({ ok: false, error: 'Mining phase not found.' })
    }

    const player = game.players[game.currentMinerIndex]

    if (!player || player.id !== socket.id) {
      return callback({ ok: false, error: 'This is not your mining turn.' })
    }

    game.players[game.currentMinerIndex] = {
      ...player,
      skipNextMining: false,
      miningCard: null
    }

    const nextIndex = nextActiveIndex(game.players, game.currentMinerIndex)

    if (nextIndex >= 0) {
      game.currentMinerIndex = nextIndex
      prepareMiningOffer(game)
    } else {
      game.miningOffer = null
      resolveMiningAndLedger(game)
    }

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-join-mining', ({ roomCode }, callback) => {
    const room = rooms[String(roomCode || '').trim().toUpperCase()]
    const game = room?.game

    if (!room || !game || game.phase !== 'mining') {
      return callback({ ok: false, error: 'Mining phase not found.' })
    }

    const player = game.players[game.currentMinerIndex]

    if (!player || player.id !== socket.id) {
      return callback({ ok: false, error: 'This is not your mining turn.' })
    }

    if (game.miningOffer?.blocked) {
      return callback({ ok: false, error: game.miningOffer.reason })
    }

    game.players[game.currentMinerIndex] = {
      ...player,
      coins: player.coins - MINING_COST,
      miningCard: game.miningOffer.selected,
      skipNextMining: false
    }

    const nextIndex = nextActiveIndex(game.players, game.currentMinerIndex)

    if (nextIndex >= 0) {
      game.currentMinerIndex = nextIndex
      prepareMiningOffer(game)
    } else {
      game.miningOffer = null
      resolveMiningAndLedger(game)
    }

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('room-confirm-ledger', ({ roomCode }, callback) => {
    const room = rooms[String(roomCode || '').trim().toUpperCase()]
    const game = room?.game

    if (!room || !game) return callback({ ok: false, error: 'Game not found.' })

    if (game.phase !== 'ledger-confirmation') {
      return callback({ ok: false, error: 'Ledger is not waiting for confirmation.' })
    }

    if (!game.ledgerConfirmedBy.includes(socket.id)) {
      game.ledgerConfirmedBy.push(socket.id)
    }

    const activePlayerIds = game.players
      .filter((player) => player.active)
      .map((player) => player.id)

    const everyoneConfirmed = activePlayerIds.every((id) =>
      game.ledgerConfirmedBy.includes(id)
    )

    if (!everyoneConfirmed) {
      callback({ ok: true, room: publicRoom(room) })
      broadcastRoom(room)
      return
    }

    if (game.round >= ROUND_LIMIT) {
      const activePlayers = game.players.filter((player) => player.active)
      const richest = [...activePlayers].sort((a, b) => b.coins - a.coins)[0]

      game.winner = richest
        ? `${richest.name} wins after ${ROUND_LIMIT} rounds with the most Istoken.`
        : 'Game over.'

      game.phase = 'game-over'
      game.currentEvent = null
      game.ledgerConfirmedBy = []
      game.miningOffer = null

      callback({ ok: true, room: publicRoom(room) })
      broadcastRoom(room)
      return
    }

    game.round += 1
    game.phase = 'movement'
    game.currentTurnIndex = firstActiveIndex(game.players)
    game.currentMinerIndex = 0
    game.currentEvent = null
    game.ledgerChanges = []
    game.ledgerConfirmedBy = []
    game.miningOffer = null
    game.players = game.players.map((player) => ({
      ...player,
      transactionCard: null,
      miningCard: null,
      blockedThisRound: false,
      lastRoll: null
    }))

    callback({ ok: true, room: publicRoom(room) })
    broadcastRoom(room)
  })

  socket.on('leave-room', ({ roomCode }) => {
    const room = rooms[String(roomCode || '').trim().toUpperCase()]

    if (!room) return

    room.players = room.players.filter((player) => player.id !== socket.id)
    socket.leave(room.code)

    if (room.players.length === 0) {
      delete rooms[room.code]
      return
    }

    if (room.hostId === socket.id) {
      room.hostId = room.players[0].id
    }

    broadcastRoom(room)
  })

  socket.on('disconnect', () => {
    for (const code of Object.keys(rooms)) {
      const room = rooms[code]
      const wasInRoom = room.players.some((player) => player.id === socket.id)

      if (!wasInRoom) continue

      room.players = room.players.filter((player) => player.id !== socket.id)

      if (room.players.length === 0) {
        delete rooms[code]
        continue
      }

      if (room.hostId === socket.id) {
        room.hostId = room.players[0].id
      }

      broadcastRoom(room)
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Market Island server running on http://localhost:${PORT}`)
})