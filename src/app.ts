import express,{Request, Response}  from 'express'
import * as dotenv from 'dotenv';
dotenv.config();

import './database/connection'
import adminRoute from './routes/adminRoute'
import staffRoute from './routes/staffRoute'
const cors = require('cors');
const app = express()
const PORT = 4000
app.use(express.json());

import AdminRegisterFunction from './service/adminRegister';

setTimeout(() => {
    AdminRegisterFunction()
}, 1000); 

// Serve static files from the 'src/uploads' directory
app.use(express.static("./src/uploads/")) 

app.use(cors({ 
    origin: ['http://localhost:5173','http://localhost:5174'] 
  }));

app.use('/api/admin',adminRoute)
app.use('/api/staff',staffRoute)

app.listen(PORT, ()=>{
    console.log('Server has started at', PORT)
})





/*

sudo /Applications/XAMPP/xamppfiles/xampp start
npm start

*/ 