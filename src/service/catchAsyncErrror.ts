import {Request, Response} from 'express'


const errorHandler = (fn: Function)=>{
    return (req:Request, res:Response)=>{
        fn(req,res).catch((err:Error)=>{
            console.log(err)
            return res.status(500).json({
                message : "Internal Server Error 500 !!",
                errMessage : err.message
            })
        })
    }
}

export default errorHandler