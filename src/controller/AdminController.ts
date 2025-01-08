import {Request, Response} from 'express'
import { isValidEmail } from '../global/validation'
import sequelize from '../database/connection'
import { DataTypes, QueryTypes } from "sequelize";
import { AdminInterface } from '../global/interface/interface';
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');

class AdminController{

    async adminLogin(req:Request, res:Response):Promise<void>{
        const {email, password } = req.body

        // Check if email or password is missing in the request
        if(!email || !password){ res.status(400).json({
                message : "Please Provide Email Or Password"
            })
            return
        }

        // Query the database to check if the user exists with the provided email
        const [isUserExists]:AdminInterface[] = await sequelize.query(`SELECT password FROM users WHERE email = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        // If no user is found, return a 404 response with an error message
        if(!isUserExists){
            res.status(404).json({
                message : "Invalid Credentials"
            })
            return
        }

        // Compare the provided password with the hashed password stored in the database
        const match = await bcrypt.compare(password, isUserExists.password);
        
        // If the passwords do not match, return a 400 response with an error message
        if(!match){
            res.status(400).json({
                message : 'Invalid Credentials'
            })
            return
        }

        // Query the database to check if the user exists with the provided email
        const [fetchUserData]:AdminInterface[] = await sequelize.query(`SELECT name, email, phoneNumber, profilePictureUrl, dateOfBirth, gender, address FROM users WHERE email = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        // JWT TOKEN
        const jwtToken = jwt.sign({ adminId: fetchUserData.id}, process.env.ADMIN_JWT_TOKEN);
        res.status(200).json({
            message : jwtToken
        })

    }

    async addSupplier(req:Request, res:Response): Promise<void>{
        const {name, email, phone, dateOfBirth, gender, address, status} = req.body

        if(!name || !email || !phone || !dateOfBirth || !gender || !address || !status){
            res.status(200).json({
                message : 'Please fill all required fields'
            })
            return
        }
        res.status(200).json({
            message : "pass"
        })
    }


}

export default new AdminController