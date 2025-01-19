import {Request, Response} from 'express'
import { isValidEmail } from '../global/validation'
import sequelize from '../database/connection'
import { DataTypes, QueryTypes } from "sequelize";
import MulterRequest, { UserInterface, UserRequestInterface } from '../global/interface/interface';
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
import multer from 'multer';
import { DeleteFile } from '../service/FileDelete';
import { v4 as uuidv4 } from 'uuid';
import { stat } from 'fs';
import { error } from 'console';
import { waitForDebugger } from 'inspector';


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
        const [isUserExists]:UserInterface[] = await sequelize.query(`SELECT password FROM users WHERE email = ?`,{
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
        const [fetchUserData]:UserInterface[] = await sequelize.query(`SELECT id, name, email, phoneNumber, profilePictureUrl, dateOfBirth, gender, address FROM users WHERE email = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        // JWT TOKEN
        const jwtToken = jwt.sign({ adminId: fetchUserData.id}, process.env.ADMIN_JWT_TOKEN);
        res.status(200).json({
            message : jwtToken
        })

    }

    // Add Supplier
    async addSupplier(req:Request, res:Response): Promise<void>{
        const multerReq = req as unknown as MulterRequest
        const {name, email, phone, dateOfBirth, gender, address, status} = req.body
        const id = uuidv4()
        const time = new Date()

        const supplierPhoto = multerReq.file?.path
        let supplierPhotoPath = ''

        if(supplierPhoto){
            const cutSupplierFileURL= supplierPhoto.substring("src/uploads/".length);
            const newSupplierFilePath = process.env.HOST_PATH + cutSupplierFileURL 
            supplierPhotoPath = newSupplierFilePath


            if(!name || !email || !phone || !dateOfBirth || !gender || !address || !status){
                DeleteFile(supplierPhoto)
                res.status(200).json({
                    message : 'Please fill all required fields'
                })
                return
            }

        }else{
            res.status(400).json({
                message : "Please upload supplier photo"
            })
            return
        }

        // Is Email Already Exists
        const [isEmailExist] = await sequelize.query(`SELECT email FROM suppliers WHERE email = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        if(isEmailExist){
            res.status(400).json({
                message : "Email Already Exists"
            })
            return
        }

        // Is Phone Already Exists
        const [isPhoneExists] = await sequelize.query(`SELECT phoneNumber FROM suppliers WHERE phoneNumber = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        if(isPhoneExists){
            res.status(400).json({
                message : "Phone Already Exists"
            })
            return
        }
       
        await sequelize.query(`INSERT INTO suppliers(id, name, email, phoneNumber, profilePictureUrl, dateOfBirth, gender, address, status, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,{
            type : QueryTypes.INSERT,
            replacements : [id, name, email, phone, supplierPhotoPath, dateOfBirth, gender, address, status, time, time]
        })

        res.status(200).json({
            message : "Supplier Added Successfully"
        })
    }

    // Fetch Supplier List
    async supplierList(req:Request, res:Response): Promise<void>{
        const supplierList = await sequelize.query(`SELECT * FROM suppliers`,{
            type : QueryTypes.SELECT
        })

        res.status(200).json({
            message : supplierList
        })
    }

    // Delete Supplier
    async deleteSupplier(req:UserRequestInterface, res:Response):Promise<void>{
        const supplierId = req.params.supplierId

        if(!supplierId){
            res.status(400).json({
                message : "Please Provide Supplier Id"
            })
            return
        }

        await sequelize.query(`DELETE FROM suppliers WHERE id = ?`, {
            type : QueryTypes.DELETE,
            replacements: [supplierId]
        })
        
        res.status(200).json({
            message : "Successfully Deleted"
        })
    }

    // Fetch Single Supplier Details
    async fetchSingleSupplierDetails(req:UserRequestInterface, res:Response) :Promise<void>{
        const supplierId = req.params.supplierId
        if(!supplierId){
            res.status(400).json({
                message : "Please provide supplier Id"
            })
            return
        }

        const [response]:any = await sequelize.query(`SELECT * FROM suppliers WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [supplierId]
        })

        res.status(200).json({
            message : response
        })
    }

    // Update Supplier Details
    async updateSupplierDetails(req:UserRequestInterface, res:Response) : Promise<void>{
        const supplierId = req.params.supplierId
        const multerReq = req as unknown as MulterRequest
        const {name, email, phone, dateOfBirth, gender, address, status} = req.body
        const time = new Date()
        if(!supplierId){
            res.status(400).json({
                message : "Please Provide Supplier Id"
            })
            return
        }

        if(!name || !email || !phone || !dateOfBirth || !gender || !address || !status){
            res.status(200).json({
                message : 'Please fill all required fields'
            })
            return
        }

        const [oldSupplierPhotoPath]: UserInterface[] = await sequelize.query(`SELECT profilePictureUrl FROM suppliers WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [supplierId]
        })

        const supplierPhoto = multerReq.file?.path
        let StudentPhotoURLPath = ''
        let newSupplierPhotoURLPath = ''

        if(supplierPhoto){
            const cutSupplierPhotoURL= supplierPhoto.substring("src/uploads/".length);
            newSupplierPhotoURLPath = process.env.HOST_PATH + cutSupplierPhotoURL   // Use this for inserting in the table
            StudentPhotoURLPath = newSupplierPhotoURLPath  // Use this for inserting in the table
            DeleteFile(oldSupplierPhotoPath.profilePictureUrl)
        }else{
            StudentPhotoURLPath = oldSupplierPhotoPath.profilePictureUrl
        }

        await sequelize.query(`UPDATE suppliers SET name = ?, email = ?, phoneNumber = ?, profilePictureUrl = ?, dateOfBirth = ?, gender = ?, address = ?, status = ?, updatedAt = ? WHERE id = ?`,{
            type : QueryTypes.UPDATE,
            replacements : [name, email, phone, StudentPhotoURLPath, dateOfBirth, gender, address, status, time, supplierId]
        })

        res.status(200).json({
            message : "Success Supplier Updated"
        })
    }


}

export default new AdminController