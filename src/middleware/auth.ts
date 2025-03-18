import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'

/**
 * Esta parte extiende la interfaz Request que proporciona Express para incluir una nueva propiedad llamada user, que será opcional (user?).
 * como mandaremos los datos del usuario si existe en el req debemos decirle a Request que ahi estan los datos del usuario
 * entonces la interface de req:Request no entiende lo que le mandaremos y por lo tanto hay que sobreescribirlo
 */
declare global {
    namespace Express {
        interface Request {
            user?: IUser
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    //verificamos que la peticion tenga un token de JWT
    const bearer = req.headers.authorization
    if (!bearer) {
        const error = new Error('No Autorizado')
        res.status(401).json({ error: error.message })
        return
    }

    //Esto se hace por que bearer obtiene, bearer asdasdasf78sdf8d7sf
    //como bine la palabra bearer espacio y luego el token, entonces con split entregamos un arreglo y con destructurin obtenemos token
    const [, token] = bearer.split(' ')

    try {

        //aqui verificamos que el token sea valido, si el token tiene otra forma osea se modifico o ya expirto caeria en el catch
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (typeof decoded === 'object' && decoded.id) {

            //consultamos al usuario que esta logueado y extraemos su id, name, email y lo asignamos a req.user
            const user = await User.findById(decoded.id).select('_id name email')
            if (user) {
                //aqui enviamos los datos del usuario en req.user, del usuario logueado
                req.user = user
                next()
            } else {
                res.status(500).json({ error: 'Token no valido' })
                return
            }

        }

    } catch (error) {
        res.status(500).json({ error: 'Token no valido' })
        return
    }

}