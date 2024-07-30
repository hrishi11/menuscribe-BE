import { VendorPackageDefaultItem } from "./VendorModels/VendorPackageDefaultItem.js";
import { VendorPackage } from "./VendorModels/VendorPackage.js";
import { VendorMenuItems } from "./VendorModels/VendorMenuItems.js";
import { VendorMenuQuantity } from "./VendorModels/VendorMenuQuantity.js";
import { VendorPackageCities } from "./VendorModels/VendorPackageCites.js";
import { VendorPackagePrice } from "./VendorModels/VendorPackagePrice.js";
import { UserVendor } from "./VendorModels/UserVendor.js";
import { UserCustomer } from "./CustomerModels/UserCustomer.js";
import { Vendor } from "./VendorModels/Vendor.js";
import { VendorLocations } from "./VendorModels/VendorLocation.js";
import { VendorLocationServiceAreas } from "./VendorModels/VendorLocationServiceAreas.js";
import { VendorPackageMenuItems } from "./VendorModels/VendorPackageMenuItems.js";
import { CustomerPackage } from "./CustomerModels/CustomerPackage.js";
import { CustomerOrder } from "./CustomerModels/CustomerOrder.js";
import { CustomerOrderItem } from "./CustomerModels/CustomerOrderItem.js";
import { CitiesActive } from "./VendorModels/CitiesActive.js";
import { CitiesAll } from "./VendorModels/CitiesAll.js";
import { VendorCustomerLink } from "./VendorModels/VendorCustomerLink.js";
import { VendorSettings } from "./VendorModels/VendorSetting.js";
import { CustomerDeliveryAddress } from "./CustomerModels/CustomerDeliveryAddress.js";
import { VendorPackageFrequency } from "./VendorModels/VendorPackageFrequency.js";
import { CustomerSubscription } from "./CustomerModels/CustomerSubscription.js";
import { CategoryVendor } from "./VendorModels/CategoryVendor.js";
import { Categories } from "./VendorModels/Categories.js";
import { CouponTypes } from "./CouponModels/CouponTypes.js";
import { VendorCoupon } from "./CouponModels/VendorCoupon.js";
import { VendorCouponPackages } from "./CouponModels/VendorCouponPackages.js";
import { CustomerPackageRequest } from "./CustomerModels/CustomerPackageRequest.js";
import { ServingMesurements } from "./VendorModels/ServingMesureMents.js";
import { VendorDrivers } from "./VendorModels/VendorDrivers.js";
import { DriverDeliveries } from "./VendorModels/DriverDeliveries.js";
import { VendorEmployee } from "./VendorModels/VendorEmployee.js";
import { VendorEmployeeLocations } from "./VendorModels/VendorEmployeeLocations.js";
import { CustomerPackageSubscription } from "./CustomerModels/CustomerPackageSubscription.js";
import { PaymentMethods } from "./VendorModels/PaymentMethods.js";
import { VendorPaymentMethods } from "./VendorModels/VendorPaymentMethods.js";
import { VendorLocationPostalRegions } from "./VendorModels/VendorLocationPostalRegion.js";
import { VendorPackageSlots } from "./VendorModels/VendorPackageSlots.js";
import { VendorPackageLocations } from "./VendorModels/VendorPackageLocation.js";
import { PostalRegions } from "./VendorModels/PostalRegion.js";
import { VendorRoles } from "./VendorModels/VendorRole.js";
import { VendorDefaultItem } from "./VendorModels/VendorDefaultItems.js";
import { VendorCustomerPaymentLog } from "./VendorModels/VendorCustomerPaymentLog.js";
import { VendorCities } from "./VendorModels/VendorCities.js";
import { PlatformVendorBilling } from "./VendorModels/PlatformVendorBilling.js";
import { Plans } from "./VendorModels/Plans.js";
import { CustomerPaymentMethod } from "./CustomerModels/CustomerPaymentMethod.js";

