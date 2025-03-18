import type { Request, Response } from 'express'
import User from '../models/User'
import { checkPassword, hasPassword } from '../utils/auth'
import Token from '../models/Token'
import { generateToken } from '../utils/token'
import { AuthEmail } from '../emails/AuthEmail'
import { generateJWT } from '../utils/jwt'

export class AuthController {

    static createAccount = async (req: Request, res: Response) => {

        try {
            //Del body - de lo que nos enviar por el formulario extraemos el valor del campo password y email
            const { password, email } = req.body

            //Prevenir usuarios duplicados
            const userExists = await User.findOne({ email })
            if (userExists) {
                const error = new Error('El Usuarios ya esta registrado con ese Correo.')
                res.status(409).json({ error: error.message })
                return
            }

            //Creando el usuario

            //aqui se insertan de forma virtual, sin llegar a guardarce por que solo es una copia del modelo
            //esta línea está creando un objeto de usuario en memoria que refleja los datos enviados por el cliente
            const user = new User(req.body)

            //hash Password
            user.password = await hasPassword(password)

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id  //este user.id viene de la instancia de User de lineas mas arriba, desde que se genera el usuario virtual ya tiene un id, y ese es el que utilizamos aqui


            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })


            //guardamos los datos
            //como el guardado de datos no depende uno del otro entonces ejecutamos los dos a la vez con
            //Promise.allSettled
            await Promise.allSettled([user.save(), token.save()])

            res.send('Cuenta Creada Revisa tu email.')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static confirmAccount = async (req: Request, res: Response) => {


        try {

            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
        
            if (!tokenExists) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }
            
            //buscamos al usuario del token y le cambiamos su propiedad confirmed a true, en caso de que el usuario exita
            const user = await User.findById(tokenExists.user)
            if (!user) {
                const error = new Error('Usuario no valido')
                res.status(404).json({ error: error.message })
                return
            }
            
            user.confirmed = true

            //guardamos los cambios y borramos el token del modelo de Token
            await Promise.allSettled([
                user.save(),
                tokenExists.deleteOne()
            ])

            res.status(201).send('Usuario validado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static login = async (req: Request, res: Response) => {

        try {

            const { email, password } = req.body
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('Usuario no valido')
                res.status(404).json({ error: error.message })
                return
            }

            if(!user.confirmed){

                //Generamos un nuevo token
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()


                //Enviar Email
                AuthEmail.sendConfirmationEmail({
                    email: user.email,
                    name: user.name,
                    token: token.token
                })


                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un nuevo token a tu correo')
                res.status(401).json({ error: error.message })
                return
            }

            //Revisar password 
            const isPasswordCorrect = await checkPassword(password,user.password)
            if(!isPasswordCorrect){
                const error = new Error('Password Incorrecto')
                res.status(401).json({ error: error.message })
                return
            }

            const token = generateJWT({id:user.id})
            res.send(token)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error En el Login' })
        }
    }

    static requestConfirmationCode = async (req: Request, res: Response) => {

        try {
            //Del body - de lo que nos enviar por el formulario extraemos el valor del campo password y email
            const { email } = req.body
            
            //Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuarios no esta registrado.')
                res.status(404).json({ error: error.message })
                return
            }
            
            //verificamos si el usuario ya esta confirmado para no estar enviando emails
            if(user.confirmed){
                const error = new Error('El Usuarios ya ha sido confirmado.')
                res.status(403).json({ error: error.message })
                return
            }

            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id  //este user.id viene de la instancia de User de lineas mas arriba, desde que se genera el usuario virtual ya tiene un id, y ese es el que utilizamos aqui


            //Enviar Email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })


            //guardamos los datos
            //como el guardado de datos no depende uno del otro entonces ejecutamos los dos a la vez con
            //Promise.allSettled
            await Promise.allSettled([user.save(), token.save()])

            res.send('Se ha enviado un nuevo token, revista tu email.')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static forgotPassword = async (req: Request, res: Response) => {


        try {
            //Del body - de lo que nos enviar por el formulario extraemos el valor del campo password y email
            const { email } = req.body
            
            //Usuario existe
            const user = await User.findOne({ email })
            if (!user) {
                const error = new Error('El Usuarios no esta registrado.')
                res.status(404).json({ error: error.message })
                return
            }
            
            
            //Generar el token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id  //este user.id viene de la instancia de User de lineas mas arriba, desde que se genera el usuario virtual ya tiene un id, y ese es el que utilizamos aqui
            await token.save()


            
            //Enviar Email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            
            res.send('Se ha enviado un nuevo token, revista tu email.')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static validateToken = async (req: Request, res: Response) => {

        try {

            const { token } = req.body

            const tokenExists = await Token.findOne({ token })
        
            if (!tokenExists) {
                const error = new Error('Token no valido')
                res.status(404).json({ error: error.message })
                return
            }
            
            //validamos que exista el usaurio
            const user = await User.findById(tokenExists.user)
            if (!user) {
                const error = new Error('Usuario no valido')
                res.status(404).json({ error: error.message })
                return
            }
            
            res.status(201).send('Token Valido define tu nuevo password')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static updatePasswordWithToken = async (req: Request, res: Response) => {

        try {
            
            const { token } = req.params
            const { password } = req.body

            const tokenExists = await Token.findOne({ token })
        
            if (!tokenExists) {
                const error = new Error('Token no valido, el Token probablemente Caduco solicita un nuevo Token')
                res.status(404).json({ error: error.message })
                return
            }
            
            //validamos que exista el usaurio
            const user = await User.findById(tokenExists.user)
            if (!user) {
                const error = new Error('Usuario no valido')
                res.status(404).json({ error: error.message })
                return
            }
            //hash Password
            user.password = await hasPassword(password)

            await Promise.allSettled([
                user.save(),
                tokenExists.deleteOne()
            ])

            res.status(200).send('El password ha sido actualizado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al crear al usuario' })
        }

    }

    static user = async (req: Request, res: Response) => {

        res.json(req.user)
        return

    }

    static updateProfile = async (req: Request, res: Response) => {

        const { name, email } = req.body

        try {
            const userExists = await User.findOne({email})
            
            //Esta comprobacion solo es para que no te puedas cambiar por un email que ya existe
            if(userExists && userExists.id.toString() !== req.user.id.toString()){
                const error = new Error('El email ya esta registrado, intenta con otro')
                res.status(409).json({error: error.message})
                return
            }

            req.user.name = name
            req.user.email = email
            await req.user.save()
            res.send('Perfil Actualizado correctamente')

        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {

        const { current_password, password } = req.body

        try {
            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(current_password,user.password)
            
            if(!isPasswordCorrect){
                const error = new Error('El password actual es incorrecto')
                res.status(401).json({error: error.message})
                return
            }

            user.password = await hasPassword(password)
            await user.save()
            res.send('Contraseña cambiada correctamente')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

    static checkPassword = async (req: Request, res: Response) => {

        const { password } = req.body

        try {
            
            const user = await User.findById(req.user.id)
            const isPasswordCorrect = await checkPassword(password,user.password)
            
            if(!isPasswordCorrect){
                const error = new Error('El password es incorrecto')
                res.status(401).json({error: error.message})
                return
            }

            res.send('Password corecto')
        } catch (error) {
            res.status(500).send('Hubo un error')
        }
    }

}