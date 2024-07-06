import express from 'express'
import PlayersService from '../services/players-service.js'
import verifyToken from '../middlewares/verify-token.js'

const playersRouter = express.Router()

playersRouter.use(verifyToken)

playersRouter.post("/edit", async (request, response) => {
  try {
    const { playerId, ...fields } = request.body

    await PlayersService.edit(playerId, fields)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

playersRouter.post("/delete", async (request, response) => {
  try {
    const { playerId } = request.body

    await PlayersService.delete(playerId)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

playersRouter.post("/find-by-id", async (request, response) => {
  try {
    const { playerId } = request.body

    const player = await PlayersService.findById(playerId)

    response.status(200).json(player)
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

playersRouter.post("/add-badge", async (request, response) => {
  try {
    const { playerId, badgeId } = request.body

    await PlayersService.addBadge(playerId, badgeId)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

playersRouter.post("/increment-campaign-level", async (request, response) => {
  try {
    const { playerId } = request.body

    await PlayersService.incrementCampaignLevel(playerId)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

playersRouter.post("/update-score", async (request, response) => {
  try {
    const { playerId, differential } = request.body

    await PlayersService.updateScore(playerId, differential)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

export default playersRouter
