import express from 'express'
import { router } from './src/routes/routes'
import { errorHandler } from './src/middlewares/handle-error'

const app = express()
const port = process.env.PORT || 3000

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