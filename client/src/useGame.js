import { useMemo, useState } from 'react'
import {
  MINING_COST,
  MINING_REWARD,
  ROUND_LIMIT
} from './constants.js'
import {
  createStandardDeck,
  createIncomeDeck,
  createExpenseDeck,
  createActionDeck,
  drawStandardCards,
  createPlayers,
  getCardFace,
  rollDice,
  processPlayerTurn,
  applyTransactionEffects,
  resolveMiningWinner,
  createRoundBlock,
  checkWinConditions,
  calculateMiningScore
} from './gameUtils.js'
import { chestIcon, chainIcon, expenseIcon, actionIcon, crystalIcon } from './constants.js'

export function useGame() {
  const [players, setPlayers] = useState(createPlayers(['Player 1', 'Player 2', 'Player 3']))
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('ready')
  const [diceValue, setDiceValue] = useState(1)
  const [incomeDeck, setIncomeDeck] = useState(createIncomeDeck())
  const [expenseDeck, setExpenseDeck] = useState(createExpenseDeck())
  const [actionDeck, setActionDeck] = useState(createActionDeck())
  const [playingDeck, setPlayingDeck] = useState(createStandardDeck())
  const [winningCard, setWinningCard] = useState(null)
  const [ledger, setLedger] = useState([])
  const [blocks, setBlocks] = useState([])
  const [eventQueue, setEventQueue] = useState([])
  const [eventIndex, setEventIndex] = useState(0)
  const [pendingPlayers, setPendingPlayers] = useState(null)
  const [currentMiner, setCurrentMiner] = useState(0)
  const [miningChoice, setMiningChoice] = useState(null)
  const [winner, setWinner] = useState('')

  const activePlayers = useMemo(() => players.filter((player) => player.active), [players])
  const currentEvent = eventQueue[eventIndex]
  const miner = pendingPlayers?.[currentMiner]

  function addLedger(items) {
    setLedger((prev) => [...items.reverse(), ...prev].slice(0, 80))
  }

  function startGame(names) {
    const freshDeck = createStandardDeck()
    const firstWinning = freshDeck[0]
    const newPlayers = createPlayers(names)

    setPlayers(newPlayers)
    setRound(1)
    setPhase('ready')
    setDiceValue(1)
    setIncomeDeck(createIncomeDeck())
    setExpenseDeck(createExpenseDeck())
    setActionDeck(createActionDeck())
    setPlayingDeck(freshDeck.slice(1))
    setWinningCard(firstWinning)
    setLedger([
      `Initial Winning Card is ${getCardFace(firstWinning)}.`,
      'All players start with 50 Istoken.',
      'This digital version uses one shared scoreboard as the synchronized ledger.'
    ])
    setBlocks([{ id: 'genesis', title: 'Genesis Block', miner: 'System', reward: 0, card: firstWinning }])
    setEventQueue([])
    setEventIndex(0)
    setPendingPlayers(null)
    setCurrentMiner(0)
    setMiningChoice(null)
    setWinner('')
  }

  function playPhaseOne() {
    if (phase !== 'ready' || winner) return

    const nextPlayers = players.map((player) => ({
      ...player, transactionCard: null, miningCard: null, blockedThisRound: false, lastRoll: null
    }))

    const decks = { income: [...incomeDeck], expense: [...expenseDeck], action: [...actionDeck] }
    const allLogs = []
    const events = []

    nextPlayers.forEach((player, index) => {
      if (!player.active) return
      const roll = rollDice()
      setDiceValue(roll)
      const result = processPlayerTurn(player, roll, decks)
      nextPlayers[index] = result.moved
      allLogs.push(...result.logs)
      events.push(result.event)
    })

    setPlayers(nextPlayers)
    setPendingPlayers(nextPlayers)
    setIncomeDeck(decks.income)
    setExpenseDeck(decks.expense)
    setActionDeck(decks.action)
    setEventQueue(events)
    setEventIndex(0)
    setPhase('phase-one-events')
    addLedger(allLogs)
  }

  function continueEvent() {
    if (eventIndex < eventQueue.length - 1) {
      setEventIndex((prev) => prev + 1)
      return
    }
    setEventQueue([])
    setEventIndex(0)
    if (phase === 'phase-one-events') startMiningPhase()
    if (phase === 'reveal-events') finishRound()
  }

  function getMiningBlockReason(player) {
    if (!player.active) return 'This player is disqualified.'
    if (player.skipNextMining) return 'Jellyfish effect: this player must skip this mining round.'
    if (player.blockedForever) return 'Totem effect: this player can no longer participate in mining.'
    if (player.blockedThisRound) return 'Totem Corner: this player cannot mine this round.'
    if (player.coins < MINING_COST) return 'This player does not have enough Istoken to pay the mining cost.'
    return ''
  }

  function startMiningPhase() {
    const candidates = pendingPlayers || players
    const noOneAllowed = candidates.filter((player) => player.active).every((player) => Boolean(getMiningBlockReason(player)))
    if (noOneAllowed) {
      const richest = [...candidates.filter((player) => player.active)].sort((a, b) => b.coins - a.coins)[0]
      setWinner(`${richest.name} wins because no active player is allowed to participate in mining.`)
      setPhase('game-over')
      return
    }
    setCurrentMiner(0)
    setPhase('mining')
    prepareMiner(0, candidates)
  }

  function prepareMiner(index, basePlayers = pendingPlayers) {
    const list = basePlayers || players
    const player = list[index]
    if (!player || !player.active) { nextMiner(index + 1, list); return }
    const reason = getMiningBlockReason(player)
    if (reason) { setMiningChoice({ blocked: true, reason, cards: [] }); return }
    const count = player.transactionCard?.action === 'axe' ? 2 : 1
    const result = drawStandardCards(playingDeck, count)
    setPlayingDeck(result.deck)
    setMiningChoice({ blocked: false, cards: result.cards, selected: result.cards[0] })
  }

  function nextMiner(nextIndex, updatedPlayers = pendingPlayers) {
    if (nextIndex >= updatedPlayers.length) { revealAndExecute(updatedPlayers); return }
    setCurrentMiner(nextIndex)
    prepareMiner(nextIndex, updatedPlayers)
  }

  function skipMining() {
    const updated = pendingPlayers.map((player, i) =>
      i !== currentMiner ? player : { ...player, skipNextMining: false, miningCard: null }
    )
    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function joinMining() {
    const updated = pendingPlayers.map((player, i) =>
      i !== currentMiner ? player : { ...player, coins: player.coins - MINING_COST, miningCard: miningChoice.selected, skipNextMining: false }
    )
    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function executeCards(basePlayers, logs, events) {
    const updated = basePlayers.map((player) => ({ ...player }))
    const adjustCoins = (index, amount) => { updated[index].coins += amount }

    updated.forEach((player, index) => {
      if (!player.active || !player.transactionCard) return
      const card = player.transactionCard
      applyTransactionEffects(updated, adjustCoins, card, index)
      logs.push(`${player.name} executes ${card.title}: ${card.text}`)
      events.push({
        title: `${player.name}'s Transaction`,
        icon: card.kind === 'income' ? chestIcon : card.kind === 'expense' ? expenseIcon : actionIcon,
        text: `${card.title}: ${card.text}`,
        note: `Card: ${getCardFace(card)}.`,
        privateNote: 'The shared scoreboard updates for everyone.',
        card
      })
    })

    return updated
  }

  function revealAndExecute(basePlayers) {
    let updated = basePlayers.map((player) => ({ ...player }))
    const logs = []
    const events = []
    const visible = [winningCard, ...updated.map((player) => player.transactionCard).filter(Boolean)]
    const miners = updated
      .filter((player) => player.active && player.miningCard)
      .map((player) => ({ ...player, miningScore: calculateMiningScore(player.miningCard, visible) }))

    let newWinningCard = winningCard
    let newBlock = null

    events.push({ title: 'Reveal Phase', icon: crystalIcon, text: `Previous Winning Card: ${getCardFace(winningCard)}.`,
      note: 'All hidden transaction/action cards are revealed.',
      privateNote: miners.length ? miners.map((m) => `${m.name} mined with ${getCardFace(m.miningCard)}, score ${m.miningScore}`).join(' | ') : 'No player joined mining.'
    })

    if (miners.length) {
      const { miningWinner, newWinningCard: winnerCard } = resolveMiningWinner(miners)
      updated = updated.map((player) => player.id === miningWinner.id ? { ...player, coins: player.coins + MINING_REWARD } : player)
      newWinningCard = winnerCard
      newBlock = createRoundBlock(round, miningWinner, newWinningCard)
      logs.push(`${miningWinner.name} wins mining with ${getCardFace(miningWinner.miningCard)} and receives 5 Istoken.`)
      events.push({ title: 'Block Created', icon: chainIcon, text: `${miningWinner.name} receives 5 Istoken for creating the block.`,
        note: `New Winning Card: ${getCardFace(newWinningCard)}.`, privateNote: 'This card links the next round to the current block.'
      })
    } else {
      logs.push('No player joined mining. No block reward is paid.')
    }

    updated = executeCards(updated, logs, events)
    updated = updated.map((player) => player.coins < 0 ? { ...player, active: false } : player)
    updated.forEach((player) => { if (!player.active && player.coins < 0) logs.push(`${player.name} has negative Istoken and is disqualified.`) })

    setPlayers(updated)
    setPendingPlayers(updated)
    setWinningCard(newWinningCard)
    if (newBlock) setBlocks((prev) => [newBlock, ...prev])
    setEventQueue(events)
    setEventIndex(0)
    setPhase('reveal-events')
    addLedger(logs)

    const active = updated.filter((player) => player.active)
    const winnerMessage = checkWinConditions(active, round)
    if (winnerMessage) { setWinner(winnerMessage); setPhase('game-over') }
  }

  function finishRound() {
    if (winner) return
    setRound((prev) => prev + 1)
    setPhase('ready')
    setPendingPlayers(null)
    setMiningChoice(null)
  }

  return {
    players, round, phase, diceValue, winningCard, ledger, blocks,
    eventQueue, eventIndex, currentEvent, pendingPlayers, miner,
    currentMiner, miningChoice, winner, activePlayers,
    setMiningChoice,
    startGame, playPhaseOne, continueEvent, getMiningBlockReason,
    skipMining, joinMining, finishRound
  }
}
