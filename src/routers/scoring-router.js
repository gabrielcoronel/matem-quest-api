import express from 'express'
import ScoringService from '../services/scoring-service.js'

const scoringRouter = express.Router()

scoringRouter.post("/score-update", (request, response) => {
})

scoringRouter.post("/ranking-get", (request, response) => {
})

export default scoringRouter
