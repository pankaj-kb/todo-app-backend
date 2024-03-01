import mongoose, { Schema } from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        index: true,
        lowercase: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, { timestamps: true })

export const Todo = mongoose.model("Todo", todoSchema)