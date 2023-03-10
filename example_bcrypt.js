const bcrypt = require("bcrypt")

bcrypt.hash("salut",10).then(hash=>{
    console.log(hash)
    bcrypt.compare("saluiiit",hash).then(res=>
        console.log(res))
})