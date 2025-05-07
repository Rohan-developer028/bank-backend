const mysql=require("mysql2")
require("dotenv").config();

const db=mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.pass,
    database:process.env.dbName
})

db.connect((err)=>{
    if(err)
        console.log(err)
    else 
    console.log("connection sucessfull")
})
module.exports=db