import mongoose from "mongoose";
import colors from 'colors'
import { exit } from 'node:process';

//esta es la funcion para la conexion a la base de datos
export const connectDB = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${colors.cyan.bold(`Mongo Host`)}:${colors.green.bold(`${connection.host}`)} : ${colors.cyan.bold(`Puerto`)}:${colors.green.bold(`${connection.port}`)} : ${colors.cyan.bold(`DB-name`)}:${colors.green.bold(`${connection.name}`)}`
        console.log(url)
    } catch (error) {
        console.log(error.message)
        exit(1)//para terminar el proceso asincrono
    }
}