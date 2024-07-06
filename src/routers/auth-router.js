import express from 'express'
import AuthService from '../services/auth-service.js'
import verifyToken from '../middlewares/verify-token.js'

const authRouter = express.Router()

authRouter.post("/sign-up", async (request, response) => {
  try {
    const session = await AuthService.signUp(request.body)

    response.status(200).json(session)
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

authRouter.post("/log-in", async (request, response) => {
  try {
    const { email, password } = request.body

    const session = await AuthService.logIn(email, password)

    response.status(200).json(session)
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

authRouter.post("/log-out", verifyToken, async (request, response) => {
  try {
    const { sessionId } = request.body

    await AuthService.logOut(sessionId)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

authRouter.post("/change-email", verifyToken, async (request, response) => {
  try {
    const { playerId, email, password } = request.body

    await AuthService.changeEmail(playerId, email, password)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

authRouter.post("/change-password", verifyToken, async (request, response) => {
  try {
    const { playerId, oldPassword, newPassword } = request.body

    await AuthService.changePassword(playerId, oldPassword, newPassword)

    response.status(200).json()
  } catch (error) {
    response.status(400).json(error.toString())
  }
})

export default authRouter
