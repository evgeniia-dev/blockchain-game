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

export { background, chestIcon, chainIcon, ledgerIcon, crystalIcon, expenseIcon, actionIcon }

export const STORY_IMAGES = [story1, story2, story3, story4, story5, story6, story7, story8, story9]
export const DICE_IMAGES = { 1: dice1, 2: dice2, 3: dice3, 4: dice4, 5: dice5, 6: dice6 }
export const PAWN_IMAGES = { 1: player1Pawn, 2: player2Pawn, 3: player3Pawn }
export const CARD_BACK_IMAGES = { income: incomeBack, expense: expenseBack, action: actionBack }

export const START_COINS = 50
export const MINING_COST = 1
export const MINING_REWARD = 5
export const ROUND_LIMIT = 12

export const SUITS = ['clubs', 'diamonds', 'hearts', 'spades']
export const SUIT_SYMBOLS = { clubs: '♣', diamonds: '♦', hearts: '♥', spades: '♠' }
export const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
export const RANK_VALUES = { A: 14, K: 13, Q: 12, J: 11, 10: 10, 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 3: 3, 2: 2 }

export const PLAYERS = [
  { id: 1, label: 'Player 1', colorName: 'Blue', color: '#7288ff' },
  { id: 2, label: 'Player 2', colorName: 'Mint', color: '#6ed9bd' },
  { id: 3, label: 'Player 3', colorName: 'Lilac', color: '#c79cff' }
]

export const BOARD = [
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
