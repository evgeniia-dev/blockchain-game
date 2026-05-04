import { useState, useMemo } from 'react'
import {
  createStandardDeck,
  createIncomeDeck,
  createExpenseDeck,
  createActionDeck,
  createPlayers
} from './gameUtils.js'

export function useGameStore() {
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

  return {
    players, setPlayers, round, setRound, phase, setPhase,
    diceValue, setDiceValue, incomeDeck, setIncomeDeck, expenseDeck, setExpenseDeck,
    actionDeck, setActionDeck, playingDeck, setPlayingDeck, winningCard, setWinningCard,
    ledger, setLedger, blocks, setBlocks, eventQueue, setEventQueue, eventIndex, setEventIndex,
    pendingPlayers, setPendingPlayers, currentMiner, setCurrentMiner, miningChoice, setMiningChoice,
    winner, setWinner, activePlayers, currentEvent, miner, addLedger
  }
}
