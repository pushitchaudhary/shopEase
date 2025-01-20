import AdminController from "../controller/AdminController"
import authMiddleware, { Role } from "../middleware/authMiddleware"
import { upload } from "../middleware/multer"
import errorHandler from "../service/catchAsyncErrror"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)

// Supplier Routes
router.route('/add-supplier').post(upload.single('profile'), AdminController.addSupplier)
router.route('/supplier-list').get(authMiddleware.isAuthenticatedUser, AdminController.supplierList)
router.route('/supplier/:supplierId').patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.updateSupplierDetails))
                                     .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchSingleSupplierDetails))
                                     .delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.deleteSupplier))


// Category Routes
router.route('/category').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.addCategory))
                         .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchCategoryList))
router.route('/category/:categoryId').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchSingleCategoryDetail))
                                     .patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.updateCategoryDetail))
                                     .delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.DeleteCategory))

export default router