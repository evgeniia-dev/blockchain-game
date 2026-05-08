import React, { useMemo, useState } from 'react'
import './index.css'

import background from './assets/bg/background.png'

import dice1 from './assets/dice/dice-1.png'
import dice2 from './assets/dice/dice-2.png'
import dice3 from './assets/dice/dice-3.png'
import dice4 from './assets/dice/dice-4.png'
import dice5 from './assets/dice/dice-5.png'
import dice6 from './assets/dice/dice-6.png'

import startIcon from './assets/icons/start.png'
import expenseIcon from './assets/icons/expense.png'
import actionIcon from './assets/icons/action.png'
import jellyfishIcon from './assets/icons/jellyfish.png'
import fireIcon from './assets/icons/fire.png'
import totemIcon from './assets/icons/totem.png'

import chestIcon from './assets/blockchain/chest.png'
import chainIcon from './assets/blockchain/chain.png'
import ledgerIcon from './assets/blockchain/ledger.png'
import crystalIcon from './assets/blockchain/crystal.png'

import player1Pawn from './assets/pawns/player1-blue-board.png'
import player2Pawn from './assets/pawns/player2-mint-board.png'
import player3Pawn from './assets/pawns/player3-lilac-board.png'

import incomeBack from './assets/cards/income-back.png'
import expenseBack from './assets/cards/expense-back.png'
import actionBack from './assets/cards/action-back.png'

import story1 from './assets/story/story-1.png'
import story2 from './assets/story/story-2.png'
import story3 from './assets/story/story-3.png'
import story4 from './assets/story/story-4.png'
import story5 from './assets/story/story-5.png'
import story6 from './assets/story/story-6.png'
import story7 from './assets/story/story-7.png'
import story8 from './assets/story/story-8.png'
import story9 from './assets/story/story-9.png'

const STORY_IMAGES = [story1, story2, story3, story4, story5, story6, story7, story8, story9]
const DICE = { 1: dice1, 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6 }
const PAWNS = { 1: player1Pawn, 2: player2Pawn, 3: player3Pawn }
const CARD_BACKS = { income: incomeBack, expense: expenseBack, action: actionBack }

const START_COINS = 50
const MINING_COST = 1
const MINING_REWARD = 5
const ROUND_LIMIT = 12

const SUITS = ['clubs', 'diamonds', 'hearts', 'spades']
const SUIT_SYMBOL = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const RANK_VALUE = { A: 14, K: 13, Q: 12, J: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 }

const PLAYERS = [
  { id: 1, label: 'Player 1', colorName: 'Blue', color: '#7288ff' },
  { id: 2, label: 'Player 2', colorName: 'Mint', color: '#6ed9bd' },
  { id: 3, label: 'Player 3', colorName: 'Lilac', color: '#c79cff' }
]

const BOARD = [
  { id: 0, name: 'Start', type: 'start', icon: startIcon, pos: [1, 1] },
  { id: 1, name: 'Income', type: 'income', icon: chestIcon, pos: [2, 1] },
  { id: 2, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [3, 1] },
  { id: 3, name: 'Action', type: 'action', icon: actionIcon, pos: [4, 1] },
  { id: 4, name: 'Jellyfish', type: 'jellyfish-corner', icon: jellyfishIcon, pos: [5, 1] },
  { id: 5, name: 'Income', type: 'income', icon: chestIcon, pos: [5, 2] },
  { id: 6, name: 'Action', type: 'action', icon: actionIcon, pos: [5, 3] },
  { id: 7, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [5, 4] },
  { id: 8, name: 'Fire', type: 'fire-corner', icon: fireIcon, pos: [5, 5] },
  { id: 9, name: 'Income', type: 'income', icon: chestIcon, pos: [4, 5] },
  { id: 10, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [3, 5] },
  { id: 11, name: 'Action', type: 'action', icon: actionIcon, pos: [2, 5] },
  { id: 12, name: 'Totem', type: 'totem-corner', icon: totemIcon, pos: [1, 5] },
  { id: 13, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [1, 4] },
  { id: 14, name: 'Income', type: 'income', icon: chestIcon, pos: [1, 3] },
  { id: 15, name: 'Action', type: 'action', icon: actionIcon, pos: [1, 2] }
]

