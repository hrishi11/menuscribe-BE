import express from "express";

import {
  authUser,
  logoutUser,
  customerLogin,
  refreshToken,
  sendForgetPasswordMsg,
  verifyForgetPasswordLink,
  resetForgetPassword,
  managerSignup,
  checkManagerEmail,
  verifyManagerOtp,
  setCustomerSignup,
  verifCustomerOtp,
  resendCustomerOtp,
  updateCustomerPhone,
  updateCustomerInfo,
  addCustomerAddress,
} from "../controller/AuthController.js";
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
  UpdateCustomerPackage,
  deleteVendorPackageItems,
  getCategories,
  getVendorPackageFrequency,
  uploadDeliveryImage,
  updateVendorPackageItemsQuantity,
  getCouponTypes,
  setPromotions,
  getActivePromotion,
  getInactivePromotion,
  deletePromotion,
  setCustomerPackageRequest,
  getServingMesurements,
  getVendorCategories,
  updateVendorPackageDefaultItems,
  getCustomerPackageRequests,
  packageRequestApprove,
  packageRequestRemove,
  packageRequestReject,
  getCustomerOrder,
  setConfrimOrderPickup,
  setNonConfrimOrderPickup,
  getVendorMenuItems,
  setCustomerOrderItem,
  cencelCustomerOrder,
  getVendorPaymentMethod,
  confirmPaymentRequest,
  getVendorDrivers,
  getVendorCities,
  addDriver,
  deleteVendorPackageCity,
  getEmployees,
  getVendorLocations,
  setEmployee,
  setEmployeeLocation,
  deleteEmployeeLocation,
  validateEmployee,
  activatePackage,
  getOrdersByDate,
  manageOrder,
  getSubscriptionInfo,
  sendRenewalMsg,
  setVendorPaymentMethods,
  addPkgTimeSlots,
  getVendorPackagesForVendorLocation,
  setOrderIsDelivered,
  getPackageTImeSlots,
  getPostalRegions,
  deletePackageTimeSlots,
  getVendorEmployee,
  getPopularItems,
  getProvince,
  setVendorSettingInfo,
  getVendorSettingInfo,
  getVendorPackages,
  checkVendorLocationPostalRegion,
  getVendorPackagePrice,
  getVendorEmployeesWithEmail,
  updateCustomerPackageSlot,
  sendMessageSlotChange,
  updateCustomerPackageAddress,
  setStoreInfo,
  setNewVendorLocation,
  countPackagesMenuItems,
  uploadFile,
  deleteMenuItemsBox,
  addNewSubscriptionPackage,
  countPackagesOrderItems,
  getVendorSettingsInfo,
  getAllDefaultItems,
  updateVendorPackageItems,
  getAllPackagesDefaultItems,
  addDefaultItemToDay,
  getMultipleMenuItems,
  getGlobalDefaultItems,
  getCustomerPaymentLog,
  setCustomerPaymentMethod,
  getVendorTax,
  getVendorCustomerOrders,
  getVendorCustomerAddress,
  getCustomerSubscriptionOrders,
  saveVendorSettingTax,
  getVendorSetting,
  uploadPackageImage,
  checkDeletedTimeSlots,
  savePackageDays,
  sendMsgForPickupOrder,
  getVendorPackagesForVendor,
  setUserCustomersByVendor,
  getVendorWebsiteSetting,
  setVendorWebsiteSetting,
  deleteVendorWebsiteSetting,
  addVendorDefaultItem,
  deleteVendorDefaultItem,
  deletePackageImage,
  deleteDefaultItemImage,
  getCustomerPaymentStatus,
  getVendorBillingInfo,
  getVendorSettingsById,
  getAllUserVendors,
  setVendorSettings,
  createVendorSettings,
  createVendorTamplateDesigner,
  getVendorTamplateDesigner,
  getVendorTamplateInfo,
  getAllVendorPackages,
  changeCustomerPackage,
  getVendorSettings,
  deleteVendorMenuItem,
  deleteLocation,
  getVendorSettingsByVendorId,
  getVendorRoles,
  // addVendorLocationPostalRegion,
} from "../controller/VendorController.js";
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
  getCustomerWithAddress,
  setCustomerAddress,
  saveAllCustomerOrders,
  updateCustomerPackage,
  updateSubscription,
  getCustomerOrderFromId,
  filterOrderDates,
  getCustomerActivePackages,
  renewPackageSubscription,
  getCustomersByOrderDate,
  updateCustomerOrder,
  getCustomerPackagess,
  updateCustomerAddressFromCustomerDashboard,
  setOrderItemFromCustomerDashboard,
  updateCustomerProfile,
  getOrderCreationDates,
  getOrderCancelationDates,
  cancelCustomerPackage,
  getVendorOrders,
  saveExistingCustomer,
  getResturantDetails,
  checkEmail,
  createUserFromOrderConformation,
  getCustomerActiveSubscriptions,
  getCustomerCustomerPackageRequest,
  getPackagesWithoutLoginByVendorId,
  getCustomerPackageRequest,
  addCustomerLink,
  updatePickupDeliveryStatus,
  getVendorPackageByDate,
  getHolidays,
  setHolidays,
  deleteHolidays,
  getUpcomingOrders,
  getCurrentSubscription,
  createPackageRequensts,
  setOrder,
  getVendorPackageForCustomer,
  setInitCustomerPackageRequest,
  setCustomerOrderStatus,
  getAllCustomerOrders,
  getVendorPackageByLocation,
  getCustomerDeliveryLocations,
  getSelectedCustomerPackage,
  customerPackageCancelByCustomer,
  getCustomerPaymentMethod,
  updateCustomerPaymentMethod,
  getCustomerDeliveryAddress,
  updateCustomerPackageAddressByCustomer,
  getCustomerBillingInfo,
} from "../controller/CustomerController.js";