VendorPackage.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});
Vendor.hasMany(VendorPackage, {
  foreignKey: "vendor_id",
});

VendorCities.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});
Vendor.hasMany(VendorCities, {
  foreignKey: "vendor_id",
});

VendorPackageSlots.hasMany(CustomerPackageRequest, {
  foreignKey: "timeslot_id",
});
CustomerPackageRequest.belongsTo(VendorPackageSlots, {
  foreignKey: "timeslot_id",
});

CustomerPackage.belongsTo(VendorPackageSlots, {
  foreignKey: "delivery_slot_id",
});
VendorPackageSlots.hasMany(CustomerPackage, {
  foreignKey: "delivery_slot_id",
});

//Vendor Driver Deliveries association
CustomerOrder.belongsTo(VendorDrivers, {
  foreignKey: "vendor_employee_id",
});
VendorDrivers.hasMany(CustomerOrder, {
  foreignKey: "vendor_employee_id",
});

Vendor.hasMany(VendorDrivers, {
  foreignKey: "vendor_id",
});
VendorDrivers.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});

VendorEmployee.belongsTo(VendorRoles, {
  foreignKey: "vendor_role_id",
});
VendorRoles.hasMany(VendorEmployee, {
  foreignKey: "vendor_role_id",
});

// User Customer relation with Cities All

CustomerDeliveryAddress.belongsTo(UserCustomer, {
  foreignKey: "customer_id",
  as: "UserCustomer",
});

UserCustomer.hasMany(CustomerDeliveryAddress, {
  foreignKey: "customer_id",
  // as: "CustomerDe",
});

UserCustomer.belongsTo(CitiesAll, { foreignKey: "city_id", as: "CitiesAll" });
VendorLocations.belongsTo(CitiesAll, {
  foreignKey: "city_id",
  as: "VendorLocations",
});
CitiesAll.hasMany(VendorLocations, {
  foreignKey: "city_id",
  as: "CitiesAll",
});

VendorPackageCities.belongsTo(CitiesAll, {
  foreignKey: "city_id",
  as: "VendorPackageCities",
});

CitiesAll.hasMany(VendorPackageCities, {
  foreignKey: "city_id",
  as: "Cities",
});

//vendor package -- vendor package default items
VendorPackage.hasMany(VendorPackageDefaultItem, { foreignKey: "package_id" });
VendorPackageDefaultItem.belongsTo(VendorPackage, { foreignKey: "package_id" });

CustomerDeliveryAddress.belongsTo(PostalRegions, {
  foreignKey: "postal_region_id",
});
PostalRegions.hasMany(CustomerDeliveryAddress, {
  foreignKey: "postal_region_id",
});

VendorLocationPostalRegions.belongsTo(PostalRegions, {
  foreignKey: "postal_region_id",
});
PostalRegions.hasMany(VendorLocationPostalRegions, {
  foreignKey: "postal_region_id",
});

VendorLocationPostalRegions.belongsTo(VendorPackage, {
  foreignKey: "package_id",
});
VendorPackage.hasMany(VendorLocationPostalRegions, {
  foreignKey: "package_id",
});

UserCustomer.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});
Vendor.hasMany(UserCustomer, {
  foreignKey: "vendor_id",
});

UserVendor.hasMany(CustomerOrder, {
  foreignKey: "driver_id",
});
CustomerOrder.belongsTo(UserVendor, {
  foreignKey: "driver_id",
});
UserVendor.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});
Vendor.hasMany(UserVendor, {
  foreignKey: "vendor_id",
});
CustomerDeliveryAddress.belongsTo(UserCustomer, { foreignKey: "customer_id" });
UserCustomer.hasMany(CustomerDeliveryAddress, { foreignKey: "customer_id" });

//vendor package -- vendor menu quantity
VendorMenuItems.hasMany(VendorMenuQuantity, { foreignKey: "item_id" });
VendorMenuQuantity.belongsTo(VendorMenuItems, { foreignKey: "item_id" });
//vendor package -- vendor package cities
VendorPackage.hasMany(VendorPackageCities, { foreignKey: "package_id" });
VendorPackageCities.belongsTo(VendorPackage, { foreignKey: "package_id" });

