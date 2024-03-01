import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    addTodo,
    deleteTodo,
    updateTodo,
    toggleTodoStatus
} from "../controllers/todo.controller.js"

const router = Router()

router.use(verifyJWT)

router.route('/').post(addTodo);
router.route('/:todoId').delete(deleteTodo).patch(updateTodo);
router.route('/toggle/:todoId').patch(toggleTodoStatus);

export default router