import type { Request, Response } from 'express'
import Note, { INote } from '../models/Notes'

export class NoteController {

    static createNote = async (req: Request<{}, {}, INote>, res: Response) => {


        const { content } = req.body

        const note = new Note()
        note.content = content
        note.createdBy = req.user.id
        note.task = req.task.id

        req.task.notes.push(note.id)

        try {
            //guardamos los datos
            //como el guardado de datos no depende uno del otro entonces ejecutamos los dos a la vez con
            //Promise.allSettled
            await Promise.allSettled([note.save(), req.task.save()])
            res.send('Nota creada correctamente')

        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al salvar la nota' })
        }

    }

    static getTaskNotes = async (req: Request, res: Response) => {

        try {
            const notes = await Note.find({ task: req.task.id }).populate('task')
            res.json(notes)
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al obtener los datos de la nota' })
        }
    }

    static deleteNote = async (req: Request, res: Response) => {

        const { noteId } = req.params

        try {

            const note = await Note.findById(noteId)
            //se verifica que la nota exista
            if (!note) {
                const error = new Error('Nota no encontrada')
                res.status(404).json({ error: error.message })
                return
            }

            //se verifica que sea el propietario de la nota, donde quien la creao sea igual al usuario logueado
            if (note.createdBy.toString() !== req.user.id.toString()) {
                const error = new Error('Accion no valida')
                res.status(401).json({ error: error.message })
                return
            }

            req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString())

            //guardamos los datos
            //como el guardado de datos no depende uno del otro entonces ejecutamos los dos a la vez con
            //Promise.allSettled
            await Promise.allSettled([req.task.save(), note.deleteOne()])

            res.send('Nota eliminada')
        } catch (error) {
            res.status(500).json({ error: 'Hubo un error al borrar la nota' })
        }
    }
}