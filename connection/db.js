const mysql=require("mysql2")
require("dotenv").config();

const db=mysql.createPool({
    host:process.env.host,
    user:process.env.user,
    password:process.env.pass,
    database:process.env.dbName,
     waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

db.connect((err)=>{
    if(err)
        console.log(err)
    else 
    console.log("connection sucessfull")
})
module.exports=db
