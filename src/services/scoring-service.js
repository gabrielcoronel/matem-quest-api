import knexClient from '../shared/database-connection.js'

export default class {
  static async getRanking(scoringPeriod) {
    const RANKING_LENGTH = 20

    const ranking = await knexClient("score")
      .join("player", "player.player_id", "=", "score.player_id")
      .where({
        period: scoringPeriod
      })
      .select(
        "player.name as name",
        "player.first_surname as first_surname",
        "player.second_surname as second_surname",
        "score.points as score"
      )
      .orderBy("score.points", "desc")
      .limit(RANKING_LENGTH)

    return ranking
  }
}
