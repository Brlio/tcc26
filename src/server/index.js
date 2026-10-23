import express from `express`
import userRouter from "./routes/user.routes"

const server = express()

server.get('/users', userRouter)
server.get('/tasks', userRouter)



server.listen(3000)