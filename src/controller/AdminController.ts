import {Request, Response} from 'express'
import sequelize from '../database/connection'
import { DataTypes, QueryTypes } from "sequelize";
import MulterRequest, { CategoryName, UserInterface, UserRequestInterface } from '../global/interface/interface';
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
import { DeleteFile } from '../service/FileDelete';
import { v4 as uuidv4 } from 'uuid';
import { randomInt } from 'crypto';
import { Role } from '../middleware/authMiddleware';


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
        const [isUserExists]:UserInterface[] = await sequelize.query(`SELECT password, role FROM users WHERE email = ?`,{
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

        if(isUserExists.role !== 'admin'){
            res.status(400).json({
                message : 'unauthorized access'
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
        const jwtToken = jwt.sign({ userId: fetchUserData.id}, process.env.ADMIN_JWT_TOKEN);
        res.status(200).json({
            message : jwtToken
        })

    }

            //////////////////////////////////////////////////
            //////////      SUPPLIER CONTROLLER    //////////
            //////////////////////////////////////////////////

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

        // Removing Photos from uploads folder
        const [oldSupplierPhotoPath]: UserInterface[] = await sequelize.query(`SELECT profilePictureUrl FROM suppliers WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [supplierId]
        })
        DeleteFile(oldSupplierPhotoPath.profilePictureUrl)


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

    // To Fetch Supplier List (STATUS ON)
    async fetchSupplierList_StatusON(req:Request, res:Response) : Promise<void>{
        const supplierList_StatusON = await sequelize.query(`SELECT id, name, email FROM suppliers WHERE status = ?`,{
            type : QueryTypes.SELECT,
            replacements : [1]
        })

        res.status(200).json({
            message : supplierList_StatusON
        })
    }

            //////////////////////////////////////////////////
            //////////      CATEGORY CONTROLLER    //////////
            //////////////////////////////////////////////////

    // To Add Category 
    async addCategory(req:Request, res:Response) : Promise<void>{
        const id = uuidv4()
        const {categoryName, status} = req.body
        const time = new Date();

        if(!categoryName || !status){
            res.status(400).json({
                message : "Please Provide all required fields"
            })
            return
        }

        const [isAlredyExistsCategoryName]:CategoryName[] = await sequelize.query(`SELECT name FROM category WHERE name = ?`,{
            type : QueryTypes.SELECT,
            replacements : [categoryName]
        })

        if(isAlredyExistsCategoryName){
            res.status(400).json({
                message : "Category Name already exists !!"
            })
            return
        }

        await sequelize.query(`INSERT INTO category( id, name, status, createdAt, updatedAt) VALUES( ?, ?, ?, ?, ?)`,{
            type : QueryTypes.INSERT,
            replacements : [id, categoryName, status, time, time]
        })

        res.status(200).json({
            message : "Successfully Category Added !!"
        })
    }

    // To Fetch Category List
    async fetchCategoryList(req:Request, res:Response) :Promise<void>{
        const categoryList = await sequelize.query(`SELECT id, name, status, createdAt, updatedAt FROM category`,{
            type : QueryTypes.SELECT,
        })
        res.status(200).json({
            message : categoryList
        })
    }

    // To Fetch Single Category Details
    async fetchSingleCategoryDetail(req:Request, res:Response) : Promise<void>{
        const categoryId = req.params.categoryId

        if(!categoryId){
            res.status(400).json({
                message : "Please Provide category Id"
            })
            return
        }

        const [categoryDetails] = await sequelize.query(`SELECT name, status FROM category WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [categoryId]
        })

        res.status(200).json({
            message : categoryDetails
        })
    }

    // To Update Category Detail
    async updateCategoryDetail(req:Request, res:Response) : Promise<void>{
        const categoryId = req.params.categoryId
        const {categoryName, status} = req.body
        const time = new Date();

        if(!categoryId){
            res.status(400).json({
                message : "Please Provide Category Id"
            })
            return
        }

        if(!categoryName || !status){
            res.status(400).json({
                message : "Please Provide all required fields"
            })
            return
        }

        const [isAlredyExistsCategoryName]:CategoryName[] = await sequelize.query(`SELECT name FROM category WHERE id != ? AND name = ?`,{
            type : QueryTypes.SELECT,
            replacements : [categoryId, categoryName]
        })

        if(isAlredyExistsCategoryName){
            res.status(400).json({
                message : "Category Name already exists !!"
            })
            return
        }

        await sequelize.query(`UPDATE category SET name = ?, status = ?, updatedAt = ? WHERE id = ?`,{
            type : QueryTypes.UPDATE,
            replacements : [categoryName, status, time, categoryId]
        })

        res.status(200).json({
            message : "Successfully Category Updated !!"
        })
    }

    // To delete Category
    async DeleteCategory(req:Request, res:Response) :Promise<void>{
        const categoryId = req.params.categoryId
        if(!categoryId){
            res.status(400).json({
                message : "Please Provide Category Id"
            })
            return
        }

        const [isCategoryExists] = await sequelize.query(`SELECT * FROM category WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [categoryId]
        })

        if(!isCategoryExists){
            res.status(404).json({
                message : "Category Not Found !!"
            })
            return
        }

        await sequelize.query('DELETE FROM category WHERE id = ?',{
            type : QueryTypes.DELETE,
            replacements : [categoryId]
        })

        res.status(200).json({
            message : "Category Successfully Deleted !!"
        })
    }

    // To Fetch Category List (STATUS ON)
    async fetchCategory_StatusON(req:Request, res:Response) : Promise<void>{
        const categoryList:CategoryName[] = await sequelize.query(`SELECT id, name FROM category WHERE status = ?`,{
            type : QueryTypes.SELECT,
            replacements : [1]
        })
        res.status(200).json({
            message : categoryList
        })
    }        

            //////////////////////////////////////////////////
            ///////////    PRODUCT CONTROLLER     ////////////
            //////////////////////////////////////////////////

    // To Add Product   
    async AddProduct(req:Request, res:Response) : Promise<void>{
        const multerReq = req as unknown as MulterRequest
        const {name, description, price, stockQuantity, weight, categoryId, supplierId, status} = req.body
        const productPhoto = multerReq.file?.path
        let productPhotoPath = ''
        const id = uuidv4()
        const time = new Date()

        if(productPhoto){
            const cutProductPhotoFileURL= productPhoto.substring("src/uploads/".length);
            const newProductFilePath = process.env.HOST_PATH + cutProductPhotoFileURL 
            productPhotoPath = newProductFilePath
     
            if(!name || !description || !price || !stockQuantity || !weight || !categoryId || !supplierId || !status ){
                DeleteFile(productPhoto)
                res.status(400).json({
                    message : "Please fill all required fields"
                })
                return
            }

        }else{
            res.status(400).json({
                message : "Please upload product photo"
            })
            return
        }

        await sequelize.query(`INSERT INTO products (id, name, description, price, stockQuantity, productImageUrl, weight, status, createdAt, updatedAt, categoryId,  supplierId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, {
                type: QueryTypes.INSERT,
                replacements: [id, name, description, price,  stockQuantity,  productPhotoPath,  weight,  status,  time,  time,  categoryId,  supplierId]
            }
        );
        
        res.status(200).json({
            message : 'Product Added Successfully'
        })
    }

    // To Fetch Product List
    async FetchProduct(req:Request, res:Response) : Promise<void>{
        const productList = await sequelize.query(`SELECT P.*, C.name AS categoryName, S.name AS supplierName FROM products P JOIN category C ON P.categoryId = C.id JOIN suppliers S ON P.supplierId = S.id`,{
            type: QueryTypes.SELECT,
            }
        );

        res.status(200).json({
            message : productList
        })
    }

    // To Delete Product
    async DeleteProduct(req:Request, res:Response) : Promise<void>{
        const productId = req.params.productId

        if(!productId){
            res.status(200).json({
                message : "Please provide Product Id"
            })
            return
        }

        const [isProductExists]:any = await sequelize.query(`SELECT * FROM products WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [productId]
        })
        if(!isProductExists){
            res.status(404).json({
                message : "Product Not Found"
            })
            return
        }

        await sequelize.query(`DELETE FROM products WHERE id = ?`,{
            type : QueryTypes.DELETE,
            replacements : [productId]
        })
        
        res.status(200).json({
            message : "Successfully Deletetd"
        })
    }

    // To Fetch Single Product Details
    async FetchSingleProductDetails(req:Request, res:Response) : Promise<void>{
        const productId = req.params.productId
        if(!productId){
            res.status(400).json({
                message : 'Please Provide Product Id'
            })
            return
        }

        const [isProductExists] = await sequelize.query(`SELECT P.*, C.id AS categoryId, S.id AS supplierId FROM products P JOIN category C ON P.categoryId = C.id JOIN suppliers S ON P.supplierId = S.id WHERE P.id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [productId]
        })

        res.status(200).json({
            message : isProductExists
        })
    }

    // To Update Single Product Details
    async UpdateSingleProductDetails(req:Request, res:Response) : Promise<void>{
        const productId = req.params.productId
        const {name, description, price, stockQuantity, weight, categoryId, supplierId, status} = req.body
        const multerReq = req as unknown as MulterRequest
        const time = new Date()


        if(!productId){
            res.status(400).json({
                message : 'Please Provide Product Id'
            })
            return
        }


        if(!name || !description || !price || !stockQuantity || !weight || !categoryId || !supplierId || !status){
            res.status(200).json({
                message : 'Please fill all required fields'
            })
            return
        }

        const [oldProductPhotoPath]:any = await sequelize.query(`SELECT productImageUrl FROM products WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [productId]
        })

        const productPhoto = multerReq.file?.path
        let ProductPhotoURLPath = ''
        let newProductPhotoURLPath = ''

        if(productPhoto){
            const cutPhotoPhotoURL= productPhoto.substring("src/uploads/".length);
            newProductPhotoURLPath = process.env.HOST_PATH + cutPhotoPhotoURL   // Use this for inserting in the table
            ProductPhotoURLPath = newProductPhotoURLPath  // Use this for inserting in the table
            DeleteFile(oldProductPhotoPath.productImageUrl)
        }else{
            ProductPhotoURLPath = oldProductPhotoPath.productImageUrl
        }

        console.log('status is :', status)
        await sequelize.query(`UPDATE products SET name = ?, description = ?, price = ?, stockQuantity = ?, productImageUrl = ?, weight = ?, status = ?, updatedAt = ?, categoryId = ?, supplierId = ? WHERE id = ?`, { 
            type: QueryTypes.UPDATE, 
            replacements: [name, description, price, stockQuantity, ProductPhotoURLPath, weight, status, time, categoryId, supplierId, productId] 
        });
        
        res.status(200).json({
            message : "Successfully Product Updated"
        })
    }

            //////////////////////////////////////////////////
            ///////////    STAFF CONTROLLER     ////////////
            //////////////////////////////////////////////////

    // To Add Staff
    async AddStaff(req:Request, res:Response): Promise<void>{
        const multerReq = req as unknown as MulterRequest
        const {name, email, phone, dateOfBirth, gender, address, status} = req.body
        const id = uuidv4()
        const time = new Date()
        // const randomPassword = randomInt(10000,100000)
        const randomPassword = "pushit"
  
        const StaffPhoto = multerReq.file?.path
        let staffPhotoPath = ''

        if(StaffPhoto){
            const cutStaffFileURL= StaffPhoto.substring("src/uploads/".length);
            const newStaffFilePath = process.env.HOST_PATH + cutStaffFileURL 
            staffPhotoPath = newStaffFilePath


            if(!name || !email || !phone || !dateOfBirth || !gender || !address || !status){
                DeleteFile(staffPhotoPath)
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
        const [isEmailExist] = await sequelize.query(`SELECT email FROM users WHERE email = ?`,{
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
        const [isPhoneExists] = await sequelize.query(`SELECT phoneNumber FROM users WHERE phoneNumber = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        if(isPhoneExists){
            res.status(400).json({
                message : "Phone Already Exists"
            })
            return
        }

        // Email Pathau user lai 😂
        const hashPassword = await bcrypt.hashSync(randomPassword, 12);
  
        await sequelize.query(`INSERT INTO users(id, name, email, password, phoneNumber, profilePictureUrl, dateOfBirth, gender, address, role, status, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,{
            type : QueryTypes.INSERT,
            replacements : [id, name, email, hashPassword, phone, staffPhotoPath, dateOfBirth, gender, address, Role.STAFF ,status, time, time]
        })

        res.status(200).json({
            message : "Supplier Added Successfully"
        })
    }

    // Fetch Supplier List
    async FetchStaffList(req:Request, res:Response): Promise<void>{
        const staffList = await sequelize.query(`SELECT * FROM users WHERE role = ?`,{
            type : QueryTypes.SELECT,
            replacements : [Role.STAFF]
        })

        res.status(200).json({
            message : staffList
        })
    }

    // To Fetch Singl Staff Details
    async FetchSingleStaffDetails(req:Request, res:Response) : Promise<void>{
        const staffId = req.params.staffId
        if(!staffId){
            res.status(400).json({
                message : "Please provide staff id"
            })
            return
        }

        const [staffDetails] = await sequelize.query(`SELECT name, email, phoneNumber, dateOfBirth, gender, address, status FROM users WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [staffId]
        })

        res.status(200).json({
            message : staffDetails
        })
    }

    // To Update Supplier Details
    async UpdateStaffDetails(req:UserRequestInterface, res:Response) : Promise<void>{
        const staffId = req.params.staffId
        const multerReq = req as unknown as MulterRequest
        const {name, email, phone, dateOfBirth, gender, address, status} = req.body
        const time = new Date()
        if(!staffId){
            res.status(400).json({
                message : "Please Provide Staff Id"
            })
            return
        }

        if(!name || !email || !phone || !dateOfBirth || !gender || !address || !status){
            res.status(200).json({
                message : 'Please fill all required fields'
            })
            return
        }

        const [oldStaffPhotoPath]: UserInterface[] = await sequelize.query(`SELECT profilePictureUrl FROM users WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [staffId]
        })

        const staffPhoto = multerReq.file?.path
        let StaffPhotoURLPath = ''
        let newStaffPhotoURLPath = ''

        if(staffPhoto){
            const cutStaffPhotoURL= staffPhoto.substring("src/uploads/".length);
            newStaffPhotoURLPath = process.env.HOST_PATH + cutStaffPhotoURL   // Use this for inserting in the table
            StaffPhotoURLPath = newStaffPhotoURLPath  // Use this for inserting in the table
            DeleteFile(oldStaffPhotoPath.profilePictureUrl)
        }else{
            StaffPhotoURLPath = oldStaffPhotoPath.profilePictureUrl
        }

        await sequelize.query(`UPDATE users SET name = ?, email = ?, phoneNumber = ?, profilePictureUrl = ?, dateOfBirth = ?, gender = ?, address = ?, status = ?, updatedAt = ? WHERE id = ?`, {
            type: QueryTypes.UPDATE,
            replacements: [name, email, phone, StaffPhotoURLPath, dateOfBirth, gender, address, status, time, staffId]
        });
        
        res.status(200).json({
            message : "Success Staff Updated"
        })
    }
    
    // To Delete Supplier
    async deleteStaff(req:UserRequestInterface, res:Response):Promise<void>{
        const staffId = req.params.staffId

        if(!staffId){
            res.status(400).json({
                message : "Please Provide Staff Id"
            })
            return
        }

        // Removing Photos from uploads folder
        const [oldStaffPhotoPath]: UserInterface[] = await sequelize.query(`SELECT profilePictureUrl FROM users WHERE id = ?`,{
            type : QueryTypes.SELECT,
            replacements : [staffId]
        })
        DeleteFile(oldStaffPhotoPath.profilePictureUrl)


        await sequelize.query(`DELETE FROM users WHERE id = ?`, {
            type : QueryTypes.DELETE,
            replacements: [staffId]
        })
        
        res.status(200).json({
            message : "Successfully Deleted"
        })
    }

            //////////////////////////////////////////////////
            ///////////    PROFILE CONTROLLER     ////////////
            //////////////////////////////////////////////////

    // To Fetch Profile Details
    async fetchProfileDetails(req:UserRequestInterface, res:Response) : Promise<void>{
        const {userId, role} = req
          
        if(!userId){
            res.status(400).json({
                message : "Please Provide User Id"
            })
            return
        }

        if(!role || role !== Role.ADMIN){
            res.status(400).json({
                message : 'You are not authorized to perform this action.'
            })
            return
        }

        const [adminDetails] = await sequelize.query(`SELECT name, email, phoneNumber, profilePictureUrl, dateOfBirth, gender, address, createdAt FROM users WHERE id = ? AND role = ?`,{
            type : QueryTypes.SELECT,
            replacements : [userId, Role.ADMIN]
        })

        res.status(200).json({
            message : adminDetails
        })
    }

    // To Update Profile Details
    async UpdateProfileDetails(req:UserRequestInterface, res:Response) : Promise<void>{
        const {userId, role} = req
        const {name, email, phone, dateOfBirth, gender, address} = req.body
        const multerReq = req as unknown as MulterRequest
        const time = new Date()
        if(!userId){
            res.status(400).json({
                message : "Please Provide User Id"
            })
            return
        }

        if(!role || role !== Role.ADMIN){
            res.status(400).json({
                message : 'You are not authorized to perform this action.'
            })
            return
        }

        const [oldAdminPhotoPath]: UserInterface[] = await sequelize.query(`SELECT profilePictureUrl FROM users WHERE id = ? AND role = ?`,{
            type : QueryTypes.SELECT,
            replacements : [userId, Role.ADMIN]
        })

        const AdminPhoto = multerReq.file?.path
        let AdminPhotoURLPath = ''
        let newAdminPhotoURLPath = ''

        if(AdminPhoto){
            const cutStaffPhotoURL= AdminPhoto.substring("src/uploads/".length);
            newAdminPhotoURLPath = process.env.HOST_PATH + cutStaffPhotoURL   // Use this for inserting in the table
            AdminPhotoURLPath = newAdminPhotoURLPath  // Use this for inserting in the table
            DeleteFile(oldAdminPhotoPath.profilePictureUrl)
        }else{
            AdminPhotoURLPath = oldAdminPhotoPath.profilePictureUrl
        }

        await sequelize.query(`UPDATE users SET name = ?, email = ?, phoneNumber = ?, profilePictureUrl = ?, dateOfBirth = ?, gender = ?, address = ?, updatedAt = ? WHERE id = ?`, {
            type: QueryTypes.UPDATE,
            replacements: [name, email, phone, AdminPhotoURLPath, dateOfBirth, gender, address, time, userId]
        });
        
        res.status(200).json({
            message : "Success Admin Updated"
        })


    }

    // To Change Admin Password
    async ChangeAdminPassword(req:UserRequestInterface, res:Response) : Promise<void>{
        const {userId, role} = req
        const {newPassword, confirmPassword, currentPassword} = req.body
        const time = new Date()
        if(!userId){
            res.status(400).json({
                message : "Please Provide User Id"
            })
            return
        }

        if(!role || role !== Role.STAFF){
            res.status(400).json({
                message : 'You are not authorized to perform this action.'
            })
            return
        }

        if(!newPassword || !confirmPassword || !currentPassword){
            res.status(400).json({
                message : 'Please Provide All required fileds'
            })
            return
        }

        if(newPassword !== confirmPassword){
            res.status(400).json({
                message : "New Password and confirm password doesnot matched !!"
            })
            return
        }

        const [currentStaffPasssword]:any = await sequelize.query(`SELECT password FROM users WHERE id = ? AND role = ?`,{
            type : QueryTypes.SELECT,
            replacements :[userId, Role.STAFF]
        })

        const isValidPasswrod = await bcrypt.compare(currentPassword, currentStaffPasssword.password);
        if(isValidPasswrod != true){
            res.status(400).json({
                message : "Invalid Password"
            })
            return
        }

        // New Hash password
        const newHashPassword = bcrypt.hashSync(newPassword, 12);

        await sequelize.query(`UPDATE users SET password = ?, updatedAt = ? WHERE id = ? AND role = ?`,{
            type : QueryTypes.UPDATE,
            replacements : [newHashPassword, time, userId, Role.ADMIN]
        })

        res.status(200).json({
            message : "Successfully Password Updated"
        })
    }


            //////////////////////////////////////////////////
            ///////////    PROFILE CONTROLLER     ////////////
            //////////////////////////////////////////////////

    // Fetch Total Product
    async fetchTotalProduct(req:Request, res:Response) : Promise<void>{
        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalItems FROM products`,{
            type : QueryTypes.SELECT
        })
        res.status(200).json({
            message : response
        })
    }

    // Fetch Total Product
    async fetchTotalSell(req:UserRequestInterface, res:Response) : Promise<void>{
        const staffId = req.userId
        if(!staffId){
            res.status(400).json({
                message : "Please provide staff id"
            })
            return
        }

        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalSell FROM orders WHERE orderStatus = ?`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted']
        })
        res.status(200).json({
            message : response
        })
    }

    // Fetch Total Product
    async fetchTotalSellAmount(req:UserRequestInterface, res:Response) : Promise<void>{
        const staffId = req.userId
        if(!staffId){
            res.status(400).json({
                message : "Please provide staff id"
            })
            return
        }

        const [response] =  await sequelize.query(`SELECT SUM(amount) AS totalSellAmount FROM orders WHERE orderStatus = ?`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted']
        })
        res.status(200).json({
            message : response
        })
    }

    // Fetch Today Product
    async fetchTodaySell(req:UserRequestInterface, res:Response) : Promise<void>{
        const staffId = req.userId
        if(!staffId){
            res.status(400).json({
                message : "Please provide staff id"
            })
            return
        }

        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalSell FROM orders WHERE orderStatus = ? AND DATE(createdAt) = CURDATE()`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted']
        })
        res.status(200).json({
            message : response
        })
    }

    // Fetch Total Product
    async fetchTodaySellAmount(req:UserRequestInterface, res:Response) : Promise<void>{
        const staffId = req.userId
        if(!staffId){
            res.status(400).json({
                message : "Please provide staff id"
            })
            return
        }

        const [response] =  await sequelize.query(`SELECT SUM(amount) AS todaySellAmount FROM orders WHERE orderStatus = ? AND DATE(createdAt) = CURDATE()`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted']
        })
        res.status(200).json({
            message : response
        })
    }

    // Top Sell Product
    async fetchTopSellProduct(req:Request, res:Response) : Promise<void>{
        const topProducts = await sequelize.query(
            `SELECT p.id, p.name, p.productImageUrl, p.price, p.stockQuantity, SUM(oi.quantity) AS totalSold
             FROM orderItems oi
             JOIN orders o ON oi.orderId = o.id
             JOIN products p ON oi.productId = p.id
             WHERE o.orderStatus = 'Accepted'
             GROUP BY p.id, p.name, p.productImageUrl
             ORDER BY totalSold DESC
             LIMIT 8`,
            { type: QueryTypes.SELECT }
          );
          
          console.log(topProducts)
    
          res.status(200).json({ message : topProducts });
    }


}

export default new AdminController