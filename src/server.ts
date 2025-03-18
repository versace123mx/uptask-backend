import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db'
import authRoutes from './routes/authRoutes'
import router from './routes/projectRoutes'

dotenv.config()
import { corsOptions } from './config/cors'


//llamada a la conexion de la DB
connectDB()

const server = express()


//aqui esta la configuracion de cors
server.use(cors(corsOptions))


//leer datos de formulario desde donde se hace la peticion y esta configuracion es para que express pueda leer dichos datos
server.use(express.json())

//detalles de las peticiones del API
server.use(morgan('dev'))

//Esta es la entrada al router
server.use('/api/auth', authRoutes)
server.use('/api/project', router)


// Middleware para manejar rutas no encontradas
server.use((req, res) => {
    const error = new Error('Ruta no invalida')
    res.status(404).json({ error: error.message })
});


export default server