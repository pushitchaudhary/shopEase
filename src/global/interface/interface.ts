import { Request } from 'express';

export default interface MulterRequest extends Request {
    files: {
        [fieldname: string]: Express.Multer.File[];
    };
}



export interface AdminInterface  {
    id : string,
    name : string,
    email : string
    password : string
    phoneNumber: string,
    profilePictureUrl : string,
    dateOfBirth : string,
    gender : string,
    address : string,
    role : string,
    status : string,
}