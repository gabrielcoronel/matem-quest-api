import { config } from "dotenv"
config()

import express from "express"
import bodyParser from "body-parser"
import morgan from "morgan"
// prueba
import AuthService from './services/auth-service.js'

const server = express() 

server.use(bodyParser.json())
server.use(morgan("combined"))

AuthService.changePassword(
    9,
    "adios",
    "yupi"
).then((session) => console.log(session))

server.listen(process.env.API_PORT)