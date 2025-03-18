import { transport } from '../config/nodemailer'

interface IEmail{
    email:string
    name:string
    token:string
}

export class AuthEmail{

    static sendConfirmationEmail = async (user:IEmail)=> {
        
        await transport.sendMail({
            from: 'Gestor de Tareas <admin@gestordetareas.com>',
            to: user.email,
            subject: 'Gestor de Tareas - Confirma Tu Cuenta',
            text: 'Gestor de Tareas - Confirma Tu Cuenta ',
            html: `<p> Hola: ${user.name}, has creado tu cuenta en UpTask, 
                    ya casi esta todo listo, solo debes de confirmar tu cuenta </p>
                    <p>Visita el siguinete enlace:</p>
                    <a href="${process.env.CORS_URL_DESARROLLO}/auth/confirm-account">Confirmar cuenta</a>
                    <p>E ingresa el codigo:<b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
                    `
        })
    }

    static sendPasswordResetToken = async (user:IEmail)=> {
        
        await transport.sendMail({
            from: 'Gestor de Tareas <admin@gestordetareas.com>',
            to: user.email,
            subject: 'Gestor de Tareas - Restablece tu password',
            text: 'Gestor de Tareas - Restablece tu password ',
            html: `<p> Hola: ${user.name}, has solicitado restablecer tu password </p>
                    <p>Visita el siguiente enlace:</p>
                    <a href="${process.env.CORS_URL_DESARROLLO}/auth/new-password">Restablecer Password</a>
                    <p>E ingresa el codigo:<b>${user.token}</b></p>
                    <p>Este token expira en 10 minutos</p>
                    `
        })
    }

}