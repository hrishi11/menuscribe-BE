import { VendorPackageDefaultItem } from './VendorModels/VendorPackageDefaultItem.js';
import { VendorPackage } from './VendorModels/VendorPackage.js';
import { VendorMenuItems } from './VendorModels/VendorMenuItems.js';
import { VendorMenuQuantity } from './VendorModels/VendorMenuQuantity.js';
import { VendorPackageCities } from './VendorModels/VendorPackageCites.js';
import { VendorPackagePrice } from './VendorModels/VendorPackagePrice.js';
import { UserVendor } from './VendorModels/UserVendor.js';
import { UserCustomer } from './CustomerModels/UserCustomer.js';
import { Vendor } from './VendorModels/Vendor.js';
import { VendorLocations } from './VendorModels/VendorLocation.js';
import { VendorLocationServiceAreas } from './VendorModels/VendorLocationServiceAreas.js';
import { VendorPackageMenuItems } from './VendorModels/VendorPackageMenuItems.js';
import { CustomerPackage } from './CustomerModels/CustomerPackage.js';
import { CustomerOrder } from './CustomerModels/CustomerOrder.js';
import { CustomerOrderItem } from './CustomerModels/CustomerOrderItem.js'
import { CitiesActive } from './VendorModels/CitiesActive.js';
import { CitiesAll } from './VendorModels/CitiesAll.js';
import { VendorCustomerLink } from './VendorModels/VendorCustomerLink.js';
import { VendorSettings } from './VendorModels/VendorSetting.js';
import { CustomerDeliveryAddress } from './CustomerModels/CustomerDeliveryAddress.js'
import { VendorPackageFrequency } from './VendorModels/VendorPackageFrequency.js';

//vendor package -- vendor package default items
VendorPackage.hasMany(VendorPackageDefaultItem, { foreignKey: 'package_id' });
VendorPackageDefaultItem.belongsTo(VendorPackage, { foreignKey: 'package_id' });
//vendor package -- vendor menu quantity
VendorMenuItems.hasMany(VendorMenuQuantity, { foreignKey: 'item_id' });
VendorMenuQuantity.belongsTo(VendorMenuItems, { foreignKey: 'item_id' });
//vendor package -- vendor package cities
VendorPackage.hasMany(VendorPackageCities, { foreignKey: 'package_id' });
VendorPackageCities.belongsTo(VendorPackage, { foreignKey: 'package_id' });
//vendor package -- vendor package price
VendorPackage.hasMany(VendorPackagePrice, { foreignKey: 'package_id' });
VendorPackagePrice.belongsTo(VendorPackage, { foreignKey: 'package_id' });
//cities active -- vendor package cities
CitiesActive.hasMany(VendorPackageCities, { foreignKey: 'city_id' });
VendorPackageCities.belongsTo(CitiesActive, { foreignKey: 'city_id' });
//customer-packages -- packages
VendorPackage.hasMany(CustomerPackage, {foreignKey: 'package_id'})
CustomerPackage.belongsTo(VendorPackage, { foreignKey: 'package_id' });
//Vendor Package Default Item -- vendor menu items
VendorPackageDefaultItem.belongsTo(VendorMenuItems, { foreignKey: 'item_id' });
//VendorPackageDefaultItem --     VendorPackageMenuItems
VendorPackageDefaultItem.hasOne(VendorPackageMenuItems, {foreignKey: 'menu_group_id'})
VendorPackageMenuItems.belongsTo(VendorPackageDefaultItem, { foreignKey: 'menu_group_id' });
//Vendor Package Frequency -- Vendor Package
VendorPackage.hasMany(VendorPackageFrequency, {foreignKey: 'package_id'})
VendorPackageFrequency.belongsTo(VendorPackage, {foreignKey: 'package_id'})
//user customer -- customer order
UserCustomer.hasOne(CustomerOrder, {foreignKey: 'user_id'})
CustomerOrder.belongsTo(UserCustomer, {foreignKey: 'user_id'})
UserCustomer.hasMany(CustomerPackage, {foreignKey: 'user_id'})
CustomerPackage.belongsTo(UserCustomer, {foreignKey: 'user_id'})
//customer order -- vendor package
VendorPackage.hasOne(CustomerOrder, {foreignKey: 'package_id'})
CustomerOrder.belongsTo(VendorPackage, {foreignKey: 'package_id'})
UserCustomer.belongsTo(VendorPackage, {foreignKey: 'vendor_id'})
//customer order -- vendor package
CustomerOrder.hasMany(CustomerOrderItem, {foreignKey: 'order_id'})
CustomerOrderItem.belongsTo(CustomerOrder, {foreignKey: 'order_id'})
//customer order -- vendor package
CustomerOrderItem.belongsTo(VendorMenuItems, {foreignKey: 'item_id'})
//customer order -- vendor package
VendorPackageMenuItems.belongsTo(VendorMenuItems, {foreignKey: 'menu_item_id'})
//
UserCustomer.hasOne(VendorCustomerLink, {foreignKey: 'customer_id'})
UserCustomer.hasMany(CustomerDeliveryAddress, {foreignKey: 'customer_id'})
//
//CustomerDeliveryAddress.hasOne(CitiesAll, {foreignKey: 'id'})
CustomerDeliveryAddress.belongsTo(CitiesAll, { foreignKey: 'city_id', targetKey: 'id'});
CitiesAll.hasMany(CustomerDeliveryAddress, { foreignKey: 'city_id', sourceKey: 'id' });

VendorLocations.belongsTo(CitiesAll, { foreignKey: 'city_id', targetKey: 'id'});
Vendor.belongsTo(VendorLocations, { foreignKey: 'id', targetKey: 'vendor_id'});
// VendorLocations.hasMany(VendorLocationServiceAreas, {foreignKey: 'id', sourceKey: 'vendor_location_id'})
VendorLocationServiceAreas.belongsTo(VendorLocations, { foreignKey: 'vendor_location_id', targetKey: 'id' });

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
    VendorPackageMenuItems,
    CustomerOrder,
    CustomerOrderItem,
    CitiesAll,
    VendorCustomerLink,
    VendorSettings,
    CustomerDeliveryAddress,
    VendorPackageFrequency
}