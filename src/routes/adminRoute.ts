import AdminController from "../controller/AdminController"
import authMiddleware, { Role } from "../middleware/authMiddleware"
import { upload } from "../middleware/multer"
import errorHandler from "../service/catchAsyncErrror"

const router = require('express').Router()

router.route('/admin-login').post(AdminController.adminLogin)

// Supplier Routes
router.route('/supplier-list-status-on').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN, Role.STAFF), errorHandler(AdminController.fetchSupplierList_StatusON))
router.route('/add-supplier').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.addSupplier))
router.route('/supplier-list').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.supplierList))
router.route('/supplier/:supplierId').patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.updateSupplierDetails))
                                     .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchSingleSupplierDetails))
                                     .delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.deleteSupplier))


// Category Routes
router.route('/category-list-status-on').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN, Role.STAFF), errorHandler(AdminController.fetchCategory_StatusON))  
router.route('/category').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.addCategory))
                         .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchCategoryList))
router.route('/category/:categoryId').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.fetchSingleCategoryDetail))
                                     .patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.updateCategoryDetail))
                                     .delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.DeleteCategory))

// Product Routes
router.route('/product').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('productImage'), errorHandler(AdminController.AddProduct))
                        .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.FetchProduct))
router.route('/product/:productId').delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.DeleteProduct))   
                                   .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.FetchSingleProductDetails)) 
                                   .patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.UpdateSingleProductDetails))                   


// Staff Routes
router.route('/staff').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.AddStaff))      
                      .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.FetchStaffList))      
router.route('/staff/:staffId').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN),errorHandler(AdminController.FetchSingleStaffDetails))    
                               .patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), upload.single('profile'), errorHandler(AdminController.UpdateStaffDetails))  
                               .delete(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.ADMIN), errorHandler(AdminController.deleteStaff))              

export default router