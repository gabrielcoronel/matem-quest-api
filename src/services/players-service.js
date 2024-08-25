import knexClient from '../shared/database-connection.js'

const getCurrentScoringPeriod = () => {
  const currentDate = new Date()
  const currentScoringPeriod = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth()
  )

  return currentScoringPeriod
}

const getPlayerInformation = async (playerId) => {
  const currentScoringPeriod = getCurrentScoringPeriod()

  const result = await knexClient.raw(`
      SELECT
        player.player_id,
        player.name,
        player.first_surname,
        player.second_surname,
        player.email,
        json_agg(badge) as badges,
        campaign.achieved_level AS campaign_level,
        score.points AS ranked_score
      FROM player
      LEFT JOIN player_badge ON player.player_id = player_badge.player_id
      LEFT JOIN badge ON player_badge.badge_id = badge.badge_id
      LEFT JOIN score ON player.player_id = score.player_id
      JOIN campaign ON player.player_id = campaign.player_id
      WHERE player.player_id = :playerId
      GROUP BY
        player.player_id,
        campaign.achieved_level,
        score.points
      LIMIT 1
    `,
    {
      playerId
    }
  )
  const playerInformation = result.rows[0]

  return playerInformation
}

const deletePlayer = async (playerId) => {
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
}

const updatePlayerScore = async (playerId, differential, scoringPeriod) => {
  await knexClient.transaction(async (transaction) => {
    const scores = await transaction("score")
      .where({
        player_id: playerId
      })
      .andWhere("period", ">=", scoringPeriod)

    if (scores.length == 0) {
      await transaction("score")
        .insert({
          player_id: playerId,
          points: differential,
          period: scoringPeriod
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
}

export default class {
  static async edit(playerId, fields) {
    await knexClient("player")
      .where({
        player_id: playerId
      })
      .update(fields)
  }

  static async delete(playerId) {
    await deletePlayer(playerId)
  }

  static async findById(playerId) {
    const player = await getPlayerInformation(playerId)

    return player
  }

  static async addBadge(playerId, badgeId) {
    await knexClient("player_badge")
      .insert({
        player_id: playerId,
        badge_id: badgeId,
        claiming_time: new Date()
      })
  }

  static async incrementCampaignLevel(playerId) {
    await knexClient("campaign")
      .where({
        player_id: playerId
      })
      .update({
        achieved_level: knexClient.raw("achieved_level + 1")
      })
  }

  static async updateScore(playerId, differential) {
    const currentScoringPeriod = getCurrentScoringPeriod()

    await updatePlayerScore(playerId, differential, currentScoringPeriod)
  }
}
