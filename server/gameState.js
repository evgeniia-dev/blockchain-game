import {
  MINING_COST,
  MINING_REWARD,
  BOARD_SIZE,
  BOARD_TILES,
  PLAYER_COLORS,
  INCOME_CARDS,
  EXPENSE_CARDS,
  ACTION_CARDS
} from './gameConstants.js'
import {
  shuffle,
  createStandardDeck,
  drawCard,
  createHash,
  createGenesisBlock,
  createPlayer,
  getLeftPlayerIndex,
  getRightPlayerIndex,
  calculateMiningScore
} from './gameHelpers.js'

let game = null

export function isGameActive() {
  return game !== null
}

function buildLedger() {
  const ledger = {}
  for (const player of game.players) {
    ledger[player.name] = player.istokens
  }
  return ledger
}

function buildGameState() {
  return {
    round: game.round,
    phase: game.phase,
    boardTiles: BOARD_TILES,
    players: game.players,
    winningCard: game.winningCard,
    chain: game.chain,
    ledger: buildLedger(),
    gameOver: game.gameOver,
    winnerName: game.winnerName,
    lastRound: game.lastRound
  }
}

function resetRoundState() {
  game.players = game.players.map((player) => ({
    ...player,
    currentCard: null,
    miningCard: null,
    miningScore: null,
    blockedThisRound: false,
    lastDice: null
  }))
}

function drawCardForTileType(tile, player) {
  if (tile.type === 'income') {
    const drawn = drawCard(game.incomeDeck, () => shuffle(INCOME_CARDS))
    game.incomeDeck = drawn.nextDeck
    return drawn.card
  }
  if (tile.type === 'expense') {
    const drawn = drawCard(game.expenseDeck, () => shuffle(EXPENSE_CARDS))
    game.expenseDeck = drawn.nextDeck
    return drawn.card
  }
  if (tile.type === 'action' || tile.type === 'start') {
    const drawn = drawCard(game.actionDeck, () => shuffle(ACTION_CARDS))
    game.actionDeck = drawn.nextDeck
    return drawn.card
  }
  if (tile.type === 'jellyfish') {
    const drawn = drawCard(game.expenseDeck, () => shuffle(EXPENSE_CARDS))
    game.expenseDeck = drawn.nextDeck
    player.istokens -= 1
    return drawn.card
  }
  if (tile.type === 'fire') {
    const drawn = drawCard(game.incomeDeck, () => shuffle(INCOME_CARDS))
    game.incomeDeck = drawn.nextDeck
    player.istokens += 1
    return drawn.card
  }
  if (tile.type === 'totem') {
    const drawn = drawCard(game.actionDeck, () => shuffle(ACTION_CARDS))
    game.actionDeck = drawn.nextDeck
    player.blockedThisRound = true
    return drawn.card
  }
  return null
}

function movePlayerAndDraw(playerId, diceValue) {
  const playerIndex = game.players.findIndex((player) => player.id === playerId)
  const player = game.players[playerIndex]

  if (!player || !player.active) return null

  let newPosition = player.position
  let crossedStart = false

  for (let step = 0; step < diceValue; step += 1) {
    newPosition = (newPosition + 1) % BOARD_SIZE
    if (newPosition === 0) crossedStart = true
  }

  player.position = newPosition
  player.lastDice = diceValue

  if (crossedStart) {
    player.istokens += 4
  }

  const tile = BOARD_TILES[newPosition]
  player.currentCard = drawCardForTileType(tile, player)
  game.players[playerIndex] = player

  return {
    name: player.name,
    diceValue,
    tile: tile.label,
    card: player.currentCard
  }
}

