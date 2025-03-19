import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose"
import Task, { ITask } from "./Task"
import { IUser } from "./User"
import Note from "./Notes"


//Este es un type de typescript
export interface IProject extends Document {
    projectName: string
    clientenName: string
    description: string
    task: PopulatedDoc<ITask & Document>[]
    manger: PopulatedDoc<IUser & Document>
    team:PopulatedDoc<IUser & Document>[]
}

//Este es el schema de mongo
const ProjectSchema: Schema = new Schema({
    projectName:{
        type: String,
        required: true,
        trim: true
    },
    clientenName:{
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    task:[
        {
            type: Types.ObjectId,
            ref: 'Task'
        }
    ],
    manger:{
        type: Types.ObjectId,
        ref: 'User'
    },
    team:[
        {
            type: Types.ObjectId,
            ref: 'User'
        }
    ],
}, {timestamps: true})

//Middleware
//Vamos a eliminar las tareas que pertenecen a un proyecto, se puede hacer desde el controlador
//pero dice Juan que el controlador queda mas cargado, entonces para eliminar desde el modelo
//se ejecuta un middleware, que cuando se elimine un projecto, se eliminen sus tareas
ProjectSchema.pre('deleteOne',{document:true}, async function() {
    
    const projectId = this._id
    if(!projectId) return

    const tasks = await Task.find({project:projectId})
    for(const task of tasks){
        await Note.deleteMany({task:task.id})
    }
    await Task.deleteMany({project:projectId})
})


const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project