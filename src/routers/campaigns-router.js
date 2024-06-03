import express from 'express'
import CampaignsService from '../services/campaigns-service.js'

const campaignsRouter = express.Router()

campaignsRouter.post("/campaign-increment-level", (request, response) => {
})

export default campaignsRouter
