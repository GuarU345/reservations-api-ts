import express from 'express'
import { router } from './src/routes/routes'

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.get('/', (_req, res) => {
    res.json({ message: 'api is healthy' })
})
app.use("/api", router)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})