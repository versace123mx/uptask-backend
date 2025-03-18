import mongoose, { Schema, Document, Types } from "mongoose";

//Esta es la definicion de la interfaz de Typescript
export interface INote extends Document{
    content: string
    createdBy: Types.ObjectId
    task: Types.ObjectId
}

//Este es el schema de la base de datos
const NoteShema: Schema = new Schema({
    content:{
        type: String,
        require: true
    },
    createdBy:{
        type: Types.ObjectId,
        ref: 'User',
        required: true
    },
    task:{
        type: Types.ObjectId,
        ref: 'Task',
        required: true
    }
}, {timestamps: true})

const Note = mongoose.model<INote>('Note', NoteShema)
export default Note