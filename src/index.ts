import express from 'express'
import cors from 'cors'
import { router } from './routes/routes'
import { errorHandler } from './middlewares/handle-error'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
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