//vendor package -- vendor package price
VendorPackage.hasMany(VendorPackagePrice, { foreignKey: "package_id" });
VendorPackagePrice.belongsTo(VendorPackage, { foreignKey: "package_id" });

VendorPackage.hasMany(VendorPackageFrequency, { foreignKey: "package_id" });
VendorPackageFrequency.belongsTo(VendorPackage, { foreignKey: "package_id" });

VendorPackageDefaultItem.hasMany(VendorPackageMenuItems, {
  foreignKey: "menu_default_group_id",
});
VendorPackageMenuItems.belongsTo(VendorPackageDefaultItem, {
  foreignKey: "menu_default_group_id",
});

// VendorPackageDefaultItem.hasMany(VendorLocations, {
//   foreignKey: "vendor_location_id",
// });
// VendorLocations.belongsTo(VendorPackageDefaultItem, {
//   foreignKey: "vendor_location_id",
// });

// Categories---Categories Vendor
Categories.hasMany(CategoryVendor, { foreignKey: "category_id" });
CategoryVendor.belongsTo(Categories, { foreignKey: "category_id" });

//cities active -- vendor package cities
CitiesActive.hasMany(VendorPackageCities, { foreignKey: "city_id" });
VendorPackageCities.belongsTo(CitiesActive, { foreignKey: "city_id" });

VendorPackageMenuItems.hasMany(CustomerOrderItem, { foreignKey: "item_id" });
CustomerOrderItem.belongsTo(VendorPackageMenuItems, { foreignKey: "item_id" });

VendorLocations.hasMany(VendorPackage, { foreignKey: "vendor_location_id" });
VendorPackage.belongsTo(VendorLocations, { foreignKey: "vendor_location_id" });

CustomerPackage.hasMany(CustomerOrder, { foreignKey: "customer_package_id" });
CustomerOrder.belongsTo(CustomerPackage, { foreignKey: "customer_package_id" });

VendorPackagePrice.hasMany(CustomerPackageRequest, {
  foreignKey: "frequency_id",
});
CustomerPackageRequest.belongsTo(VendorPackagePrice, {
  foreignKey: "frequency_id",
});

//customer-packages -- packages
VendorLocations.hasMany(CustomerPackage, { foreignKey: "vendor_location_id" });
CustomerPackage.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});

//customer-packages -- packages
VendorPackage.hasMany(CustomerPackage, { foreignKey: "package_id" });
CustomerPackage.belongsTo(VendorPackage, { foreignKey: "package_id" });

//customer-packages-subscription -- packages
CustomerPackageSubscription.belongsTo(CustomerPackage, {
  foreignKey: "customer_package_id",
});
CustomerPackage.hasMany(CustomerPackageSubscription, {
  foreignKey: "customer_package_id",
});

CustomerPackageSubscription.belongsTo(PaymentMethods, {
  foreignKey: "payment_method_id",
});
PaymentMethods.hasMany(CustomerPackageSubscription, {
  foreignKey: "payment_method_id",
});

CustomerOrder.belongsTo(Plans, {
  foreignKey: "plan_id",
});
Plans.hasMany(CustomerOrder, {
  foreignKey: "plan_id",
});
VendorCustomerPaymentLog.belongsTo(Plans, {
  foreignKey: "plan_id",
});
Plans.hasMany(VendorCustomerPaymentLog, {
  foreignKey: "plan_id",
});
VendorCustomerPaymentLog.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});
Vendor.hasMany(VendorCustomerPaymentLog, {
  foreignKey: "vendor_id",
});

PlatformVendorBilling.belongsTo(Plans, {
  foreignKey: "plan_id",
});
Plans.hasMany(PlatformVendorBilling, {
  foreignKey: "plan_id",
});

