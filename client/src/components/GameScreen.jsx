import React from 'react'
import { getCardFace } from '../gameUtils.js'
import GameBoard from './GameBoard.jsx'
import GameSidebar from './GameSidebar.jsx'

export default function GameScreen({ game }) {
  return (
    <>
      <header className="top-bar">
        <div>
          <p className="eyebrow">Market Island</p>
          <h1>Manual Rule Game</h1>
        </div>
        <div className="top-stats">
          <div className="pill-box"><span>Round</span><strong>{game.round}</strong></div>
          <div className="pill-box"><span>Winning Card</span><strong>{getCardFace(game.winningCard)}</strong></div>
          <div className="pill-box"><span>Active</span><strong>{game.activePlayers.length}</strong></div>
        </div>
      </header>

      <main className="game-layout">
        <section className="panel board-panel">
          <GameBoard
            players={game.players}
            winningCard={game.winningCard}
            diceValue={game.diceValue}
            phase={game.phase}
            winner={game.winner}
            onPlayRound={game.playPhaseOne}
          />
        </section>

        <GameSidebar players={game.players} blocks={game.blocks} />
      </main>
    </>
  )
}
