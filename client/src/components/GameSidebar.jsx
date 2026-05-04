import React from 'react'
import { chainIcon, ledgerIcon, PAWN_IMAGES } from '../constants.js'
import { getCardFace } from '../gameUtils.js'

export default function GameSidebar({ players, blocks }) {
  return (
    <aside className="side-stack">
      <section className="panel">
        <h2>Players</h2>
        <div className="players-list">
          {players.map((player) => (
            <div key={player.id} className={`player-card ${!player.active ? 'player-out' : ''}`}>
              <div className="player-head">
                <img src={PAWN_IMAGES[player.id]} alt="" className="player-pawn-small" />
                <div><strong>{player.label} - {player.colorName}</strong><p>{player.name}</p></div>
                <b>{player.coins}</b>
              </div>
              <small>{player.blockedForever ? 'Totem: cannot mine' : player.skipNextMining ? 'Jellyfish: skips next mining' : 'Can mine if funded'}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2><img src={ledgerIcon} alt="" /> Shared Scoreboard / Ledger</h2>
        <p className="small-note">Keep an eye on the scoreboard.</p>
        <div className="shared-scoreboard">
          {players.map((player) => (
            <div key={player.id} className="score-row">
              <div className="score-name"><img src={PAWN_IMAGES[player.id]} alt="" /><span>{player.name}</span></div>
              <div className="score-track"><span className="marker" style={{ left: `${Math.min(100, Math.max(0, player.coins))}%`, background: player.color }} /></div>
              <b>{player.coins}</b>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2><img src={chainIcon} alt="" /> Blockchain</h2>
        <div className="blocks-list">
          {blocks.map((block) => (
            <div key={block.id} className="block-card">
              <img src={chainIcon} alt="" />
              <div><strong>{block.title}</strong><p>Miner: {block.miner}</p><p>Card: {getCardFace(block.card)}</p></div>
            </div>
          ))}
        </div>
      </section>
    </aside>
  )
}
