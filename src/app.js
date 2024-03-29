import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("<h1>Server Running/Live</h1>")
})

import userRouter from "./routes/user.routes.js"
import todoRouter from "./routes/todo.routes.js"

app.use('/api/v1/user', userRouter)
app.use('/api/v1/todo', todoRouter)

export { app }