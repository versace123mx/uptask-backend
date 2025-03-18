import type { Request, Response } from 'express'
import Project from '../models/Project'
import Task from '../models/Task'
import colors from 'colors'
import { populate } from 'dotenv'
export class TaskController {

    static createTask = async (req: Request, res: Response) => {

        try {
            const task = new Task(req.body)
            task.project = req.project.id//aqui accedemos al id de project.id y lo asignamos a task.project
            req.project.task.push(task.id)//aqui a project.task se asignamos el id de task, en mongo se puede acceeder a su id antes se ser persistente en la db, por eso es que podemos acceder al id

            //Promise.allSettled se ejecuta si todas las promesas se cumplen con Promise.all se ejecutan sin importar si se cumplen o no
            //Esto es para que se ejecuten las dos al mismo tiempo ya que tenerlas separadas en await task.save() y await req.project.save() esto ejecuta primero una y luego de terminar ejecuta la otra
            //Esto seria funciona cuando se requiere que se ejecute una y la segunda depende de la primera, pero en nuestro caso no por eso se utiliza este enfoque Promise.allSettled
            await Promise.allSettled([task.save(), req.project.save()])
            res.send('Tarea creada correctamente')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }
    }

    static getProjectTasks = async (req: Request, res: Response) => {

        try {
            //populate es como un join aqui buscamos las tareas asociadas a un proyecto, pero con populate nos traemos los datos del proyecto
            const task = await Task.find({ project: req.project.id }).populate('project')
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al obtener tareas' })
        }

    }

    static getTaskById = async (req: Request, res: Response) => {

        try {
            /**
             * Aqui ya no se hacen validaciones si la tarea existe o no, por que el middleware
             * que valida si la tarea existe ese nos previene de llegar hasta esta parte del endpoint
             */
            const task = await Task.findById(req.task.id)
                .populate({path:'completeBy.user', select:'id name email'})
                .populate({path:'notes', populate:{path:'createdBy', select:'id name email'}})
            
            res.json(task)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error en las tareas' })
        }

    }

    static updateTask = async (req: Request, res: Response) => {

        try {
            const task = await Task.find({ _id: req.task.id, project: req.project.id })

            if (!task || !task.length) {
                const error = new Error('Tarea no encontrada')
                res.status(404).json({ error: error.message })
                return;
            }

            await Task.findByIdAndUpdate(task, req.body)
            res.send('Tarea actualizada correctamente')


        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }

    }

    static deleteTask = async (req: Request, res: Response) => {

        try {

            const project = req.project //  desde el req desde el middleware project
            const taskId = req.task.id
            const result = await Task.deleteOne({ _id: taskId, project: project.id });

            if (result.deletedCount === 0) {
                res.status(404).send('Tarea no encontrada')
                return
            }

            req.project.task = req.project.task.filter(task => task._id.toString() !== taskId)
            req.project.save()

            res.status(204).send('Tarea eliminada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error' })
        }

    }

    static updateStatus = async (req: Request, res: Response) => {

        try {
            const project = req.project //  desde el req desde el middleware project
            const taskId = req.task.id
            const task = await Task.findOne({ _id: taskId, project: project.id });
            if (!task) {
                res.status(404).json({ error: 'Tarea no encontrada' })
                return
            }
            const { status } = req.body
            task.status = status

            const data= {
                user:req.user.id,
                status
            }

            task.completeBy.push(data)

            await task.save()
            res.send('Se ha actualizado')
        } catch (error) {
            console.log(colors.bgRed('Ha ocurrido un error. Detalles a continuación'))
            res.status(500).json({ error: 'Hubo un error' })
        }
    }
}