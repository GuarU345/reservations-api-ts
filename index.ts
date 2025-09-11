import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (_req, res) => {
    res.json({ message: 'api is healthy' })
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})