function shuffle(list) {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function standardDeck() {
  return shuffle(
    SUITS.flatMap((suit) =>
      RANKS.map((rank) => ({
        kind: 'standard',
        rank,
        suit,
        value: RANK_VALUE[rank],
        title: `${rank}${SUIT_SYMBOL[suit]}`
      }))
    )
  )
}

function face(card) {
  if (!card) return '—'
  return `${card.rank}${SUIT_SYMBOL[card.suit]}`
}

function rollDice() {
  return Math.floor(Math.random() * 6) + 1
}

function makeIncomeDeck() {
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

function makeExpenseDeck() {
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

function makeActionDeck() {
  const effects = [
    { title: 'Jellyfish', text: 'Skip the next mining round.', action: 'jellyfish', rank: 'J', suit: 'hearts' },
    { title: 'Fire', text: 'Each other player gives you 1 Istoken.', action: 'fire', rank: 'Q', suit: 'diamonds' },
    { title: 'Totem', text: 'You cannot mine for the rest of the game.', action: 'totem', rank: 'K', suit: 'clubs' },
    { title: 'Axe', text: 'Draw two standard cards and choose one during mining.', action: 'axe', rank: 'A', suit: 'spades' }
  ]

  return shuffle(Array.from({ length: 54 }, (_, i) => ({ ...effects[i % effects.length], kind: 'action' })))
}

function createPlayers(names) {
  return PLAYERS.map((p, index) => ({
    ...p,
    name: names[index] || p.label,
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

function draw(deck, fallback) {
  const safeDeck = deck.length ? deck : fallback()
  return { card: safeDeck[0], deck: safeDeck.slice(1) }
}

function drawStandard(deck, count) {
  let current = deck.length ? deck : standardDeck()
  const cards = []
  for (let i = 0; i < count; i += 1) {
    if (!current.length) current = standardDeck()
    cards.push(current[0])
    current = current.slice(1)
  }
  return { cards, deck: current }
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

function score(card, visibleCards) {
  return visibleCards.reduce((total, other) => {
    if (!other) return total
    return total + (card.rank === other.rank ? 1 : 0) + (card.suit === other.suit ? 1 : 0)
  }, 0)
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [storyIndex, setStoryIndex] = useState(0)
  const [showStory, setShowStory] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3'])

  const [players, setPlayers] = useState(createPlayers(names))
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState('ready')
  const [diceValue, setDiceValue] = useState(1)
  const [turnIndex, setTurnIndex] = useState(0)

  const [incomeDeck, setIncomeDeck] = useState(makeIncomeDeck())
  const [expenseDeck, setExpenseDeck] = useState(makeExpenseDeck())
  const [actionDeck, setActionDeck] = useState(makeActionDeck())
  const [playingDeck, setPlayingDeck] = useState(standardDeck())
  const [winningCard, setWinningCard] = useState(null)

  const [ledger, setLedger] = useState([])
  const [blocks, setBlocks] = useState([])
  const [currentEvent, setCurrentEvent] = useState(null)
  const [cardRevealed, setCardRevealed] = useState(false)
  const [pendingPlayers, setPendingPlayers] = useState(null)
  const [currentMiner, setCurrentMiner] = useState(0)
  const [miningChoice, setMiningChoice] = useState(null)
  const [winner, setWinner] = useState('')
  const [ledgerChanges, setLedgerChanges] = useState([])

  const activePlayers = useMemo(() => players.filter((p) => p.active), [players])
  const activeTurnPlayer = players[turnIndex]
  const miner = pendingPlayers?.[currentMiner]

  function addLedger(items) {
    setLedger((prev) => [...items.reverse(), ...prev].slice(0, 80))
  }

  function startGame() {
    const freshDeck = standardDeck()
    const firstWinning = freshDeck[0]
    const newPlayers = createPlayers(names)

    setPlayers(newPlayers)
    setRound(1)
    setPhase('ready')
    setTurnIndex(0)
    setDiceValue(1)
    setIncomeDeck(makeIncomeDeck())
    setExpenseDeck(makeExpenseDeck())
    setActionDeck(makeActionDeck())
    setPlayingDeck(freshDeck.slice(1))
    setWinningCard(firstWinning)
    setLedger([
      `Initial Winning Card is ${face(firstWinning)}.`,
      'All players start with 50 Istoken.',
      'The shared scoreboard represents the synchronized blockchain ledger.'
    ])
    setBlocks([{ id: 'genesis', title: 'Genesis Block', miner: 'System', reward: 0, card: firstWinning }])
    setCurrentEvent(null)
    setPendingPlayers(null)
    setCurrentMiner(0)
    setMiningChoice(null)
    setWinner('')
    setLedgerChanges([])
    setShowSetup(false)
    setScreen('game')
  }

  function drawCardForTile(tile, decks) {
    if (tile.type === 'income' || tile.type === 'fire-corner') {
      const result = draw(decks.income, makeIncomeDeck)
      decks.income = result.deck
      return result.card
    }

    if (tile.type === 'expense' || tile.type === 'jellyfish-corner') {
      const result = draw(decks.expense, makeExpenseDeck)
      decks.expense = result.deck
      return result.card
    }

    const result = draw(decks.action, makeActionDeck)
    decks.action = result.deck
    return result.card
  }

  function movePlayer(player, roll) {
    let position = player.position
    let crossedStart = false

    for (let i = 0; i < roll; i += 1) {
      position = (position + 1) % BOARD.length
      if (position === 0) crossedStart = true
    }

    return { ...player, position, crossedStart, lastRoll: roll }
  }

  function findNextActiveIndex(fromIndex, list) {
    for (let i = fromIndex + 1; i < list.length; i += 1) {
      if (list[i].active) return i
    }
    return -1
  }

  function rollCurrentPlayer() {
    if (phase !== 'ready' || winner) return

    if (!activeTurnPlayer || !activeTurnPlayer.active) {
      const next = findNextActiveIndex(turnIndex, players)
      if (next >= 0) setTurnIndex(next)
      return
    }

    const roll = rollDice()
    const decks = { income: [...incomeDeck], expense: [...expenseDeck], action: [...actionDeck] }
    let moved = movePlayer(activeTurnPlayer, roll)
    const tile = BOARD[moved.position]
    const card = drawCardForTile(tile, decks)
    const logs = []

    if (moved.crossedStart) {
      moved.coins += 4
      logs.push(`${moved.name} crossed Start and received 4 Istoken.`)
    }

    if (tile.type === 'jellyfish-corner') {
      moved.coins -= 1
      logs.push(`${moved.name} landed on Jellyfish and paid 1 extra Istoken.`)
    }

    if (tile.type === 'fire-corner') {
      moved.coins += 1
      logs.push(`${moved.name} landed on Fire and received 1 extra Istoken.`)
    }

    if (tile.type === 'totem-corner') {
      moved.blockedThisRound = true
      logs.push(`${moved.name} landed on Totem and cannot mine this round.`)
    }

    moved.transactionCard = card

    const updatedPlayers = players.map((p, index) => index === turnIndex ? moved : p)

    setDiceValue(roll)
    setPlayers(updatedPlayers)
    setIncomeDeck(decks.income)
    setExpenseDeck(decks.expense)
    setActionDeck(decks.action)
    setCardRevealed(false)
    addLedger([`${moved.name} rolled ${roll}, moved to ${tile.name}, and drew a hidden ${card.kind} card.`, ...logs])

    setCurrentEvent({
      title: `${moved.label} / ${moved.colorName}: ${moved.name}`,
      icon: tile.icon,
      text: `${moved.name} rolled ${roll} and moved clockwise to ${tile.name}.`,
      note: `Transaction validated.`,
      privateNote: `${card.title}: ${card.text} (${face(card)})`,
      card,
      playersAfterMove: updatedPlayers,
      lesson: 'This is a transaction card. In blockchain, transactions are actions that can change balances, but they are only confirmed after validation.'
    })

    setPhase('movement-event')
  }

  function continueAfterMove() {
    const updatedPlayers = currentEvent.playersAfterMove
    const nextIndex = findNextActiveIndex(turnIndex, updatedPlayers)

    setCurrentEvent(null)
    setCardRevealed(false)

    if (nextIndex >= 0) {
      setTurnIndex(nextIndex)
      setPlayers(updatedPlayers)
      setPhase('ready')
      return
    }

    setPlayers(updatedPlayers)
    setPendingPlayers(updatedPlayers)
    setTurnIndex(0)
    startMiningPhase(updatedPlayers)
  }

  function miningReason(player) {
    if (!player.active) return 'This player is disqualified.'
    if (player.skipNextMining) return 'Jellyfish effect: this player must skip this mining round.'
    if (player.blockedForever) return 'Totem effect: this player can no longer participate in mining.'
    if (player.blockedThisRound) return 'Totem corner: this player cannot mine this round.'
    if (player.coins < MINING_COST) return 'This player does not have enough Istoken to pay the mining cost.'
    return ''
  }

  function startMiningPhase(basePlayers = players) {
    const noOneAllowed = basePlayers.filter((p) => p.active).every((p) => Boolean(miningReason(p)))

    if (noOneAllowed) {
      const richest = [...basePlayers.filter((p) => p.active)].sort((a, b) => b.coins - a.coins)[0]
      setWinner(`${richest.name} wins because no active player is allowed to participate in mining.`)
      setPhase('game-over')
      return
    }

    setPendingPlayers(basePlayers)
    setCurrentMiner(0)
    setPhase('mining')
    prepareMiner(0, basePlayers)
  }

  function prepareMiner(index, basePlayers = pendingPlayers) {
    const list = basePlayers || players
    const player = list[index]

    if (!player || !player.active) {
      nextMiner(index + 1, list)
      return
    }

    const reason = miningReason(player)

    if (reason) {
      setMiningChoice({ blocked: true, reason, cards: [] })
      return
    }

    const count = player.transactionCard?.action === 'axe' ? 2 : 1
    const result = drawStandard(playingDeck, count)

    setPlayingDeck(result.deck)
    setMiningChoice({ blocked: false, cards: result.cards, selected: result.cards[0] })
  }

  function nextMiner(nextIndex, updatedPlayers = pendingPlayers) {
    if (nextIndex >= updatedPlayers.length) {
      revealAndExecute(updatedPlayers)
      return
    }

    setCurrentMiner(nextIndex)
    prepareMiner(nextIndex, updatedPlayers)
  }

  function skipMining() {
    const updated = pendingPlayers.map((p, i) =>
      i === currentMiner ? { ...p, skipNextMining: false, miningCard: null } : p
    )

    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function joinMining() {
    const updated = pendingPlayers.map((p, i) =>
      i === currentMiner
        ? { ...p, coins: p.coins - MINING_COST, miningCard: miningChoice.selected, skipNextMining: false }
        : p
    )

    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function revealAndExecute(basePlayers) {
    const beforeBalances = basePlayers.map((p) => ({ id: p.id, name: p.name, before: p.coins }))

    let updated = basePlayers.map((p) => ({ ...p }))
    const logs = []
    const events = []
    const visible = [winningCard, ...updated.map((p) => p.transactionCard).filter(Boolean)]
    const miners = updated
      .filter((p) => p.active && p.miningCard)
      .map((p) => ({ ...p, miningScore: score(p.miningCard, visible) }))

    let newWinningCard = winningCard
    let newBlock = null

    if (miners.length) {
      let finalists = [...miners].sort((a, b) => b.miningScore - a.miningScore || b.miningCard.value - a.miningCard.value)
      const bestScore = finalists[0].miningScore
      finalists = finalists.filter((m) => m.miningScore === bestScore)
      const bestValue = Math.max(...finalists.map((m) => m.miningCard.value))
      finalists = finalists.filter((m) => m.miningCard.value === bestValue)

      let miningWinner = finalists[0]

      if (finalists.length > 1) {
        miningWinner = finalists.map((m) => ({ ...m, tieRoll: rollDice() })).sort((a, b) => b.tieRoll - a.tieRoll)[0]
      }

      updated = updated.map((p) => p.id === miningWinner.id ? { ...p, coins: p.coins + MINING_REWARD } : p)
      newWinningCard = miningWinner.miningCard
      newBlock = {
        id: `block-${round}-${Date.now()}`,
        title: `Block ${round}`,
        miner: miningWinner.name,
        reward: MINING_REWARD,
        card: newWinningCard
      }

      logs.push(`${miningWinner.name} wins mining with ${face(miningWinner.miningCard)} and receives 5 Istoken.`)
      events.push(`${miningWinner.name} validated the transactions and created a new block.`)
    } else {
      logs.push('No player joined mining. No block reward was paid.')
      events.push('No player joined mining this round.')
    }

    updated = executeCards(updated, logs)
    updated = updated.map((p) => p.coins < 0 ? { ...p, active: false } : p)

    const changes = updated.map((p) => {
      const before = beforeBalances.find((b) => b.id === p.id)?.before ?? p.coins
      return { id: p.id, name: p.name, before, after: p.coins, difference: p.coins - before }
    })

    setPlayers(updated)
    setPendingPlayers(updated)
    setWinningCard(newWinningCard)
    setLedgerChanges(changes)

    if (newBlock) setBlocks((prev) => [newBlock, ...prev])

    addLedger(logs)

    const active = updated.filter((p) => p.active)

    if (active.length <= 1) {
      setWinner(active[0] ? `${active[0].name} wins because only one player remains.` : 'Game over.')
      setPhase('game-over')
      return
    }

    if (round >= ROUND_LIMIT) {
      const richest = [...active].sort((a, b) => b.coins - a.coins)[0]
      setWinner(`${richest.name} wins after ${ROUND_LIMIT} rounds with the most Istoken.`)
      setPhase('game-over')
      return
    }

    setCurrentEvent({
      title: 'Ledger Confirmation',
      icon: ledgerIcon,
      text: events.join(' '),
      note: 'Shared ledger updated.',
      privateNote: 'All players must acknowledge the same updated balances before the next round begins.',
      card: null,
      roundEnd: true,
      lesson: 'A blockchain ledger is a shared record. Everyone sees the same balance updates, and the next block continues from this shared state.'
    })

    setPhase('round-summary')
  }

  function executeCards(basePlayers, logs) {
    const updated = basePlayers.map((p) => ({ ...p }))
    const add = (idx, amount) => { updated[idx].coins += amount }

    updated.forEach((player, index) => {
      if (!player.active || !player.transactionCard) return
      const card = player.transactionCard

      if (card.effect === 'bankGain') add(index, card.amount)
      if (card.effect === 'bankLoss') add(index, -card.amount)

      if (card.effect === 'leftPays') {
        const target = leftIndex(updated, index)
        if (target >= 0) { add(target, -card.amount); add(index, card.amount) }
      }

      if (card.effect === 'rightPays') {
        const target = rightIndex(updated, index)
        if (target >= 0) { add(target, -card.amount); add(index, card.amount) }
      }

      if (card.effect === 'payLeft') {
        const target = leftIndex(updated, index)
        if (target >= 0) { add(index, -card.amount); add(target, card.amount) }
      }

      if (card.effect === 'payRight') {
        const target = rightIndex(updated, index)
        if (target >= 0) { add(index, -card.amount); add(target, card.amount) }
      }

      if (card.effect === 'allPay') {
        updated.forEach((p, i) => {
          if (i !== index && p.active) { add(i, -card.amount); add(index, card.amount) }
        })
      }

      if (card.effect === 'payAll') {
        updated.forEach((p, i) => {
          if (i !== index && p.active) { add(index, -card.amount); add(i, card.amount) }
        })
      }

      if (card.action === 'jellyfish') updated[index].skipNextMining = true

      if (card.action === 'fire') {
        updated.forEach((p, i) => {
          if (i !== index && p.active) { add(i, -1); add(index, 1) }
        })
      }

      if (card.action === 'totem') updated[index].blockedForever = true

      logs.push(`${player.name} executes ${card.title}: ${card.text}`)
    })

    return updated
  }

  function finishRound() {
    setCurrentEvent(null)
    setLedgerChanges([])
    setRound((prev) => prev + 1)
    setTurnIndex(players.findIndex((p) => p.active))
    setPhase('ready')
    setPendingPlayers(null)
    setMiningChoice(null)
    setPlayers((prev) => prev.map((p) => ({
      ...p,
      transactionCard: null,
      miningCard: null,
      blockedThisRound: false,
      lastRoll: null
    })))
  }

  function closeCurrentEvent() {
    if (phase === 'movement-event') {
      continueAfterMove()
      return
    }

    if (phase === 'round-summary') {
      finishRound()
      return
    }

    setCurrentEvent(null)
  }

  return (
    <div className="app-shell" style={{ backgroundImage: `url(${background})` }}>
      <div className="app-overlay">
        {screen === 'home' && (
          <>
            <header className="top-bar">
              <div>
                <p className="eyebrow">Market Island</p>
                <h1>Treasure Chain Board Game</h1>
              </div>
              <div className="top-stats">
                <div className="pill-box"><span>Start</span><strong>50 Istoken</strong></div>
                <div className="pill-box"><span>Mining</span><strong>1 cost / 5 reward</strong></div>
              </div>
            </header>

            <main className="home-layout">
              <section className="panel home-hero">
                <img src={chestIcon} alt="" className="hero-icon" />
                <h2>Welcome to Market Island</h2>
                <p>Three local players move, draw hidden cards, mine blocks, and update one shared ledger.</p>
                <div className="home-buttons">
                  <button className="primary-btn" onClick={() => setShowSetup(true)}>Start Game</button>
                  <button className="secondary-btn" onClick={() => setShowRules(true)}>Instructions</button>
                  <button className="secondary-btn" onClick={() => setShowStory(true)}>Read the Story</button>
                </div>
              </section>
            </main>
          </>
        )}

        {screen === 'game' && (
          <>
            <header className="top-bar">
              <div>
                <p className="eyebrow">Market Island</p>
                <h1>Manual Rule Game</h1>
              </div>
              <div className="top-stats">
                <div className="pill-box"><span>Round</span><strong>{round}</strong></div>
                <div className="pill-box"><span>Winning Card</span><strong>{face(winningCard)}</strong></div>
                <div className="pill-box"><span>Active</span><strong>{activePlayers.length}</strong></div>
              </div>
            </header>

            <main className="game-layout">
              <section className="panel board-panel">
                <div className="board">
                  {BOARD.map((tile) => (
                    <div key={tile.id} className={`board-tile tile-${tile.type}`} style={{ gridColumn: tile.pos[0], gridRow: tile.pos[1] }}>
                      <img src={tile.icon} alt="" />
                      <span>{tile.name}</span>
                      <div className="pawn-row">
                        {players.filter((p) => p.active && p.position === tile.id).map((p) => (
                          <img key={p.id} className="pawn-img" src={PAWNS[p.id]} alt={`${p.label} ${p.name}`} />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="board-center">
                    <img src={DICE[diceValue]} alt="" className="dice" />
                    <h3>{activeTurnPlayer?.active ? `${activeTurnPlayer.name}'s Turn` : 'Next Turn'}</h3>
                    <p>Winning Card: <b>{face(winningCard)}</b></p>
                    <p>Roll the dice, move clockwise, then draw a hidden card.</p>
                    <button className="primary-btn" disabled={phase !== 'ready' || winner} onClick={rollCurrentPlayer}>
                      Roll Dice
                    </button>
                  </div>
                </div>
              </section>

              <aside className="side-stack">
                <section className="panel">
                  <h2>Players</h2>
                  <div className="players-list">
                    {players.map((p, index) => (
                      <div key={p.id} className={`player-card ${!p.active ? 'player-out' : ''}`}>
                        <div className="player-head">
                          <img src={PAWNS[p.id]} alt="" className="player-pawn-small" />
                          <div>
                            <strong>{p.label} - {p.colorName}</strong>
                            <p>{p.name}{index === turnIndex && phase === 'ready' ? ' - current turn' : ''}</p>
                          </div>
                          <b>{p.coins}</b>
                        </div>
                        <small>{p.blockedForever ? 'Totem: cannot mine' : p.skipNextMining ? 'Jellyfish: skips next mining' : 'Can mine if funded'}</small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2><img src={ledgerIcon} alt="" /> Shared Scoreboard / Ledger</h2>
                  <div className="shared-scoreboard">
                    {players.map((p) => (
                      <div key={p.id} className="score-row">
                        <div className="score-name"><img src={PAWNS[p.id]} alt="" /><span>{p.name}</span></div>
                        <div className="score-track"><span className="marker" style={{ left: `${Math.min(100, Math.max(0, p.coins))}%`, background: p.color }} /></div>
                        <b>{p.coins}</b>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2><img src={chainIcon} alt="" /> Blockchain</h2>
                  <div className="blocks-list">
                    {blocks.map((b) => (
                      <div key={b.id} className="block-card">
                        <img src={chainIcon} alt="" />
                        <div><strong>{b.title}</strong><p>Miner: {b.miner}</p><p>Card: {face(b.card)}</p></div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </main>
          </>
        )}

        {showSetup && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2>Choose 3 Local Players</h2>
              <div className="form-grid">
                {PLAYERS.map((p, i) => (
                  <label key={p.id}>
                    {p.label} - {p.colorName}
                    <input value={names[i]} onChange={(e) => setNames(names.map((n, idx) => idx === i ? e.target.value : n))} />
                  </label>
                ))}
              </div>
              <button className="primary-btn" onClick={startGame}>Begin Game</button>
              <button className="secondary-btn" onClick={() => setShowSetup(false)}>Close</button>
            </div>
          </div>
        )}

        {showRules && (
          <div className="modal-overlay">
            <div className="modal-card wide">
              <h2>Rules</h2>
              <div className="rules-scroll">
                <div className="rule-card"><b>Start</b><p>Each player starts with 50 Istoken. The first Winning Card is drawn from the standard deck.</p></div>
                <div className="rule-card"><b>Movement</b><p>Players take turns. Roll the dice, move clockwise, and draw the card type shown by the square.</p></div>
                <div className="rule-card"><b>Hidden Cards</b><p>Cards are hidden until validation. Click a card to inspect it, then keep it for the reveal phase.</p></div>
                <div className="rule-card"><b>Mining</b><p>Mining means validating the round. A player pays 1 Istoken to compete for the block reward.</p></div>
                <div className="rule-card"><b>Scoring</b><p>Mining cards score 1 point for each matching rank and 1 point for each matching suit against the Winning Card and revealed cards.</p></div>
                <div className="rule-card"><b>Ledger</b><p>After each round, everyone confirms the same updated ledger before the game continues.</p></div>
              </div>
              <button className="primary-btn" onClick={() => setShowRules(false)}>Close</button>
            </div>
          </div>
        )}

        {showStory && (
          <div className="modal-overlay">
            <div className="story-modal">
              <button className="close-btn" onClick={() => setShowStory(false)}>×</button>
              <img src={STORY_IMAGES[storyIndex]} alt="" />
              <div className="story-controls">
                <button className="secondary-btn" disabled={storyIndex === 0} onClick={() => setStoryIndex((i) => i - 1)}>Previous</button>
                <span>{storyIndex + 1} / {STORY_IMAGES.length}</span>
                <button className="primary-btn" disabled={storyIndex === STORY_IMAGES.length - 1} onClick={() => setStoryIndex((i) => i + 1)}>Next</button>
              </div>
            </div>
          </div>
        )}

        {currentEvent && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="lesson-card">
                <b>Blockchain hint</b>
                <p>{currentEvent.lesson || 'The game state changes only after everyone confirms the result.'}</p>
              </div>

              <h2>{currentEvent.title}</h2>
              <img src={currentEvent.icon} alt="" className="event-icon" />
              <p>{currentEvent.text}</p>

              {currentEvent.card && (
                <>
                  <button className="click-card" onClick={() => setCardRevealed(true)}>
                    <img src={CARD_BACKS[currentEvent.card.kind]} alt="" className="card-back-only" />
                    {!cardRevealed && <span>Click card to reveal</span>}
                  </button>

                  {cardRevealed && (
                    <div className="rule-card">
                      <b>{currentEvent.note}</b>
                      <p>{currentEvent.privateNote}</p>
                    </div>
                  )}
                </>
              )}

              {!currentEvent.card && (
                <>
                  <div className="rule-card"><b>{currentEvent.note}</b><p>{currentEvent.privateNote}</p></div>
                  {ledgerChanges.length > 0 && (
                    <div className="ledger-confirm-list">
                      {ledgerChanges.map((change) => (
                        <div key={change.id} className="ledger-confirm-row">
                          <span>{change.name}</span>
                          <b>{change.before} → {change.after}</b>
                          <small>{change.difference >= 0 ? '+' : ''}{change.difference}</small>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <button className="primary-btn" disabled={currentEvent.card && !cardRevealed} onClick={closeCurrentEvent}>
                {phase === 'round-summary' ? 'Confirm Ledger and Start Next Round' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {phase === 'mining' && miner && !currentEvent && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="lesson-card">
                <b>Mining explained</b>
                <p>Mining is not digging. In blockchain, mining means validating transactions and competing to create the next block.</p>
              </div>

              <h2>{miner.label} / {miner.colorName}: {miner.name}</h2>

              {miningReason(miner) ? (
                <>
                  <div className="rule-card"><b>Cannot Mine</b><p>{miningReason(miner)}</p></div>
                  <button className="primary-btn" onClick={skipMining}>Continue</button>
                </>
              ) : (
                <>
                  <div className="validation-table">
                    <div>
                      <small>Previous Winning Card</small>
                      <strong>{face(winningCard)}</strong>
                    </div>
                    <div>
                      <small>Your hidden card</small>
                      <img src={CARD_BACKS[miner.transactionCard.kind]} alt="" />
                    </div>
                    <div>
                      <small>Your mining card</small>
                      <strong>{face(miningChoice?.selected)}</strong>
                    </div>
                  </div>

                  <div className="rule-card">
                    <b>Your hidden card</b>
                    <p>{miner.transactionCard.title}: {miner.transactionCard.text} ({face(miner.transactionCard)})</p>
                  </div>

                  <div className="card-choice-grid">
                    {miningChoice?.cards.map((card, i) => (
                      <button key={i} className={`mining-card ${miningChoice.selected === card ? 'selected-mining-card' : ''}`} onClick={() => setMiningChoice({ ...miningChoice, selected: card })}>
                        <span>{face(card)}</span>
                        <small>{miningChoice.selected === card ? 'Selected' : 'Click to select'}</small>
                      </button>
                    ))}
                  </div>

                  <button className="primary-btn" onClick={joinMining}>Pay 1 and Mine</button>
                  <button className="secondary-btn" onClick={skipMining}>Skip Mining</button>
                </>
              )}
            </div>
          </div>
        )}

        {winner && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2>Game Complete</h2>
              <p>{winner}</p>
              <button className="primary-btn" onClick={() => setScreen('home')}>Back Home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}