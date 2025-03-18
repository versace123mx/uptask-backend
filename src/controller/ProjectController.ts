import type { Request, Response } from 'express'
import Project from '../models/Project'


export class ProjectControler {

    static createProjects = async (req: Request, res: Response) => {

        const project = new Project(req.body)

        //Asigna un manager, asocia a project.manajer quien crea el proyecto, en este caso el usuario logueado que esta creando el project
        project.manger = req.user.id

        try {
            await project.save()
            res.send('Proyecto creado correctamente.')
        } catch (error) {
            console.log(error)
        }
    }

    static getAllProjects = async (req: Request, res: Response) => {

        try {
            const project = await Project.find({
                $or:[
                    {manger:req.user.id},
                    {team:req.user.id}
                ]
            })
            res.send(project)
        } catch (error) {
            console.log(error)
        }

    }

    static getProjectById = async (req: Request, res: Response): Promise<void> => {

        const { id } = req.params

        try {

            const project = await Project.findById(id).populate('task')//cambiar task por tasks por que son varias tareas, cambiar el modelo tabien
            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return;
            }

            if(project.manger.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)){
                const error = new Error('Accion no valida')
                res.status(404).json({ error: error.message })
                return;
            }

            res.send(project)
            return;

        } catch (error) {
            console.log(error)
        }

    }

    static updateProject = async (req: Request, res: Response) => {

        const { id } = req.params

        try {

            const project = await Project.findByIdAndUpdate(id, req.body)

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return;
            }

            if(project.manger.toString() !== req.user.id.toString()){
                const error = new Error('Solo el Manager puede Actualizar el Proyecto')
                res.status(404).json({ error: error.message })
                return;
            }

            await project.save()
            res.send('Proyecto Actualizado')

        } catch (error) {
            console.log(error)
        }

    }

    static deleteProject = async (req: Request, res: Response) => {

        const { id } = req.params

        try {

            const project = await Project.findById(id)

            if (!project) {
                const error = new Error('Proyecto no encontrado')
                res.status(404).json({ error: error.message })
                return;
            }

            if(project.manger.toString() !== req.user.id.toString()){
                const error = new Error('Solo el Manager puede Eliminar el Proyecto')
                res.status(404).json({ error: error.message })
                return;
            }

            await project.deleteOne()
            res.send('Proyecto Eliminado Correctamente.')
            return;

        } catch (error) {
            console.log(error)
        }

    }

}