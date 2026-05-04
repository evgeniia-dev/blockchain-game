import { useGameStore } from './useGameStore.js'
import { startGame, playPhaseOne } from './gameSetupActions.js'
import { getMiningBlockReason, startMiningPhase, skipMining, joinMining } from './gameMiningActions.js'
import { revealAndExecute, finishRound } from './gameRevealActions.js'

export function useGame() {
  const store = useGameStore()

  const boundReveal = (basePlayers) => revealAndExecute(basePlayers, store)
  const boundStartMining = () => startMiningPhase(store, boundReveal)
  const boundSkipMining = () => skipMining(store, boundReveal)
  const boundJoinMining = () => joinMining(store, boundReveal)
  const boundFinishRound = () => finishRound(store)

  function continueEvent() {
    if (store.eventIndex < store.eventQueue.length - 1) {
      store.setEventIndex((prev) => prev + 1)
      return
    }
    store.setEventQueue([])
    store.setEventIndex(0)
    if (store.phase === 'phase-one-events') boundStartMining()
    if (store.phase === 'reveal-events') boundFinishRound()
  }

  return {
    players: store.players,
    round: store.round,
    phase: store.phase,
    diceValue: store.diceValue,
    winningCard: store.winningCard,
    ledger: store.ledger,
    blocks: store.blocks,
    eventQueue: store.eventQueue,
    eventIndex: store.eventIndex,
    currentEvent: store.currentEvent,
    pendingPlayers: store.pendingPlayers,
    miner: store.miner,
    currentMiner: store.currentMiner,
    miningChoice: store.miningChoice,
    winner: store.winner,
    activePlayers: store.activePlayers,
    setMiningChoice: store.setMiningChoice,
    startGame: (names) => startGame(names, store),
    playPhaseOne: () => playPhaseOne(store),
    continueEvent,
    getMiningBlockReason,
    skipMining: boundSkipMining,
    joinMining: boundJoinMining,
    finishRound: boundFinishRound
  }
}
