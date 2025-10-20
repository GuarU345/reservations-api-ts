import express from 'express'
import cors from 'cors'
import { router } from './routes/routes'
import { errorHandler } from './middlewares/handle-error'
import webpush from "web-push"

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

webpush.setVapidDetails(
    `mailto:${process.env.VAPID_MAILTO}`,
    process.env.VAPID_PUBLIC_KEY as string,
    process.env.VAPID_SECRET_KEY as string
)

app.use((req, _res, next) => {
    console.log('Peticion entrante: endpoint', req.url)
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