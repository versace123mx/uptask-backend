import type { Request, Response, NextFunction } from 'express'
import Task, { ITask } from '../models/Task'

declare global {
    namespace Express {
        interface Request {
            task: ITask
        }
    }
}

export async function taskExists( req: Request, res: Response, next: NextFunction ) {

    try {
        const { taskId } = req.params
        const task = await Task.findById(taskId)
        if(!task) {
            const error = new Error('Tarea no encontrada')
            res.status(404).json({error: error.message})
            return
        }
        req.task = task
        next()
    } catch (error) {
        res.status(500).json({error: 'Hubo un error'})
    }
}

export const hasAuthorization = (req: Request, res: Response, next:NextFunction) => {
    
    try {
        if( req.user.id.toString() !== req.project.manger.toString() ) {
            const error = new Error('Acción no válida')
            res.status(400).json({error: error.message}) 
            return
        }    
    } catch (error) {
        res.status(500).json({error: 'Hubo un error desde el middleware de task 1'})
    }
    
    next()
    return
}