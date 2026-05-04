import express from 'express'
import cors from 'cors'
import {
  isGameActive,
  startGame,
  getGameState,
  processPlayerRoll,
  processPlayerMining
} from './gameState.js'

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.post('/api/game/start', (req, res) => {
  const { playerCount, names } = req.body

  if (![2, 3, 4].includes(playerCount)) {
    return res.status(400).json({ error: 'Player count must be 2, 3, or 4.' })
  }

  const safeNames = Array.isArray(names) ? names : []
  return res.json({ state: startGame(playerCount, safeNames) })
})

app.get('/api/game/state', (req, res) => {
  if (!isGameActive()) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  return res.json({ state: getGameState() })
})

app.post('/api/game/player-roll', (req, res) => {
  if (!isGameActive()) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  const result = processPlayerRoll()
  if (result.error) return res.status(400).json({ error: result.error })
  return res.json({ state: result.state })
})

app.post('/api/game/player-mine', (req, res) => {
  if (!isGameActive()) {
    return res.status(404).json({ error: 'No game found. Start a new game first.' })
  }

  const { willMine } = req.body
  const result = processPlayerMining(Boolean(willMine))
  if (result.error) return res.status(400).json({ error: result.error })
  return res.json({ state: result.state })
})

app.listen(PORT, () => {
  console.log(`Market Island server running on http://localhost:${PORT}`)
})