UserVendor.belongsTo(VendorRoles, {
  foreignKey: "role_id",
});
VendorRoles.hasMany(UserVendor, {
  foreignKey: "role_id",
});

CustomerPackageSubscription.hasMany(CustomerOrder, {
  foreignKey: "customer_package_subscription_id",
});
CustomerOrder.belongsTo(CustomerPackageSubscription, {
  foreignKey: "customer_package_subscription_id",
});
Vendor.hasMany(VendorEmployee, {
  foreignKey: "vendor_id",
});
VendorEmployee.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});

VendorPackagePrice.hasMany(CustomerPackage, {
  foreignKey: "vendor_package_price_id",
});
CustomerPackage.belongsTo(VendorPackagePrice, {
  foreignKey: "vendor_package_price_id",
});

VendorEmployee.hasMany(VendorEmployeeLocations, {
  foreignKey: "vendor_employee_id",
});
VendorEmployeeLocations.belongsTo(VendorEmployee, {
  foreignKey: "vendor_employee_id",
});

VendorPackagePrice.hasMany(CustomerPackage, {
  foreignKey: "vendor_package_price_id",
});
CustomerPackage.belongsTo(VendorPackagePrice, {
  foreignKey: "vendor_package_price_id",
});

VendorPackagePrice.belongsTo(VendorPackageSlots, {
  foreignKey: "vendor_package_price_id",
});
VendorPackageSlots.hasMany(VendorPackagePrice, {
  foreignKey: "vendor_package_price_id",
});

VendorLocationPostalRegions.belongsTo(PostalRegions, {
  foreignKey: "postal_region_id",
});
PostalRegions.hasMany(VendorLocationPostalRegions, {
  foreignKey: "postal_region_id",
});

VendorPackageFrequency.hasMany(CustomerPackage, { foreignKey: "frequency_id" });
CustomerPackage.belongsTo(VendorPackageFrequency, {
  foreignKey: "frequency_id",
});

// CustomerSubscription.hasMany(CustomerPackage, {foreignKey: 'customer_package_id'})
// CustomerPackage.belongsTo(CustomerSubscription, { foreignKey: 'customer_package_id' });
CustomerPackage.hasMany(CustomerSubscription, {
  foreignKey: "customer_package_id",
});

CustomerSubscription.belongsTo(CustomerPackage, {
  foreignKey: "customer_package_id",
});
Vendor.hasMany(VendorMenuItems, {
  foreignKey: "vendor_id",
});

VendorMenuItems.belongsTo(Vendor, {
  foreignKey: "vendor_id",
});

//Vendor Package Default Item -- vendor menu items
VendorPackageDefaultItem.belongsTo(VendorMenuItems, { foreignKey: "item_id" });
//VendorPackageDefaultItem --     VendorPackageMenuItems
// VendorPackageDefaultItem.hasOne(VendorPackageMenuItems, {
//   foreignKey: "menu_default_group_id",
// });
// VendorPackageMenuItems.belongsTo(VendorPackageDefaultItem, {
//   foreignKey: "menu_default_group_id",
// });

//Vendor Package Frequency -- Vendor Package
VendorPackage.hasMany(VendorPackageFrequency, { foreignKey: "package_id" });
VendorPackageFrequency.belongsTo(VendorPackage, { foreignKey: "package_id" });
//user customer -- customer order
UserCustomer.hasOne(CustomerOrder, { foreignKey: "user_id" });
CustomerOrder.belongsTo(UserCustomer, { foreignKey: "user_id" });

// VendorPackagePrice.hasMany(VendorCouponPackages, {
//   foreignKey: "vendor_package_price_id",
// });
// VendorCouponPackages.belongsTo(VendorPackagePrice, {
//   foreignKey: "vendor_package_price_id",
// });

CouponTypes.hasMany(VendorCoupon, {
  foreignKey: "coupon_type_id",
});
VendorCoupon.belongsTo(CouponTypes, {
  foreignKey: "coupon_type_id",
});