// const storage = multer.memoryStorage(); // Store file as a buffer in memory
import { protect } from "../middleware/Auth.js";
import {
  AddCustomerPackageValidation,
  UpdateCustomerPackageValidation,
  getCustomerWithAddressValidation,
} from "../validations/VendorValidations.js";
import { ValidateRequest } from "../middleware/RequestValidator.js";
import { upload } from "../config/multerConfig.js";
import { multerUploads } from "../middleware/Multer.js";
import S3Upload from "../utils/S3 Config/S3 config.js";
const router = express.Router();

// router.get('/menu-items', getAllMenuItems);
router.post("/auth-admin", authUser);
router.post("/manager-signup", managerSignup);
router.post("/check-vendor-email", checkManagerEmail);
router.post("/verify-manager-otp", verifyManagerOtp);
router.post("/update-customer-phone", updateCustomerPhone);
router.post("/update-customer-info", updateCustomerInfo);
router.post("/verify-customer-otp", verifCustomerOtp);
router.post("/resend-customer-otp", resendCustomerOtp);
router.post("/customer-login", customerLogin);
router.post("/logout-user", logoutUser);
router.post("/customer-logout", logoutUser);
router.get("/get-customer-by-vc/:id", getCustomerByVc);
router.post("/update-customer-password", updateCustomerPassword);
router.post("/check-verification-pin", checkVerificationPin);
router.post("/send-verification-password", sendForgetPasswordMsg);
router.post("/verify-forget-passwor-link", verifyForgetPasswordLink);
router.post("/reset-forget-password", resetForgetPassword);

router.post(
  "/get-packages-without-login-by-vendorid",
  getPackagesWithoutLoginByVendorId
);
router.post("/save-vendor-setting-tax", saveVendorSettingTax);
router.get("/get-vendor-setting", getVendorSetting);
router.post("/get-resturant-details", getResturantDetails);
router.post("/check-email", checkEmail);
router.post(
  "/create-user-from-order-conformation",
  createUserFromOrderConformation
);
router.post(
  "/create-package-request-from-order-conformation",
  createPackageRequensts
);

router.post("/get-vendor-employes-with-email", getVendorEmployeesWithEmail);
router.get("/get-vendor-package-for-customer/:id", getVendorPackageForCustomer);
router.post("/add-customer-address", addCustomerAddress);
// router.post("/set-credit-card-detail", setCreditCardDetail);

router.get("/get-cities", getCities);
router.get("/get-postal-regions", getPostalRegions);
router.post("/set-new-vendor-location", setNewVendorLocation);
router.post(`/set-store-info`, setStoreInfo);
router.post("/upload-file", multerUploads.single("image"), uploadFile);
router.post("/customer-signup", setCustomerSignup);
router.post(
  "/upload-package-image",
  S3Upload.single("image"),
  uploadPackageImage
);

