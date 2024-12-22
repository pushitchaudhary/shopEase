import AdminController from "../controller/AdminController"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)


export default router