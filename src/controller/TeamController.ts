import { Request, Response} from 'express'
import User from '../models/User'
import Project from '../models/Project'

export class TeamMemberController {


    static addMemberById = async (req: Request, res: Response) => {
        
        const { id } = req.body

        try {
        
            //Find User
            const user = await User.findById(id).select('id')
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }

            //validamos que un usuario no se pueda agregar al proyecto mas de una vez
            if(req.project.team.some( team => team.toString() === user.id.toString() )){
                const error = new Error('El Usuario ya existe en el Proyecto')
                res.status(409).json({error: error.message})
                return
            }
            
            req.project.team.push(user.id)
            await req.project.save()

            res.send('Usuario agregado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static findMemberByEmail = async (req: Request, res: Response) => {
        try {
            
            const { email } = req.body

            //Find User
            const user = await User.findOne({email}).select('id email name')
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }
            
            res.json(user)

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectTeam = async (req: Request, res: Response) => {
        
        try {
        
            const { team } = await req.project.populate('team', 'id name email')
            res.status(200).json( team )

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static removeMemberById = async (req: Request, res: Response) => {
        
        const { userId } = req.params

        try {
        
            //Find User
            const user = await User.findById(userId).select('id')
            if(!user){
                const error = new Error('Usuario no encontrado')
                res.status(404).json({error: error.message})
                return
            }

            //validamos que un usuario no se pueda agregar al proyecto mas de una vez
            if(!req.project.team.some( team => team.toString() === user.id.toString() )){
                const error = new Error('El Usuario no existe en el Proyecto')
                res.status(409).json({error: error.message})
                return
            }
            
            req.project.team = req.project.team.filter(team => team._id.toString() !== user.id )
            await req.project.save()

            res.send('Usuario se ha eliminado correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

}