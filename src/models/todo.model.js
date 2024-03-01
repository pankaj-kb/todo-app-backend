import mongoose, { Schema } from "mongoose";

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        index: true,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export const Todo = mongoose.model("Todo", todoSchema);