import { NextFunction, Response } from "express";
import { AuthRequest, UserInterface, UserRequestInterface } from "../global/interface/interface";
var jwt = require('jsonwebtoken');
import { promisify } from 'util'
import sequelize from "../database/connection";
import { QueryTypes } from "sequelize";

export enum Role {
    ADMIN = "admin",
    STAFF = 'staff'
}

class authMiddleware {
    async isAuthenticatedUser(req:UserRequestInterface, res:Response, next:NextFunction) :Promise<void>{
        const token = req.headers.authorization;

        if(!token || token == undefined || token == null){
            res.status(400).json({
                message : 'Please Provide Token'
            })
            return
        }

        try {
            // JWT TOKEN
            const decoded = await promisify(jwt.verify)(token, process.env.ADMIN_JWT_TOKEN)
            const [isUserExists]:UserInterface[] = await sequelize.query(`SELECT * FROM users WHERE id = ?`,{
                type : QueryTypes.SELECT,
                replacements : [decoded.adminId]
            })

            if (!isUserExists) {
                res.status(400).json({
                    message: "User not found or you do not have the required permissions.",
                });
                return;
            }

            req.userId = isUserExists.id
            req.userEmail = isUserExists.email
            req.role = isUserExists.role
            next()
            
        } catch (error) {
            res.status(400).json({
                message : `Your session has expired or the token is invalid. Please log in again.`
            })
        }
    }

    // Restrict
    restrictTo(...roles:Role[]){
        return (req:AuthRequest,res:Response,next:NextFunction)=>{
            let userRole = req.role as Role
            if(!roles.includes(userRole)){
                res.status(401).json({
                    message : "You don't have permission"
                })
                return
            }else{
                next()
            }
        }
    }
}

export default new authMiddleware