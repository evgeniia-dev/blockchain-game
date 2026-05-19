import React, { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
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

import player1Pawn from './assets/pawns/player1-blue-board.png'
import player2Pawn from './assets/pawns/player2-mint-board.png'
import player3Pawn from './assets/pawns/player3-lilac-board.png'

import incomeBack from './assets/cards/income/income-back.png'
import fishingProfitFront from './assets/cards/income/fishing-profit-back.png'
import marketBonusFront from './assets/cards/income/market-bonus-back.png'
import pearlTradeFront from './assets/cards/income/pearl-trade-back.png'
import shellSaleFront from './assets/cards/income/shell-sale-back.png'

import expenseBack from './assets/cards/expense/expense-back.png'
import boatRepairFront from './assets/cards/expense/boat-repair-back.png'
import brokenToolsFront from './assets/cards/expense/broken-tools-back.png'
import sharedCostFront from './assets/cards/expense/shared-cost-back.png'
import stormDamageFront from './assets/cards/expense/storm-damage-back.png'

import actionBack from './assets/cards/action/action-back.png'
import axeFront from './assets/cards/action/axe-back.png'
import fireFront from './assets/cards/action/fire-back.png'
import jellyfishFront from './assets/cards/action/jellyfish-back.png'
import totemFront from './assets/cards/action/totem-back.png'

import story1 from './assets/story/story-1.png'
import story2 from './assets/story/story-2.png'
import story3 from './assets/story/story-3.png'
import story4 from './assets/story/story-4.png'
import story5 from './assets/story/story-5.png'
import story6 from './assets/story/story-6.png'
import story7 from './assets/story/story-7.png'
import story8 from './assets/story/story-8.png'
import story9 from './assets/story/story-9.png'

const socket = io()

const STORY_IMAGES = [story1, story2, story3, story4, story5, story6, story7, story8, story9]

const DICE = {
  1: dice1,
  2: dice2,
  3: dice3,
  4: dice4,
  5: dice5,
  6: dice6
}

const PAWNS = {
  1: player1Pawn,
  2: player2Pawn,
  3: player3Pawn
}

const GENERIC_CARD_BACKS = {
  income: incomeBack,
  expense: expenseBack,
  action: actionBack
}

const TRANSACTION_CARD_FRONTS = {
  'Shell Sale': shellSaleFront,
  'Fishing Profit': fishingProfitFront,
  'Pearl Trade': pearlTradeFront,
  'Market Bonus': marketBonusFront,
  'Boat Repair': boatRepairFront,
  'Broken Tools': brokenToolsFront,
  'Storm Damage': stormDamageFront,
  'Shared Cost': sharedCostFront,
  Jellyfish: jellyfishFront,
  Fire: fireFront,
  Totem: totemFront,
  Axe: axeFront
}

const BOARD = [
  { id: 0, name: 'Start', type: 'start', icon: startIcon, pos: [1, 1] },
  { id: 1, name: 'Income', type: 'income', icon: chestIcon, pos: [2, 1] },
  { id: 2, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [3, 1] },
  { id: 3, name: 'Action', type: 'action', icon: actionIcon, pos: [4, 1] },
  { id: 4, name: 'Jellyfish', type: 'jellyfish', icon: jellyfishIcon, pos: [5, 1] },
  { id: 5, name: 'Income', type: 'income', icon: chestIcon, pos: [5, 2] },
  { id: 6, name: 'Action', type: 'action', icon: actionIcon, pos: [5, 3] },
  { id: 7, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [5, 4] },
  { id: 8, name: 'Fire', type: 'fire', icon: fireIcon, pos: [5, 5] },
  { id: 9, name: 'Income', type: 'income', icon: chestIcon, pos: [4, 5] },
  { id: 10, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [3, 5] },
  { id: 11, name: 'Action', type: 'action', icon: actionIcon, pos: [2, 5] },
  { id: 12, name: 'Totem', type: 'totem', icon: totemIcon, pos: [1, 5] },
  { id: 13, name: 'Expense', type: 'expense', icon: expenseIcon, pos: [1, 4] },
  { id: 14, name: 'Income', type: 'income', icon: chestIcon, pos: [1, 3] },
  { id: 15, name: 'Action', type: 'action', icon: actionIcon, pos: [1, 2] }
]

function face(card) {
  if (!card) return '—'

  const symbols = {
    clubs: '♣',
    diamonds: '♦',
    hearts: '♥',
    spades: '♠'
  }

  return `${card.rank}${symbols[card.suit] || ''}`
}

function getCardBack(card) {
  if (!card) return actionBack
  return GENERIC_CARD_BACKS[card.kind] || actionBack
}

function getCardFront(card) {
  if (!card) return actionBack
  return TRANSACTION_CARD_FRONTS[card.title] || GENERIC_CARD_BACKS[card.kind] || actionBack
}

function getCardImage(card, revealed) {
  return revealed ? getCardFront(card) : getCardBack(card)
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [storyIndex, setStoryIndex] = useState(0)
  const [showStory, setShowStory] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [roomData, setRoomData] = useState(null)
  const [roomError, setRoomError] = useState('')
  const [cardRevealed, setCardRevealed] = useState(false)

  const game = roomData?.game || null
  const players = game?.players || []

  const activePlayers = useMemo(() => players.filter((player) => player.active), [players])
  const myPlayer = players.find((player) => player.id === socket.id)
  const currentTurnPlayer = players.find((player) => player.id === game?.currentTurnId)
  const currentMiner = players.find((player) => player.id === game?.currentMinerId)
  const cardOwner = players.find((player) => player.id === game?.currentEvent?.ownerId)

  const isHost = roomData?.hostId === socket.id
  const isMyMovementTurn = game?.phase === 'movement' && game?.currentTurnId === socket.id
  const isMyCardReveal = game?.phase === 'card-reveal' && game?.currentEvent?.ownerId === socket.id
  const isMyMiningTurn = game?.phase === 'mining' && game?.currentMinerId === socket.id
  const hasConfirmedLedger = Boolean(game?.ledgerConfirmedBy?.includes(socket.id))

  useEffect(() => {
    socket.on('server-message', (data) => {
      console.log(data.message, data.socketId)
    })

    socket.on('room-updated', (room) => {
      setRoomData(room)
      setRoomCode(room.code)

      if (room.status === 'playing') {
        setScreen('game')
      }

      if (room.game?.phase !== 'card-reveal') {
        setCardRevealed(false)
      }
    })

    return () => {
      socket.off('server-message')
      socket.off('room-updated')
    }
  }, [])

  function handleResponse(response, fallback) {
    if (!response.ok) {
      setRoomError(response.error || fallback)
      return
    }

    setRoomData(response.room)
  }

  function createRoom() {
    setRoomError('')

    const safeName = playerName.trim()

    if (!safeName) {
      setRoomError('Enter your name first.')
      return
    }

    socket.emit('create-room', { playerName: safeName }, (response) => {
      handleResponse(response, 'Could not create room.')
    })
  }

  function joinRoom() {
    setRoomError('')

    const safeName = playerName.trim()
    const safeCode = joinCode.trim().toUpperCase()

    if (!safeName) {
      setRoomError('Enter your name first.')
      return
    }

    if (!safeCode) {
      setRoomError('Enter a room code.')
      return
    }

    socket.emit('join-room', { roomCode: safeCode, playerName: safeName }, (response) => {
      handleResponse(response, 'Could not join room.')
    })
  }

  function leaveRoom() {
    if (roomCode) {
      socket.emit('leave-room', { roomCode })
    }

    setRoomCode('')
    setJoinCode('')
    setRoomData(null)
    setRoomError('')
    setCardRevealed(false)
    setScreen('home')
  }

  function startRoomGame() {
    socket.emit('start-room-game', { roomCode }, (response) => {
      handleResponse(response, 'Could not start game.')

      if (response.ok) {
        setScreen('game')
      }
    })
  }

  function rollDice() {
    socket.emit('room-roll-dice', { roomCode }, (response) => {
      handleResponse(response, 'Could not roll dice.')
    })
  }

  function continueAfterCard() {
    socket.emit('room-continue-after-card', { roomCode }, (response) => {
      handleResponse(response, 'Could not continue.')

      if (response.ok) {
        setCardRevealed(false)
      }
    })
  }

  function selectMiningCard(cardId) {
    socket.emit('room-select-mining-card', { roomCode, cardId }, (response) => {
      handleResponse(response, 'Could not select card.')
    })
  }

  function joinMining() {
    socket.emit('room-join-mining', { roomCode }, (response) => {
      handleResponse(response, 'Could not join mining.')
    })
  }

  function skipMining() {
    socket.emit('room-skip-mining', { roomCode }, (response) => {
      handleResponse(response, 'Could not skip mining.')
    })
  }

  function confirmLedger() {
    socket.emit('room-confirm-ledger', { roomCode }, (response) => {
      handleResponse(response, 'Could not confirm ledger.')
    })
  }
    return (
    <div className="app-shell" style={{ backgroundImage: `url(${background})` }}>
      <div className="app-overlay">
        {screen === 'home' && (
          <>
            <header className="top-bar">
              <div>
                <p className="eyebrow">Market Island</p>
                <h1>Gamified Blockchain Boardgame</h1>
              </div>

              <div className="top-stats">
                <div className="pill-box">
                  <span>Mode</span>
                  <strong>Online Room</strong>
                </div>

                <div className="pill-box">
                  <span>Players</span>
                  <strong>2-3</strong>
                </div>
              </div>
            </header>

            <main className="home-layout">
              <section className="panel home-hero">
                <img src={chestIcon} alt="" className="hero-icon" />

                <h2>Welcome to Market Island</h2>

                <p>
                  Players join one room, take turns from different browsers, pick up cards, mine blocks,
                  and update one shared ledger.
                </p>

                <div className="multiplayer-panel">
                  <h3>Online Multiplayer Lobby</h3>

                  <p className="small-note">
                    Create a room, share the room code, or join an existing room from another browser.
                  </p>

                  <div className="form-grid">
                    <label>
                      Your name
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(event) => setPlayerName(event.target.value)}
                      />
                    </label>

                    <div className="home-buttons">
                      <button className="primary-btn" onClick={createRoom}>
                        Create Room
                      </button>
                    </div>

                    <label>
                      Room code
                      <input
                        type="text"
                        placeholder="Enter room code"
                        value={joinCode}
                        onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                      />
                    </label>

                    <div className="home-buttons">
                      <button className="secondary-btn" onClick={joinRoom}>
                        Join Room
                      </button>
                    </div>
                  </div>

                  {roomError && <p className="room-error">{roomError}</p>}

                  {roomData && (
                    <div className="room-box">
                      <h3>Room Code: {roomData.code}</h3>

                      <p>
                        Players: {roomData.players.length} / {roomData.maxPlayers}
                      </p>

                      <div className="room-player-list">
                        {roomData.players.map((player) => (
                          <div key={player.id} className="room-player-row">
                            <span style={{ background: player.color }} />
                            <b>{player.name}</b>
                            <small>{player.isHost ? 'Host' : 'Joined'}</small>
                          </div>
                        ))}
                      </div>

                      <div className="home-buttons">
                        {isHost && (
                          <button className="primary-btn" onClick={startRoomGame}>
                            Start Online Game
                          </button>
                        )}

                        <button className="secondary-btn" onClick={leaveRoom}>
                          Leave Room
                        </button>
                      </div>

                      {!isHost && <p className="small-note">Waiting for the host to start the game.</p>}
                    </div>
                  )}

                  <div className="home-buttons">
                    <button className="secondary-btn" onClick={() => setShowRules(true)}>
                      Instructions
                    </button>

                    <button className="secondary-btn" onClick={() => setShowStory(true)}>
                      Read the Story
                    </button>
                  </div>
                </div>
              </section>
            </main>
          </>
        )}

        {screen === 'game' && game && (
          <>
            <header className="top-bar">
              <div>
                <p className="eyebrow">Room {roomCode}</p>
                <h1>Market Island Online Game</h1>
              </div>

              <div className="top-stats">
                <div className="pill-box">
                  <span>Round</span>
                  <strong>{game.round} / 10</strong>
                </div>

                <div className="pill-box">
                  <span>Winning Card</span>
                  <strong>{face(game.winningCard)}</strong>
                </div>

                <div className="pill-box">
                  <span>You are</span>
                  <strong>{myPlayer?.name || 'Viewer'}</strong>
                </div>

                <div className="pill-box">
                  <span>Active</span>
                  <strong>{activePlayers.length}</strong>
                </div>
              </div>
            </header>

            <main className="game-layout">
              <section className="panel board-panel">
                <div className="board">
                  {BOARD.map((tile) => (
                    <div
                      key={tile.id}
                      className={`board-tile tile-${tile.type}`}
                      style={{ gridColumn: tile.pos[0], gridRow: tile.pos[1] }}
                    >
                      <img src={tile.icon} alt="" />
                      <span>{tile.name}</span>

                      <div className="pawn-row">
                        {players
                          .filter((player) => player.active && player.position === tile.id)
                          .map((player) => {
                            const originalIndex = players.findIndex((item) => item.id === player.id)

                            return (
                              <img
                                key={player.id}
                                className="pawn-img"
                                src={PAWNS[originalIndex + 1]}
                                alt={player.name}
                              />
                            )
                          })}
                      </div>
                    </div>
                  ))}

                  <div className="board-center">
                    <img src={DICE[game.diceValue || 1]} alt="" className="dice" />

                    {game.phase === 'movement' && (
                      <>
                        <h3>{isMyMovementTurn ? 'Your Turn' : `Waiting for ${currentTurnPlayer?.name || 'player'}`}</h3>

                        <p>
                          Winning Card: <b>{face(game.winningCard)}</b>
                        </p>

                        <p>{isMyMovementTurn ? 'Roll the dice to move your pawn.' : 'Only the current player can roll.'}</p>

                        <button className="primary-btn" disabled={!isMyMovementTurn} onClick={rollDice}>
                          Roll Dice
                        </button>
                      </>
                    )}

                    {game.phase === 'card-reveal' && (
                      <>
                        <h3>{isMyCardReveal ? 'Pick Up Your Card' : `Waiting for ${cardOwner?.name || 'player'} to pick up a card`}</h3>

                        <p>{game.currentEvent?.text}</p>
                      </>
                    )}

                    {game.phase === 'mining' && (
                      <>
                        <h3>{isMyMiningTurn ? 'Your Mining Choice' : `Waiting for ${currentMiner?.name || 'player'}`}</h3>

                        <p>Mining means validating transactions and competing to create the next block.</p>
                      </>
                    )}

                    {game.phase === 'ledger-confirmation' && (
                      <>
                        <h3>Ledger Confirmation</h3>

                        <p>
                          {hasConfirmedLedger
                            ? 'You confirmed the ledger. Waiting for the other active players.'
                            : 'All balances were updated. Confirm the shared ledger to continue.'}
                        </p>

                        <button className="primary-btn" disabled={hasConfirmedLedger} onClick={confirmLedger}>
                          {hasConfirmedLedger ? 'Ledger Confirmed' : 'Confirm Ledger'}
                        </button>
                      </>
                    )}

                    {game.phase === 'game-over' && (
                      <>
                        <h3>Game Complete</h3>
                        <p>{game.winner}</p>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <aside className="side-stack">
                <section className="panel">
                  <h2>Players</h2>

                  <div className="players-list">
                    {players.map((player, index) => (
                      <div key={player.id} className={`player-card ${!player.active ? 'player-out' : ''}`}>
                        <div className="player-head">
                          <img src={PAWNS[index + 1]} alt="" className="player-pawn-small" />

                          <div>
                            <strong>
                              {player.label} - {player.colorName}
                            </strong>

                            <p>
                              {player.name}
                              {player.id === socket.id ? ' - you' : ''}
                              {player.id === game.currentTurnId ? ' - current turn' : ''}
                              {game.phase === 'ledger-confirmation' && game.ledgerConfirmedBy?.includes(player.id)
                                ? ' - ledger confirmed'
                                : ''}
                            </p>
                          </div>

                          <b>{player.coins}</b>
                        </div>

                        <small>
                          {player.blockedForever
                            ? 'Totem: cannot mine'
                            : player.skipNextMining
                              ? 'Jellyfish: skips next mining'
                              : 'Can mine if funded'}
                        </small>
                      </div>
                    ))}
                  </div>
                </section>

                {game.currentEvent && (
                  <section className="panel">
                    <h2>Last Action</h2>

                    <div className="rule-card">
                      <b>{game.currentEvent.title}</b>
                      <p>{game.currentEvent.text}</p>

                      {game.phase !== 'card-reveal' && game.currentEvent.privateNote && (
                        <p>{game.currentEvent.privateNote}</p>
                      )}
                    </div>
                  </section>
                )}

                {game.phase === 'ledger-confirmation' && game.ledgerChanges?.length > 0 && (
                  <section className="panel">
                    <h2>
                      <img src={ledgerIcon} alt="" /> Ledger Update
                    </h2>

                    <div className="ledger-confirm-list">
                      {game.ledgerChanges.map((change) => (
                        <div key={change.id} className="ledger-confirm-row">
                          <span>{change.name}</span>
                          <b>
                            {change.before} → {change.after}
                          </b>
                          <small>
                            {change.difference >= 0 ? '+' : ''}
                            {change.difference}
                          </small>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="panel">
                  <h2>
                    <img src={ledgerIcon} alt="" /> Shared Scoreboard / Ledger
                  </h2>

                  <div className="shared-scoreboard">
                    {players.map((player, index) => (
                      <div key={player.id} className="score-row">
                        <div className="score-name">
                          <img src={PAWNS[index + 1]} alt="" />
                          <span>{player.name}</span>
                        </div>

                        <div className="score-track">
                          <span
                            className="marker"
                            style={{
                              left: `${Math.min(100, Math.max(0, player.coins))}%`,
                              background: player.color
                            }}
                          />
                        </div>

                        <b>{player.coins}</b>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="panel">
                  <h2>
                    <img src={chainIcon} alt="" /> Blockchain
                  </h2>

                  <div className="blocks-list">
                    {game.blocks.map((block) => (
                      <div key={block.id} className="block-card">
                        <img src={chainIcon} alt="" />

                        <div>
                          <strong>{block.title}</strong>
                          <p>Miner: {block.miner}</p>
                          <p>Card: {face(block.card)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </aside>
            </main>
          </>
        )}

        {game?.phase === 'card-reveal' && game?.currentEvent && isMyCardReveal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="lesson-card">
                <b>Blockchain hint</b>
                <p>{game.currentEvent.lesson}</p>
              </div>

              <h2>Pick Up Your Transaction Card</h2>

              <p>{game.currentEvent.text}</p>

              <button className="click-card" onClick={() => setCardRevealed(true)}>
                <img
                  src={getCardImage(game.currentEvent.card, cardRevealed)}
                  alt=""
                  className="card-back-only"
                />

                {!cardRevealed && <span>Click card to reveal</span>}
              </button>

              {cardRevealed && (
                <div className="rule-card">
                  <b>{game.currentEvent.note}</b>
                  <p>{game.currentEvent.privateNote}</p>
                </div>
              )}

              <button className="primary-btn" disabled={!cardRevealed} onClick={continueAfterCard}>
                Keep Card and Continue
              </button>
            </div>
          </div>
        )}

        {game?.phase === 'mining' && game?.miningOffer && isMyMiningTurn && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="lesson-card">
                <b>Mining explained</b>
                <p>Mining is not digging. It means validating transactions and competing to create the next block.</p>
              </div>

              <h2>Your Mining Choice</h2>

              {game.miningOffer.blocked ? (
                <>
                  <div className="rule-card">
                    <b>Cannot Mine</b>
                    <p>{game.miningOffer.reason}</p>
                  </div>

                  <button className="primary-btn" onClick={skipMining}>
                    Continue
                  </button>
                </>
              ) : (
                <>
                  <div className="validation-table">
                    <div>
                      <small>Previous Winning Card</small>
                      <strong>{face(game.winningCard)}</strong>
                    </div>

                    <div>
                      <small>Your mining card</small>
                      <strong>{face(game.miningOffer.selected)}</strong>
                    </div>
                  </div>

                  <div className="card-choice-grid">
                    {game.miningOffer.cards.map((card) => (
                      <button
                        key={card.id}
                        className={`mining-card ${game.miningOffer.selected?.id === card.id ? 'selected-mining-card' : ''}`}
                        onClick={() => selectMiningCard(card.id)}
                      >
                        <span>{face(card)}</span>
                        <small>{game.miningOffer.selected?.id === card.id ? 'Selected' : 'Click to select'}</small>
                      </button>
                    ))}
                  </div>

                  <button className="primary-btn" onClick={joinMining}>
                    Pay 1 and Mine
                  </button>

                  <button className="secondary-btn" onClick={skipMining}>
                    Skip Mining
                  </button>
                </>
              )}
            </div>
          </div>
        )}

                {showRules && (
          <div className="modal-overlay">
            <div className="modal-card wide">
              <h2>Rules</h2>

              <div className="rules-scroll">
                <div className="rule-card">
                  <b>Start</b>
                  <p>
                    Each player starts with 50 Istoken. The host starts the online room game.
                    The game lasts 10 rounds.
                  </p>
                </div>

                <div className="rule-card">
                  <b>Movement</b>
                  <p>
                    Only the player whose turn it is can roll the dice. After rolling, that player
                    moves clockwise and picks up a transaction card from the square they landed on.
                  </p>
                </div>

                <div className="rule-card">
                  <b>Card pickup</b>
                  <p>
                    The card first appears face down. The current player clicks it to reveal the
                    illustrated transaction card. The effect is applied after mining.
                  </p>
                </div>

                <div className="rule-card">
                  <b>Mining</b>
                  <p>
                    During mining, each active player gets a chance to pay 1 Istoken and compete to
                    validate the round. The mining winner receives 5 Istoken and creates the next block.
                  </p>
                </div>

                <div className="rule-card">
                  <b>Ledger confirmation</b>
                  <p>
                    After every round, all active players must confirm the shared ledger. The next round
                    starts only after everyone confirms.
                  </p>
                </div>

                <div className="rule-card">
                  <b>Winning</b>
                  <p>
                    The game ends after round 10. The active player with the most Istoken wins.
                    The game can also end earlier if only one active player remains.
                  </p>
                </div>
              </div>

              <button className="primary-btn" onClick={() => setShowRules(false)}>
                Close
              </button>
            </div>
          </div>
        )}

        {showStory && (
          <div className="modal-overlay">
            <div className="story-modal">
              <button className="close-btn" onClick={() => setShowStory(false)}>
                ×
              </button>

              <img src={STORY_IMAGES[storyIndex]} alt="" />

              <div className="story-controls">
                <button
                  className="secondary-btn"
                  disabled={storyIndex === 0}
                  onClick={() => setStoryIndex((index) => index - 1)}
                >
                  Previous
                </button>

                <span>
                  {storyIndex + 1} / {STORY_IMAGES.length}
                </span>

                <button
                  className="primary-btn"
                  disabled={storyIndex === STORY_IMAGES.length - 1}
                  onClick={() => setStoryIndex((index) => index + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}