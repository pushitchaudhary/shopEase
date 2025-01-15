import AdminController from "../controller/AdminController"
import { upload } from "../middleware/multer"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)

// Supplier
router.route('/add-supplier').post(upload.single('profile'), AdminController.addSupplier)


export default router