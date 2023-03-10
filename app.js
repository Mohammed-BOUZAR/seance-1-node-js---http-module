const express = require("express")
const usersRouter =require("./routes/users.js")
const todosRouter =require("./routes/todos.js")
const session = require("express-session")
const mongoose = require("mongoose")
const dotenv= require("dotenv")
dotenv.config(); // require("dotenv").config()

mongoose.set('strictQuery', false);
mongoose.connect()
mongoose.connect(process.env.CONNECTION)
.then(()=>{console.log("connected with success to mongodb")

})
.catch(err=>console.log(err))

const app = express()
const port = process.env.PORT || 3000
let authGuard=(req,res,next)=>{
    if(req.session.isConnected)
       return next();
    res.status(403).json({message:"you need to login first"})
}
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    httpOnly: true
  }
}))
app.get("/index.html",(req,res)=>{

})

app.use(express.json()) // global
app.use((req,res,next)=>{
    if(!req.session.count)
        req.session.count=1
    else
        req.session.count++
    console.log(req.session)
    next()
})
app.get("/",(req,res)=>{
    res.send("visited " + req.session.count + " times")
})
app.use("/users",usersRouter);


app.use("/todos",authGuard,todosRouter);


app.use((req,res)=>{
    res.status(404).json({message:"404 not found"})
})
app.listen(port,()=>{
    console.log("server started at localhost: " + port)
})