import mongoose, { Document, PopulatedDoc, Schema, Types } from "mongoose"
import { ITask } from "./Task"
import { IUser } from "./User"


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

const Project = mongoose.model<IProject>('Project', ProjectSchema)
export default Project