function drawMiningCard(player) {
  const firstDraw = drawCard(game.standardDeck, createStandardDeck)
  game.standardDeck = firstDraw.nextDeck
  let chosen = firstDraw.card

  if (player.currentCard?.actionType === 'axe') {
    const secondDraw = drawCard(game.standardDeck, createStandardDeck)
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

function applyIncomeCardEffect(playerIndex, card, roundEvents, transactions) {
  const player = game.players[playerIndex]

  if (card.mode === 'bank') {
    adjustBalance(player.id, card.amount)
    roundEvents.push(`${player.name} received ${card.amount} Istokens from the bank.`)
    transactions.push({ type: 'income', from: 'Bank', to: player.name, amount: card.amount, reason: card.title })
  }

  if (card.mode === 'leftPays') {
    const other = game.players[getLeftPlayerIndex(game.players, playerIndex)]
    if (other.active) {
      adjustBalance(other.id, -card.amount)
      adjustBalance(player.id, card.amount)
      roundEvents.push(`${other.name} paid ${card.amount} Istokens to ${player.name}.`)
      transactions.push({ type: 'transfer', from: other.name, to: player.name, amount: card.amount, reason: card.title })
    }
  }

  if (card.mode === 'rightPays') {
    const other = game.players[getRightPlayerIndex(game.players, playerIndex)]
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

function applyExpenseCardEffect(playerIndex, card, roundEvents, transactions) {
  const player = game.players[playerIndex]

  if (card.mode === 'bank') {
    adjustBalance(player.id, -card.amount)
    roundEvents.push(`${player.name} paid ${card.amount} Istokens to the bank.`)
    transactions.push({ type: 'expense', from: player.name, to: 'Bank', amount: card.amount, reason: card.title })
  }

  if (card.mode === 'leftReceives') {
    const other = game.players[getLeftPlayerIndex(game.players, playerIndex)]
    if (other.active) {
      adjustBalance(player.id, -card.amount)
      adjustBalance(other.id, card.amount)
      roundEvents.push(`${player.name} paid ${card.amount} Istokens to ${other.name}.`)
      transactions.push({ type: 'transfer', from: player.name, to: other.name, amount: card.amount, reason: card.title })
    }
  }

  if (card.mode === 'rightReceives') {
    const other = game.players[getRightPlayerIndex(game.players, playerIndex)]
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

function applyActionCardEffect(playerIndex, card, roundEvents, transactions) {
  const player = game.players[playerIndex]

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

function executeCardEffects(roundEvents, transactions) {
  for (let index = 0; index < game.players.length; index += 1) {
    const player = game.players[index]
    if (!player.active || !player.currentCard) continue

    const card = player.currentCard
    if (card.category === 'income') applyIncomeCardEffect(index, card, roundEvents, transactions)
    if (card.category === 'expense') applyExpenseCardEffect(index, card, roundEvents, transactions)
    if (card.category === 'action') applyActionCardEffect(index, card, roundEvents, transactions)
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

  const hasMinersAvailable = activePlayers.some(
    (player) => !player.permanentlyBlocked && !player.skipNextMining
  )

  if (!hasMinersAvailable) {
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

    const diceValue = Math.floor(Math.random() * 6) + 1
    const moveResult = movePlayerAndDraw(player.id, diceValue)
    if (moveResult) {
      moves.push(moveResult)
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

function resolveHumanMiningDecision(human, humanWillMine, roundEvents, transactions) {
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

function determineMiningWinner(roundEvents, transactions) {
  const visibleCards = [game.winningCard, ...game.players.map((player) => player.currentCard).filter(Boolean)]
  const miners = game.players.filter((player) => player.active && player.miningCard)

  for (const player of miners) {
    player.miningScore = calculateMiningScore(player.miningCard, visibleCards)
  }

  if (miners.length === 0) {
    roundEvents.push('No one mined this round.')
    return null
  }

  const sorted = [...miners].sort((a, b) => {
    if (b.miningScore !== a.miningScore) return b.miningScore - a.miningScore
    return b.miningCard.value - a.miningCard.value
  })

  const topScore = sorted[0].miningScore
  const tied = sorted.filter((player) => player.miningScore === topScore)

  let roundWinner
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
  return roundWinner
}

function appendRoundToChain(roundWinner, transactions, roundEvents) {
  const previousBlock = game.chain[game.chain.length - 1]
  const blockData = {
    index: game.chain.length,
    round: game.round,
    timestamp: new Date().toISOString(),
    previousHash: previousBlock.hash,
    miner: roundWinner ? roundWinner.name : 'No miner',
    transactions,
    balances: buildLedger(),
    winningCard: game.winningCard
  }
  const block = { ...blockData, hash: createHash(blockData) }
  game.chain.push(block)
  game.lastRound.events = roundEvents
}

function resolveRound(humanWillMine) {
  const roundEvents = []
  const transactions = []

  const human = game.players.find((player) => player.isHuman)
  if (human && human.active) {
    resolveHumanMiningDecision(human, humanWillMine, roundEvents, transactions)
  }

  processAiPlayers()

  const roundWinner = determineMiningWinner(roundEvents, transactions)
  executeCardEffects(roundEvents, transactions)
  eliminatePlayers(roundEvents)

  appendRoundToChain(roundWinner, transactions, roundEvents)
  resolveEndGame()

  if (!game.gameOver) {
    game.round += 1
    game.phase = 'awaiting_roll'
  }
}

export function startGame(playerCount, safeNames) {
  const players = Array.from({ length: playerCount }, (_, index) => {
    const defaultName = index === 0 ? 'Player 1' : `AI ${index + 1}`
    const name = typeof safeNames[index] === 'string' && safeNames[index].trim()
      ? safeNames[index].trim()
      : defaultName
    return createPlayer(index + 1, name, PLAYER_COLORS[index], index === 0)
  })

  const newStandardDeck = createStandardDeck()
  const winningCard = newStandardDeck[0]

  game = {
    round: 1,
    phase: 'awaiting_roll',
    players,
    winningCard,
    standardDeck: newStandardDeck.slice(1),
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

  return buildGameState()
}

export function getGameState() {
  return buildGameState()
}

export function processPlayerRoll() {
  if (game.gameOver) {
    return { error: 'Game is already over.' }
  }

  if (game.phase !== 'awaiting_roll') {
    return { error: 'It is not the roll phase.' }
  }

  resetRoundState()
  game.lastRound = { moves: [], aiActions: [], events: [] }

  const human = game.players.find((player) => player.isHuman)
  if (!human || !human.active) {
    return { error: 'Human player is not active.' }
  }

  const diceValue = Math.floor(Math.random() * 6) + 1
  const moveResult = movePlayerAndDraw(human.id, diceValue)
  if (moveResult) {
    game.lastRound.moves.push(moveResult)
  }

  game.phase = 'awaiting_mine_choice'
  return { state: buildGameState() }
}

export function processPlayerMining(willMine) {
  if (game.gameOver) {
    return { error: 'Game is already over.' }
  }

  if (game.phase !== 'awaiting_mine_choice') {
    return { error: 'It is not the mining choice phase.' }
  }

  resolveRound(willMine)
  return { state: buildGameState() }
}
