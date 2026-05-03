import React from 'react'
import { CARD_BACK_IMAGES } from '../constants.js'
import { getCardFace } from '../gameUtils.js'

export default function MiningModal({ miner, winningCard, miningChoice, getMiningBlockReason, onJoin, onSkip, onSelectCard }) {
  const blockReason = getMiningBlockReason(miner)

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{miner.label} / {miner.colorName}: {miner.name}</h2>
        {blockReason ? (
          <>
            <div className="rule-card"><b>Cannot Mine</b><p>{blockReason}</p></div>
            <button className="primary-btn" onClick={onSkip}>Continue</button>
          </>
        ) : (
          <>
            <p>Winning Card: <b>{getCardFace(winningCard)}</b></p>
            <div className="card-display">
              <img src={CARD_BACK_IMAGES[miner.transactionCard.kind]} alt="" />
              <div>
                <h3>Your hidden card</h3>
                <p>{miner.transactionCard.title}: {miner.transactionCard.text}</p>
                <b>{getCardFace(miner.transactionCard)}</b>
              </div>
            </div>
            <div className="mining-cards">
              {miningChoice?.cards.map((card, i) => (
                <button key={i} className={`mining-card ${miningChoice.selected === card ? 'selected-mining-card' : ''}`} onClick={() => onSelectCard(card)}>
                  <span>{getCardFace(card)}</span>
                  <small>{miningChoice.selected === card ? 'Selected' : 'Choose card'}</small>
                </button>
              ))}
            </div>
            <button className="primary-btn" onClick={onJoin}>Pay 1 and Mine</button>
            <button className="secondary-btn" onClick={onSkip}>Skip Mining</button>
          </>
        )}
      </div>
    </div>
  )
}
