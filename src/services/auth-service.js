import knexClient from '../shared/database-connection.js'
import bcrypt from 'bcrypt'
import jsonWebToken from 'jsonwebtoken'

const generateJsonWebToken = (payload) => {
  const secret = process.env.JWT_SECRET
  const token = jsonWebToken.sign(payload, secret, { expiresIn: "2h" })

  return token
}

const createSession = async (playerId, databaseClient) => {
  const [sessionFromDatabase] = await databaseClient("session")
    .insert({
      player_id: playerId,
      issue_time: new Date()
    })
    .returning(["session_id", "player_id", "issue_time"])

  const token = generateJsonWebToken(sessionFromDatabase)
  const session = {
    player_id: sessionFromDatabase.player_id,
    token
  }

  return session
}

const hashPassword = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 10)

  return hashedPassword
}

const compareHashedPassword = async (hashedPassword, test) => {
  const comparisonResult = await bcrypt.compare(test, hashedPassword)

  return comparisonResult
}

const isEmailSignedUp = async (email) => {
  const [{ count }] = await knexClient("player")
    .where({
      email
    })
    .count("email")

  return count > 0
}

const findPlayerByEmail = async (email) => {
  const players = await knexClient("player")
    .where({
      email
    })
    .select("*")

  if (players.length == 0) {
    return null
  }

  return players[0]
}

const findPlayerById = async (playerId) => {
  const players = await knexClient("player")
    .where({
      player_id: playerId
    })
    .select("*")

  if (players.length == 0) {
    return null
  }

  return players[0]
}

const signUpPlayer = async (player) => {
  const session = await knexClient.transaction(async (transaction) => {
    const hashedPassword = await hashPassword(player.password)

    const [{ player_id: playerId }] = await transaction("player")
      .insert({
        name: player.name,
        first_surname: player.first_surname,
        second_surname: player.second_surname,
        email: player.email,
        hashed_password: hashedPassword
      })
      .returning(["player_id"])

    await transaction("campaign")
      .insert({
        player_id: playerId,
        achieved_level: 0
      })

    const session = await createSession(playerId, transaction)

    return session
  })

  return session
}

const updatePlayerEmail = async (playerId, newEmail) => {
  await knexClient("player")
    .where({
      player_id: playerId
    })
    .update({
      email: newEmail
    })
}

const updatePlayerPassword = async (playerId, newPassword) => {
  const hashedPassword = await hashPassword(newPassword)

  await knexClient("player")
    .where({
      player_id: playerId
    })
    .update({
      hashed_password: hashedPassword
    })
}

export default class {
  static async signUp(player) {
    if (await isEmailSignedUp(player.email)) {
      throw new Error("EMAIL_ALREADY_SIGNED_UP")
    }

    const session = await signUpPlayer(player)

    return session
  }

  static async logIn(email, password) {
    const player = await findPlayerByEmail(email)

    if (player === null) {
      throw new Error("EMAIL_NOT_FOUND")
    }

    if (!(await compareHashedPassword(player.hashed_password, password))) {
      throw new Error("WRONG_PASSWORD")
    }

    const session = await createSession(player.player_id, knexClient)

    return session
  }

  static async logOut(sessionId) {
    await knexClient("session")
      .where({
        session_id: sessionId
      })
      .del()
  }

  static async changeEmail(playerId, newEmail, password) {
    const player = await findPlayerById(playerId)

    if (!(await compareHashedPassword(player.hashed_password, password))) {
      throw new Error("WRONG_PASSWORD")
    }

    await updatePlayerEmail(playerId, newEmail)
  }

  static async changePassword(playerId, oldPassword, newPassword) {
    const player = await findPlayerById(playerId)

    if (!(await compareHashedPassword(player.hashed_password, oldPassword))) {
      throw new Error("WRONG_PASSWORD")
    }

    await updatePlayerPassword(playerId, newPassword)
  }
}
