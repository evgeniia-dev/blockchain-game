import React from 'react'
import { chestIcon } from '../constants.js'

export default function HomeScreen({ onShowSetup, onShowRules, onShowStory }) {
  return (
    <>
      <header className="top-bar">
        <div>
          <p className="eyebrow">Market Island</p>
          <h1>Treasure Chain Board Game</h1>
        </div>
        <div className="top-stats">
          <div className="pill-box"><span>Start</span><strong>50 Istoken</strong></div>
          <div className="pill-box"><span>Mining</span><strong>1 cost / 5 reward</strong></div>
        </div>
      </header>

      <main className="home-layout">
        <section className="panel home-hero">
          <img src={chestIcon} alt="" className="hero-icon" />
          <h2>Welcome to Market Island</h2>
          <p>Three local players move clockwise, draw hidden cards, mine blocks, and update one shared digital scoreboard.</p>
          <div className="home-buttons">
            <button className="primary-btn" onClick={onShowSetup}>Start Game</button>
            <button className="secondary-btn" onClick={onShowRules}>Instructions</button>
            <button className="secondary-btn" onClick={onShowStory}>Read the Story</button>
          </div>
        </section>
      </main>
    </>
  )
}
