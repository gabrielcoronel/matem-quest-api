import { config } from "dotenv"
config()

import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
import PlayersService from "./services/players-service.js"

const server = express() 

server.use(bodyParser.json())
server.use(morgan("combined"))

PlayersService.updateScore(10, 50).then((result) => console.log(result))

server.listen(process.env.API_PORT)