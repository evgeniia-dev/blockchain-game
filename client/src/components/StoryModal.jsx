import React from 'react'
import { STORY_IMAGES } from '../constants.js'

export default function StoryModal({ storyIndex, onPrev, onNext, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="story-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        <img src={STORY_IMAGES[storyIndex]} alt="" />
        <div className="story-controls">
          <button className="secondary-btn" disabled={storyIndex === 0} onClick={onPrev}>Previous</button>
          <span>{storyIndex + 1} / {STORY_IMAGES.length}</span>
          <button className="primary-btn" disabled={storyIndex === STORY_IMAGES.length - 1} onClick={onNext}>Next</button>
        </div>
      </div>
    </div>
  )
}
