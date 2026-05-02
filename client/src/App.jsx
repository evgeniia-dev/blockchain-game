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

function dice() {
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
    { title: 'Jellyfish', text: 'You will skip the next mining round.', action: 'jellyfish', rank: 'J', suit: 'hearts' },
    { title: 'Fire', text: 'Each other player gives you 1 Istoken.', action: 'fire', rank: 'Q', suit: 'diamonds' },
    { title: 'Totem', text: 'From next turn on, you cannot participate in mining.', action: 'totem', rank: 'K', suit: 'clubs' },
    { title: 'Axe', text: 'In this mining turn, draw two standard cards and choose one.', action: 'axe', rank: 'A', suit: 'spades' }
  ]
  return shuffle(Array.from({ length: 54 }, (_, i) => ({ ...effects[i % effects.length], kind: 'action' })))
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

function move(player, roll) {
  let position = player.position
  let crossedStart = false
  for (let i = 0; i < roll; i += 1) {
    position = (position + 1) % BOARD.length
    if (position === 0) crossedStart = true
  }
  return { ...player, position, crossedStart, lastRoll: roll }
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

  const [incomeDeck, setIncomeDeck] = useState(makeIncomeDeck())
  const [expenseDeck, setExpenseDeck] = useState(makeExpenseDeck())
  const [actionDeck, setActionDeck] = useState(makeActionDeck())
  const [playingDeck, setPlayingDeck] = useState(standardDeck())
  const [winningCard, setWinningCard] = useState(null)

  const [ledger, setLedger] = useState([])
  const [blocks, setBlocks] = useState([])
  const [eventQueue, setEventQueue] = useState([])
  const [eventIndex, setEventIndex] = useState(0)
  const [pendingPlayers, setPendingPlayers] = useState(null)
  const [currentMiner, setCurrentMiner] = useState(0)
  const [miningChoice, setMiningChoice] = useState(null)
  const [winner, setWinner] = useState('')

  const activePlayers = useMemo(() => players.filter((p) => p.active), [players])
  const currentEvent = eventQueue[eventIndex]
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
    setDiceValue(1)
    setIncomeDeck(makeIncomeDeck())
    setExpenseDeck(makeExpenseDeck())
    setActionDeck(makeActionDeck())
    setPlayingDeck(freshDeck.slice(1))
    setWinningCard(firstWinning)
    setLedger([
      `Initial Winning Card is ${face(firstWinning)}.`,
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

  function playPhaseOne() {
    if (phase !== 'ready' || winner) return

    const nextPlayers = players.map((p) => ({
      ...p,
      transactionCard: null,
      miningCard: null,
      blockedThisRound: false,
      lastRoll: null
    }))

    const decks = { income: [...incomeDeck], expense: [...expenseDeck], action: [...actionDeck] }
    const logs = []
    const events = []

    nextPlayers.forEach((player, index) => {
      if (!player.active) return
      const roll = dice()
      setDiceValue(roll)
      let moved = move(player, roll)
      const tile = BOARD[moved.position]
      const card = drawCardForTile(tile, decks)

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
      nextPlayers[index] = moved

      events.push({
        title: `${moved.label} / ${moved.colorName}: ${moved.name}`,
        icon: tile.icon,
        text: `${moved.name} rolled ${roll} and moved to ${tile.name}.`,
        note: `${moved.name} drew a hidden ${card.kind.toUpperCase()} card.`,
        privateNote: `${card.title}: ${card.text} (${face(card)})`,
        card
      })

      logs.push(`${moved.name} rolled ${roll}, landed on ${tile.name}, and drew a hidden ${card.kind} card.`)
    })

    setPlayers(nextPlayers)
    setPendingPlayers(nextPlayers)
    setIncomeDeck(decks.income)
    setExpenseDeck(decks.expense)
    setActionDeck(decks.action)
    setEventQueue(events)
    setEventIndex(0)
    setPhase('phase-one-events')
    addLedger(logs)
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

  function miningReason(player) {
    if (!player.active) return 'This player is disqualified.'
    if (player.skipNextMining) return 'Jellyfish effect: this player must skip this mining round.'
    if (player.blockedForever) return 'Totem effect: this player can no longer participate in mining.'
    if (player.blockedThisRound) return 'Totem Corner: this player cannot mine this round.'
    if (player.coins < MINING_COST) return 'This player does not have enough Istoken to pay the mining cost.'
    return ''
  }

  function startMiningPhase() {
    const candidates = pendingPlayers || players
    const noOneAllowed = candidates.filter((p) => p.active).every((p) => Boolean(miningReason(p)))
    if (noOneAllowed) {
      const richest = [...candidates.filter((p) => p.active)].sort((a, b) => b.coins - a.coins)[0]
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
    const updated = pendingPlayers.map((p, i) => {
      if (i !== currentMiner) return p
      return { ...p, skipNextMining: false, miningCard: null }
    })
    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function joinMining() {
    const updated = pendingPlayers.map((p, i) => {
      if (i !== currentMiner) return p
      return { ...p, coins: p.coins - MINING_COST, miningCard: miningChoice.selected, skipNextMining: false }
    })
    setPendingPlayers(updated)
    nextMiner(currentMiner + 1, updated)
  }

  function revealAndExecute(basePlayers) {
    let updated = basePlayers.map((p) => ({ ...p }))
    const logs = []
    const events = []
    const visible = [winningCard, ...updated.map((p) => p.transactionCard).filter(Boolean)]

    const miners = updated.filter((p) => p.active && p.miningCard).map((p) => ({
      ...p,
      miningScore: score(p.miningCard, visible)
    }))

    let newWinningCard = winningCard
    let newBlock = null

    events.push({
      title: 'Reveal Phase',
      icon: crystalIcon,
      text: `Previous Winning Card: ${face(winningCard)}.`,
      note: 'All hidden transaction/action cards are revealed.',
      privateNote: miners.length ? miners.map((m) => `${m.name} mined with ${face(m.miningCard)}, score ${m.miningScore}`).join(' | ') : 'No player joined mining.'
    })

    if (miners.length) {
      let finalists = [...miners].sort((a, b) => b.miningScore - a.miningScore || b.miningCard.value - a.miningCard.value)
      const bestScore = finalists[0].miningScore
      finalists = finalists.filter((m) => m.miningScore === bestScore)
      const bestValue = Math.max(...finalists.map((m) => m.miningCard.value))
      finalists = finalists.filter((m) => m.miningCard.value === bestValue)

      let miningWinner = finalists[0]
      if (finalists.length > 1) {
        miningWinner = finalists.map((m) => ({ ...m, tieRoll: dice() })).sort((a, b) => b.tieRoll - a.tieRoll)[0]
      }

      updated = updated.map((p) => p.id === miningWinner.id ? { ...p, coins: p.coins + MINING_REWARD } : p)
      newWinningCard = miningWinner.miningCard
      newBlock = { id: `block-${round}-${Date.now()}`, title: `Block ${round}`, miner: miningWinner.name, reward: MINING_REWARD, card: newWinningCard }

      logs.push(`${miningWinner.name} wins mining with ${face(miningWinner.miningCard)} and receives 5 Istoken.`)

      events.push({
        title: 'Block Created',
        icon: chainIcon,
        text: `${miningWinner.name} receives 5 Istoken for creating the block.`,
        note: `New Winning Card: ${face(newWinningCard)}.`,
        privateNote: 'This card links the next round to the current block.'
      })
    } else {
      logs.push('No player joined mining. No block reward is paid.')
    }

    updated = executeCards(updated, logs, events)
    updated = updated.map((p) => p.coins < 0 ? { ...p, active: false } : p)

    updated.forEach((p) => {
      if (!p.active && p.coins < 0) logs.push(`${p.name} has negative Istoken and is disqualified.`)
    })

    setPlayers(updated)
    setPendingPlayers(updated)
    setWinningCard(newWinningCard)
    if (newBlock) setBlocks((prev) => [newBlock, ...prev])
    setEventQueue(events)
    setEventIndex(0)
    setPhase('reveal-events')
    addLedger(logs)

    const active = updated.filter((p) => p.active)
    if (active.length <= 1) {
      setWinner(active[0] ? `${active[0].name} wins because only one player remains.` : 'Game over.')
      setPhase('game-over')
    }

    if (round >= ROUND_LIMIT) {
      const richest = [...active].sort((a, b) => b.coins - a.coins)[0]
      setWinner(`${richest.name} wins after ${ROUND_LIMIT} rounds with the most Istoken.`)
      setPhase('game-over')
    }
  }

  function executeCards(basePlayers, logs, events) {
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

      events.push({
        title: `${player.name}'s Transaction`,
        icon: card.kind === 'income' ? chestIcon : card.kind === 'expense' ? expenseIcon : actionIcon,
        text: `${card.title}: ${card.text}`,
        note: `Card: ${face(card)}.`,
        privateNote: 'The shared scoreboard updates for everyone.',
        card
      })
    })

    return updated
  }

  function finishRound() {
    if (winner) return
    setRound((prev) => prev + 1)
    setPhase('ready')
    setPendingPlayers(null)
    setMiningChoice(null)
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
                <p>Three local players move clockwise, draw hidden cards, mine blocks, and update one shared digital scoreboard.</p>
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
                    <img src={DICE[diceValue]} alt="" className="dice-img" />
                    <h3>Winning Card: {face(winningCard)}</h3>
                    <p>Phase: {phase}</p>
                    <button className="primary-btn" disabled={phase !== 'ready' || winner} onClick={playPhaseOne}>Play Next Round</button>
                  </div>
                </div>
              </section>

              <aside className="side-stack">
                <section className="panel">
                  <h2>Players</h2>
                  <div className="players-list">
                    {players.map((p) => (
                      <div key={p.id} className={`player-card ${!p.active ? 'player-out' : ''}`}>
                        <div className="player-head">
                          <img src={PAWNS[p.id]} alt="" className="player-pawn-small" />
                          <div><strong>{p.label} - {p.colorName}</strong><p>{p.name}</p></div>
                          <b>{p.coins}</b>
                        </div>
                        <small>{p.blockedForever ? 'Totem: cannot mine' : p.skipNextMining ? 'Jellyfish: skips next mining' : 'Can mine if funded'}</small>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2><img src={ledgerIcon} alt="" /> Shared Scoreboard / Ledger</h2>
                  <p className="small-note">Keep an eye on the scoreboard.</p>
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
                <div className="rule-card"><b>Start of the Game</b><p>Each player chooses a colour and takes 2 pawns. Each player starts with 50 Istoken. The first Winning Card is drawn from the standard deck.</p></div>
                <div className="rule-card"><b>Phase 1 - Moving</b><p>Each player rolls the dice, moves clockwise, and draws one hidden card. Income spaces give Income cards, Expense spaces give Expense cards, and Action spaces give Action cards.</p></div>
                <div className="rule-card"><b>Special Corners</b><p>Cross Start - gain 4. Land on Start - draw Action. Jellyfish - draw Expense and pay 1. Fire - draw Income and gain 1. Totem - draw Action and skip mining this round.</p></div>
                <div className="rule-card"><b>Phase 2 - Mining</b><p>Each player draws a standard card and decides whether to mine. Mining costs 1 Istoken. Axe lets the player draw two standard cards and choose one.</p></div>
                <div className="rule-card"><b>Scoring</b><p>Compare each mining card with the previous Winning Card and all players’ drawn cards. Gain 1 point for each matching rank and 1 point for each matching suit.</p></div>
                <div className="rule-card"><b>Block Reward</b><p>The mining winner gets 5 Istoken. The winner’s standard card becomes the next Winning Card.</p></div>
                <div className="rule-card"><b>Ledger</b><p>After mining, all hidden cards are executed and the shared scoreboard updates.</p></div>
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
              <h2>{currentEvent.title}</h2>
              <img src={currentEvent.icon} alt="" className="event-icon" />
              <p>{currentEvent.text}</p>
              {currentEvent.card && (
                <div className="card-display">
                  <img src={CARD_BACKS[currentEvent.card.kind]} alt="" />
                  <div>
                    <h3>{currentEvent.note}</h3>
                    <p>{currentEvent.privateNote}</p>
                  </div>
                </div>
              )}
              {!currentEvent.card && <div className="rule-card"><b>{currentEvent.note}</b><p>{currentEvent.privateNote}</p></div>}
              <button className="primary-btn" onClick={continueEvent}>{eventIndex < eventQueue.length - 1 ? 'Next Player' : 'Continue'}</button>
            </div>
          </div>
        )}

        {phase === 'mining' && miner && !currentEvent && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h2>{miner.label} / {miner.colorName}: {miner.name}</h2>
              {miningReason(miner) ? (
                <>
                  <div className="rule-card"><b>Cannot Mine</b><p>{miningReason(miner)}</p></div>
                  <button className="primary-btn" onClick={skipMining}>Continue</button>
                </>
              ) : (
                <>
                  <p>Winning Card: <b>{face(winningCard)}</b></p>
                  <div className="card-display">
                    <img src={CARD_BACKS[miner.transactionCard.kind]} alt="" />
                    <div>
                      <h3>Your hidden card</h3>
                      <p>{miner.transactionCard.title}: {miner.transactionCard.text}</p>
                      <b>{face(miner.transactionCard)}</b>
                    </div>
                  </div>

                  <div className="mining-cards">
                    {miningChoice?.cards.map((card, i) => (
                      <button key={i} className={`mining-card ${miningChoice.selected === card ? 'selected-mining-card' : ''}`} onClick={() => setMiningChoice({ ...miningChoice, selected: card })}>
                        <span>{face(card)}</span>
                        <small>{miningChoice.selected === card ? 'Selected' : 'Choose card'}</small>
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