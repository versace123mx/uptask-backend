import mongoose, { Document, Schema, Types } from "mongoose";

const taskStatus = {
    PENDING: 'pending',
    ON_HOLD: 'onHold',
    IN_PROGRESS: 'inProgress',
    UNDER_REVIEW: 'underReview',
    COMPLETED: 'completed'
} as const //esto as const es para que el objeto taskStatus sea de solo lectura readonly

export type TaskStatus = typeof taskStatus[keyof typeof taskStatus] //con esto TaskStatus solo acepta los valores de taskStatus

//Este es un type de typescript
export interface ITask extends Document {
    name: string
    description: string
    project: Types.ObjectId
    status: TaskStatus
    completeBy:{
        user: Types.ObjectId,
        status: TaskStatus
    }[]
    notes: Types.ObjectId[]
}

//Este es el schema de mongo
export const TaskSchema: Schema = new Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    project: {
        type: Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: Object.values(taskStatus),
        default: taskStatus.PENDING
    },
    completeBy:[
        {
            user:{
                type: Types.ObjectId,
                ref: 'User',
                default:null
            },
            status: {
                type: String,
                enum: Object.values(taskStatus),
                default: taskStatus.PENDING
            },
        }
    ],
    notes:[
        {
            type: Types.ObjectId,
            ref: 'Note',
        }
    ]
}, {timestamps: true})

const Task = mongoose.model<ITask>('Task', TaskSchema)
export default Task