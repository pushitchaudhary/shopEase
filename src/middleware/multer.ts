import fs from 'fs';
import multer from 'multer';
import { Request } from 'express';

// Multer disk storage configuration
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        console.log(' 😂 😂 😂 😂 😂 😂 😂 😂 😂 multer vitra aayo !!');

        // Check if file type is allowed
        const allowedFileTypes = ['image/jpg', 'image/png', 'image/jpeg'];
        if (!allowedFileTypes.includes(file.mimetype)) {
            cb(new Error("This file type is not accepted"), '');
        } else {
            const uploadPath = './src/uploads';  // You can set the path where you want to store files
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath);  // Creates the directory if it doesn't exist
            }
            cb(null, uploadPath);  // Pass the path where the file will be stored
        }
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, Date.now() + "-" + file.originalname);  // Unique filename
    }
});

// Multer upload instance
const upload = multer({ storage });
export { upload };
