const http=require("http")
const fs=require("fs");
let idCounter;
idCounter = parseInt(fs.readFileSync("./idCounter.txt").toString())
const bd=JSON.parse(fs.readFileSync("./database.json").toString());
const server = http.createServer((req,res)=>{
    let method=req.method;
    let path=req.url;
    if(method=="GET" && path.indexOf("/todos")==0)
    {
        let ch=path.substring("/todos".length)
        if(ch[0]=="/" && ch.length>1)
        {
            let index=ch.substring(1)
            if(isNaN(index))
            {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message:"todo not found"}));
            return res.end();
            }
            let todo=bd.todos.filter(element=>element.id==index)
            if(!todo)
            {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message:"todo not found"}));
                return res.end();
            }
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify(todo));
            return res.end();
        }
        else{
            let limit=bd.todos.length;
            if(ch[0]=="?")
            {
                let queries=ch.substring(1).split("&").map(element=>{let table =element.split("="); return {key:table[0],value:table[1]}})
                queries.forEach(element=> {
                                            if(element.key=="limit") 
                                                limit=element.value
                                        })
            }

            let datas=bd.todos.filter((element,index)=>index<limit)
            res.setHeader("Content-Type","application/json")
            res.write(JSON.stringify(datas))
            res.end();
        }
        
       
    }
    else if(method=="POST" && path=="/todos")
    {
        // eventDriven Architecture
        let chunks=[]
        req.on("data",(chunk)=>{
            chunks.push(chunk)
        })
        req.on("end",()=>{
            const parsedBody = Buffer.concat(chunks).toString();
           // verification
           let data;
           try{
            data =JSON.parse(parsedBody);
            }
            catch(e)
            {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message:"json format is required"}));
                return res.end();
            }
           const {userId, title, completed} = data;
           if(!userId || !title || completed==undefined)
           {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message:"userId, title and completed are required"}));
            return res.end();
           }
           idCounter++;
           
           const dataToSave={
            id:idCounter,
            userId:userId,
            title:title,
            completed:completed
           }
            bd.todos.push(dataToSave)
            fs.promises.writeFile("./database.json",JSON.stringify(bd,null,4))
            .then(()=>{
                fs.writeFileSync("./idCounter.txt",idCounter+"")
                res.writeHead(201, {"Content-Type": "application/json"});
                res.write(JSON.stringify(dataToSave));
                return res.end();
            })
            .catch(err=>{
                console.log(err)
                bd.todos.pop();
                idCounter--;
                res.writeHead(500, {"Content-Type": "application/json"});
                res.write(JSON.stringify({message:"please try again later"}));
                return res.end();
            })
          
        })
    }
    else if(method=="DELETE" && path.indexOf("/todos/")==0)
    {
        let index=path.substring("/todos/".length)
        if(isNaN(index) || index=="")
        {
            res.writeHead(400, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message:"id is required (integer)"}));
            return res.end();
        }
        let todo = bd.todos.find(element=>element.id==index)
        if(!todo)
        {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message:"todo not found"}));
            return res.end();
        }
        bd.todos=bd.todos.filter(element=>element.id!=index)
        fs.promises.writeFile("./database.json",JSON.stringify(bd,null,4))
        .then(()=>{
            res.writeHead(200, {"Content-Type": "application/json"});
            res.write(JSON.stringify({message:"deleted with success"}));
            return res.end();
        })
  
    }
    else{
        res.writeHead(404, {"Content-Type": "text/html"});
        res.write("not found: "+ path);
        res.end();
    }
   /* console.log('incoming request')
    let method=req.method;
    let path=req.url;
    res.setHeader("Content-Type","application/json")
    res.write(JSON.stringify({
        method:method,
        path:path
    }))
    res.end()
    */
    /*
    fs.promises.readFile("./public/page.html").
    then(data=>{
        res.setHeader("Content-Type","text/html")
        res.write(data.toString())
        res.end();
    })
    */
  
})
server.listen(3000,()=>{
    console.log('server started')
})