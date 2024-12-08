import express,{Request, Response}  from 'express'
import * as dotenv from 'dotenv';
dotenv.config();

import './database/connection'


const app = express()
const PORT = 4000
app.use(express.json());
  

app.use('/',(req:Request,res:Response)=>{
    res.status(200).json({
        message : "Home page"
    })
})

app.listen(PORT, ()=>{
    console.log('Server has started at', PORT)
})




/*

sudo /Applications/XAMPP/xamppfiles/xampp start
npm start

*/ 