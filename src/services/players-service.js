import knexClient from '../shared/database-connection.js'

const getCurrentScoringPeriod = () => {
  const currentDate = new Date()
  const currentScoringPeriod = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()
  )

  return currentScoringPeriod
}

const getPlayerInformation = async (playerId, currentScoringPeriod) => {
  try {
    const result = await knexClient.raw(`
        SELECT
          player.player_id AS player_id,
          player.name AS name,
          player.first_surname AS first_surname,
          player.second_surname AS second_surname,
          player.email AS email,
          json_agg(badge) AS badges,
          campaign.achieved_level AS campaign_level,
          score.points AS score
        FROM player
        INNER JOIN player_badge ON player.player_id = player_badge.player_id
        FULL OUTER JOIN badge ON player_badge.badge_id = badge.badge_id
        INNER JOIN campaign ON player.player_id = campaign.player_id
        FULL OUTER JOIN score ON player.player_id = score.player_id
        WHERE player.player_id = :playerId
        GROUP BY
          player.player_id,
          campaign.achieved_level,
          score.points
        LIMIT 1
      `, {
      playerId,
      currentScoringPeriod
    })
    const playerInformation = result.rows[0]

    return playerInformation
  } catch (error) {
    throw error
  }
}

const performDelete = async (playerId) => {
  try {
    await knexClient.transaction(async (transaction) => {
      await transaction("player")
        .where({
          player_id: playerId
        })
        .del()

      await transaction("campaign")
        .where({
          player_id: playerId
        })
        .del()

      await transaction("score")
        .where({
          player_id: playerId
        })
        .del()

      await transaction("player_badge")
        .where({
          player_id: playerId
        })
        .del()

      await transaction("session")
        .where({
          player_id: playerId
        })
        .del()

      await transaction.commit()
    })
  } catch (error) {
    throw error
  }
}

export default class {
  static async edit(playerId, fields) {
    try {
      await knexClient("player")
        .where({
          player_id: playerId
        })
        .update(fields)
    } catch (error) {
      throw error
    }
  }

  static async delete(playerId) {
    await performDelete(playerId)
  }

  static async findById(playerId) {
    const currentScoringPeriod = getCurrentScoringPeriod()

    const player = await getPlayerInformation(playerId, currentScoringPeriod)

    return player
  }

  static async addBadge(playerId, badgeId) {
    try {
      await knexClient("player_badge")
        .insert({
          player_id: playerId,
          badge_id: badgeId,
          claiming_time: new Date()
        })
    } catch (error) {
      throw error
    }
  }

  static async incrementCampaignLevel(playerId) {
    try {
      await knexClient("campaign")
        .where({
          player_id: playerId
        })
        .update({
          achieved_level: knexClient.raw("achieved_level + 1")
        })
    } catch (error) {
      throw error
    }
  }

  static async updateScore(playerId, differential) {
    const currentScoringPeriod = getCurrentScoringPeriod()

    try {
      await knexClient.transaction(async (transaction) => {
        const scores = await transaction("score")
          .where({
            player_id: playerId
          })
          .andWhere("period", ">=", currentScoringPeriod)

        if (scores.length == 0) {
          await transaction("score")
            .insert({
              player_id: playerId,
              points: differential,
              period: currentScoringPeriod
            })

            return
        }

        const currentScore = scores[0]

        await transaction("score")
          .where({
            score_id: currentScore.score_id
          })
          .update({
            points: knexClient.raw(
              "points + :differential",
              {
                differential
              }
            )
          })
      })
    } catch (error) {
      throw error
    }
  }
}
