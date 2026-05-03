import React from 'react'
import { BOARD, PAWN_IMAGES, DICE_IMAGES } from '../constants.js'
import { getCardFace } from '../gameUtils.js'

export default function GameBoard({ players, winningCard, diceValue, phase, winner, onPlayRound }) {
  return (
    <div className="board">
      {BOARD.map((tile) => (
        <div key={tile.id} className={`board-tile tile-${tile.type}`} style={{ gridColumn: tile.pos[0], gridRow: tile.pos[1] }}>
          <img src={tile.icon} alt="" />
          <span>{tile.name}</span>
          <div className="pawn-row">
            {players.filter((player) => player.active && player.position === tile.id).map((player) => (
              <img key={player.id} className="pawn-img" src={PAWN_IMAGES[player.id]} alt={`${player.label} ${player.name}`} />
            ))}
          </div>
        </div>
      ))}

      <div className="board-center">
        <img src={DICE_IMAGES[diceValue]} alt="" className="dice-img" />
        <h3>Winning Card: {getCardFace(winningCard)}</h3>
        <p>Phase: {phase}</p>
        <button className="primary-btn" disabled={phase !== 'ready' || winner} onClick={onPlayRound}>Play Next Round</button>
      </div>
    </div>
  )
}
