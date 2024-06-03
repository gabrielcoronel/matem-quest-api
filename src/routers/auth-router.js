import express from 'express'
import AuthService from '../services/auth-service.js'

const authRouter = express.Router()

authRouter.post("/player-sign-up", (request, response) => {
})

authRouter.post("/player-log-in", (request, response) => {
})

authRouter.post("/player-log-out", (request, response) => {
})

authRouter.post("/player-change-email", (request, response) => {
})

authRouter.post("/player-change-password", (request, response) => {
})

export default authRouter
