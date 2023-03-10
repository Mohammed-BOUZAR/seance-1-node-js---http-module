const express = require('express')
const bcrypt = require('bcrypt');
const User = require('../ models/users');

const router = express.Router();


router.post("/register",async (req,res)=>{
    const {login,pwd}= req.body
    if(!login || !pwd)
        return res.status(400).send("login and pwd are required")
    let user = await User.findOne({login:login})
    if(user)
        return res.status(400).send("login already exists")
    
    let hashPwd= await bcrypt.hash(pwd,10);
    
    let newUser = new User({
        login, pwd:hashPwd,todos:[]
    })
    
    newUser.save().then(()=>res.json({message:"register success"}))
    .catch(err=>{
        console.log(err)
        res.status(500).json({message:"please try again later"})
    })
})

router.post("/login",async (req,res)=>{
    const {login,pwd}= req.body
    if(!login || !pwd)
        return res.status(400).send("login and pwd are required")
    
        let user =await  User.findOne({login:login})
    if(!user)
        return res.status(404).send("not found")
    if(await bcrypt.compare(pwd,user.pwd))
        {
            req.session.isConnected=true;
            req.session.userId=user.id

            return res.json({message:"success"})
        }
    res.status(400).send("invalid credentiels")  
    
})
module.exports=router