router.post(
  "/set-init-customer-package-request",
  setInitCustomerPackageRequest
);

router.use(protect);
router.post("/logout-user", logoutUser);
router.post("/check-existing-user", checkExistingUser);
router.post("/save-existing-customer", saveExistingCustomer);
router.post("/save-customer", saveCustomer);
router.get("/get-customers", getCustomers);
router.get("/get-packages", getPackages);
router.get("/get-vendor-pakcages/:id", getVendorPackages);
router.get("/get-package/:id", getPackage);
router.post("/add-item", addItem);
router.get("/get-items", getItems);
router.get("/get-item/:id", getItem);
router.post("/update-item/:id", updateItem);
router.post("/add-default-item", addDefaultItem);
router.delete("/delete-default-item/:id", deleteDefaultItem);
router.get("/get-vendor-cities", getVendorCities);
router.post("/add-package-city", addPackageCity);
router.delete("/handle-delete-city/:id", handledeleteCity);
router.post("/save-package", savePackage);
router.post("/save-package-days", savePackageDays);
router.get("/get-default-items/:id", getDefaultItems);
router.get("/get-all-default-items", getAllDefaultItems);
router.delete("/delete-menu-item/:id", deleteMenuItemsBox);
router.post("/save-packages", savePackages);
router.get("/get-customer", getCustomer);
router.post("/update-customer", updateCustomer);
router.post("/get-user-packages", getUserPackages);
router.post("/add-item-to-day", addItemToDay);
router.get("/get-customer-packages/:id", getCustomerPackages);
router.post("/change-customer-package", changeCustomerPackage);
router.get("/get-vendor-customer-address/:id", getVendorCustomerAddress);
router.get("/get-customer-packagess/:id", getCustomerPackagess);
router.get("/get-customer-active-packages/:id", getCustomerActivePackages);
router.patch("/update-customer-profile", updateCustomerProfile);
router.get(
  "/get-customer-active-subscriptions",
  getCustomerActiveSubscriptions
);
router.get("/customer_package_requests", getCustomerCustomerPackageRequest);
router.post("/set-customer-package-request", setCustomerPackageRequest);

router.post("/update-customer-package", updateCustomerPackage);
router.post("/get-order-creation-dates", getOrderCreationDates);
router.post("/get-order-cancelation-dates", getOrderCancelationDates);
router.post("/cancel-customer-package", cancelCustomerPackage);

router.post("/update-customer-subscription", updateSubscription);
router.post("/renew-package-subscription", renewPackageSubscription);
router.post("/filter-order-dates", filterOrderDates);

router.get("/get-categories", getCategories);

router.get("/get-vendor-package-frequency", getVendorPackageFrequency);

router.post("/refresh-token", refreshToken);
router.post("/save-customer-order", saveCustomerOrder);
router.post("/get-customers-orders", getCustomerOrders);
router.post("/set-customer-order-status", setCustomerOrderStatus);

router.get("/get-customers-order/:id", getCustomerOrder);
router.post("/cencel-customers-order/:id", cencelCustomerOrder);

router.post("/set-confrim-order-pickup/:id", setConfrimOrderPickup);
router.post("/set-non-confrim-order-pickup/:id", setNonConfrimOrderPickup);

router.get("/get-customer-order-from-id/:id", getCustomerOrderFromId);
router.post("/get-order-summary", getOrderSummary);
router.get("/deactivate-package/:id", deactivatePackage);
router.get("/activate-package/:id", activatePackage);
router.post("/set-payment-status", setPaymentStatus);
router.post("/cancel-customer-order", cancelCustomerOrder);
router.patch("/update-pickup-delivery-status/:id", updatePickupDeliveryStatus);
router.get("/get-customer-address", getCustomerAddress);
router.post("/set-customer-address", setCustomerAddress);
router.patch(
  "/set-customer-address",
  updateCustomerAddressFromCustomerDashboard
);
router.post("/update-customer-address", updateCustomerAddress);
router.delete("/delete-customer-address/:id", deleteCustomerAddress);
router.post("/save-all-customer-orders", saveAllCustomerOrders);
router.post("/get-customers-by-order-date", getCustomersByOrderDate);
router.patch("/update-customer-order", updateCustomerOrder);

