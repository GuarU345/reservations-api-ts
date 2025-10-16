import express from 'express'
import cors from 'cors'
import { router } from './routes/routes'
import { errorHandler } from './middlewares/handle-error'
import { prisma } from './utils/prisma'

const app = express()
const port = process.env.PORT || 3000

prisma.$connect()
    .then(() => {
        console.log('Connected to the database')
    })
    .catch((error) => {
        console.error('Error connecting to the database', error)
    })

app.use(cors())
app.use(express.json())
app.use((req, _res, next) => {
    console.log('Petición entrante: body', req.body)
    console.log('Petición entrante: params', req.params)

    next()
})
app.get('/', (_req, res) => {
    res.json({ message: 'api is healthy' })
})
app.use("/api", router)
app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})