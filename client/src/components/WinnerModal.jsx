import React from 'react'

export default function WinnerModal({ winner, onHome }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Game Complete</h2>
        <p>{winner}</p>
        <button className="primary-btn" onClick={onHome}>Back Home</button>
      </div>
    </div>
  )
}