router.post("/get-deliveries", getDeliveriesByCreateDate);
router.post("/set-delivered", setDelivered);
router.post("/set-promotions", setPromotions);
router.delete("/delete-promotion/:id", deletePromotion);
router.post(
  "/upload-delivery-image",
  upload.single("image"),
  uploadDeliveryImage
);

router.post("/set-customer-order-item", setCustomerOrderItem);

router.post(
  "/set-customer-order-item-from-customer-dashboard",
  setOrderItemFromCustomerDashboard
);

router.get("/get-serving-measurements", getServingMesurements);
router.get("/get-vendor-categories", getVendorCategories);

router.get("/get-vendor-menu-items", getVendorMenuItems);

router.get("/get-coupon-types", getCouponTypes);
router.get("/get-active-promotions", getActivePromotion);
router.get("/get-inactive-promotions", getInactivePromotion);

router.get("/get-vendor", getVendor);
router.post("/set-vendor", setVendor);
router.post("/set-vendor-location", setVendorLocation);

router.post("/get-package-frequency", getVendorPackageWithFrequency);
router.post(
  "/get-customer-with-address",
  getCustomerWithAddressValidation,
  ValidateRequest,
  getCustomerWithAddress
);
router.post(
  "/add-customer-package-with-vendor",
  AddCustomerPackageValidation,
  ValidateRequest,
  AddCustomerPackage
);
router.post(
  "/update-customer-package-with-vendor",
  UpdateCustomerPackageValidation,
  ValidateRequest,
  UpdateCustomerPackage
);

router.post("/update-vendor-package-items", updateVendorPackageItems);
router.post("/delete-vendor-package-items", deleteVendorPackageItems);
router.post(
  "/update-vendor-package-items-quantity",
  updateVendorPackageItemsQuantity
);

//Vendor Package Dafautl Items
router.post(
  "/update-vendor-package-default-items",
  updateVendorPackageDefaultItems
);
//Customer Package Requests
router.get("/get-customer-package-requests", getCustomerPackageRequests);
router.post("/package-request-approve", packageRequestApprove);
router.post("/add-new-subscription-package", addNewSubscriptionPackage);
router.post("/package-request-remove", packageRequestRemove);
router.post("/package-request-reject", packageRequestReject);
router.post("/confirm-payment-request", confirmPaymentRequest);

router.get("/get-vendor-payment-method", getVendorPaymentMethod);

router.get("/get-vendor-drivers", getVendorDrivers);
router.post("/add-driver", addDriver);
router.get("/get-vendor-order", getVendorOrders);
router.delete("/delete-vendor-package-city/:id", deleteVendorPackageCity);
// router.post("/cancel-order-reason", deleteVendorPackageCity);
router.post("/set-vendor-payment-methods", setVendorPaymentMethods);

// Team Settings
router.post("/validate-employee", validateEmployee);
router.get("/get-employees", getEmployees);
router.get("/get-vendor-locations", getVendorLocations);
router.patch("/set-employee", setEmployee);
router.post("/employee-location", setEmployeeLocation);
router.post("/delete-employee-location", deleteEmployeeLocation);

// Order Manager
router.post("/get-orders-by-date", getOrdersByDate);
router.post("/manage-order", manageOrder);

router.post("/get-subscription-info", getSubscriptionInfo);
router.post("/send-renew-package-msg", sendRenewalMsg);
router.post("/add-package-time-slots", addPkgTimeSlots);

router.post("/set-order-is-delivered", setOrderIsDelivered);
router.post("/set-order", setOrder);

//  Settings Delete
router.post(
  "/get-vendor-packages-for-vendor-location",
  getVendorPackagesForVendorLocation
);
router.get("/get-vendor-packages-for-vendor", getVendorPackagesForVendor);
router.delete("/delete-vendor-location/:id", deleteLocation);
router.get("/get-package-timeslots/:id", getPackageTImeSlots);
router.delete("/delete-package-timeslots/:id", deletePackageTimeSlots);
router.get("/check-deleted-time-slots/:id", checkDeletedTimeSlots);

router.get("/get-customer-package-request-one", getCustomerPackageRequest);
router.post("/add-customer-link", addCustomerLink);

