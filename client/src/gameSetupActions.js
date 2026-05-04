import {
  createStandardDeck,
  createIncomeDeck,
  createExpenseDeck,
  createActionDeck,
  createPlayers,
  getCardFace,
  rollDice,
  processPlayerTurn
} from './gameUtils.js'

export function startGame(names, store) {
  const freshDeck = createStandardDeck()
  const firstWinning = freshDeck[0]
  const newPlayers = createPlayers(names)

  store.setPlayers(newPlayers)
  store.setRound(1)
  store.setPhase('ready')
  store.setDiceValue(1)
  store.setIncomeDeck(createIncomeDeck())
  store.setExpenseDeck(createExpenseDeck())
  store.setActionDeck(createActionDeck())
  store.setPlayingDeck(freshDeck.slice(1))
  store.setWinningCard(firstWinning)
  store.setLedger([
    `Initial Winning Card is ${getCardFace(firstWinning)}.`,
    'All players start with 50 Istoken.',
    'This digital version uses one shared scoreboard as the synchronized ledger.'
  ])
  store.setBlocks([{ id: 'genesis', title: 'Genesis Block', miner: 'System', reward: 0, card: firstWinning }])
  store.setEventQueue([])
  store.setEventIndex(0)
  store.setPendingPlayers(null)
  store.setCurrentMiner(0)
  store.setMiningChoice(null)
  store.setWinner('')
}

export function playPhaseOne(store) {
  if (store.phase !== 'ready' || store.winner) return

  const nextPlayers = store.players.map((player) => ({
    ...player, transactionCard: null, miningCard: null, blockedThisRound: false, lastRoll: null
  }))

  const decks = { income: [...store.incomeDeck], expense: [...store.expenseDeck], action: [...store.actionDeck] }
  const allLogs = []
  const events = []

  nextPlayers.forEach((player, index) => {
    if (!player.active) return
    const roll = rollDice()
    store.setDiceValue(roll)
    const result = processPlayerTurn(player, roll, decks)
    nextPlayers[index] = result.moved
    allLogs.push(...result.logs)
    events.push(result.event)
  })

  store.setPlayers(nextPlayers)
  store.setPendingPlayers(nextPlayers)
  store.setIncomeDeck(decks.income)
  store.setExpenseDeck(decks.expense)
  store.setActionDeck(decks.action)
  store.setEventQueue(events)
  store.setEventIndex(0)
  store.setPhase('phase-one-events')
  store.addLedger(allLogs)
}
