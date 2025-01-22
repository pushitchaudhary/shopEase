import { Query } from "mysql2/typings/mysql/lib/protocol/sequences/Query"
import sequelize from "../database/connection"
import { UserInterface } from "../global/interface/interface"
import { DataTypes, json, QueryTypes } from "sequelize";
import { v4 as uuidv4 } from 'uuid';
import { time, timeStamp } from "console";
const bcrypt = require('bcrypt');

const AdminRegisterFunction = ()=>{
    const adminRegister = async (adminList:UserInterface[])=>{
        const currentTimestamp = new Date();
        const hashPassword = bcrypt.hashSync(adminList[0].password, 12);

        const [isAdminExist] = await sequelize.query(`SELECT * FROM users WHERE role = ?`,{
            type : QueryTypes.SELECT,
            replacements : ['admin']
        })

        if(!isAdminExist){
            await sequelize.query(`INSERT INTO users (id,name,email,password,phoneNumber,profilePictureUrl,dateOfBirth,gender,address,role,otp, status, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,{
                type : QueryTypes.INSERT,
                replacements : [adminList[0].id, adminList[0].name, adminList[0].email, hashPassword, adminList[0].phoneNumber, adminList[0].profilePictureUrl, adminList[0].dateOfBirth, adminList[0].gender, adminList[0].address, adminList[0].role, '', adminList[0].status, currentTimestamp, currentTimestamp]
            })
            console.log('Admin Register Successfully')
        }else{
            console.log('Admin Already Exists')
        }

       

    }


    const adminList:UserInterface[] = [
        {'id':uuidv4(), 
        'name':'admin', 
        'email':'admin@gmail.com',
        'password' : 'password',
        'phoneNumber': '9832323',
        'profilePictureUrl' : 'https://i.sstatic.net/l60Hf.png',
        'dateOfBirth' : '2021-09-23',
        'gender' : 'male',
        'address' : 'Pokhara',
        'role' : 'admin',
        'status' : '1',
        }
    ]
    adminRegister(adminList)
}

export default AdminRegisterFunction