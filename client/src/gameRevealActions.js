import { chestIcon, chainIcon, expenseIcon, actionIcon, crystalIcon, MINING_REWARD } from './constants.js'
import {
  getCardFace,
  applyTransactionEffects,
  resolveMiningWinner,
  createRoundBlock,
  checkWinConditions,
  calculateMiningScore
} from './gameUtils.js'

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

export function revealAndExecute(basePlayers, store) {
  let updated = basePlayers.map((player) => ({ ...player }))
  const logs = []
  const events = []
  const visible = [store.winningCard, ...updated.map((player) => player.transactionCard).filter(Boolean)]
  const miners = updated
    .filter((player) => player.active && player.miningCard)
    .map((player) => ({ ...player, miningScore: calculateMiningScore(player.miningCard, visible) }))

  let newWinningCard = store.winningCard
  let newBlock = null

  events.push({ title: 'Reveal Phase', icon: crystalIcon, text: `Previous Winning Card: ${getCardFace(store.winningCard)}.`,
    note: 'All hidden transaction/action cards are revealed.',
    privateNote: miners.length ? miners.map((m) => `${m.name} mined with ${getCardFace(m.miningCard)}, score ${m.miningScore}`).join(' | ') : 'No player joined mining.'
  })

  if (miners.length) {
    const { miningWinner, newWinningCard: winnerCard } = resolveMiningWinner(miners)
    updated = updated.map((player) => player.id === miningWinner.id ? { ...player, coins: player.coins + MINING_REWARD } : player)
    newWinningCard = winnerCard
    newBlock = createRoundBlock(store.round, miningWinner, newWinningCard)
    logs.push(`${miningWinner.name} wins mining with ${getCardFace(miningWinner.miningCard)} and receives 5 Istoken.`)
    events.push({ title: 'Block Created', icon: chainIcon,
      text: `${miningWinner.name} receives 5 Istoken for creating the block.`,
      note: `New Winning Card: ${getCardFace(newWinningCard)}.`,
      privateNote: 'This card links the next round to the current block.'
    })
  } else {
    logs.push('No player joined mining. No block reward is paid.')
  }

  updated = executeCards(updated, logs, events)
  updated = updated.map((player) => player.coins < 0 ? { ...player, active: false } : player)
  updated.forEach((player) => { if (!player.active && player.coins < 0) logs.push(`${player.name} has negative Istoken and is disqualified.`) })

  store.setPlayers(updated)
  store.setPendingPlayers(updated)
  store.setWinningCard(newWinningCard)
  if (newBlock) store.setBlocks((prev) => [newBlock, ...prev])
  store.setEventQueue(events)
  store.setEventIndex(0)
  store.setPhase('reveal-events')
  store.addLedger(logs)

  const active = updated.filter((player) => player.active)
  const winnerMessage = checkWinConditions(active, store.round)
  if (winnerMessage) { store.setWinner(winnerMessage); store.setPhase('game-over') }
}

export function finishRound(store) {
  if (store.winner) return
  store.setRound((prev) => prev + 1)
  store.setPhase('ready')
  store.setPendingPlayers(null)
  store.setMiningChoice(null)
}
