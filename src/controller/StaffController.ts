import {Request, Response} from 'express'
import { UserInterface, UserRequestInterface } from '../global/interface/interface'
import sequelize from '../database/connection'
import { QueryTypes, UUIDV1 } from 'sequelize'
import { Role } from '../middleware/authMiddleware';
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
import {v4 as uuidv4} from 'uuid';
import { ORDER_STATUS, STATUS } from '../global/enum/enumFiles';
import random from 'random'
import { addAbortListener } from 'events';

class StaffController {

    // To Login
    async StaffLogin(req:Request, res:Response):Promise<void>{
        const {email, password } = req.body

        // Check if email or password is missing in the request
        if(!email || !password){ res.status(400).json({
                message : "Please Provide Email Or Password"
            })
            return
        }

        console.log('email :', email)

        // Query the database to check if the user exists with the provided email
        const [isUserExists]:UserInterface[] = await sequelize.query(`SELECT password FROM users WHERE email = ?`,{
            type : QueryTypes.SELECT,
            replacements : [email]
        })

        console.log('isUserExists :', isUserExists)

        // If no user is found, return a 404 response with an error message
        if(!isUserExists){
            res.status(404).json({
                message : "Invalid Credentials !"
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

        if(!role || role !== Role.STAFF){
            res.status(400).json({
                message : 'You are not authorized to perform this action.'
            })
            return
        }

        const [staffDetails] = await sequelize.query(`SELECT name, email, phoneNumber, profilePictureUrl, dateOfBirth, gender, address, createdAt FROM users WHERE id = ? AND role = ?`,{
            type : QueryTypes.SELECT,
            replacements : [userId, Role.STAFF]
        })

        res.status(200).json({
            message : staffDetails
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

        if(!role || role !== Role.ADMIN){
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

        const [currentAdminPasssword]:any = await sequelize.query(`SELECT password FROM users WHERE id = ? AND role = ?`,{
            type : QueryTypes.SELECT,
            replacements :[userId, Role.ADMIN]
        })

        const isValidPasswrod = await bcrypt.compare(currentPassword, currentAdminPasssword.password);
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

    // To Fetch Product List
    async fetchProductList(req:UserRequestInterface, res:Response) : Promise<void>{
        const productList = await sequelize.query(`SELECT * FROM products WHERE status = ? ORDER BY updatedAt DESC`,{
            type : QueryTypes.SELECT,
            replacements : ['1']
        })

        res.status(200).json({
            message : productList
        })
    }

    // Add Order
    async addOrder(req: UserRequestInterface, res: Response): Promise<void> {
        const { orderItems } = req.body;
        const userId = req.userId;
        let totalPrice = 0
    
        if (!userId) {
            res.status(400).json({
                message: "Please provide user id"
            });
            return;
        }
    
        if (!orderItems || orderItems.length === 0) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }

        for (const item of orderItems){
            const orderId = item.productId
            const qty = item.quantity

            if (qty < 1 || qty > 5) {
                res.status(400).json({
                    message: "Quantity must be between 1 and 5"
                });
                return;
            }
            
            const [price]:any = await sequelize.query(`SELECT name, price, stockQuantity FROM products WHERE id = ?`,{
                type : QueryTypes.SELECT,
                replacements : [orderId]
            })


            if(price.stockQuantity < qty){
                res.status(400).json({
                    message: `${price.name} only ${price.stockQuantity} available (LOW STOCK)`
                })
                return
            }
        

            totalPrice = totalPrice + price.price * qty
        }

        const [orderDetials] =  await sequelize.query(`INSERT INTO orders(date, orderStatus, paymentMethod, amount, transactionId, createdAt, updatedAt, staffId) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,{
            type : QueryTypes.INSERT,
            replacements : [new Date(), ORDER_STATUS.PENDING, 'Cash', totalPrice, '', new Date(), new Date(), userId ]
        })

        for(const item of orderItems){
            const orderId = item.productId
            const qty = item.quantity
            const orderItemsId = uuidv4()

            const [details]:any = await sequelize.query(`SELECT id, price FROM products WHERE id = ?`,{
                type : QueryTypes.SELECT,
                replacements : [orderId]
            })

            await sequelize.query(
                `INSERT INTO orderItems (id, price, quantity, createdAt, updatedAt, orderId, productId) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                {
                  type: QueryTypes.INSERT,
                  replacements: [
                    orderItemsId, 
                    details.price, 
                    qty, 
                    new Date().toISOString().slice(0, 19).replace("T", " "), // Format for SQL
                    new Date().toISOString().slice(0, 19).replace("T", " "), // Format for SQL
                    orderDetials, 
                    details.id
                  ]
                }
              );

            const [fetchProductQty]:any = await sequelize.query(`SELECT stockQuantity FROM products WHERE id = ?`,{
                type : QueryTypes.SELECT,
                replacements : [item.productId]
            })

            await sequelize.query(`UPDATE products SET stockQuantity = ? WHERE id = ?`,{
                type : QueryTypes.UPDATE,
                replacements : [fetchProductQty.stockQuantity - qty, item.productId]
            })
              
        }

        res.status(200).json({
            message : 'Successfully Order Added'
        })
        return
      
    }
    
    // Fetch Orde
    async fetchOrder(req:Request, res:Response) : Promise<void>{
        const orderList = await sequelize.query(`SELECT O.id, O.date, O.orderStatus, O.amount, staff.name FROM orders O JOIN users staff ON staff.id = O.staffId ORDER BY O.updatedAt DESC`,{
            type : QueryTypes.SELECT
        })
 
        res.status(200).json({
            message : orderList
        })
    }

    // Search Product
    async searchProduct(req:Request, res:Response) : Promise<void>{
        const {filterProduct} = req.body
        let productList
        if(filterProduct){
            productList = await sequelize.query(`SELECT * FROM products WHERE name LIKE ? AND status = ? ORDER BY updatedAt DESC`,{
                type: QueryTypes.SELECT,
                replacements: [`${filterProduct}%`, '1'], 
            });
        }else{
            productList = await sequelize.query(`SELECT * FROM products WHERE status = ? ORDER BY updatedAt DESC`,{
                type : QueryTypes.SELECT,
                replacements : ['1']
            })
        }
        res.status(200).json({
            message : productList
        })
    }

    // Fetch Order Items 
    async fetchOrderItem(req:Request, res:Response) : Promise<void>{
        const orderId = req.params.orderId

        if(!orderId){
            res.status(400).json({
                message : "Please provide order id"
            })
            return
        }
        const productList = await sequelize.query(
            `SELECT P.name, P.productImageUrl, O.price, O.quantity 
             FROM orderItems O 
             LEFT JOIN products P ON O.productId = P.id 
             WHERE O.orderId = ?`,
            {
              type: QueryTypes.SELECT,
              replacements: [orderId], 
            }
          );
          

          res.status(200).json({
            message : productList
          })


    }

    // Accept Order
    async acceptOrder(req:Request, res:Response) : Promise<void>{
        const orderId = req.params.orderId
        if(!orderId){
            res.status(400).json({
                message : "Please provide order id"
            })
            return
        }

        await sequelize.query(`UPDATE orders SET orderStatus = ? WHERE id = ?`,{
            type : QueryTypes.UPDATE,
            replacements : [ORDER_STATUS.ACCEPTED ,orderId]
        })

        const productList = await sequelize.query(`SELECT * FROM products WHERE status = ? ORDER BY updatedAt DESC`,{
            type : QueryTypes.SELECT,
            replacements : ['1']
        })

        res.status(200).json({
            message : 'Successfully Status Updated',
            newProductList : productList
        })
    }

    // Reject Order
    async RejectOrder(req:Request, res:Response) : Promise<void>{
        const orderId = req.params.orderId
        if(!orderId){
            res.status(400).json({
                message : "Please provide order id"
            })
            return
        }

        await sequelize.query(`UPDATE orders SET orderStatus = ? WHERE id = ?`,{
            type : QueryTypes.UPDATE,
            replacements : [ORDER_STATUS.REJECTED ,orderId]
        })

        const rejectedOrderProductlist:any = await sequelize.query(`SELECT quantity, productId FROM orderItems WHERE orderId = ?`,{
            type : QueryTypes.SELECT,
            replacements : [orderId]
        })

        for(const item of rejectedOrderProductlist){
            const quantity = item.quantity
            const productId = item.productId

            const [stockQuantity]:any = await sequelize.query(`SELECT stockQuantity FROM products WHERE id = ?`,{
                type : QueryTypes.SELECT,
                replacements : [productId]
            })

            await sequelize.query(`UPDATE products SET stockQuantity = ? WHERE id = ?`,{
                type : QueryTypes.UPDATE,
                replacements : [stockQuantity.stockQuantity+quantity, productId]
            })
        }


        const productList = await sequelize.query(`SELECT * FROM products WHERE status = ? ORDER BY updatedAt DESC`,{
            type : QueryTypes.SELECT,
            replacements : ['1']
        })

        res.status(200).json({
            message : 'Successfully Status Updated',
            newProductList : productList
        })
    }

    // Fetch Total Product
    async fetchTotalProduct(req:Request, res:Response) : Promise<void>{
        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalItems FROM products WHERE status = ?`,{
            type : QueryTypes.SELECT,
            replacements : [1]
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

        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalSell FROM orders WHERE orderStatus = ? AND staffId = ?`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted', staffId]
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

        const [response] =  await sequelize.query(`SELECT SUM(amount) AS totalSellAmount FROM orders WHERE orderStatus = ? AND staffId = ?`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted', staffId]
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

        const [response] =  await sequelize.query(`SELECT COUNT(*) AS totalSell FROM orders WHERE orderStatus = ? AND staffId = ? AND DATE(createdAt) = CURDATE()`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted', staffId]
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

        const [response] =  await sequelize.query(`SELECT SUM(amount) AS todaySellAmount FROM orders WHERE orderStatus = ? AND staffId = ? AND DATE(createdAt) = CURDATE()`,{
            type : QueryTypes.SELECT,
            replacements : ['Accepted', staffId]
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

export default new StaffController