import React from 'react'

export default function RulesModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card wide">
        <h2>Rules</h2>
        <div className="rules-scroll">
          <div className="rule-card"><b>Start of the Game</b><p>Each player chooses a colour and takes 2 pawns. Each player starts with 50 Istoken. The first Winning Card is drawn from the standard deck.</p></div>
          <div className="rule-card"><b>Phase 1 - Moving</b><p>Each player rolls the dice, moves clockwise, and draws one hidden card. Income spaces give Income cards, Expense spaces give Expense cards, and Action spaces give Action cards.</p></div>
          <div className="rule-card"><b>Special Corners</b><p>Cross Start - gain 4. Land on Start - draw Action. Jellyfish - draw Expense and pay 1. Fire - draw Income and gain 1. Totem - draw Action and skip mining this round.</p></div>
          <div className="rule-card"><b>Phase 2 - Mining</b><p>Each player draws a standard card and decides whether to mine. Mining costs 1 Istoken. Axe lets the player draw two standard cards and choose one.</p></div>
          <div className="rule-card"><b>Scoring</b><p>Compare each mining card with the previous Winning Card and all players' drawn cards. Gain 1 point for each matching rank and 1 point for each matching suit.</p></div>
          <div className="rule-card"><b>Block Reward</b><p>The mining winner gets 5 Istoken. The winner's standard card becomes the next Winning Card.</p></div>
          <div className="rule-card"><b>Ledger</b><p>After mining, all hidden cards are executed and the shared scoreboard updates.</p></div>
        </div>
        <button className="primary-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
