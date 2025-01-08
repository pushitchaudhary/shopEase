import AdminController from "../controller/AdminController"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)

// Supplier
router.route('/add-supplier').post(AdminController.addSupplier)


export default router