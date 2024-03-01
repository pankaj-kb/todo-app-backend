import { asyncHandler } from "../utils/asyncHandler.js"
import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { Todo } from "../models/todo.model.js"
import { User } from "../models/user.model.js"

const addTodo = asyncHandler(async (req, res) => {
    const { title } = req.body;
    console.log(title);

    if (!title) {
        throw new APIError("Title is required");
    }

    const user = await User.findOne({ _id: req.user._id })

    if (!user) {
        throw new APIError(400, "Unauthorized request")
    }

    const todo = await Todo.create({
        title,
        owner: user._id,
        status: "Pending"
    })

    await User.findByIdAndUpdate(
        user._id,
        {
            $push: { todos: todo._id },
        },
        {
            new: true,
        }
    );

    return res
        .status(201)
        .json(new APIResponse(201, todo, "Todo has been added."))
})

const deleteTodo = asyncHandler(async (req, res) => {

    const { todoId } = req.params;

    if (!todoId) {
        throw new APIError(404, "Kindly provide todoId");
    }

    const todo = await Todo.findOne({ _id: todoId })

    if (!todo) {
        throw new APIError(404, "Todo Does not exist")
    }

    await Todo.findByIdAndDelete(todo._id)

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $pull: { todos: todoId },
        },
        {
            new: true,
        }
    );

})

const updateTodo = asyncHandler(async (req, res) => {
    const { todoId } = req.params;
    const { title } = req.body;

    if (!todoId) {
        throw new APIError(404, "Kindly provide todoId");
    }

    const todo = await Todo.findOne({ _id: todoId });

    if (!todo) {
        throw new APIError(404, "Todo does not exist");
    }

    const updatedTodo = await Todo.findByIdAndUpdate(
        todo._id,
        { title: title },
        { new: true }
    );

    if (updatedTodo === null || updatedTodo === undefined) {
        throw new APIError("Something went wrong while updating todo.");
    }

    return res
        .status(200)
        .json(new APIResponse(200, updatedTodo, "Todo has been updated successfully."));
});

const toggleTodoStatus = asyncHandler(async (req, res) => {

    const { todoId } = req.params;

    if (!todoId) {
        throw new APIError(404, "Kindly provide todoId");
    }

    const todo = await Todo.findOne({ _id: todoId })

    if (!todo) {
        throw new APIError(404, "Todo Does not exist")
    }

    const updatedTodo = await Todo.findByIdAndUpdate(todo._id,
        { status: !todo.status }, { new: true })

    if (!updatedTodo) {
        throw new APIError("Something went wrong while updating todo.")
    }

    return res
        .status(200)
        .json(new APIResponse(200, updatedTodo, "Todo has been updated successfully."));
})


export {
    addTodo,
    deleteTodo,
    updateTodo,
    toggleTodoStatus,
}