router.post("/check-vendor-postal-region", checkVendorLocationPostalRegion);
router.post("/get-vendor-employee", getVendorEmployee);
router.get("/get-popular-items", getPopularItems);
router.get("/get-province", getProvince);
router.post("/set-vendor-setting-info", setVendorSettingInfo);
router.get("/get-vendor-setting-info", getVendorSettingInfo);
router.get("/get-vendor-settings-info", getVendorSettingsInfo);
router.get("/get-vendor-package-price/:id", getVendorPackagePrice);
router.patch("/update-customer-package-slot/:id", updateCustomerPackageSlot);
router.patch(
  "/update-customer-package-address/:id",
  updateCustomerPackageAddress
);
// router.patch("/update-customer-package-address/:id", updateCustomerPackageAddress);
router.post("/send-message-slot-change", sendMessageSlotChange);
router.post("/get-vendor-package-by-date", getVendorPackageByDate);
router.get("/get-upcomming-orders/:id", getUpcomingOrders);
router.get("/get-current-subscription/:id", getCurrentSubscription);

// Holidays
router.get("/get-holidays", getHolidays);
router.post(`/set-holidays`, setHolidays);
router.delete("/delete-holidays/:id", deleteHolidays);

router.get("/count-packages-menu-items", countPackagesMenuItems);
router.post("/count-packages-order-items", countPackagesOrderItems);
router.get("/get-all-packages-default-items", getAllPackagesDefaultItems);
router.post("/add-items-to-all-day", addDefaultItemToDay);
router.get("/get-multiple-menu-items/:id", getMultipleMenuItems);
router.get("/get-global-default-items", getGlobalDefaultItems);
router.get("/get-customer-payment-log/:id", getCustomerPaymentLog);
router.get("/get-vendor-tax", getVendorTax);
router.post("/set-customer-payment-method", setCustomerPaymentMethod);
router.post("/get-vendor-customer-orders/:id", getVendorCustomerOrders);
router.get(
  "/get-customer-subscription-orders/:id",
  getCustomerSubscriptionOrders
);

router.post("/send-msg-for-pickup-order", sendMsgForPickupOrder);
router.post("/set-user-customers-by-vendor", setUserCustomersByVendor);
router.get("/get-vendor-website-setting", getVendorWebsiteSetting);
router.post("/set-vendor-website-setting", setVendorWebsiteSetting);
router.delete("/delete-vendor-website-setting/:id", deleteVendorWebsiteSetting);
router.post(
  "/add-vendor-default-item",
  S3Upload.single("image"),
  addVendorDefaultItem
);
router.delete("/delete-vendor-default-item/:id", deleteVendorDefaultItem);
router.post("/delete-package-image", deletePackageImage);
router.post("/delete-default-item-image", deleteDefaultItemImage);
router.get("/get-customer-payment-status", getCustomerPaymentStatus);
router.get("/get-vendor-billing-info", getVendorBillingInfo);
router.get("/get-customer-billing-info", getCustomerBillingInfo);
router.get("/get-vendor-setting-by-id/:id", getVendorSettingsById);
router.get("/get-all-user-vendors", getAllUserVendors);
router.post("/set-vendor-settings", setVendorSettings);
router.post("/create-vendor-settings", createVendorSettings);
router.post("/create-vendor-tamplate-designer", createVendorTamplateDesigner);
router.get("/get-vendor-tamplate-designer", getVendorTamplateDesigner);
router.get("/get-vendor-tamplate-info", getVendorTamplateInfo);
router.get("/get-all-vendor-packages", getAllVendorPackages);
router.post("/get-all-customer-orders", getAllCustomerOrders);
router.get("/get-vendor-settings", getVendorSettings);
router.post("/get-vendor-package-by-location/", getVendorPackageByLocation);
router.delete("/delete-vendor-menu-item/:id", deleteVendorMenuItem);
router.get(
  "/get-vendor-settings-by-vendor-id/:id",
  getVendorSettingsByVendorId
);
router.get("/get-customer-delivery-locations", getCustomerDeliveryLocations);
router.get("/get-vendor-roles", getVendorRoles);
router.get("/get-selected-customer-package", getSelectedCustomerPackage);
router.post(
  "/customer-package-cancel-by-customer",
  customerPackageCancelByCustomer
);
router.get("/get-customer-payment-method", getCustomerPaymentMethod);
router.patch("/update-customer-payment-method", updateCustomerPaymentMethod);
router.get("/get-customer-delivery-address/:id", getCustomerDeliveryAddress);
router.post(
  "/update-customer-package-address-by-customer",
  updateCustomerPackageAddressByCustomer
);

export default router;
