import { Request, Response ,NextFunction } from "express";
import Project, { IProject } from '../models/Project'


declare global{
    namespace Express{
        interface Request{
            project: IProject //esta es la propiedad que se escribira con los valores de la consulta en Project.findById
        }
    }
}

export const validateProjectExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    try {

        //Verifica si el proyexto existe, extraiendo de la url su id
        const { projectId } = req.params
        //console.log(projectId)
        const project = await Project.findById(projectId)

        if (!project) {
            const error = new Error('Proyecto no encontrado')
            res.status(404).json({ error: error.message })
            return;
        }

        //ahora que ya validamos y sabemos que ese id existe ya podemos modificar el req para pasarle ese id
        //dice juan que hay que sobre escribir la req agregandole nuestro dato para que ese valor ya viva de forma global en esa peticion y tenga el valor del projecto
        //estoy ya lo habia echo yo en el curso de fernando herrera node en la parte de la autenticacion solo que ahi no se usa ts y entonces es mas facil mandar ese valor en el req a la siguiente accion del middleware
        //el enfoque o patro de diseño se hace llamar, nested resource routing
        req.project = project
        next()

    } catch (error) {
        res.status(500).json({error: 'Hubo un error desde el middleware'})
    }

    
    return;
}