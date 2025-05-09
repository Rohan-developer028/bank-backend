const exp = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const db = require('./connection/db');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = exp();

app.use(cors());
app.use(exp.json());



function verifytonken(rq,rs,next){
    console.log(rq.body)
   let token=rq.headers['authorization']
   
   if(token){
    token=token.split(' ')[1];
    console.log(token)
    
    jwt.verify(token,process.env.jwtkey,(err,valid)=>{
        if(err){
            console.log(err)
            rs.json({error:'invalid token'})
        }
        else{
        console.log("in next")
          next()
    }})
    
   } 
   else{
    rs.json({eror:"invalid token"})
   }

}



app.post("/login", async(rq,rs)=>{
    try{
        console.log(rq.body)
      const{email,password}=rq.body
    if (!email || !password)
        return rs.status(400).json({ message: "Email and password required" });

    const [result]=await db.promise().query("SELECT _id,name,role,email,balance FROM users WHERE email=?  AND password=?",[rq.body.email,rq.body.password])
            
            if(result.length==0)
                return rs.json({err:"invalid credentials"})
            consoe.log(result)
            const user=result[0]
            const authToken=jwt.sign(user._id,process.env.jwtkey)

            rs.status(200).json({
                token:authToken,
                id:user._id,
                name:user.name,
                role:user.role,
                balance:user.balance
            

            })

        

        
    
}

catch(err)
{
    console.log(err)
}
}
)

app.post("/deposit",verifytonken,async(rq,rs)=>{
    const {id,amount}=rq.body;
    try{
    await db.promise().query(
        "UPDATE users SET balance=balance + ? WHERE _id=? ",[amount,id])
        const data=    await db.promise().query(
            "SELECT _id ,balance from users WHERE _id=? ",[id]
        )

  await  db.promise().query (
        `INSERT INTO transactionlog
         (user_id, transaction_type, amount) 
         VALUES (?, ?, ?)`,
        [
          id,
          'credit' ,
          amount
        
        ]
      );
      rs.json({data:data[0][0]})
}
    catch(err)
    {
        console.log(err)
    }
})

app.post("/wihdraw",verifytonken,async(rq,rs)=>{  
    const {id,amount}=rq.body;
    try{
    await db.promise().query(
        "UPDATE users SET balance=balance - ? WHERE _id=? ",[amount,id])
        const data=    await db.promise().query(
            "SELECT _id ,balance from users WHERE _id=? ",[id]
        )

  await  db.promise().query (
        `INSERT INTO transactionlog
         (user_id, transaction_type, amount) 
         VALUES (?, ?, ?)`,
        [
          id,
          'debit' ,
          amount
        
        ]
      );
      rs.json({data:data[0][0]})
}
    catch(err)
    {
        console.log(err)
    }

})

app.get("/getuser",verifytonken,async(rq,rs)=>{

    try{
        const data= await db.promise().query(
            "SELECT balance ,email,name ,_id FROM users WHERE role=?",['customer']
        )
        
        rs.send(data[0])

    }
    catch(err){
        console.log(err)
    }
    
})

app.post('/log',verifytonken,async(rq,rs)=>{
    const id=rq.body.id

    const data=await db.promise().query(
        "SELECT * FROM transactionlog WHERE user_id =? ",[id]
    )
    rs.send([data[0]])
})

app.post('/bal',verifytonken,async(rq,rs)=>{
      const id=rq.body.id
    const data=await db.promise().query(
        "SELECT balance FROM users WHERE _id=?",[id]
    )
 console.log(data)
    rs.json({bal:data[0][0]})
})

app.listen(process.env.port,(err,res)=>{
    if(err)
        return console.log(err)
    console.log(`"server started"${process.env.port}`)
})