VendorPackageLocations.belongsTo(VendorPackage, {
  foreignKey: "vendor_package_id",
});
VendorPackage.hasMany(VendorPackageLocations, {
  foreignKey: "vendor_package_id",
});

VendorCoupon.hasMany(VendorCouponPackages, {
  foreignKey: "vendor_coupon_id",
});
VendorCouponPackages.belongsTo(VendorCoupon, {
  foreignKey: "vendor_coupon_id",
});

UserCustomer.hasMany(CustomerPackageRequest, { foreignKey: "user_id" });
CustomerPackageRequest.belongsTo(UserCustomer, { foreignKey: "user_id" });

VendorPackage.hasMany(CustomerPackageRequest, { foreignKey: "package_id" });
CustomerPackageRequest.belongsTo(VendorPackage, { foreignKey: "package_id" });

VendorPackageFrequency.hasMany(CustomerPackageRequest, {
  foreignKey: "frequency_id",
});
CustomerPackageRequest.belongsTo(VendorPackageFrequency, {
  foreignKey: "frequency_id",
});
CustomerDeliveryAddress.hasMany(CustomerPackageRequest, {
  foreignKey: "customer_delivery_address_id",
});
CustomerPackageRequest.belongsTo(CustomerDeliveryAddress, {
  foreignKey: "customer_delivery_address_id",
});
VendorLocations.hasMany(CustomerPackageRequest, {
  foreignKey: "vendor_location_id",
});
CustomerPackageRequest.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});

UserCustomer.hasMany(CustomerPackage, { foreignKey: "user_id" });
CustomerPackage.belongsTo(UserCustomer, { foreignKey: "user_id" });

CustomerDeliveryAddress.hasMany(CustomerPackage, {
  foreignKey: "customer_delivery_address_id",
});
CustomerPackage.belongsTo(CustomerDeliveryAddress, {
  foreignKey: "customer_delivery_address_id",
});

VendorPackageLocations.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});
VendorLocations.hasMany(VendorPackageLocations, {
  foreignKey: "vendor_location_id",
});

VendorLocations.belongsTo(PostalRegions, {
  foreignKey: "postal_id",
});
PostalRegions.hasMany(VendorLocations, {
  foreignKey: "postal_id",
});

//customer order -- vendor package
VendorPackage.hasMany(CustomerOrder, { foreignKey: "package_id" });
CustomerOrder.belongsTo(VendorPackage, { foreignKey: "package_id" });
UserCustomer.belongsTo(VendorPackage, { foreignKey: "vendor_id" });
//customer order -- vendor package
CustomerOrder.hasMany(CustomerOrderItem, {
  foreignKey: "order_id",
});
CustomerOrderItem.belongsTo(CustomerOrder, {
  foreignKey: "order_id",
});

UserCustomer.hasOne(CustomerPaymentMethod, {
  foreignKey: "customer_id",
});
CustomerPaymentMethod.belongsTo(UserCustomer, {
  foreignKey: "customer_id",
});
//customer order -- vendor package
CustomerOrderItem.belongsTo(VendorMenuItems, { foreignKey: "item_id" });
//vendorPackage -- item quantity
VendorPackageMenuItems.belongsTo(VendorMenuQuantity, {
  foreignKey: "quantity_id",
});
//customer order -- vendor package
VendorPackageMenuItems.belongsTo(VendorMenuItems, {
  foreignKey: "menu_item_id",
});
//
UserCustomer.hasOne(VendorCustomerLink, { foreignKey: "customer_id" });
UserCustomer.hasMany(CustomerDeliveryAddress, { foreignKey: "customer_id" });
//
//CustomerDeliveryAddress.hasOne(CitiesAll, {foreignKey: 'id'})
CustomerDeliveryAddress.belongsTo(CitiesAll, {
  foreignKey: "city_id",
  targetKey: "id",
});
CitiesAll.hasMany(CustomerDeliveryAddress, {
  foreignKey: "city_id",
  sourceKey: "id",
});

