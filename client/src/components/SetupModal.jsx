import React from 'react'
import { PLAYERS } from '../constants.js'

export default function SetupModal({ names, onChangeName, onStart, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Choose 3 Local Players</h2>
        <div className="form-grid">
          {PLAYERS.map((playerTemplate, index) => (
            <label key={playerTemplate.id}>
              {playerTemplate.label} - {playerTemplate.colorName}
              <input value={names[index]} onChange={(e) => onChangeName(index, e.target.value)} />
            </label>
          ))}
        </div>
        <button className="primary-btn" onClick={onStart}>Begin Game</button>
        <button className="secondary-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
