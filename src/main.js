import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
import { config } from "dotenv"

config()

const server = express() 

server.use(bodyParser.json())
server.use(morgan("combined"))

server.listen(process.env.API_PORT)