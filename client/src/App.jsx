import React, { useState } from 'react'
import './index.css'

import {
  background,
  chestIcon,
  chainIcon,
  ledgerIcon,
  crystalIcon,
  STORY_IMAGES,
  DICE_IMAGES,
  PAWN_IMAGES,
  CARD_BACK_IMAGES,
  PLAYERS,
  BOARD
} from './constants.js'

import { getCardFace } from './gameUtils.js'
import { useGame } from './useGame.js'
import HomeScreen from './components/HomeScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import SetupModal from './components/SetupModal.jsx'
import RulesModal from './components/RulesModal.jsx'
import StoryModal from './components/StoryModal.jsx'
import EventModal from './components/EventModal.jsx'
import MiningModal from './components/MiningModal.jsx'
import WinnerModal from './components/WinnerModal.jsx'

export { background, chestIcon, chainIcon, ledgerIcon, crystalIcon, STORY_IMAGES, DICE_IMAGES, PAWN_IMAGES, CARD_BACK_IMAGES, PLAYERS, BOARD, getCardFace }

export default function App() {
  const [screen, setScreen] = useState('home')
  const [showSetup, setShowSetup] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)
  const [names, setNames] = useState(['Player 1', 'Player 2', 'Player 3'])

  const game = useGame()

  function handleStartGame() {
    game.startGame(names)
    setShowSetup(false)
    setScreen('game')
  }

  return (
    <div className="app-shell" style={{ backgroundImage: `url(${background})` }}>
      <div className="app-overlay">
        {screen === 'home' && (
          <HomeScreen onShowSetup={() => setShowSetup(true)} onShowRules={() => setShowRules(true)} onShowStory={() => setShowStory(true)} />
        )}
        {screen === 'game' && <GameScreen game={game} />}

        {showSetup && (
          <SetupModal names={names} onChangeName={(index, value) => setNames(names.map((n, i) => i === index ? value : n))} onStart={handleStartGame} onClose={() => setShowSetup(false)} />
        )}
        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
        {showStory && (
          <StoryModal storyIndex={storyIndex} onPrev={() => setStoryIndex((i) => i - 1)} onNext={() => setStoryIndex((i) => i + 1)} onClose={() => setShowStory(false)} />
        )}
        {game.currentEvent && (
          <EventModal event={game.currentEvent} eventIndex={game.eventIndex} queueLength={game.eventQueue.length} onContinue={game.continueEvent} />
        )}
        {game.phase === 'mining' && game.miner && !game.currentEvent && (
          <MiningModal miner={game.miner} winningCard={game.winningCard} miningChoice={game.miningChoice} getMiningBlockReason={game.getMiningBlockReason} onJoin={game.joinMining} onSkip={game.skipMining} onSelectCard={(card) => game.setMiningChoice({ ...game.miningChoice, selected: card })} />
        )}
        {game.winner && <WinnerModal winner={game.winner} onHome={() => setScreen('home')} />}
      </div>
    </div>
  )
}
