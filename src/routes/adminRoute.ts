import AdminController from "../controller/AdminController"
import authMiddleware, { Role } from "../middleware/authMiddleware"
import { upload } from "../middleware/multer"
import errorHandler from "../service/catchAsyncErrror"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)

// Supplier
router.route('/add-supplier').post(upload.single('profile'), AdminController.addSupplier)
router.route('/supplier-list').get(authMiddleware.isAuthenticatedAdmin, AdminController.supplierList)
router.route('/supplier/:supplierId').patch(authMiddleware.isAuthenticatedAdmin, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.updateSupplierDetails))
                                     .get(authMiddleware.isAuthenticatedAdmin, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchSingleSupplierDetails))
                                     .delete(authMiddleware.isAuthenticatedAdmin, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.deleteSupplier))

export default router