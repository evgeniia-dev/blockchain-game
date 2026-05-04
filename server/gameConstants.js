export const START_BALANCE = 50
export const MINING_COST = 1
export const MINING_REWARD = 5
export const BOARD_SIZE = 20

export const BOARD_TILES = [
  { type: 'start', label: 'Start' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'jellyfish', label: 'Jellyfish' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' },
  { type: 'fire', label: 'Fire' },
  { type: 'income', label: 'Income' },
  { type: 'action', label: 'Action' },
  { type: 'expense', label: 'Expense' },
  { type: 'income', label: 'Income' },
  { type: 'totem', label: 'Totem' },
  { type: 'expense', label: 'Expense' },
  { type: 'action', label: 'Action' },
  { type: 'income', label: 'Income' },
  { type: 'expense', label: 'Expense' }
]

export const PLAYER_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']

export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']

export const RANKS = [
  { rank: '2', value: 2 },
  { rank: '3', value: 3 },
  { rank: '4', value: 4 },
  { rank: '5', value: 5 },
  { rank: '6', value: 6 },
  { rank: '7', value: 7 },
  { rank: '8', value: 8 },
  { rank: '9', value: 9 },
  { rank: '10', value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 }
]

export const INCOME_CARDS = [
  { id: 'i1', category: 'income', title: 'Fishing Reward', amount: 4, mode: 'bank', suit: 'hearts', rank: '4' },
  { id: 'i2', category: 'income', title: 'Fruit Trade', amount: 3, mode: 'bank', suit: 'clubs', rank: '3' },
  { id: 'i3', category: 'income', title: 'Tool Repair Payment', amount: 5, mode: 'bank', suit: 'diamonds', rank: '5' },
  { id: 'i4', category: 'income', title: 'Receive from Left', amount: 4, mode: 'leftPays', suit: 'spades', rank: '4' },
  { id: 'i5', category: 'income', title: 'Receive from Right', amount: 4, mode: 'rightPays', suit: 'hearts', rank: '6' },
  { id: 'i6', category: 'income', title: 'Community Bonus', amount: 2, mode: 'allPay', suit: 'clubs', rank: '2' }
]

export const EXPENSE_CARDS = [
  { id: 'e1', category: 'expense', title: 'Broken Net', amount: 3, mode: 'bank', suit: 'diamonds', rank: '3' },
  { id: 'e2', category: 'expense', title: 'Storm Damage', amount: 4, mode: 'bank', suit: 'spades', rank: '4' },
  { id: 'e3', category: 'expense', title: 'Pay Left Player', amount: 5, mode: 'leftReceives', suit: 'hearts', rank: '5' },
  { id: 'e4', category: 'expense', title: 'Pay Right Player', amount: 5, mode: 'rightReceives', suit: 'clubs', rank: '5' },
  { id: 'e5', category: 'expense', title: 'Shared Camp Cost', amount: 2, mode: 'allReceive', suit: 'diamonds', rank: '2' },
  { id: 'e6', category: 'expense', title: 'Lost Supplies', amount: 3, mode: 'bank', suit: 'spades', rank: '6' }
]

export const ACTION_CARDS = [
  { id: 'a1', category: 'action', actionType: 'jellyfish', title: 'Jellyfish', text: 'Skip next mining round.', suit: 'hearts', rank: 'J' },
  { id: 'a2', category: 'action', actionType: 'fire', title: 'Fire', text: 'Each other player gives you 1 Istoken.', suit: 'diamonds', rank: 'Q' },
  { id: 'a3', category: 'action', actionType: 'totem', title: 'Totem', text: 'You become permanently blocked from mining.', suit: 'clubs', rank: 'K' },
  { id: 'a4', category: 'action', actionType: 'axe', title: 'Axe', text: 'Draw two mining cards and keep the better one.', suit: 'spades', rank: 'A' }
]
