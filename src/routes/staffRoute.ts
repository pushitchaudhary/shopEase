import AdminController from "../controller/AdminController"
import StaffController from "../controller/StaffController"
import authMiddleware, { Role } from "../middleware/authMiddleware"
import errorHandler from "../service/catchAsyncErrror"

const router = require('express').Router()

router.route('/staff-login').post(StaffController.StaffLogin)

// Profile Routes
router.route('/profile').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(StaffController.fetchProfileDetails))
                        .patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(AdminController.ChangeAdminPassword))

// Product Routes
router.route('/product').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(StaffController.fetchProductList))
router.route('/product/:id').get(authMiddleware.isAuthenticatedUser, StaffController.fetchSingleProduct)

router.route('/orders').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF,), errorHandler(StaffController.addOrder))
                       .get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(StaffController.fetchOrder))

router.route('/accept-order/:orderId').patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), StaffController.acceptOrder) 
router.route('/reject-order/:orderId').patch(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), StaffController.RejectOrder) 

router.route('/orders/items/:orderId').get(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(StaffController.fetchOrderItem))

router.route('/search-product').post(authMiddleware.isAuthenticatedUser, authMiddleware.restrictTo(Role.STAFF), errorHandler(StaffController.searchProduct))                      

// Information
router.route('/total-product-info').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTotalProduct))
router.route('/total-sell-info').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTotalSell))
router.route('/total-sell-amount-info').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTotalSellAmount))
router.route('/today-sell-info').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTodaySell))
router.route('/today-sell-amount-info').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTodaySellAmount))
router.route('/top-sell-product').get(authMiddleware.isAuthenticatedUser, errorHandler(StaffController.fetchTopSellProduct))


export default router