//CustomerDeliveryAddress to CustomerOrders
CustomerDeliveryAddress.hasMany(CustomerOrder, {
  foreignKey: "customer_delivery_address_id",
});
CustomerOrder.belongsTo(CustomerDeliveryAddress, {
  foreignKey: "customer_delivery_address_id",
});

VendorLocations.belongsTo(CitiesAll, {
  foreignKey: "city_id",
  targetKey: "id",
});
Vendor.hasMany(VendorLocations, { foreignKey: "vendor_id" });
VendorLocations.belongsTo(Vendor, { foreignKey: "vendor_id" });

// VendorLocations.hasMany(VendorLocationServiceAreas, {foreignKey: 'id', sourceKey: 'vendor_location_id'})
VendorLocationServiceAreas.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
  targetKey: "id",
});

// ----------Team Settings--------
VendorLocationPostalRegions.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});
VendorLocations.hasMany(VendorLocationPostalRegions, {
  foreignKey: "vendor_location_id",
});

CustomerOrder.belongsTo(VendorEmployee, {
  foreignKey: "vendor_employee_id",
});
VendorEmployee.hasMany(CustomerOrder, {
  foreignKey: "vendor_employee_id",
});

CustomerOrder.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});
VendorLocations.hasMany(CustomerOrder, {
  foreignKey: "vendor_location_id",
});

UserVendor.hasMany(VendorEmployee, { foreignKey: "user_vendor_id" });
VendorEmployee.belongsTo(UserVendor, { foreignKey: "user_vendor_id" });

VendorLocations.hasMany(VendorEmployeeLocations, {
  foreignKey: "vendor_location_id",
});
VendorEmployeeLocations.belongsTo(VendorLocations, {
  foreignKey: "vendor_location_id",
});

PaymentMethods.hasOne(VendorPaymentMethods, {
  foreignKey: "payment_method_id",
});

CustomerOrder.belongsTo(VendorPackageSlots, {
  foreignKey: "vendor_package_slots_id",
});

VendorPackageSlots.hasMany(CustomerOrder, {
  foreignKey: "vendor_package_slots_id",
});
VendorPaymentMethods.belongsTo(PaymentMethods, {
  foreignKey: "payment_method_id",
});

VendorLocations.hasMany(VendorPaymentMethods, {
  foreignKey: "vendor_location_id",
});
VendorPackage.hasMany(VendorPackageSlots, {
  foreignKey: "package_id",
});

VendorPackageDefaultItem.belongsTo(VendorDefaultItem, {
  foreignKey: "default_item_id",
});
VendorDefaultItem.hasMany(VendorPackageDefaultItem, {
  foreignKey: "default_item_id",
});
VendorCustomerPaymentLog.belongsTo(CustomerPackage, {
  foreignKey: "customer_package_id",
});
CustomerPackage.hasMany(VendorCustomerPaymentLog, {
  foreignKey: "customer_package_id",
});

//export
export {
  VendorPackage,
  VendorPackageDefaultItem,
  VendorMenuItems,
  VendorMenuQuantity,
  VendorPackageCities,
  VendorPackagePrice,
  CitiesActive,
  UserVendor,
  UserCustomer,
  Vendor,
  VendorLocations,
  VendorLocationServiceAreas,
  CustomerPackage,
  CustomerSubscription,
  VendorPackageMenuItems,
  CustomerOrder,
  CustomerOrderItem,
  CitiesAll,
  Categories,
  CategoryVendor,
  CouponTypes,
  VendorCustomerLink,
  VendorSettings,
  CustomerDeliveryAddress,
  VendorPackageFrequency,
  VendorCoupon,
  VendorCouponPackages,
  CustomerPackageRequest,
  ServingMesurements,
  VendorEmployee,
  VendorEmployeeLocations,
  PaymentMethods,
  VendorPaymentMethods,
};
