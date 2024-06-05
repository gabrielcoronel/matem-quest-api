import { config } from 'dotenv'
config()

import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import authRouter from './routers/auth-router.js'
import playersRouter from './routers/players-router.js'
import scoringRouter from './routers/scoring-router.js'

const server = express() 
const port = process.env.API_PORT

server.use(bodyParser.json())
server.use(morgan("combined"))

server.use("/auth-service", authRouter)
server.use("/players-service", playersRouter)
server.use("/scoring-service", scoringRouter)

server.listen(port, () => console.log(port))