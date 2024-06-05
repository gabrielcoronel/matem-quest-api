import { config } from "dotenv"
config()

import knex from 'knex'

const knexClient = knex({
  client: "pg",
  connection: process.env.POSTGRESQL_CONNECTION_STRING
})

export default knexClient