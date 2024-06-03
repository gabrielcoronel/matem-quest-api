import express from 'express'
import PlayersService from '../services/players-service.js'

const playersRouter = express.Router()

playersRouter.post("/player-edit", (request, response) => {
})

playersRouter.post("/player-delete", (request, response) => {
})

playersRouter.post("/player-find-by-id", (request, response) => {
})

playersRouter.post("/player-add-badge", (request, response) => {
})

playersRouter.post("/player-get-badges", (request, response) => {
})

export default playersRouter
