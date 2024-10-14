import express from 'express'
import {connectdb} from './db/connectdb.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/authRoute.js'
import cors from 'cors'
import path from 'path'

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.resolve()

app.use(cors({origin: 'http://localhost:5173', credentials: true}))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)

if(process.env.NODE_ENV = 'production'){
    app.use(express.static(path.join(__dirname, '/frontend/dist')))

    app.get('*', (req, res)=>{
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    })
}

app.listen(PORT, ()=> {
    connectdb()
    console.log(`server is running on port ${PORT}`)
})


