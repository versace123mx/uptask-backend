import { CorsOptions } from 'cors'

//Permitir conexiones con CORS, controlar quien puede consumir recursos del API
const whitelist = [process.env.CORS_URL_DESARROLLO, process.env.CORS_URL_PROUDCCION]

export const corsOptions: CorsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            return callback(new Error('No permitido por CORS')); // Rechaza peticiones sin origin
        }
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('No permitido por CORS'))
        }
    }
}