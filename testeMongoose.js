const mongoose = require("mongoose")
const User = require("./ models/users")
require("dotenv").config()


let teste=async ()=>{
    try{
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.CONNECTION);
    let datas= await User.find()
    console.log(datas[0])
    }
    catch(e){
        console.log(e)
    }

}

teste();
console.log("end")