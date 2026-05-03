import React from 'react'
import { CARD_BACK_IMAGES } from '../constants.js'

export default function EventModal({ event, eventIndex, queueLength, onContinue }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{event.title}</h2>
        <img src={event.icon} alt="" className="event-icon" />
        <p>{event.text}</p>
        {event.card && (
          <div className="card-display">
            <img src={CARD_BACK_IMAGES[event.card.kind]} alt="" />
            <div>
              <h3>{event.note}</h3>
              <p>{event.privateNote}</p>
            </div>
          </div>
        )}
        {!event.card && <div className="rule-card"><b>{event.note}</b><p>{event.privateNote}</p></div>}
        <button className="primary-btn" onClick={onContinue}>{eventIndex < queueLength - 1 ? 'Next Player' : 'Continue'}</button>
      </div>
    </div>
  )
}
