import express from 'express';

import { 
    authUser, 
    logoutUser, 
    customerLogin,
    refreshToken
} from '../controller/AuthController.js';
import {
    getCustomers,
    getPackage,
    getPackages,
    addItem,
    getItems,
    getItem,
    updateItem,
    addDefaultItem,
    deleteDefaultItem,
    getCities,
    addPackageCity,
    handledeleteCity,
    savePackage,
    getDefaultItems,
    addItemToDay,
    getCustomerOrders,
    getOrderSummary,
    deactivatePackage,
    setPaymentStatus,
    getDeliveriesByCreateDate,
    setDelivered,
    getVendorPackageWithFrequency,
    AddCustomerPackage,
    getVendor,
    setVendor,
    setVendorLocation,
    UpdateCustomerPackage
} from '../controller/VendorController.js';
import {
    checkExistingUser,
    saveCustomer,
    getCustomer,
    updateCustomerPassword,
    checkVerificationPin,
    updateCustomer,
    getUserPackages,
    savePackages,
    getCustomerPackages,
    saveCustomerOrder,
    getCustomerByVc,
    cancelCustomerOrder,
    getCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    getCustomerWithAddress
} from '../controller/CustomerController.js';

// const storage = multer.memoryStorage(); // Store file as a buffer in memory
import { protect } from '../middleware/Auth.js';
import { AddCustomerPackageValidation, UpdateCustomerPackageValidation, getCustomerWithAddressValidation } from '../validations/VendorValidations.js';
import { ValidateRequest } from '../middleware/RequestValidator.js';
const router = express.Router();

// router.get('/menu-items', getAllMenuItems);
router.post('/auth-admin', authUser);
router.post('/customer-login', customerLogin);
router.post('/logout-user', logoutUser);
router.post('/customer-logout', logoutUser);
router.get('/get-customer-by-vc/:id', getCustomerByVc);
router.post('/update-customer-password', updateCustomerPassword);
router.post('/check-verification-pin', checkVerificationPin);

router.use(protect);
router.post('/logout-user', logoutUser);
router.post('/check-existing-user', checkExistingUser);
router.post('/save-customer', saveCustomer);
router.get('/get-customers', getCustomers);
router.get('/get-packages', getPackages);
router.get('/get-package/:id', getPackage);
router.post('/add-item', addItem);
router.get('/get-items', getItems);
router.get('/get-item/:id', getItem);
router.post('/update-item/:id', updateItem);
router.post('/add-default-item', addDefaultItem);
router.delete('/delete-default-item/:id', deleteDefaultItem);
router.get('/get-cities', getCities);
router.post('/add-package-city', addPackageCity);
router.delete('/handle-delete-city/:id', handledeleteCity);
router.post('/save-package', savePackage);
router.get('/get-default-items/:id', getDefaultItems);
router.post('/save-packages', savePackages);
router.get('/get-customer/:id', getCustomer);
router.post('/update-customer', updateCustomer);
router.post('/get-user-packages', getUserPackages);
router.post('/add-item-to-day', addItemToDay);
router.get('/get-customer-packages/:id', getCustomerPackages);
router.post('/refresh-token', refreshToken);
router.post('/save-customer-order', saveCustomerOrder);
router.post('/get-customers-orders', getCustomerOrders);
router.post('/get-order-summary', getOrderSummary);
router.get('/deactivate-package/:id', deactivatePackage);
router.post('/set-payment-status', setPaymentStatus);
router.post('/cancel-customer-order', cancelCustomerOrder);
router.get('/get-customer-address/:id', getCustomerAddress);
router.post('/update-customer-address', updateCustomerAddress);
router.delete('/delete-customer-address/:id', deleteCustomerAddress);


router.post("/get-deliveries", getDeliveriesByCreateDate)
router.post("/set-delivered", setDelivered)
router.get("/get-vendor", getVendor)
router.post("/set-vendor", setVendor)
router.post("/set-vendor-location", setVendorLocation)

router.post("/get-package-frequency",getVendorPackageWithFrequency)
router.post("/get-customer-with-address",getCustomerWithAddressValidation,ValidateRequest,getCustomerWithAddress)
router.post("/add-customer-package-with-vendor",AddCustomerPackageValidation,ValidateRequest,AddCustomerPackage)
router.post("/update-customer-package-with-vendor",UpdateCustomerPackageValidation,ValidateRequest,UpdateCustomerPackage)

export default router;