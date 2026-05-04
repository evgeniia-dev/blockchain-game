import { MINING_COST } from './constants.js'
import { drawStandardCards } from './gameUtils.js'

export function getMiningBlockReason(player) {
  if (!player.active) return 'This player is disqualified.'
  if (player.skipNextMining) return 'Jellyfish effect: this player must skip this mining round.'
  if (player.blockedForever) return 'Totem effect: this player can no longer participate in mining.'
  if (player.blockedThisRound) return 'Totem Corner: this player cannot mine this round.'
  if (player.coins < MINING_COST) return 'This player does not have enough Istoken to pay the mining cost.'
  return ''
}

export function startMiningPhase(store, onRevealAndExecute) {
  const candidates = store.pendingPlayers || store.players
  const noOneAllowed = candidates.filter((player) => player.active).every((player) => Boolean(getMiningBlockReason(player)))
  if (noOneAllowed) {
    const richest = [...candidates.filter((player) => player.active)].sort((a, b) => b.coins - a.coins)[0]
    store.setWinner(`${richest.name} wins because no active player is allowed to participate in mining.`)
    store.setPhase('game-over')
    return
  }
  store.setCurrentMiner(0)
  store.setPhase('mining')
  prepareMiner(0, candidates, store, onRevealAndExecute)
}

export function prepareMiner(index, basePlayers, store, onRevealAndExecute) {
  const list = basePlayers || store.pendingPlayers
  const player = list[index]
  if (!player || !player.active) { nextMiner(index + 1, list, store, onRevealAndExecute); return }
  const reason = getMiningBlockReason(player)
  if (reason) { store.setMiningChoice({ blocked: true, reason, cards: [] }); return }
  const count = player.transactionCard?.action === 'axe' ? 2 : 1
  const result = drawStandardCards(store.playingDeck, count)
  store.setPlayingDeck(result.deck)
  store.setMiningChoice({ blocked: false, cards: result.cards, selected: result.cards[0] })
}

export function nextMiner(nextIndex, updatedPlayers, store, onRevealAndExecute) {
  if (nextIndex >= updatedPlayers.length) { onRevealAndExecute(updatedPlayers); return }
  store.setCurrentMiner(nextIndex)
  prepareMiner(nextIndex, updatedPlayers, store, onRevealAndExecute)
}

export function skipMining(store, onRevealAndExecute) {
  const updated = store.pendingPlayers.map((player, i) =>
    i !== store.currentMiner ? player : { ...player, skipNextMining: false, miningCard: null }
  )
  store.setPendingPlayers(updated)
  nextMiner(store.currentMiner + 1, updated, store, onRevealAndExecute)
}

export function joinMining(store, onRevealAndExecute) {
  const updated = store.pendingPlayers.map((player, i) =>
    i !== store.currentMiner ? player : { ...player, coins: player.coins - MINING_COST, miningCard: store.miningChoice.selected, skipNextMining: false }
  )
  store.setPendingPlayers(updated)
  nextMiner(store.currentMiner + 1, updated, store, onRevealAndExecute)
}
