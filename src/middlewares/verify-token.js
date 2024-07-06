import jsonWebToken from 'jsonwebtoken'
import knexClient from '../shared/database-connection.js'

const decodeJsonWebToken = (token) => {
  const secret = process.env.JWT_SECRET
  const payload = jsonWebToken.verify(token, secret)

  return payload
}

const isValidSessionId = async (sessionId) => {
  const sessions = await knexClient("session")
    .where({
      session_id: sessionId
    })
    .select("*")
  const sessionIsValid = sessions.length !== 0

  return sessionIsValid
}

export default async (request, response, nextHandler) => {
  const token = request.get("token")

  if (!token) {
    return response.status(400).json("INVALID_TOKEN")
  }

  let payload = null

  try {
    payload = decodeJsonWebToken(token)
  } catch (error) {
    return response.status(400).json("INVALID_TOKEN")
  }

  if (!(await isValidSessionId(payload.session_id))) {
    return response.status(400).json("INVALID_TOKEN")
  }

  nextHandler()
}
