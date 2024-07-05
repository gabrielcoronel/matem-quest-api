import express from 'express'
import ScoringService from '../services/scoring-service.js'

const scoringRouter = express.Router()

scoringRouter.post("/get-ranking", async (request, response) => {
  try {
    const { scoringPeriod } = request.body

    const ranking = await ScoringService.getRanking(scoringPeriod)

    response.status(200).json(ranking)
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

export default scoringRouter
