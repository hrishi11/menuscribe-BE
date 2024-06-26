import { Sequelize, Op } from "sequelize";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { sendEmail } from "../utils/email.js";
import fs from "fs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import {
  UserCustomer,
  VendorPackage,
  VendorPackageDefaultItem,
  VendorMenuItems,
  VendorMenuQuantity,
  VendorPackageCities,
  VendorPackagePrice,
  CitiesAll,
  CitiesActive,
  VendorPackageMenuItems,
  CustomerOrder,
  CustomerOrderItem,
  CustomerPackage,
  CustomerDeliveryAddress,
  VendorPackageFrequency,
  Vendor,
  VendorLocations,
  VendorLocationServiceAreas,
  UserVendor,
  CategoryVendor,
  Categories,
  CouponTypes,
  VendorCoupon,
  VendorCouponPackages,
  CustomerPackageRequest,
  ServingMesurements,
  CustomerSubscription,
  VendorEmployee,
  VendorEmployeeLocations,
  PaymentMethods,
  VendorCustomerLink,
  VendorSettings,
} from "../config/Models/relations.js";
import multer from "multer";

import path from "path";
import Helper from "../utils/Helper.js";
import { loggedInUser, loggedInUserLocation } from "../middleware/Auth.js";
import { error, log } from "console";
import { menuSelectBucket } from "../config/s3Config.js";
import { generateRandomImageName } from "../utils/generateRandomName.js";
import { VendorPaymentMethods } from "../config/Models/VendorModels/VendorPaymentMethods.js";
import { VendorDrivers } from "../config/Models/VendorModels/VendorDrivers.js";
import { DriverDeliveries } from "../config/Models/VendorModels/DriverDeliveries.js";
import { response } from "express";
import crypto from "crypto";
import { VendorDriverCities } from "../config/Models/VendorModels/VendorDriverCities.js";
import { customerOrderById } from "./CustomerController.js";
import { CustomerPackageSubscription } from "../config/Models/CustomerModels/CustomerPackageSubscription.js";
import { VendorPackageSlots } from "../config/Models/VendorModels/VendorPackageSlots.js";
import { PostalRegions } from "../config/Models/VendorModels/PostalRegion.js";
import { VendorLocationPostalRegions } from "../config/Models/VendorModels/VendorLocationPostalRegion.js";
import { VendorPackageLocations } from "../config/Models/VendorModels/VendorPackageLocation.js";
import { ProvinceAll } from "../config/Models/VendorModels/ProvinceAll.js";
import { VendorSetting } from "../config/Models/CustomerModels/VendorSetting.js";
import { VendorRoles } from "../config/Models/VendorModels/VendorRole.js";
import sharp from "sharp";
import { LogPage } from "twilio/lib/rest/serverless/v1/service/environment/log.js";
import { VendorDefaultItem } from "../config/Models/VendorModels/VendorDefaultItems.js";
import { VendorCustomerPaymentLog } from "../config/Models/VendorModels/VendorCustomerPaymentLog.js";
import { VendorTax } from "../config/Models/VendorModels/VendorTax.js";
import { VendorWebsiteSetting } from "../config/Models/VendorModels/VendorWebsiteSetting.js";
import S3Upload, { s3 } from "../utils/S3 Config/S3 config.js";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/images'); // Uploads will be stored in the 'uploads/' directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const fullDayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function hashPassword(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

function matchPassword(user, password) {
  const hashedPassword = hashPassword(password);
  return user.password === hashedPassword;
}

export const getCustomers = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const locationIds = await loggedInUserLocation(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const users = await UserCustomer.findAll({
      where: { vendor_id: vendorUser.vendor_id },
      order: [["id", "DESC"]],
      include: [
        {
          model: VendorCustomerLink,
          where: { location_id: { [Op.in]: [...locationIds] } },
          required: true,
        },
        {
          model: CustomerPackage,

          attributes: ["id", "package_id"],
          include: [
            {
              model: VendorPackage,
            },
          ],
        },
      ],
      // subQuery: false, // Disable subquery to make GROUP BY work in the main query
      // group: ["UserCustomer.id"],
    });
    const temp = [];
    // Getting Order count and order_start_date order_end_date
    const results = [];
    for (const user of users) {
      const allPackages = [];
      for (const pack of user.CustomerPackages) {
        const userId = user.id;
        const packageId = pack.package_id;
        const ordersAll = await CustomerOrder.findAll({
          where: {
            user_id: userId,
            vendor_id: loggedInUserId,
            package_id: packageId,
            customer_package_id: pack.id,
          },
        });

        // Getting the upcomming order whoose order dates are today or later
        const UpcommingOrders = [];
        ordersAll.forEach((order) => {
          const inputDateObj = new Date(order.order_date + "T00:00:00");

          // Get today's date
          const todayDate = new Date();

          // // Set hours, minutes, seconds, and milliseconds to 0 for both dates
          inputDateObj.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);

          // Compare input date with today's date
          const status = inputDateObj >= todayDate;
          if (status) {
            UpcommingOrders.push(order);
          }
        });

        const allDates = [];
        ordersAll.forEach((or) => {
          allDates.push(or.order_date);
        });

        const order_start = Helper.getLargestDateStringArray(allDates);
        const order_end = Helper.getSmallestDateStringArray(allDates);

        allPackages.push({
          ...pack.dataValues,
          order_count: UpcommingOrders.length,
          order_start,
          order_end,
        });
      }
      results.push({ ...user.dataValues, CustomerPackages: allPackages });
    }

    res.status(200).json({ success: true, data: results, temp: users });
  } catch (error) {
    console.log("Error fetching customers: " + error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      error_details: error,
    });
  }
};

export const getVendor = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);

    const vendorSetting = await VendorSettings.findOne({
      where: { vendor_id: loggedInUserId },
    });
    let methods = [];
    if (vendorSetting.dataValues.cash_allowed == 1) {
      methods.push(3);
    }
    if (vendorSetting.dataValues.creditcard_allowed == 1) {
      methods.push(2);
    }
    if (vendorSetting.dataValues.interac_allowed == 1) {
      methods.push(1);
    }

    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const vendor = await Vendor.findOne({
      where: { id: vendorUser.vendor_id },
    });

    const locations = await VendorLocations.findAll({
      where: { vendor_id: vendor.id, status: 1 },
      include: [
        {
          model: VendorLocationPostalRegions,
          attributes: [["postal_region_value", "title"], "id"],
        },
      ],
    });

    const locationPayment = await Promise.all(
      locations.map(async (item) => {
        const data = await PaymentMethods.findAll({
          where: { id: { [Op.in]: [...methods] } },
          include: [
            {
              model: VendorPaymentMethods,
              where: {
                // admin_allowed: 1,
                vendor_location_id: item.dataValues.id,
              },
              required: false,
            },
          ],
        });
        return {
          ...item.dataValues,
          PaymentMethods: data.map((d) => d.dataValues),
        };
      })
    );

    let areas = {};
    for (let i = 0; i < locationPayment.length; i++) {
      const service_areas = await VendorLocationServiceAreas.findAll({
        where: {
          vendor_location_id: locationPayment[i].id,
        },
      });
      areas[locationPayment[i].id] = service_areas.map((sa) => sa.dataValues);
    }

    const result = {
      ...vendor.dataValues,
      locations: locationPayment,
      areas,
    };

    res.status(200).json({ message: "OK", success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching vendor", error });
  }
};

// export const getVendor = async (req, res) => {
//   try {
//     const loggedInUserId = loggedInUser(req);

//     const vendorSetting = await VendorSettings.findOne({
//       where: { vendor_id: loggedInUserId },
//     });
//     let methods = [];
//     if (vendorSetting.dataValues.cash_allowed == 1) {
//       methods.push(3);
//     }
//     if (vendorSetting.dataValues.creditcard_allowed == 1) {
//       methods.push(2);
//     }
//     if (vendorSetting.dataValues.interac_allowed == 1) {
//       methods.push(1);
//     }

//     const vendorUser = await UserVendor.findByPk(loggedInUserId);
//     const vendor = await Vendor.findOne({
//       where: { id: vendorUser.vendor_id },
//     });

//     const locations = await VendorLocations.findAll({
//       where: { vendor_id: vendor.id, status: 1 },

//       include: [
//         {
//           model: VendorLocationPostalRegions,
//           attributes: [["postal_region_value", "title"], "id"],
//         },
//         // {
//         //   model: VendorPaymentMethods,
//         //   required: false,
//         //   where: {
//         //     admin_allowed: 1,
//         //     payment_method_id: { [Op.in]: [...methods] },
//         //   },
//         //   include: [{ model: PaymentMethods }],
//         // },
//       ],
//     });
//     const locationPayment = await Promise.all(
//       locations.map(async (item) => {
//         console.log(item.dataValues.id);
//         const data = await PaymentMethods.findAll({
//           where: { id: { [Op.in]: [...methods] } },
//           include: [
//             {
//               model: VendorPaymentMethods,
//               where: {
//                 admin_allowed: 1,
//                 vendor_location_id: item.dataValues.id,
//                 // payment_method_id: { [Op.in]: [...methods] },
//               },
//               required: false,
//             },
//           ],
//         });
//         return { ...item, PaymentMethods: data };
//       })
//     );
//     // console.log(locationPayment);

//     let areas = {};
//     for (let i = 0; i < locationPayment.length; i++) {
//       console.log("helo", locationPayment[i].dataValues.id);
//       const service_areas = await VendorLocationServiceAreas.findAll({
//         where: {
//           vendor_location_id: locationPayment[i].dataValues.id,
//         },
//       });
//       areas[locationPayment[i].id] = service_areas;
//     }
//     const result = {
//       ...vendor.dataValues,
//       locations: locationPayment,
//       areas,
//     };

//     res.status(200).json({ message: "OK", success: true, data: result });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error fetching vendor", error });
//   }
// };

export const setVendorPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = req.body.methods;
    console.log(req.body);
    const vendor_id = loggedInUser(req);
    for (const method of paymentMethods) {
      if (method.VendorPaymentMethod) {
        const vendorPaymentMethod = await VendorPaymentMethods.findByPk(
          method.VendorPaymentMethod.id
        );
        if (vendorPaymentMethod) {
          vendorPaymentMethod.status = method.VendorPaymentMethod.status;
          vendorPaymentMethod.instructions =
            method.VendorPaymentMethod.instructions;
          await vendorPaymentMethod.save();
        } else {
          const createMethod = await VendorPaymentMethods.create({
            vendor_id: vendor_id,
            vendor_location_id: req.body.locationId,
            payment_method_id: method.id,
            instructions: method.VendorPaymentMethod.instructions
              ? method.VendorPaymentMethod.instructions
              : "",
            vendor_accepted: method.VendorPaymentMethod.vendor_accepted
              ? method.VendorPaymentMethod.vendor_accepted
              : 0,
            admin_allowed: method.VendorPaymentMethod.admin_allowed
              ? method.VendorPaymentMethod.vendor_accepted
              : 0,
            status: 1,
          });
          await createMethod.save();
        }
      }
    }
    res.json({ message: "Vendor payment method updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Faild to setVendorPaymentMethod", err });
  }
};

export const getVendorPackagesForVendorLocation = async (req, res) => {
  try {
    const location = req.body;
    const vendorPackages = await VendorPackage.findAll({
      where: { vendor_location_id: location.id },
    });
    res.json({
      message: "Packages fetched successfully",
      success: true,
      data: vendorPackages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to get vendor packages for vendor location",
      success: false,
    });
  }
};
export const getVendorPackagesForVendor = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req);

    const vendorPackages = await VendorPackage.findAll({
      where: { vendor_id },
    });
    res.json({
      message: "Packages fetched successfully",
      success: true,
      data: vendorPackages,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to get vendor packages for vendor",
      success: false,
    });
  }
};
export const deletLocation = async (req, res) => {
  try {
    const id = req.params.id;
    const vendorLocation = await VendorLocations.findByPk(id);
    vendorLocation.status = 0;
    await vendorLocation.save();
    res.json({
      message: "Location deleted successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to delete vendor location",
      success: false,
    });
  }
};

export const getPackageTImeSlots = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await VendorPackageSlots.findAll({
      include: [{ model: VendorPackagePrice }],
      where: { package_id: id },
    });

    res.json({
      message: "Data fetch successfully",
      data: response,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to delete vendor location",
      success: false,
    });
  }
};
const convertTimeFormat = (time) => {
  const parsedTime = new Date(`1970-01-01T${time}`);
  const hours = parsedTime.getHours();
  const minutes = parsedTime.getMinutes();

  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

  const period = hours < 12 ? "AM" : "PM";

  const formattedTime = `${formattedHours}:${
    minutes < 10 ? "0" : ""
  }${minutes}${period}`;

  return formattedTime;
};
export const sendMessageSlotChange = async (req, res) => {
  try {
    const emailTamplete = {
      name: req.body.name,
      text: ` ${req.body.vendor_name} is notifying you that your order's time slot has changed.`,
      text2: `You meal delivery timeslot is now.
     ${req.body.VendorPackageSlot.session} (
     ${convertTimeFormat(
       req.body.VendorPackageSlot.start_time
     )}" "${convertTimeFormat(req.body.VendorPackageSlot.start_time)}
     )`,
      text3: `Please contact the vendor if you have any questions.`,
    };
    const subject = "Email Verification";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "send-slot-change-email.ejs"),
      emailTamplete
    );

    await sendEmail(req.body.email, subject, "hello", html);

    res.json({
      message: "Data fetch successfully",
      data: response,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to delete vendor location",
      success: false,
    });
  }
};

export const updateCustomerPackageSlot = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchPkg = await CustomerPackage.findOne({
      where: { id: req.body.customer_package_id },
    });
    fetchPkg.delivery_slot_id = id;

    await fetchPkg.save();

    if (fetchPkg) {
      const getPkg = await CustomerPackage.findOne({
        where: { id: req.body.customer_package_id },
        include: [
          {
            model: VendorPackage,
            include: [
              {
                model: Vendor,
              },
              {
                model: VendorPackageDefaultItem,
                include: [
                  {
                    model: VendorPackageMenuItems,
                    include: [{ model: VendorMenuItems }],
                  },
                ],
              },
            ],
          },
          { model: VendorPackageSlots },
          {
            model: UserCustomer,
          },
          {
            model: CustomerDeliveryAddress,
            include: [
              {
                model: CitiesAll,
              },
            ],
          },

          {
            model: VendorPackagePrice,
          },
          {
            model: CustomerSubscription,
          },
        ],
      });
      const emailTamplete = {
        name: getPkg.UserCustomer.first_name,
        text: ` ${getPkg.VendorPackage.Vendor.vendor_name} is notifying you that your package's delivery or pickup time slot has changed.`,
        text2: `You meal delivery timeslot is now  
        ${convertTimeFormat(
          getPkg.VendorPackageSlot.start_time
        )}-${convertTimeFormat(getPkg.VendorPackageSlot.end_time)}`,
        text3: `Please contact the vendor if you have any questions.`,
      };
      const subject = "Package Time Slot Updated";
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const html = await ejs.renderFile(
        join(__dirname, "..", "..", "views", "send-slot-change-email.ejs"),
        emailTamplete
      );

      await sendEmail(getPkg.UserCustomer.email, subject, "hello", html);
    }

    res.json({
      message: "Data updated successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to delete vendor location",
      success: false,
    });
  }
};
export const updateCustomerPackageAddress = async (req, res) => {
  try {
    const id = req.params.id;

    const fetchPkg = await CustomerPackage.findOne({
      where: { id: id },
    });
    fetchPkg.customer_delivery_address_id =
      req.body.customer_delivery_address_id;
    await fetchPkg.save();
    const fetchInfo = await CustomerPackage.findOne({
      where: { id: id },
      include: [
        { model: UserCustomer },
        { model: CustomerDeliveryAddress, include: [{ model: CitiesAll }] },
        { model: VendorPackage, include: [{ model: Vendor }] },
      ],
    });
    if (fetchInfo) {
      const emailTamplete = {
        name: fetchInfo.UserCustomer.first_name,
        text: ` ${fetchInfo.VendorPackage.Vendor.vendor_name} has switched
        your address to a new address. Your meal delivery will
        now be delivered to the following address:`,
        text2: `${fetchInfo.CustomerDeliveryAddress.address}, ${fetchInfo.CustomerDeliveryAddress.CitiesAll?.city} ${fetchInfo.CustomerDeliveryAddress.CitiesAll?.state}`,
        text3: `Please contact the vendor if you have any questions.`,
        btn: "My Account",
        link: "http://menuscribe.com/login",
      };
      const subject = "Vendor Change Address";
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const html = await ejs.renderFile(
        join(__dirname, "..", "..", "views", "send-address-change-email.ejs"),
        emailTamplete
      );

      await sendEmail(fetchInfo.UserCustomer.email, subject, "hello", html);
    }

    // let getPkg;
    // if(fetchPkg){
    //    getPkg= await CustomerPackage.findOne({
    //     where:{id:req.body.customer_package_id},
    //     include:[{
    //       model: VendorPackage,
    //       include: [
    //         {
    //           model:Vendor
    //         },
    //         {
    //           model: VendorPackageDefaultItem,
    //           include: [
    //             {
    //               model: VendorPackageMenuItems,
    //               include: [{ model: VendorMenuItems }],
    //             },
    //           ],
    //         },

    //       ],
    //     },
    //     {model:VendorPackageSlots},
    //     {
    //       model: UserCustomer,
    //     },
    //     {
    //       model: CustomerDeliveryAddress,
    //       include: [
    //         {
    //           model: CitiesAll,
    //         },
    //       ],
    //     },

    //     {
    //       model: VendorPackagePrice,
    //     },
    //     {
    //       model: CustomerSubscription,
    //     },]
    //   })
    // }

    res.json({
      message: "Data fetch successfully",
      // data: getPkg,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to update customer address",
      success: false,
    });
  }
};
export const checkDeletedTimeSlots = async (req, res) => {
  try {
    const delivery_slot_id = req.params.id;

    const checkCustomer = await CustomerPackage.findAll({
      where: { delivery_slot_id },
      include: [
        { model: UserCustomer },
        { model: VendorPackageSlots },
        { model: VendorPackage, attributes: ["package_name"] },
      ],
    });
    if (checkCustomer.length > 0) {
      res.json({
        message: "Customer Pacakges exists",
        success: false,
        checkCustomer: checkCustomer,
      });
    } else {
      res.json({
        data: response,
        success: true,
      });
    }
  } catch (error) {
    console.log(err);
    res.status(500).json({
      message: "error delete time slot",
      error: err,
      success: false,
    });
  }
};
export const deletePackageTimeSlots = async (req, res) => {
  try {
    const delivery_slot_id = req.params.id;

    const checkCustomer = await CustomerPackage.findAll({
      where: { delivery_slot_id },
      include: [
        { model: UserCustomer },
        { model: VendorPackageSlots },
        { model: VendorPackage, attributes: ["package_name"] },
      ],
    });
    if (checkCustomer.length > 0) {
      res.json({
        message: "Customer package with this slot",
        customers: checkCustomer,
      });
    } else {
      const delSlot = await VendorPackageSlots.findByPk(delivery_slot_id);
      await delSlot.destroy();
      res.json({
        message: "deleted successfully",
        data: response,
        success: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "error delete time slot",
      error: err,
      success: false,
    });
  }
};
export const getPostalRegions = async (req, res) => {
  try {
    const postalRegions = await PostalRegions.findAll();

    res.json({
      message: "Postal Regions get successfully",
      data: postalRegions,
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Faild to delete vendor location",
      success: false,
    });
  }
};
// export const addVendorLocationPostalRegion = async (req, res) => {
//   try {

//     const postalRegions = await PostalRegions.findAll();

//     res.json({
//       message: "Postal Regions get successfully",
//       data: postalRegions,
//       success: true,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: "Faild to delete vendor location",
//       success: false,
//     });
//   }
// };

function generateDummyPassword() {
  const timestamp = Date.now().toString();
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8;

  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // Generate random index
    password += characters[randomIndex]; // Add random character to password
  }

  return timestamp + password; // Concatenate timestamp and password
}
export const addDriver = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const dummyPassowrd = generateDummyPassword();
    const hash = hashPassword(dummyPassowrd);
    const addUser = await UserVendor.create({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      phone: req.body.phoneNo,
      vendor_id: id,
      role: "Rider",
      password: hash,
    });

    await addUser.save();

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(currentDate.getDate()).padStart(2, "0");

    // Concatenate the year, month, and day with hyphens to form the desired format
    const formattedDate = `${year}-${month}-${day}`;
    const addDriver = await VendorDrivers.create({
      vendor_id: id,
      driver_id: addUser.id,
      status: 0,
      // created_at: formattedDate,
      delivery_cost: 0,
      driver_name: req.body.firstName,
    });
    await addDriver.save();
    if (req.body.cities) {
      req.body.cities.forEach(async (city) => {
        try {
          const result = await VendorDriverCities.create({
            vendor_id: id,
            driver_id: addUser.id,
            city_id: city.VendorLocation.CitiesAll.id,
          });
        } catch (error) {
          console.log(error);
          return { status: "rejected", reason: error };
        }
      });
    }

    res.status(200).send("Driver added successfully");
  } catch (error) {
    console.log(error);
    res.status(500).send(error || "internal server Error");
  }
};
export const getVendorDrivers = async (req, res) => {
  try {
    const id = loggedInUser(req);

    let response;
    const locationIds = await loggedInUserLocation(req);
    if (req.query.date) {
      response = await VendorDrivers.findAll({
        where: { vendor_id: id },
        include: [
          {
            model: CustomerOrder,
            as: "CustomerOrder",
            include: [
              {
                model: UserCustomer,
                as: "UserCustomer",
                attributes: [
                  "first_name",
                  "last_name",
                  "phone",
                  "address_1",
                  "address_2",
                ],
              },
              {
                model: VendorPackage,
                as: "VendorPackage",
                attributes: ["id", "package_name", "package_description"],
              },
              {
                model: CustomerDeliveryAddress,
              },
              //
            ],
            where: { is_ready: 1 },
          },
        ],
      });
    } else {
      response = await VendorEmployee.findAll({
        where: { vendor_id: id, vendor_role_id: 3 },
        order: [["id", "DESC"]],
        include: [
          {
            model: VendorEmployeeLocations,
            where: { vendor_employee_id: { [Op.in]: [...locationIds] } },
            required: true,
          },
          {
            model: CustomerOrder,
            where: { is_ready: 1 },
            required: false,
            include: [
              {
                model: UserCustomer,
                as: "UserCustomer",
                attributes: [
                  "first_name",
                  "last_name",
                  "phone",
                  "address_1",
                  "address_2",
                ],
              },
            ],
          },
        ],
      });
    }

    res.status(200).json({ message: "OK", success: true, data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching drivers", error });
  }
};

export const getVendorPaymentMethod = async (req, res) => {
  try {
    const response = await VendorPaymentMethods.find();
    res.status(200).json({ message: "success", data: response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching vendor", error });
  }
};

export const setVendor = async (req, res) => {
  try {
    const { id, vendor_name } = req.body;
    const vendor = await Vendor.findByPk(id);
    vendor.vendor_name = vendor_name;
    vendor.save();
    res.status(200).json({
      message: "Vendor data updated successfully",
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({ message: "error setting vendor", success: false });
  }
};

export const setNewVendorLocation = async (req, res) => {
  try {
    // const loggedInUserId = loggedInUser(req);
    const postalRegions = req.body.postalRegious;
    res.status(200).json({
      message: "updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "internal server error", error: error, success: false });
  }
};

export const setVendorLocation = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const reqBody = req.body.locationData;
    const regionBody = req.body.postalData;
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const locations = await VendorLocations.findAll({
      where: { vendor_id: vendorUser.vendor_id },
    });
    const isGonnaUpdate = locations.filter((l) => l.id === reqBody.id);
    if (isGonnaUpdate.length > 0) {
      const location = await VendorLocations.findByPk(isGonnaUpdate[0].id);
      const { location_name, address, city_id, service_area } = reqBody;
      location.location_name = location_name;
      location.address = address;
      location.city_id = city_id;
      // VendorLocationServiceAreas.
      location.save();
      for (let i = 0; i < service_area.length; i++) {
        if (service_area[i]?.vendor_location_id) {
          if (service_area[i].city_id == null) {
            await VendorLocationServiceAreas.destroy({
              where: {
                id: service_area[i].id,
              },
            });
          } else {
            const area = await VendorLocationServiceAreas.update(
              {
                city_id: service_area[i].city_id,
              },
              {
                where: {
                  id: service_area[i].id,
                },
              }
            );
          }
        } else {
          if (service_area[i]?.city_id !== null) {
            const area = await VendorLocationPostalRegions.create({
              vendor_id: service_area[i].vendor_id,
              city_id: service_area[i].city_id,
              vendor_location_id: location.id,
            });
          }
        }
      }
      const existingData = await VendorLocationPostalRegions.findAll({
        where: { vendor_location_id: location.dataValues.id },
      });
      const deletedDataIds = existingData
        .filter(
          (existingItem) =>
            !regionBody.some((newItem) => newItem.id === existingItem.id)
        )
        .map((deletedItem) => deletedItem.id);
      await VendorLocationPostalRegions.destroy({
        where: { id: deletedDataIds },
      });

      for (const item of regionBody) {
        const existingItem = existingData.find(
          (existingItem) => existingItem.id === item.id
        );
        if (!existingItem) {
          await VendorLocationPostalRegions.create({
            vendor_location_id: location.dataValues.id,
            postal_region_id: item.postal_region_id,
            postal_region_value: item.title,
            vendor_id: vendorUser.vendor_id,
          });
        }
      }
      // const delRegions = await VendorLocationPostalRegions.destroy({
      //   where: { vendor_location_id: location.dataValues.id },
      // });
      // const regions = regionBody.map((item) => {
      //   return {
      //     vendor_location_id: location.dataValues.id,
      //     postal_region_id: item.id,
      //     postal_region_value: item.title,
      //     vendor_id: vendorUser.vendor_id,
      //   };
      // });
      // const VendorRegion = await VendorLocationPostalRegions.bulkCreate(
      //   regions
      // );
      res.status(200).json({
        message: "Vendor location updated successfully",
        success: true,
        data: location,
      });
    } else {
      const { location_name, address, city_id, vendor_id, service_area } =
        reqBody;
      const locationSet = await VendorLocations.create({
        location_name,
        address,
        city_id,
        vendor_id,
        status: 1,
      });
      for (let i = 0; i < service_area.length; i++) {
        await VendorLocationServiceAreas.create({
          vendor_id: service_area[i].vendor_id,
          city_id: service_area[i].city_id,
          vendor_location_id: locationSet.id,
        });
      }
      res.status(200).json({
        message: "Vendor location save successfully",
        success: true,
        data: locationSet,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error on saving vendor location",
      error,
      success: false,
    });
  }
};

export const getDeliveriesByCreateDate = async (req, res) => {
  try {
    const { created_date } = req.body;
    const tempDate = new Date(created_date);
    const userDateObj = new Date(created_date);
    // userDateObj.setDate(tempDate.getDate);

    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const locationIds = await loggedInUserLocation(req);
    const results = await CustomerOrder.findAll({
      where: {
        is_ready: 1,
        vendor_id: vendorUser.vendor_id,
        order_date: new Date(tempDate.toISOString().split("T")[0]),
        vendor_location_id: { [Op.in]: [...locationIds] },
      },
      include: [
        {
          model: UserCustomer,
          required: true,
          attributes: [
            "first_name",
            "last_name",
            "phone",
            "address_1",
            "address_2",
          ],
        },
        {
          model: VendorPackage,
          attributes: ["id", "package_name", "package_description"],
          where: {
            vendor_location_id: { [Op.in]: [...locationIds] },
          },
        },
        {
          required: false,
          model: CustomerDeliveryAddress,
          include: CitiesAll,
        },
      ],
    });

    // let finalResult = [];
    // for (let result of results) {
    //   // console.log(typeof result.created_date)
    //   let { order_date: currentDateObj } = result;
    //   if (!currentDateObj) continue;
    //   currentDateObj = new Date(currentDateObj);
    //   const dateMatch =
    //     (currentDateObj.getUTCFullYear() === userDateObj.getUTCFullYear()) &
    //     (currentDateObj.getMonth() === userDateObj.getMonth()) &
    //     (currentDateObj.getUTCDate() === userDateObj.getUTCDate());

    //   if (dateMatch) {
    //     finalResult.push(result);
    //     // console.log(result);
    //   }
    // }
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching customer_order: " + error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      error_details: error,
    });
  }
};

export const setOrderIsDelivered = async (req, res) => {
  try {
    const order = req.body;
    const customerOrder = await CustomerOrder.findByPk(order.id);
    customerOrder.is_delivered = customerOrder.is_delivered === 1 ? 0 : 1;
    await customerOrder.save();
    res.json({ message: "Order is delivered set successfully", success: true });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "faild to set orderISDelivered", success: false });
  }
};

export const deleteVendorPackageCity = async (req, res) => {
  try {
    const id = req.params.id;

    const packageId = req.query.packageId;
    const delCity = await VendorPackageCities.findByPk(id);
    const response = await CustomerOrder.findAll({
      include: [
        {
          model: CustomerDeliveryAddress,
        },
        { model: UserCustomer, as: "UserCustomer" },
      ],
      where: {
        package_id: packageId,

        order_date: {
          [Op.gt]: new Date().toISOString().split("T")[0],
        },
      },
    });

    const check = response.filter(
      (item) =>
        item.dataValues.CustomerDeliveryAddress?.city_id ==
        delCity.dataValues.city_id
    );

    if (check.length > 0) {
      const resp = [];
      const data = await Promise.all(
        check.map(async (item) => {
          const orders = await CustomerOrder.findAll({
            where: {
              user_id: item.dataValues.UserCustomer?.id,
              package_id: packageId,
            },
          });
          const activeOrders = [];
          const today = new Date();

          orders.forEach((or) => {
            const currentDate = new Date(or.order_date + "T00:00:00");

            const isActive =
              currentDate.getFullYear() >= today.getFullYear() &&
              currentDate.getDate() >= today.getDate() &&
              currentDate.getMonth() >= today.getMonth();

            isActive && activeOrders.push(or);
          });
          const checkResp = resp.filter(
            (data) => data.data.UserCustomer?.id == item.UserCustomer?.id
          );
          if (checkResp.length == 0) {
            return resp.push({
              futureOrders: activeOrders,
              data: item,
            });
          } else {
            return;
          }
        })
      );
      return res.status(200).send({
        status: false,
        message: "Cannot delete this city",
        data: resp,
      });
    }

    await delCity.destroy();
    res.status(200).json({ message: "City deleted successfully", data: check });
  } catch (error) {
    console.log("Error on setting delivered:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
      error_details: error,
    });
  }
};
export const setDelivered = async (req, res) => {
  try {
    const data = req.body;
    let order = await CustomerOrder.findByPk(data.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    order.is_delivered = data.is_delivered;
    await order.save();
    res.status(200).json({
      sucss: true,
      message: "Order delivery updated sucessfully",
      data: order,
    });
  } catch (error) {
    console.log("Error on setting delivered:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      error_details: error,
    });
  }
};

export const uploadDeliveryImage = async (req, res) => {
  try {
    const { deliveryId } = req.body;
    const loggedInUserId = loggedInUser(req);
    if (!req.file) {
      return res.status(400).json({ error: "No Image Found!" });
    }
    const delivery = await CustomerOrder.findByPk(deliveryId);
    if (!delivery) {
      return res.status(400).json({ error: "Customer order not found!" });
    }
    if (delivery.vendor_id !== loggedInUserId) {
      return res
        .status(401)
        .json({ error: "Not Authorized to access this resource" });
    }

    // Set up parameters for S3 upload
    const result = await menuSelectBucket.uploadFile(
      req.file.path,
      generateRandomImageName(),
      req.file.mimetype
    );
    delivery.delivery_img = result;
    await delivery.save();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error while updating vendor package items: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPackages = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);

    // const id= req.params.id
    const vendorUser = await UserVendor.findOne({
      where: { id: loggedInUserId },
      include: [{ model: VendorEmployee }],
    });
    const locationIds = await loggedInUserLocation(req);

    // // const loggedInUserData = await UserCustomer.findOne({
    // //   where: { id: loggedInUserId },
    // // });
    // const emp_ids= vendorUser.dataValues.VendorEmployees.map((item)=>item.dataValues.id)
    // console.log(emp_ids)
    // const locations= await VendorEmployeeLocations.findAll({where:{vendor_employee_id:{
    //   [Op.in]:[...emp_ids]
    // }}})
    // const location_id= locations.map((item)=>item.vendor_location_id)
    const results = await VendorPackage.findAll({
      where: {
        vendor_id: vendorUser.vendor_id,
        vendor_location_id: { [Op.in]: [...locationIds] },
      },
      include: [
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackagePrice,
        },

        {
          model: VendorLocations,
          include: { model: CitiesAll },
        },
        {
          model: VendorPackageSlots,
        },
      ],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getVendorPackages = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const location_id = req.params.id;
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    // const loggedInUserData = await UserCustomer.findOne({
    //   where: { id: loggedInUserId },
    // });
    const results = await VendorPackage.findAll({
      where: {
        vendor_id: vendorUser.vendor_id,
        vendor_location_id: location_id,
      },
      include: [
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackagePrice,
        },
        // {
        //   model: VendorPackageFrequency,
        // },
        {
          model: VendorLocations,
          include: { model: CitiesAll },
        },
        {
          model: VendorPackageSlots,
        },
      ],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const results = await VendorPackage.findOne({
      include: [
        {
          model: VendorPackageDefaultItem,
          include: [
            {
              model: VendorMenuItems,
            },
            {
              model: VendorPackageMenuItems,
            },
            {
              model: VendorDefaultItem,
            },
          ],
        },
        {
          model: VendorPackageCities,
          include: [
            {
              model: CitiesAll,
              as: "VendorPackageCities",
            },
          ],
        },
        {
          model: VendorPackagePrice,
        },
        {
          model: VendorPackageLocations,
          include: [{ model: VendorLocations }],
        },
        { model: VendorLocations },
      ],
      where: { id: id, vendor_id: vendorUser.vendor_id },
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorSettingInfo = async (req, res) => {
  try {
    const id = loggedInUser(req);

    const getData = await VendorSetting.findOne({ where: { vendor_id: id } });
    res.status(200).json({ success: true, data: getData });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getVendorSettingsInfo = async (req, res) => {
  try {
    const id = loggedInUser(req);
    // const id = req.body.params;
    const findCustomer = await UserCustomer.findByPk(id);
    const findVendor = await UserVendor.findByPk(
      findCustomer.dataValues.vendor_id
    );
    const getData = await VendorSettings.findAll({
      where: { vendor_id: findVendor.dataValues.id },
    });
    res.status(200).json({ success: true, data: getData[0] });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getVendorPackagePrice = async (req, res) => {
  try {
    const id = loggedInUser(req);

    const getData = await VendorPackagePrice.findOne({
      where: { package_id: req.params.id },
    });
    res.status(200).json({ success: true, data: getData });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setVendorSettingInfo = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const existingSetting = await VendorSetting.findOne({
      wher: { vendor_id: id },
    });
    if (existingSetting) {
      await existingSetting.update({
        ...req.body,
      });
    } else {
      const postData = await VendorSetting.create({
        vendor_id: id,
        time_zone: req.body.time_zone,
        province_id: req.body.province_id,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getProvince = async (req, res) => {
  try {
    const getProvince = await ProvinceAll.findAll();
    res.status(200).json({ success: true, data: getProvince });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const addItem = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    upload.single("file")(req, res, async (err) => {
      const imageBuffer = req.file ? req.file.buffer : "";
      const itemData = req.body;

      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ error: "File upload failed" });
      }

      const quantity = Helper.getStringCount(itemData.item_quantity);
      const item = await VendorMenuItems.create({
        vendor_id: vendorUser.vendor_id,
        item_name: itemData.item_name,
        quantity: quantity,
        units: itemData.units,
        item_category: itemData.item_category,
        veg: itemData.veg === "veg" ? "1" : "0",
        created_date: new Date(),
        table_description: itemData.table_description,
        image: imageBuffer,
      });

      const valuesArray = itemData.item_quantity
        ? itemData.item_quantity.split(",").map(Number)
        : [];
      for (var i = 0; i < valuesArray.length; i++) {
        const itemQuantity = await VendorMenuQuantity.create({
          item_id: item.id,
          quantity: valuesArray[i],
          measure: itemData.units,
        });
      }
      res.status(200).json({ success: true, data: item.id });
    });
  } catch (error) {
    console.error("Error adding item:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", error_detail: error });
  }
};

export const getActivePromotion = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const activePromotions = await VendorCoupon.findAll({
      where: { status: 1, vendor_id: loggedInUserId },
      include: [
        {
          model: CouponTypes,
          attributes: ["id", "coupon_type", "coupon_description"],
        },
        {
          model: VendorCouponPackages,
        },
      ],
    });
    res.json({
      message: "Successful",
      success: true,
      data: activePromotions,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error getting active promotions", success: false });
  }
};
export const getInactivePromotion = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const InactivePromotions = await VendorCoupon.findAll({
      where: { status: 0, vendor_id: loggedInUserId },
      include: [
        {
          model: CouponTypes,
          attributes: ["id", "coupon_type", "coupon_description"],
        },
        {
          model: VendorCouponPackages,
        },
      ],
    });
    res.json({
      message: "Successful",
      success: true,
      data: InactivePromotions,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error getting Active promotions", success: false });
  }
};

export const setPromotions = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const {
      prices,
      coupon_code,
      coupon_type,
      id,
      start_date,
      end_date,
      repeat_redemption,
    } = req.body;
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    // Updating vendor Coupon
    if (id) {
      const vendorCoupon = await VendorCoupon.findByPk(id);
      (vendorCoupon.vendor_id = loggedInUserId),
        (vendorCoupon.coupon_code = coupon_code),
        (vendorCoupon.coupon_type_id = coupon_type.id),
        (vendorCoupon.created_date = new Date()),
        (vendorCoupon.start_date = startDate),
        (vendorCoupon.end_date = endDate),
        (vendorCoupon.repeat_redemption = repeat_redemption),
        await vendorCoupon.save();

      for (const price of prices) {
        // updating existing prices
        if (price.vendor_coupon_package_id) {
          if (!price.selected) {
            const deletedCouponpackage = await VendorCouponPackages.findByPk(
              price.vendor_coupon_package_id
            );
            await deletedCouponpackage.destroy();
          }
        }
        // creating-new prices
        else {
          const savedCouponPackages = await VendorCouponPackages.create({
            vendor_coupon_id: id,
            vendor_package_price_id: price.id,
          });
        }
      }
    } else {
      const savedVendorCoupon = await VendorCoupon.create({
        vendor_id: loggedInUserId,
        coupon_code,
        coupon_type_id: coupon_type.id,
        status: 1,
        created_date: new Date(),
        start_date: startDate,
        end_date: endDate,
        repeat_redemption,
      });
      for (const price of prices) {
        const savedCouponPackages = await VendorCouponPackages.create({
          vendor_coupon_id: savedVendorCoupon.id,
          vendor_package_price_id: price.id,
        });
      }
    }
    res.json({ message: "Successful", success: true });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to set promotion", success: false });
  }
};

export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await VendorCoupon.findByPk(id);
    coupon.status = 0;
    const result = await coupon.save();

    res.json({ message: "Successfull", success: true, data: result });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to delete promotion" });
  }
};
export const setCustomerPackageRequest = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const reqBody = req.body;
    // console.log(reqBody);
    const loggedUser = loggedInUser(req);

    const user = await UserCustomer.findByPk(loggedUser);
    for (const pack of reqBody) {
      const savedRequest = await CustomerPackageRequest.create({
        user_id: loggedInUserId,
        package_id: pack.id,
        payment_status: 0,
        pickup_delivery: pack.pickup_delivery,
        frequency_id: pack.frequency.id,
        timeslot_id:
          pack.pickup_delivery === 1
            ? pack.pickup_time_slot.id
            : pack.delivery_time_slot.id,
        customer_delivery_address_id: pack.customer_delivery_address.id,
        vendor_location_id: pack.vendor_location_id,
        user_package_name: pack.user_package_name,
        quantity: 1,
        created_date: new Date(),
        start_date: new Date(),
        request_type: "NEW",
        status: 0,
        deleted: 0,
      });
    }
    const vendor = await Vendor.findByPk(user.dataValues.vendor_id);
    const requests = await CustomerPackageRequest.findAll({
      where: { user_id: user.dataValues.id },
      include: [
        {
          model: VendorLocations,
          include: [
            { model: VendorPaymentMethods, include: PaymentMethods },
            { model: CitiesAll },
          ],
        },
        {
          model: VendorPackage,
        },
      ],
    });
    const emailTamplete = {
      restaurant_name: vendor.vendor_name,
      requests,
    };
    const subject =
      "Account created successfully and requests are send to the vendor";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(
        __dirname,
        "..",
        "..",
        "views",
        "create-account-with-package-request.ejs"
      ),
      emailTamplete
    );
    await sendEmail(user.dataValues.email, subject, "hello", html);
    res.json({ message: "¨Successful", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to set customer package request" });
  }
};

export const getItems = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const results = await VendorMenuItems.findAll({
      where: { vendor_id: vendorUser.vendor_id },
      include: [
        {
          model: VendorMenuQuantity,
        },
      ],
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getCouponTypes = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const results = await CouponTypes.findAll();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getServingMesurements = async (req, res) => {
  try {
    const results = await ServingMesurements.findAll();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorCategories = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const results = await CategoryVendor.findAll({
      where: { vendor_id: loggedInUserId },
      include: {
        model: Categories,
      },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const categories = await CategoryVendor.findAll({
      where: { vendor_id: loggedInUserId },
      include: {
        model: Categories,
      },
    });
    res.status(200).json({ message: "Categories found", data: categories });
  } catch (error) {
    console.log("Error fetching menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    const results = await VendorMenuItems.findOne({
      where: { id: itemId },
      include: [
        {
          model: VendorMenuQuantity,
        },
      ],
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching menu item: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorPackageFrequency = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const result = await VendorPackageFrequency.findAll({
      where: { vendor_id: loggedInUserId },
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to get Vendor package frequency",
    });
  }
};

export const updateItem = async (req, res) => {
  try {
    upload.single("file")(req, res, async (err) => {
      const itemData = req.body;
      const imageBuffer = req.file ? req.file.buffer : "";

      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ error: "File upload failed" });
      }

      const itemId = req.params.id;

      // Find the existing item
      const existingItem = await VendorMenuItems.findByPk(itemId);

      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      // Update the existing item's properties
      existingItem.item_name = itemData.item_name;
      existingItem.units = itemData.units;
      existingItem.item_category = itemData.item_category;
      existingItem.veg = itemData.veg === "veg" ? "1" : "0";
      existingItem.table_description = itemData.table_description;
      if (req.file) {
        existingItem.image = imageBuffer;
      }
      await existingItem.save();

      await VendorMenuQuantity.destroy({
        where: { item_id: itemId },
      });
      const valuesArray = itemData.item_quantity
        ? itemData.item_quantity.split(",").map(Number)
        : [];

      for (let i = 0; i < valuesArray.length; i++) {
        await VendorMenuQuantity.create({
          item_id: itemId,
          quantity: valuesArray[i],
          measure: itemData.unit,
        });
      }

      res.status(200).json({ success: true, data: itemId });
    });
  } catch (error) {
    console.error("Error updating item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addDefaultItem = async (req, res) => {
  try {
    const itemData = req.body;
    const item = await VendorPackageDefaultItem.create({
      package_id: itemData.package_id ? itemData.package_id : 0,
      item_name: itemData.item_name,
      quantity: itemData.item_quantity,
      vendor_category_id: itemData.item_category,
      default_item_id: itemData.default_item_id,
      all_packages: itemData.all_packages ? itemData.all_packages : 0,
      status: 1,
    });

    res.status(200).json({ success: true, data: item.id });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getGlobalDefaultItems = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const fetchData = await VendorPackageDefaultItem.findAll({
      where: { package_id: 0, all_packages: 1 },
      include: [
        { model: VendorDefaultItem, where: { vendor_id: id }, required: true },
      ],
    });

    res.status(200).json({ success: true, data: fetchData });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCustomerPaymentLog = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const fetchData = await VendorCustomerPaymentLog.findAll({
      where: { customer_id: req.params.id },
      include: [
        {
          model: CustomerPackage,
          include: [{ model: VendorPackagePrice }, { model: VendorPackage }],
        },
      ],
    });

    res.status(200).json({ success: true, data: fetchData });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getVendorTax = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const fetchData = await VendorTax.findAll({
      where: { vendor_id: id },
    });

    res.status(200).json({ success: true, data: fetchData });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const setCustomerPaymentMethod = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const setData = await VendorCustomerPaymentLog.create({
      vendor_id: id,
      customer_id: req.body.id,
      amount: req.body.amount,
      tax: req.body.tax,
      total: req.body.total,
      created_at: req.body.created_at,
      description: req.body.description,
    });
    res.status(200).json({ success: true, data: setData });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const setUserCustomersByVendor = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const reqBody = req.body;
    console.log(reqBody.length);

    await Promise.all(
      reqBody.map(async (item) => {
        const fetchCity = await CitiesAll.findOne({
          where: { city: item.city_name },
        });
        const fetchPackage = await VendorPackage.findOne({
          where: { package_name: item.package_name },
        });

        const createUser = await UserCustomer.create({
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          password: "",
          phone: item.phone,
          address_1: item.address_1,
          address_2: item.address_2,
          delivery_instruction: item.delivery_instruction,
          postal_code: item.postal_code,
          created_date: item.created_date,
          city_id: fetchCity ? fetchCity.dataValues.id : 0,
          vendor_id: id,
          // package_id: fetchPackage ? fetchPackage.dataValues.id : 0,
        });
        if (fetchPackage) {
          await CustomerPackage.create({
            user_id: createUser.dataValues.id,
            package_id: fetchPackage ? fetchPackage.dataValues.id : 0,
            delivery_slot_id: 0,
            payment_status: 0,
            user_package_name: "",
            quantity: 0,
            status: 0,
            created_date: new Date(),
            customer_delivery_address_id: 0,
            vendor_location_id: 0,
            pickup_delivery: 1,
          });
        }
      })
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const deleteDefaultItem = async (req, res) => {
  const itemId = req.params.id;
  try {
    const results = await VendorPackageDefaultItem.destroy({
      where: { id: itemId },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error deleting default item: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getCities = async (req, res) => {
  try {
    const results = await CitiesAll.findAll();
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching cities: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setStoreInfo = async (req, res) => {
  try {
    const postalRegious = req.body.postalRegions;
    const createVendor = await Vendor.create({
      vendor_name: req.body.storeName,
      email: req.body.email,
      postal_code: req.body.postal,
      phone: req.body.phone,
      city_id: req.body.city_id,
      address: req.body.address,
    });
    await createVendor.save();

    const saveUrl = await VendorSettings.create({
      vendor_id: createVendor.dataValues.id,
      vendor_name: req.body.storeName,
      public: req.body.phone,
      pickup_option: req.body.pickupOption,
      delivery_option: req.body.deliveryOption,
      public_email: req.body.email,
      public_url: req.body.storeURL,
    });
    await saveUrl.save();

    const saveLocation = await VendorLocations.create({
      vendor_id: createVendor.dataValues.id,
      location_name: req.body.city,
      address: req.body.address,
      city_id: req.body.city_id,
      status: 1,
    });
    await saveLocation.save();
    postalRegious.forEach(async (region) => {
      const response = await VendorLocationPostalRegions.create({
        vendor_location_id: saveLocation.dataValues.id,
        postal_region_id: region.postal_region_id,
        postal_region_value: region.label,
        vendor_id: createVendor.dataValues.id,
      });
    });

    return res
      .status(200)
      .json({ status: true, message: "Store detail save successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const validateEmployee = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const { role } = req.body;
    const employee = await VendorEmployee.findOne({
      where: { user_vendor_id: id },
      include: [{ model: VendorRoles }],
    });
    if (!employee) {
      return res.status(500).json({ message: "No employee found" });
    }
    if (employee.VendorRole.dataValues.role === role) {
      return res
        .status(200)
        .json({ access: true, message: "Validate successfully" });
    }
    return res
      .status(200)
      .json({ access: false, message: "Validate successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getEmployees = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const locationIds = await loggedInUserLocation(req);
    const employees = await VendorEmployee.findAll({
      where: { vendor_id: id },
      include: [
        {
          model: VendorRoles,
        },
        {
          model: UserVendor,
        },
        {
          model: VendorEmployeeLocations,
          where: { vendor_location_id: { [Op.in]: [...locationIds] } },
          include: { model: VendorLocations },
        },
      ],
    });

    let results = [];

    // for (const employee of employees) {
    //   const locations = await VendorEmployeeLocations.findAll({
    //     where: { vendor_employee_id: employee.id,  vendor_location_id:{[Op.in]:[...locationIds]}      },
    //     include: { model: VendorLocations },
    //   });
    //   results.push({
    //     ...employee.dataValues,
    //     VendorEmployeeLocations: locations,
    //   });
    // }

    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setEmployee = async (req, res) => {
  try {
    const { UserVendor: UVendor } = req.body;
    const employee = await VendorEmployee.findByPk(req.body.id);

    employee.role = req.body.role;
    employee.delivery_page = req.body.delivery_page;
    employee.delivery_management_page = req.body.delivery_management_page;
    employee.customers_page = req.body.customers_page;
    employee.add_customer_page = req.body.add_customer_page;
    employee.menu_page = req.body.menu_page;
    employee.status = req.body.status;
    employee.settings_page = req.body.settings_page;
    employee.homepage = req.body.homepage;
    employee.packages_page = req.body.packages_page;
    employee.package_requests_page = req.body.package_requests_page;
    employee.customer_orders_page = req.body.customer_orders_page;
    employee.order_summary_page = req.body.order_summary_page;
    employee.order_manager_page = req.body.order_manager_page;
    employee.team_page = req.body.team_page;
    employee.all_subscriptions_page = req.body.all_subscriptions_page;
    employee.team_settings_page = req.body.team_settings_page;
    employee.promotions_page = req.body.promotions_page;
    employee.locations_page = req.body.locations_page;
    await employee.save();

    const UserVend = await UserVendor.findByPk(UVendor.id);
    UserVend.first_name = UVendor.first_name;
    UserVend.last_name = UVendor.last_name;
    UserVend.email = UVendor.email;
    UserVend.phone = UVendor.phone;

    await UserVend.save();

    res.status(200).json({ success: true, message: "Successfull" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setEmployeeLocation = async (req, res) => {
  try {
    const { VendorEmployeeId, location } = req.body;
    const newVendorEmployeeLocation = await VendorEmployeeLocations.create({
      vendor_employee_id: VendorEmployeeId,
      vendor_location_id: location.id,
    });
    res.status(200).json({
      success: true,
      message: "Location added Successful",
      data: newVendorEmployeeLocation,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteEmployeeLocation = async (req, res) => {
  try {
    const VELocation = req.body;
    const VEL = await VendorEmployeeLocations.destroy({
      where: { id: VELocation.id },
    });
    res
      .status(200)
      .json({ success: true, message: "Location deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getVendorEmployee = async (req, res) => {
//   try {
//     const vendorId = loggedInUser(req);
//     const getEmployees = await VendorEmployee.findAll({
//       where: { vendor_id: vendorId },
//       include: [{ model: UserVendor }, { model: VendorEmployeeLocations }],
//     });

//     res.status(200).json({
//       success: true,
//       message: "get vendor employee successfully",
//       employees: getEmployees,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
export const getVendorLocations = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const vendorLocations = await VendorLocations.findAll({
      where: { vendor_id: id, status: 1 },
      include: [CitiesAll],
    });
    // const results = await CitiesAll.findAll();
    res.status(200).json({ success: true, data: vendorLocations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorEmployee = async (req, res) => {
  try {
    const { VendorEmployeeId } = req.body;
    const loggedInUserId = loggedInUser(req);
    const vendorEmployee = await VendorEmployee.findOne({
      where: { id: VendorEmployeeId, user_vendor_id: loggedInUserId },
    });
    res.json({ message: "successfully", success: true, data: vendorEmployee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get vendor employee" });
  }
};
export const checkVendorLocationPostalRegion = async (req, res) => {
  try {
    if (req.body.postal) {
      const checkPostalRegion = await VendorLocationPostalRegions.findAll({
        include: [
          {
            model: PostalRegions,
            where: { POSTAL_CODE: req.body.postal },
            required: true,
          },
        ],
      });
      if (checkPostalRegion.length > 0) {
        return res.json({
          message: "successfully",
          success: true,
          data: checkPostalRegion,
        });
      } else {
        return res.json({ message: "Not found", success: false });
      }
    }

    return res.json({ message: "successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get postal region data" });
  }
};

export const getPopularItems = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const data = await CustomerOrderItem.findAll({
      include: [
        {
          model: VendorMenuItems,
          attributes: ["item_name", "id", "vendor_id"],
        },
        {
          model: CustomerOrder,
          required: true,
          include: [
            {
              model: CustomerPackage,
              required: true,
              include: [
                {
                  model: VendorPackage,
                  required: true,
                  where: { vendor_id: id },
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    const cities = await CustomerDeliveryAddress.findAll({
      include: [
        { model: UserCustomer, where: { vendor_id: id }, required: true },
        { model: CitiesAll },
      ],
      where: { address_type: "HOME" },
    });
    res.json({
      message: "successfully",
      success: true,
      data: data,
      cities: cities,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get vendor employee" });
  }
};

export const getVendorCities = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const cityIds = await VendorLocationServiceAreas.findAll({
      include: [
        {
          model: VendorLocations,
          where: { vendor_id: id },
          include: [CitiesAll],
        },
      ],
    });
    // const results = await CitiesAll.findAll();
    res.status(200).json({ success: true, data: cityIds });
  } catch (error) {
    console.log("Error fetching cities: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getCustomerPackageRequests = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const locationIds = await loggedInUserLocation(req);
    const requests = await CustomerPackageRequest.findAll({
      where: {
        request_type: "NEW",
        vendor_location_id: {
          [Op.in]: [...locationIds],
        },
      },
      include: [
        {
          model: UserCustomer,
          attributes: ["id", "first_name", "last_name", "phone", "email"],
        },
        {
          model: VendorPackage,
          where: {
            vendor_location_id: {
              [Op.in]: [...locationIds],
            },
          },
          // attributes: ["id", "first_name", "last_name"],
        },

        {
          model: VendorPackagePrice,
          // attributes: ["id", "first_name", "last_name"],
        },
        {
          model: CustomerDeliveryAddress,
          include: { model: CitiesAll },
          // attributes: ["id", "first_name", "last_name"],
        },
        {
          model: VendorLocations,
          include: { model: CitiesAll },
          // attributes: ["id", "first_name", "last_name"],
        },
        {
          model: VendorPackagePrice,
        },
      ],
    });
    let result = [];
    // pickup_delivery = 1 = pickup
    // pickup_delivery = 2 = delivery
    // for (const request of requests) {
    //   // Getting vendor locations for Pickup
    //   if (request.dataValues.pickup_delivery === 1) {
    //     const address = await VendorLocations.findAll({
    //       where: { vendor_id: loggedInUser },
    //       include: { model: CitiesAll },
    //     });
    //     result.push({
    //       ...request.dataValues,
    //       VendorLocations: address,
    //     });
    //   }
    //   // getting customer_delivery_address form delivery
    //   else if (request.dataValues.pickup_delivery === 2) {
    //     const address = await CustomerDeliveryAddress.findAll({
    //       where: { customer_id: request.dataValues.UserCustomer.id },
    //       include: { model: CitiesAll },
    //     });
    //     result.push({
    //       ...request.dataValues,
    //       CustomerDeliveryAddress: address,
    //     });
    //   }
    // }

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addPackageCity = async (req, res) => {
  try {
    const itemData = req.body;
    const item = await VendorPackageCities.create({
      package_id: itemData.package_id,
      city_id: itemData.city_id,
    });

    res.status(200).json({ success: true, data: item.id });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const handledeleteCity = async (req, res) => {
  const itemId = req.params.id;
  try {
    const results = await VendorPackageCities.destroy({
      where: { id: itemId },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error deleting city: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const savePackageDays = async (req, res) => {
  try {
    const packageData = req.body;
    const loggedInUserId = loggedInUser(req);
    if (packageData?.id) {
      const existingPackage = await VendorPackage.findByPk(packageData.id);

      if (!existingPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      await existingPackage.update({
        // package_name: packageData.package_name,
        // pickup: packageData.pickup === true || packageData.pickup === 1 ? 1 : 0,
        // delivery:
        //   packageData.delivery === true || packageData.delivery === 1 ? 1 : 0,
        // tax_percent: req.body.formData.tax_percent,
        // vendor_location_id: packageData.package_location.id,
        // package_description: packageData.package_details,
        // delivery_schedule_start: packageData.delivery_from,
        // delivery_schedule_end: packageData.delivery_until,
        // pickup_schedule_start: packageData.pickup_from,
        // pickup_schedule_end: packageData.pickup_until,
        mon: packageData.mon === true || packageData.mon === 1 ? 1 : 0,
        tue: packageData.tue === true || packageData.tue === 1 ? 1 : 0,
        wed: packageData.wed === true || packageData.wed === 1 ? 1 : 0,
        thu: packageData.thu === true || packageData.thu === 1 ? 1 : 0,
        fri: packageData.fri === true || packageData.fri === 1 ? 1 : 0,
        sat: packageData.sat === true || packageData.sat === 1 ? 1 : 0,
        sun: packageData.sun === true || packageData.sun === 1 ? 1 : 0,
      });
      res.status(200).json({ success: true, message: "Save successfully" });
    } else {
      res
        .status(200)
        .json({ success: false, message: "Please save pacakge name first" });
    }
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const savePackage = async (req, res) => {
  try {
    const packageData = req.body.formData;
    const loggedInUserId = loggedInUser(req);

    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    // Check if packageData.id exists
    if (packageData.id) {
      // Update existing record
      const existingPackage = await VendorPackage.findByPk(packageData.id);

      if (!existingPackage) {
        return res.status(404).json({ error: "Package not found" });
      }
      console.log("heloocasdc");

      // Update the existing package
      await existingPackage.update({
        package_name: packageData.package_name,
        pickup: packageData.pickup === true || packageData.pickup === 1 ? 1 : 0,
        delivery:
          packageData.delivery === true || packageData.delivery === 1 ? 1 : 0,
        tax_percent: req.body.formData.tax_percent,
        vendor_location_id: packageData.package_location.id,
        package_description: packageData.package_details,
        delivery_schedule_start: packageData.delivery_from,
        delivery_schedule_end: packageData.delivery_until,
        pickup_schedule_start: packageData.pickup_from,
        pickup_schedule_end: packageData.pickup_until,
        mon: packageData.mon === true || packageData.mon === 1 ? 1 : 0,
        tue: packageData.tue === true || packageData.tue === 1 ? 1 : 0,
        wed: packageData.wed === true || packageData.wed === 1 ? 1 : 0,
        thu: packageData.thu === true || packageData.thu === 1 ? 1 : 0,
        fri: packageData.fri === true || packageData.fri === 1 ? 1 : 0,
        sat: packageData.sat === true || packageData.sat === 1 ? 1 : 0,
        sun: packageData.sun === true || packageData.sun === 1 ? 1 : 0,
      });
      // save Locations
      // await VendorPackageLocations.destroy({
      //   where: {
      //     vendor_package_id: packageData.id,
      //   },
      // });

      // packageData.package_location.forEach(async (item) => {
      //   try {
      //     await VendorPackageLocations.create({
      //       vendor_package_id: packageData.id,
      //       vendor_location_id: item.id,
      //     });
      //   } catch (error) {
      //     console.log(error);
      //     return res.status(500).json({
      //       success: false,
      //       message: "Internal server error in Vendor Package Location save",
      //     });
      //   }
      // });
      // // update TimeSlots

      const results = await Promise.all(
        req.body.timeSlots.map(async (item) => {
          if (item.id) {
            const resp = await VendorPackageSlots.findByPk(item.id);

            const checkCustomer = await CustomerPackage.findAll({
              where: { delivery_slot_id: item.id },
              // include: [
              //   { model: UserCustomer },
              //   { model: VendorPackageSlots },
              //   { model: VendorPackage, attributes: ["package_name"] },
              // ],
            });

            // if (checkCustomer.length > 0) {
            //   return {
            //     success: false,
            //     data: checkCustomer,
            //     message: "can't change this timeslot",
            //   };
            // }

            await resp.update(item);
          } else {
            // const fetch= await VendorPackagePrice
            await VendorPackageSlots.create(item);
          }
        })
      );
      const failedResults = results.find((result) => !result?.success);

      if (failedResults) {
        return res.status(200).json(failedResults);
      }
      // Update package prices
      await updatePackagePrices(packageData);

      return res
        .status(200)
        .json({ success: true, data: { id: existingPackage.id } });
    }

    // Create a new recordt
    const packageCreate = await VendorPackage.create({
      vendor_id: vendorUser.vendor_id,
      vendor_location_id: 1,
      plan_id: 1,
      package_name: packageData.package_name,
      package_description: packageData.package_details,
      price: "",
      tax_percent: "",
      created_date: new Date(),
      pause: "",
      delivery: "",
      delivery_price: "",
      delivery_schedule_start: packageData.delivery_from,
      delivery_schedule_end: packageData.delivery_until,
      pickup: "",
      pickup_price: "",
      pickup_schedule_start: packageData.pickup_from,
      pickup_schedule_end: packageData.pickup_until,
      mon: packageData.mon === "on" ? 1 : 0,
      tue: packageData.tue === "on" ? 1 : 0,
      wed: packageData.wed === "on" ? 1 : 0,
      thu: packageData.thu === "on" ? 1 : 0,
      fri: packageData.fri === "on" ? 1 : 0,
      sat: packageData.sat === "on" ? 1 : 0,
      sun: packageData.sun === "on" ? 1 : 0,
    });

    // Create or update package prices
    await updatePackagePrices(packageData);

    res.status(200).json({ success: true, data: { id: packageCreate.id } });
  } catch (error) {
    console.error("Error adding item:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function updatePackagePrices(packageData) {
  const methods = ["delivery", "pickup"];
  const frequencies = ["daily", "weekly", "monthly"];
  for (const method of methods) {
    for (const frequency of frequencies) {
      const cost = packageData[`${method}_${frequency}`];
      if (cost) {
        await updateOrCreatePackagePrice(
          packageData.id,
          frequency,
          method,
          cost
        );
      }
    }
  }
}

async function updateOrCreatePackagePrice(packageId, frequency, method, cost) {
  const existingPackagePrice = await VendorPackagePrice.findOne({
    where: {
      package_id: packageId,
      frequency: frequency,
      method: method,
    },
  });

  if (existingPackagePrice) {
    // Update the existing record
    await existingPackagePrice.update({
      cost: cost,
    });
  } else {
    // Create a new record
    await VendorPackagePrice.create({
      package_id: packageId,
      frequency: frequency,
      method: method,
      cost: cost,
    });
  }
}

export const updateVendorPackageDefaultItems = async (req, res) => {
  try {
    const reqBody = req.body;

    if (reqBody.id) {
      const defaultItem = await VendorPackageDefaultItem.findOne({
        where: { id: reqBody.id },
      });
      defaultItem.item_name = reqBody.item_name;
      defaultItem.vendor_category_id = reqBody.vendor_category;
      defaultItem.quantity = reqBody.quantity;
      defaultItem.default_item_id = reqBody.default_item_id;
      defaultItem.measurement = reqBody.measurement;
      await defaultItem.save();
    } else {
      const defaultItem = await VendorPackageDefaultItem.create({
        item_name: reqBody.item_name,
        vendor_category_id: reqBody.vendor_category,
        quantity: reqBody.quantity,
        default_item_id: reqBody.default_item_id,
        measurement: reqBody.measurement,
        all_packages: 0,
        status: 0,
        package_id: reqBody.package_id,
      });
      await defaultItem.save();
    }
    res.json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error Updating Vendor package default Items",
      success: false,
    });
  }
};
const transformArray = (arr) => {
  // Group items by their 'id' property
  const groupedItems = arr.reduce((acc, item) => {
    const key = item.menu_item_group_id;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

  // Convert the grouped items into the desired format
  return Object.entries(groupedItems).map(([key, value], index) => ({
    id: key,
    itemRelated: value,
  }));
};

export const getAllDefaultItems = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const defItems = await VendorDefaultItem.findAll({
      where: { vendor_id: id },
    });
    res.status(200).json({ success: true, data: defItems });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getDefaultItems = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await VendorPackageDefaultItem.findAll({
      where: { package_id: id },
      include: [
        {
          model: VendorMenuItems,
          include: [VendorMenuQuantity],
        },
      ],
    });

    let resultsArr = [];
    const VPackage = await VendorPackage.findOne({
      where: { id: id },
    });

    const daysArr = [];
    if (VPackage.sun === 1) {
      daysArr.push("Sunday");
    }
    if (VPackage.mon === 1) {
      daysArr.push("Monday");
    }
    if (VPackage.tue === 1) {
      daysArr.push("Tuesday");
    }
    if (VPackage.wed === 1) {
      daysArr.push("Wednesday");
    }
    if (VPackage.thu === 1) {
      daysArr.push("Thursday");
    }
    if (VPackage.fri === 1) {
      daysArr.push("Friday");
    }
    if (VPackage.sat === 1) {
      daysArr.push("Saturday");
    }
    const nextDays = Helper.getNextDatesOfWeek(daysArr);
    for (const days of nextDays) {
      //nextDays.forEach(async (days) => {
      var nextObject = {};
      // const menuResult = await VendorPackageMenuItems.findAll({
      //   where: {
      //     package_id: id,
      //     menu_default_group_id: 0,
      //     menu_item_id: 0,
      //     menu_date: new Date(days.Date),
      //   },
      // });
      const menuResult = await VendorPackageMenuItems.findAll({
        where: {
          package_id: id,
          menu_default_group_id: 0,
          menu_date: new Date(days.Date),
        },
        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });

      nextObject.date = days.Date;
      nextObject.day = days.Day;
      let itemsRecord = [];

      const separateItem = transformArray(menuResult);

      for (const defaultItem of results) {
        // results.forEach(async (defaultItem) => {
        let itemData = { ...defaultItem.dataValues, isDefault: true };
        // let itemData = { ...defaultItem };
        //if (defaultItem.id === 2) {
        //const groupItem = getDefaultGroupItem(defaultItem.id, days.Date);

        const package_menu_item = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: defaultItem.id,
            menu_date: new Date(days.Date),
            is_default_linked: true,
          },
          include: [
            {
              model: VendorMenuItems,
              include: [VendorMenuQuantity],
            },
            {
              model: VendorMenuQuantity,
            },
          ],
        });

        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }

        itemData.defaultItem = defaultItem;

        if (package_menu_item) {
          itemData.package_menu_item = package_menu_item;

          defaultItem.VendorPackageMenuItem = package_menu_item;
        }

        //}
        itemsRecord.push(itemData);
      }

      for (const menuItem of separateItem) {
        let itemData = { ...menuItem, menuCheck: true, isDefault: false };
        itemsRecord.push(itemData);
      }

      const vendorAddedPackageItems = await VendorPackageMenuItems.findAll({
        where: {
          package_id: id,
          menu_date: days.Date,
          menu_default_group_id: 0,
        },
        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });
      let vendorPackageRecords = [];

      for (const defaultItem of vendorAddedPackageItems) {
        let itemData = {
          id: defaultItem.id,
          package_id: defaultItem.package_id,
          item_name: defaultItem.menu_item_name,
          item_id: defaultItem.menu_item_id,
          status: 1,
          is_default_linked: false,
          VendorMenuItem: defaultItem.VendorMenuItem,
          isDefault: false,
          VendorMenuQuantity: defaultItem.VendorMenuQuantity,
        };
        const package_menu_item = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: defaultItem.id,
            menu_date: new Date(days.Date), //check point
            is_default_linked: false,
          },
          include: [
            {
              model: VendorMenuItems,
              include: [VendorMenuQuantity],
            },
            {
              model: VendorMenuQuantity,
            },
          ],
        });
        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }
        vendorPackageRecords.push(itemData);
      }
      itemsRecord = itemsRecord.concat(vendorPackageRecords);
      nextObject.defaultItem = itemsRecord;
      resultsArr.push(nextObject);
    }
    res.status(200).json({ success: true, data: resultsArr });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMenuItemsBox = async (req, res) => {
  try {
    const { id } = req.params;
    const getMenuItems = await VendorPackageMenuItems.findAll({
      where: { menu_item_group_id: id },
    });

    await Promise.all(
      getMenuItems.map(async (item) => {
        await item.destroy();
      })
    );
    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error deleting menu items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const packageRequestApprove = async (req, res) => {
  try {
    const reqBody = req.body;
    if (!reqBody.start_date.length > 0 || !reqBody.end_date.length > 0) {
      res.status(500).json({ message: "Please provide valid dates" });
      return;
    }
    const loggedInUserId = loggedInUser(req);
    const request = await CustomerPackageRequest.findByPk(reqBody.id);
    request.status = 1;
    request.deleted = 0;
    request.approve_at = new Date();
    await request.save();

    let results = [];
    const CustomerGivenDates = Helper.getDateMonthDayBetweenTwoDates(
      reqBody.start_date,
      reqBody.end_date
    );

    const vendorP = await VendorPackage.findOne({
      where: { id: reqBody.package_id },
    });

    // Filtering among the package and getting which days are available for that package. Storing them in PackageAvailableDays Variable
    const PackageAvailableDays = [];
    if (vendorP.mon === 1) {
      PackageAvailableDays.push("mon");
    }
    if (vendorP.tue === 1) {
      PackageAvailableDays.push("tue");
    }
    if (vendorP.wed === 1) {
      PackageAvailableDays.push("wed");
    }
    if (vendorP.thu === 1) {
      PackageAvailableDays.push("thu");
    }
    if (vendorP.fri === 1) {
      PackageAvailableDays.push("fri");
    }
    if (vendorP.sat === 1) {
      PackageAvailableDays.push("sat");
    }
    if (vendorP.sun === 1) {
      PackageAvailableDays.push("sun");
    }
    // console.log(PackageAvailableDays);
    // Getting the matched days count between the packages available days and customer given days
    let customerOrderCount = [];

    PackageAvailableDays.forEach((d) => {
      CustomerGivenDates.forEach((dateObj) => {
        dateObj.day === d && customerOrderCount.push(dateObj);
      });
    });

    // Getting All the orders based on userId, VendorId, packageId
    // const existingOrders = await CustomerOrder.findAll({
    //   where: {
    //     user_id: customer_id,
    //     vendor_id: loggedInUserId,
    //     package_id: vendorP.id,
    //   },
    // });

    // Checking whether the order for the cutomer given dates are already being created or not.
    let orderDates = customerOrderCount;
    let start_order_date;
    let last_order_date;

    const dateArray = orderDates.map((date) => date.fullDate);
    if (!Array.isArray(dateArray) || dateArray.length === 0) {
      res.status(500).json({ message: "Dates array is emty" }); // If the input is not an array or empty, return null
      return;
    } else {
      // Sort the array of dates in descending order
      dateArray.sort((a, b) => b.getTime() - a.getTime());
      start_order_date = dateArray[dateArray.length - 1];
      last_order_date = dateArray[0];
    }

    // existingOrders.length > 0 &&
    //   existingOrders.forEach((or) => {
    //     orderDates = orderDates.filter(
    //       (date) => date.dateString !== or.order_date
    //     );
    //   });

    const customerPackage = await CustomerPackage.create({
      user_id: reqBody.user_id,
      package_id: reqBody.package_id,
      payment_status: reqBody.payment_status,
      frequency_id: reqBody.frequency_id,
      user_package_name: reqBody.user_package_name,
      quantity: reqBody.quantity,
      created_date: new Date(),
      start_date: new Date(reqBody.start_date + "T00:00:00"),
      end_date: new Date(reqBody.end_date + "T00:00:00"),
      customer_delivery_address_id: reqBody.customer_delivery_address_id,
      pickup_delivery: reqBody.pickup_delivery,
    });

    const customerPackageSubscription = await CustomerSubscription.create({
      customer_package_id: customerPackage.id,
      customer_package_frequency_id: reqBody.frequency_id,
      created_date: new Date(),
      start_date: new Date(reqBody.start_date + "T00:00:00"),
      end_date: new Date(reqBody.end_date + "T00:00:00"),
    });

    // Creating orders
    const deliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { id: reqBody.customer_delivery_address_id },
      include: [{ model: CitiesAll }],
    });
    for (let x = 0; x < orderDates.length; x++) {
      const customerOrder = await CustomerOrder.create({
        user_id: reqBody.user_id,
        vendor_id: loggedInUserId,
        package_id: reqBody.package_id,
        customer_package_id: customerPackage.id,
        customer_package_subscription_id: customerPackageSubscription.id,
        order_date: orderDates[x].fullDate,
        created_date: new Date(),
        is_ready: 0,
        is_delivered: 0,
        delivery_address: `${deliveryAddress?.dataValues.address}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.city}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.state},${deliveryAddress?.dataValues.postal}`,

        subtotal: 0,
        tax: 0,
        total: 0,
        delivery_img: "",
        // delivered_time: new Date(),
        customer_delivery_address_id: reqBody.customer_delivery_address_id,
        vendor_location_id: reqBody.vendor_location_id,
      });
    }

    const customerUser = await UserCustomer.findByPk(reqBody.user_id);
    const vendorDetails = await UserVendor.findByPk(vendorP.vendor_id);
    const vendor = await Vendor.findByPk(1);

    const finalPackageAvailableDays = [];
    PackageAvailableDays.forEach((day) => {
      finalPackageAvailableDays.push(fullDayNames[days.indexOf(day)]);
    });

    let deliveryAddressObj =
      reqBody.CustomerDeliveryAddress || reqBody.VendorLocation;

    // Sending the email
    const emailTamplete = {
      content: `${vendor.vendor_name} has accepted your package request. Your package details are as follows:`,
      package_name: vendorP.package_name,
      start_order_date: Helper.getDateFromString(start_order_date),
      end_order_date: Helper.getDateFromString(last_order_date),
      meals_count: orderDates.length,
      days: finalPackageAvailableDays,
      pickup_delivery: reqBody.pickup_delivery === 2 ? "Delivery" : "Pickup",
      delivery_window: "11:00AM - 2:00PM",
      delivery_address: `Delivery address: ${deliveryAddressObj?.address}
                        ${deliveryAddressObj?.CitiesAll?.city}
                        ${deliveryAddressObj?.CitiesAll?.state}
                        ${deliveryAddressObj?.postal || ""}`,
      link: `https://menuscribe.com/customer-dashboard`,
    };

    const subject = `Your package request has been accepted by ${vendor.vendor_name}`;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "approve-package.ejs"),
      emailTamplete
    );
    const emailRes = await sendEmail(
      customerUser.email,
      subject,
      "hello",
      html
    );
    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "errror from package request approve", success: false });
  }
};

export const addNewSubscriptionPackage = async (req, res) => {
  try {
    const reqBody = req.body.pkgInfo;
    const orderDates = req.body.dates;
    const loggedInUserId = loggedInUser(req);
    // const customerPackage = await CustomerPackage.create({
    //   user_id: reqBody.user_id,
    //   package_id: reqBody.package_id,
    //   payment_status: reqBody.payment_status,
    //   frequency_id: reqBody.frequency_id,
    //   user_package_name: reqBody.user_package_name,
    //   quantity: reqBody.quantity,
    //   created_date: new Date(),
    //   start_date: new Date(reqBody.start_date + "T00:00:00"),
    //   end_date: new Date(reqBody.end_date + "T00:00:00"),
    //   customer_delivery_address_id: reqBody.customer_delivery_address_id,
    //   pickup_delivery: reqBody.pickup_delivery,
    // });

    const customerPackageSubscription = await CustomerSubscription.create({
      customer_package_id: reqBody.id,
      // customer_package_frequency_id: reqBody.frequency_id,
      created_date: new Date(),
      start_date: new Date(reqBody.start_date),
      end_date: new Date(reqBody.end_date),
    });
    const deliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { id: reqBody.customer_delivery_address_id },
      include: [{ model: CitiesAll }],
    });
    console.log(deliveryAddress, reqBody.customer_delivery_address_id);
    // Creating orders
    for (let x = 0; x < orderDates.length; x++) {
      await CustomerOrder.create({
        user_id: reqBody.user_id,
        vendor_id: loggedInUserId,
        package_id: reqBody.package_id,
        customer_package_id: reqBody.id,
        customer_package_subscription_id: customerPackageSubscription.id,
        delivery_address: deliveryAddress
          ? `${deliveryAddress?.dataValues.address}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.city}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.state},${deliveryAddress?.dataValues.postal}`
          : "Address not found",
        pickup_delivery: 1,
        order_date: orderDates[x],
        created_date: new Date(),
        is_ready: 0,
        is_delivered: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        delivery_img: "",
        // delivered_time: new Date(),
        customer_delivery_address_id: reqBody.customer_delivery_address_id,
        vendor_location_id: reqBody.vendor_location_id,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "errror from package request approve", success: false });
  }
};

export const getVendorEmployeesWithEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userVendor = await UserVendor.findOne({
      where: { email: email },
    });
    let vendorEmployees = [];
    if (userVendor) {
      vendorEmployees = await VendorEmployee.findAll({
        where: { user_vendor_id: userVendor.dataValues.id, status: 1 },
        include: {
          model: Vendor,
        },
      });
    }
    res.json({ message: "successfull", success: true, data: vendorEmployees });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to get Vendor Employeees with email" });
  }
};
export const packageRequestRemove = async (req, res) => {
  try {
    const reqBody = req.body;
    const request = await CustomerPackageRequest.findByPk(reqBody.id);
    request.status = 0;
    request.deleted = 1;
    await request.save();
    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "errror from package request approve", success: false });
  }
};
export const confirmPaymentRequest = async (req, res) => {
  try {
    const reqBody = req.body;
    const findVendor = await Vendor.findByPk(reqBody.user_id);
    const findInstruction = await VendorPaymentMethods.findOne({
      vendor_id: reqBody.user_id,
    });
    const response = await VendorPackage.findByPk(reqBody.package_id);
    const tax_percent = response.dataValues.tax_percent;
    const tax = reqBody.tax;
    const price = reqBody.price;

    let payment_due;
    if (tax_percent !== 0 && price) {
      // payment_due = price + (price / 100) * tax_percent;
      payment_due = price + tax;
    } else if (tax_percent === 0 && price) {
      payment_due = price;
    } else {
      payment_due = "N/A";
    }
    const emailTamplete = {
      text: `${findVendor.dataValues.vendor_name} has received your package request and has confirmed its availability. Please provide payment to the vendor. The package will only be approved once the payment is made.`,
      taxPercent: `${payment_due} ($${price} package cost + $${tax} tax @ ${tax_percent}%)
      `,
      instructions: findInstruction.dataValues.instructions,
    };
    const subject = "Package availability confirmed - Please make payment";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "conform-package-email.ejs"),
      emailTamplete
    );

    const resp = await sendEmail(
      reqBody.UserCustomer.email,
      subject,
      "hello",
      html
    );
    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "error from package request approve", success: false });
  }
};

export const packageRequestReject = async (req, res) => {
  try {
    const reqBody = req.body;
    let reason = req.body.reason;

    const request = await CustomerPackageRequest.findByPk(reqBody.data.id);
    request.status = 2;
    request.deleted = 0;

    const findVendor = await Vendor.findByPk(reqBody.data.user_id);
    let emailTamplete;
    if (reason !== "") {
      request.sent_message = reason;
      emailTamplete = {
        text: `${findVendor.dataValues.vendor_name} has rejected your package request. Here is the reason that was provided.`,
        reason: `${reason}`,
      };
    } else {
      emailTamplete = {
        text: `${findVendor.dataValues.vendor_name} has rejected your package request.`,
        reason: `No Reason`,
      };
    }

    const subject = "Your package request was rejected";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "package-rejected-template.ejs"),
      emailTamplete
    );

    const resp = await sendEmail(
      reqBody.data.UserCustomer.email,
      subject,
      "hello",
      html
    );
    await request.save();
    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "error from package request approve", success: false });
  }
};

export const getMealCount = async (req, res) => {
  try {
    const { customer_id, packages } = req.body;
    const loggedInUserId = loggedInUser(req);
    // Find the existing item
    // const existingSubscription = await CustomerSubscription.findByPk(id);

    // if (!existingSubscription) {
    //   return res.status(404).json({ error: "Item not found" });
    // }
    // // Update the existing item's properties
    // existingSubscription.start_date = start_date;
    // existingSubscription.end_date = end_date;
    // Save the updated item
    // const finalSubscription = await existingSubscription.save();
    let results = [];
    const CustomerGivenDates = Helper.getDateMonthDayBetweenTwoDates(
      packages.start_date,
      packages.end_date
    );

    // console.log(CustomerGivenDates);

    const vendorP = await VendorPackage.findOne({
      where: { id: packages.package_id },
    });

    // Filtering among the package and getting which days are available for that package. Storing them in PackageAvailableDays Variable
    const PackageAvailableDays = [];
    if (vendorP.mon === 1) {
      PackageAvailableDays.push("mon");
    }
    if (vendorP.tue === 1) {
      PackageAvailableDays.push("tue");
    }
    if (vendorP.wed === 1) {
      PackageAvailableDays.push("wed");
    }
    if (vendorP.thu === 1) {
      PackageAvailableDays.push("thu");
    }
    if (vendorP.fri === 1) {
      PackageAvailableDays.push("fri");
    }
    if (vendorP.sat === 1) {
      PackageAvailableDays.push("sat");
    }
    if (vendorP.sun === 1) {
      PackageAvailableDays.push("sun");
    }

    // Getting the matched days count between the packages available days and customer given days
    let customerOrderCount = [];

    PackageAvailableDays.forEach((d) => {
      CustomerGivenDates.forEach((dateObj) => {
        dateObj.day === d && customerOrderCount.push(dateObj);
      });
    });
    // console.log(customerOrderCount, PackageAvailableDays);

    // Getting All the orders based on userId, VendorId, packageId
    const existingOrders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
      },
    });

    // Checking whether the order for the cutomer given dates are already being created or not.
    let orderDates = customerOrderCount;
    existingOrders.length > 0 &&
      existingOrders.forEach((or) => {
        orderDates = orderDates.filter(
          (date) => date.dateString !== or.order_date
        );
      });

    // Updating the customer package & customer_package_subscription end_date according to the current last order date
    // if (orderDates.length > 0) {
    //   const dateArray = orderDates.map((date) => date.fullDate);
    //   if (!Array.isArray(dateArray) || dateArray.length === 0) {
    //     return null; // If the input is not an array or empty, return null
    //   }
    //   // Sort the array of dates in descending order
    //   dateArray.sort((a, b) => b.getTime() - a.getTime());

    //   const start_order_date = dateArray[dateArray.length - 1];
    //   const last_order_date = dateArray[0];

    //   const customerPackage = await CustomerPackage.findByPk(
    //     packages.customer_package_id
    //   );
    //   customerPackage.end_date = new Date(last_order_date);
    //   const savedCustomerPackage = await customerPackage.save();

    //   const customerPackageSubscription = await CustomerSubscription.findOne({
    //     where: { customer_package_id: packages.customer_package_id },
    //   });
    //   if (customerPackageSubscription) {
    //     customerPackageSubscription.end_date = new Date(last_order_date);

    //     const savedCustomerSubscription =
    //       await customerPackageSubscription.save();
    //   } else {
    //     const customerSubscription = await CustomerSubscription.create({
    //       customer_package_id: packages.customer_package_id,
    //       customer_package_frequency_id: 2,
    //       created_date: new Date(),
    //       start_date: new Date(start_order_date),
    //       end_date: new Date(last_order_date),
    //     });
    //   }
    // }

    // console.log(customerPackage);

    // Creating orders
    // for (let x = 0; x < orderDates.length; x++) {
    //   const customerOrder = await CustomerOrder.create({
    //     user_id: customer_id,
    //     vendor_id: loggedInUserId,
    //     package_id: vendorP.id,
    //     created_date: new Date(),
    //     order_date: orderDates[x].fullDate,
    //     customer_package_id: packages.customer_package_id,
    //     is_ready: 0,
    //     is_delivered: 0,
    //     subtotal: 0,
    //     tax: 0,
    //     total: 0,
    //     delivery_img: "",
    //     // delivered_time: new Date(),
    //     customer_delivery_address_id: 0,
    //   });
    // }

    // const customerPackage = await CustomerPackage.findOne({
    //   where: { id: finalSubscription.customer_package_id },
    // });

    // const vendorP = await VendorPackage.findOne({
    //   where: { id: customerPackage.package_id },
    // });

    // Getting the day, date and month name between the package start and package end date.

    res.status(200).json({
      success: true,
      message: "Subscription dates updated successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function getDefaultGroupItem(id, date) {
  const package_menu_item = await VendorPackageMenuItems.findAll({
    // where: {
    //   menu_default_group_id: id,
    //   menu_date: date,
    // }
  });
  return package_menu_item; //Helper.isObjectEmpty(package_menu_item) ? package_menu_item : [];
}

export const addItemToDay = async (req, res) => {
  try {
    const itemData = req.body;
    let selectedItem;
    if (itemData.item_selected) {
      selectedItem = await VendorMenuItems.findOne({
        where: { id: itemData.item_selected },
      });
    }
    let { adOrid, quantity_id } = itemData;
    if (itemData.is_default_linked && itemData.isDefault !== true) {
      const vendorPackageMenuItem = await VendorPackageMenuItems.findByPk(
        adOrid
      );
      if (vendorPackageMenuItem) {
        adOrid = vendorPackageMenuItem.menu_default_group_id;
      }
    }

    let item;
    if (itemData.isDefault) {
      item = await VendorPackageMenuItems.create({
        package_id: itemData.package_id,
        menu_item_id: itemData.item_selected,
        menu_item_name: selectedItem ? selectedItem.item_name : "",
        menu_default_group_id: adOrid !== "" ? adOrid : 0,
        menu_item_group_id: 0,
        is_default_linked: itemData.is_default_linked,
        package_name: itemData.package_name,
        quantity: selectedItem ? selectedItem.quantity : "",
        menu_date: itemData.date,
        sort_id: itemData.sort !== "" ? itemData.sort : 0,
        replace_parent: false,
        quantity_id,
      });
    } else {
      item = await VendorPackageMenuItems.create({
        package_id: itemData.package_id,
        menu_item_id: itemData.item_selected,
        menu_item_name: selectedItem ? selectedItem.item_name : "",
        menu_default_group_id: 0,
        menu_item_group_id: adOrid,
        is_default_linked: itemData.is_default_linked,
        package_name: itemData.package_name,
        quantity: selectedItem ? selectedItem.quantity : "",
        menu_date: itemData.date,
        sort_id: itemData.sort !== "" ? itemData.sort : 0,
        replace_parent: false,
        quantity_id,
      });
    }

    res.status(200).json({ success: true, data: item.id });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error", dataError: error });
  }
};

export const addDefaultItemToDay = async (req, res) => {
  try {
    const itemData = req.body;
    let selectedItem;
    if (itemData.item_selected) {
      selectedItem = await VendorMenuItems.findOne({
        where: { id: itemData.item_selected },
      });
    }
    let { adOrid, quantity_id } = itemData;
    if (itemData.is_default_linked && itemData.isDefault !== true) {
      const vendorPackageMenuItem = await VendorPackageMenuItems.findByPk(
        adOrid
      );
      if (vendorPackageMenuItem) {
        adOrid = vendorPackageMenuItem.menu_default_group_id;
      }
    }
    let item;
    if (itemData.isDefault) {
      item = await VendorPackageMenuItems.create({
        package_id: 0,
        menu_item_id: itemData.item_selected,
        menu_item_name: selectedItem ? selectedItem.dataValues.item_name : "",
        menu_default_group_id: adOrid !== "" ? adOrid : 0,
        menu_item_group_id: 0,
        is_default_linked: itemData.is_default_linked,
        package_name: "",
        quantity: selectedItem ? selectedItem.dataValues.quantity : "",
        menu_date: itemData.date,
        sort_id: itemData.sort !== "" ? itemData.sort : 0,
        replace_parent: false,
        quantity_id,
      });
    } else {
      item = await VendorPackageMenuItems.create({
        package_id: 0,
        menu_item_id: itemData.item_selected,
        menu_item_name: selectedItem ? selectedItem.item_name : "",
        menu_default_group_id: 0,
        menu_item_group_id: adOrid,
        is_default_linked: itemData.is_default_linked,
        package_name: itemData.package_name ? itemData.package_name : "",
        quantity: selectedItem ? selectedItem.quantity : "",
        menu_date: itemData.date,
        sort_id: itemData.sort !== "" ? itemData.sort : 0,
        replace_parent: false,
        quantity_id,
      });
    }

    res.status(200).json({ success: true, data: item.id });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error", dataError: error });
  }
};

// export const getVendorCustomerOrders = async (req, res) => {
//   try {
//   } catch (error) {
//     console.log("Error: " + error);
//     res.status(500).json({ error: "Internal Server Error", dataError: error });
//   }
// };
export const getCustomerOrders = async (req, res) => {
  try {
    const data = req.body;
    const currentDate = new Date(data.selected_date);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    const currentDay = Helper.formatDate(currentDate);
    const dayAbbreviated = Helper.getAbbreviatedDayName(currentDay.dayName);

    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const locationIds = await loggedInUserLocation(req);
    const results = await UserCustomer.findAll({
      include: [
        {
          model: CustomerPackage,
          where: {
            payment_status: 1,
            vendor_location_id: { [Op.in]: [...locationIds] },
          },
          include: [
            {
              model: VendorPackage,
              where: {
                [dayAbbreviated]: 1,
                vendor_location_id: { [Op.in]: [...locationIds] },
              },
              include: [
                {
                  model: VendorPackageDefaultItem,
                  include: [
                    {
                      model: VendorPackageMenuItems,
                      include: [
                        {
                          model: VendorMenuItems,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      where: {
        vendor_id: vendorUser.vendor_id,
      },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching customer orders : " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const saveVendorSettingTax = async (req, res) => {
  try {
    const id = loggedInUser(req);
    console.log(req.body);
    const fetchData = await VendorSettings.findOne({
      where: { vendor_id: id },
    });
    fetchData.tax_default = req.body.default_tax;
    await fetchData.save();
    res.json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error getting tax saving in Vendor setting table",
      success: false,
    });
  }
};

export const getVendorSetting = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const fetchData = await VendorSettings.findOne({
      where: { vendor_id: id },
    });

    res.json({ message: "Successfull", success: true, data: fetchData });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error getting tax saving in Vendor setting table",
      success: false,
    });
  }
};
export const getCustomerOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const customerOrder = await CustomerOrder.findOne({
      where: { id },
      include: [
        {
          model: CustomerOrderItem,
          include: { model: VendorMenuItems },
        },
        {
          model: UserCustomer,
        },
      ],
    });
    res.json({ message: "Successfull", success: true, data: customerOrder });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error getting Customer Order", success: false });
  }
};
export const cencelCustomerOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const customerOrder = await CustomerOrder.findByPk(id);
    customerOrder.status = 2;
    await customerOrder.save();
    res.json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error getting Customer Order", success: false });
  }
};

export const setConfrimOrderPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const customerOrder = await CustomerOrder.findByPk(id);
    customerOrder.is_delivered = 1;
    await customerOrder.save();
    res.json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error getting Customer Order", success: false });
  }
};
export const setNonConfrimOrderPickup = async (req, res) => {
  try {
    const { id } = req.params;
    const customerOrder = await CustomerOrder.findByPk(id);
    customerOrder.is_delivered = 0;
    await customerOrder.save();
    res.json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Error getting Customer Order", success: false });
  }
};

export const getVendorMenuItems = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const results = await VendorMenuItems.findAll({
      where: {
        vendor_id: loggedInUserId,
      },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const setCustomerOrderItem = async (req, res) => {
  try {
    const { orderId, itemId } = req.body;
    const customerOrderItem = await CustomerOrderItem.create({
      order_id: orderId,
      item_id: itemId,
    });
    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error Setting Customer Order Item" });
  }
};

// export const getOrderSummary = async (req, res) => {
//   try {
//     const data = req.body;

//     const currentDate = new Date(data.selected_date);
//     const formattedDate = currentDate
//       .toISOString()
//       .slice(0, 19)
//       .replace("T", " ");
//     const nextDay = new Date(currentDate);
//     nextDay.setDate(currentDate.getDate() + 1);
//     const formattedNextDay = nextDay
//       .toISOString()
//       .slice(0, 19)
//       .replace("T", " ");
//     const currentDay = Helper.formatDate(currentDate);
//     const dayAbbreviated = Helper.getAbbreviatedDayName(currentDay.dayName);

//     const loggedInUserId = loggedInUser(req);
//     const vendorUser = await UserVendor.findByPk(loggedInUserId)
//     // const results = await CustomerOrder.findAll({
//     //   include: [
//     //     {
//     //       model: CustomerOrderItem,
//     //       include: [
//     //         {
//     //           model: VendorMenuItems,
//     //         }
//     //       ],
//     //     },
//     //   ],
//     //   where: {
//     //     vendor_id: loggedInUserId,
//     //     delivered_time: {
//     //       [Op.gte]: formattedDate,
//     //       [Op.lt]: formattedNextDay
//     //     }
//     //   }
//     // });

//     const results = await UserCustomer.findAll({
//       include: [
//         {
//           model: CustomerPackage,
//           where: { payment_status: 1 },
//           include: [
//             {
//               model: VendorPackage,
//               where: { [dayAbbreviated]: 1 },
//               include: [
//                 {
//                   model: VendorPackageDefaultItem,
//                   include: [
//                     {
//                       model: VendorPackageMenuItems,
//                     },
//                   ],
//                 },
//               ],
//             },
//           ],
//         },
//       ],

//       where: {
//         vendor_id: vendorUser.vendor_id,
//       },
//     });

//     console.log("results", results);
//     // Initialize an empty object to store item counts
//     const itemCounts = {};

//     // // Iterate through the orders array
//     for (const order of results) {
//       // Extract CustomerOrderItems from each order
//       const customerOrderItems =
//         order.CustomerPackage.VendorPackage.VendorPackageDefaultItems;

//       // Iterate through CustomerOrderItems
//       for (const item of customerOrderItems) {
//         const itemId = item.item_id;

//         // If the itemId is not in itemCounts, initialize it with count 1
//         if (!itemCounts[itemId]) {
//           itemCounts[itemId] = 1;
//         } else {
//           // If the itemId is already in itemCounts, increment the count
//           itemCounts[itemId]++;
//         }
//         if (item.VendorPackageMenuItem) {
//           const itemId = item.VendorPackageMenuItem.menu_item_id;
//           if (!itemCounts[itemId]) {
//             itemCounts[itemId] = 1;
//           } else {
//             // If the itemId is already in itemCounts, increment the count
//             itemCounts[itemId]++;
//           }
//         }
//       }
//     }

//     const itemPromises = Object.keys(itemCounts).map((itemId) =>
//       getMenuItem(parseInt(itemId)).then((item) => ({
//         item,
//         item_id: parseInt(itemId),
//         count: itemCounts[itemId],
//       }))
//     );
//     const itemCountArray = await Promise.all(itemPromises);

//     res.status(200).json({ success: true, data: itemCountArray });
//     //  res.status(200).json({ success: true, data: { results, itemCountArray }});
//   } catch (error) {
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getOrderSummary = async (req, res) => {
  const { selected_date } = req.body;
  const loggedInUserId = loggedInUser(req);
  const selected_date_Obj = new Date(selected_date);
  const locationIds = await loggedInUserLocation(req);

  try {
    const orders = await CustomerOrder.findAll({
      where: {
        vendor_id: loggedInUserId,
        vendor_location_id: { [Op.in]: [...locationIds] },
      },
      include: [
        {
          model: CustomerOrderItem,
          include: {
            model: VendorMenuItems,
          },
        },
      ],
    });

    // Validating by current date
    let finalOrders = [];
    for (const order of orders) {
      const currentCreatedDate = order.created_date;
      const dateMatch =
        (currentCreatedDate.getFullYear() === selected_date_Obj.getFullYear()) &
        (currentCreatedDate.getMonth() === selected_date_Obj.getMonth()) &
        (currentCreatedDate.getDate() === selected_date_Obj.getDate());
      if (dateMatch) {
        finalOrders.push(order);
      }
    }
    // Getting all available menu items for current vendor or user
    const availableItems = await VendorMenuItems.findAll({
      where: { vendor_id: loggedInUserId },
    });
    // Setting all the available items as an object
    let AllItems = {};
    for (const item of availableItems) {
      AllItems[item.item_name] = { ...item.dataValues, count: 0 };
    }

    // Looping throuth the final orders and incrementing the count of each item
    for (const order of finalOrders) {
      order.CustomerOrderItems.forEach((or) => {
        const allItemsKeys = Object.keys(AllItems);
        allItemsKeys.forEach((it) => {
          if (or.VendorMenuItem.item_name === it) {
            AllItems[it].count += 1;
          }
        });
      });
    }

    // Looping through the all Items values and setting the final result if current items count is greater than 0
    let finalResult = [];
    Object.values(AllItems).forEach((val) => {
      if (val.count > 0) {
        finalResult.push(val);
      }
    });

    res
      .status(200)
      .json({ message: "Success", success: true, data: finalResult });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch data",
      success: false,
      details: error,
    });
  }
};
export const getOrdersByDate = async (req, res) => {
  const { order_date, vendor_location_id, user_id } = req.body;
  const loggedInUserId = loggedInUser(req);
  const dateStr = order_date.split("T")[0];
  const lastItemofStr = dateStr.split("-");
  lastItemofStr[2] = parseInt(lastItemofStr[2]);
  const selected_date_Obj = new Date(lastItemofStr.join("-"));
  const locationIds = await loggedInUserLocation(req);
  try {
    let obj = {
      vendor_id: 1,
      order_date: selected_date_Obj,
      vendor_location_id: { [Op.in]: [...locationIds] },
    };
    if (user_id) {
      obj = {
        vendor_id: 1,
        user_id: user_id,
        order_date: selected_date_Obj,
        vendor_location_id: { [Op.in]: [...locationIds] },
      };
    }

    if (vendor_location_id) {
      obj = {
        vendor_id: 1,

        order_date: selected_date_Obj,
        vendor_location_id: { [Op.in]: [...locationIds, vendor_location_id] },
      };
    }
    const orders = await CustomerOrder.findAll({
      where: obj,
      include: [
        {
          model: VendorPackage,
          where: {
            vendor_location_id: {
              [Op.in]: [...locationIds, vendor_location_id],
            },
          },
          include: [
            {
              model: VendorPackageDefaultItem,
              include: [
                {
                  model: VendorPackageMenuItems,
                  required: false,
                  where: { menu_date: selected_date_Obj },
                },
              ],
            },
          ],
        },
        {
          model: CustomerPackage,
          include: [
            { model: VendorPackagePrice },
            { model: CustomerDeliveryAddress, include: CitiesAll },
            { model: VendorLocations },
          ],
        },
        { model: UserCustomer },
      ],
    });
    const finalOrders = [];
    for (const order of orders) {
      const newOrder = { ...order.dataValues };
      if (order?.VendorPackage?.VendorPackageDefaultItems) {
        const newVendorPackageDefaultItems = [];
        for (const dItem of order.VendorPackage.VendorPackageDefaultItems) {
          const newDItem = { ...dItem.dataValues };
          const orderItem = await CustomerOrderItem.findOne({
            where: { order_id: order.id, menu_group_id: dItem.id },
            include: VendorPackageMenuItems,
          });

          newDItem.CustomerOrderItem = orderItem;
          newVendorPackageDefaultItems.push(newDItem);
        }
        // newOrder.VendorPackage.dataValues.VendorPackageDefaultItems =
        //   ['newVendorPackageDefaultItems'];
        newOrder.VendorPackage.dataValues.DefaultItemsWithExistingOrders =
          newVendorPackageDefaultItems;
      }

      finalOrders.push(newOrder);
    }

    res.status(200).json({
      message: "Success",
      success: true,
      data: orders,
      temp: finalOrders,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to Orders By Date",
      success: false,
      details: error,
    });
  }
};
export const manageOrder = async (req, res) => {
  const reqBody = req.body;
  try {
    const order = await CustomerOrder.findByPk(reqBody.id);
    order.is_ready = reqBody.is_ready;
    order.is_delivered = reqBody.is_delivered;
    await order.save();

    res.status(200).json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to Orders By Date",
      success: false,
      details: error,
    });
  }
};

export const addPkgTimeSlots = async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to Orders By Date",
      success: false,
      details: error,
    });
  }
};
export const sendRenewalMsg = async (req, res) => {
  try {
    const emailTamplete = {
      text: `${req.body.msg}`,
      name: req.body.name,
      link: "http://menuscribe.com/add-package",
    };
    const subject = "Package renew reminder";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "renewal-package.ejs"),
      emailTamplete
    );

    await sendEmail(req.body.email, subject, "hello", html);

    res.status(200).json({ message: "Successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      details: error,
    });
  }
};
export const getSubscriptionInfo = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const locationIds = await loggedInUserLocation(req);
    const subscription = await CustomerPackageSubscription.findAll({
      include: [
        {
          model: CustomerPackage,
          where: { vendor_location_id: { [Op.in]: [...locationIds] } },
          include: [
            { model: UserCustomer, where: { vendor_id: id } },
            {
              model: VendorPackage,
              where: { vendor_location_id: { [Op.in]: [...locationIds] } },
              include: [{ model: Vendor }],
            },
            { model: VendorPackagePrice },
            // { model: CustomerOrder },
          ],
          required: true,
        },
        {
          model: CustomerOrder,
          required: true,
        },
      ],
    });

    res
      .status(200)
      .json({ message: "Successfull", success: true, data: subscription });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed with Internal Server Error",
      success: false,
      details: error,
    });
  }
};

const getMenuItem = async (id) => {
  const item = await VendorMenuItems.findOne({ where: { id: id } });
  return item;
};

export const deactivatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    // Find the existing item
    const existingPackage = await VendorPackage.findByPk(packageId);
    if (!existingPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    // Update the existing package
    await existingPackage.update({
      pause: 1,
    });
    res.status(200).json({ success: true, data: { id: packageId } });
  } catch (error) {
    console.log("Error deactivating package : " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const activatePackage = async (req, res) => {
  try {
    const packageId = req.params.id;
    // Find the existing item
    const existingPackage = await VendorPackage.findByPk(packageId);
    if (!existingPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    // Update the existing package
    await existingPackage.update({
      pause: 0,
    });
    res.status(200).json({ success: true, data: { id: packageId } });
  } catch (error) {
    console.log("Error deactivating package : " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const setPaymentStatus = async (req, res) => {
  try {
    const userData = req.body;
    // Find the existing item
    const existingPackage = await CustomerPackage.findByPk(
      userData.customer_package
    );
    if (!existingPackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    // Update the existing package
    await existingPackage.update({
      payment_status: userData.value,
    });
    res.status(200).json({ success: true, data: { id: existingPackage.id } });
  } catch (error) {
    console.log("Error deactivating package : " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorPackageWithFrequency = async (req, res) => {
  try {
    // console.log(
    //   `Service Enter - ${req.originalUrl} - ${req.method}`,
    //   JSON.stringify(req.body)
    // );
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const packages = await VendorPackage.findAll({
      where: {
        vendor_id: vendorUser.vendor_id,
      },
      include: [
        {
          model: VendorPackagePrice,
          attributes: ["frequency"],
        },
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackagePrice,
        },
      ],
    });
    res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Error while fetching Vendor Package Frequency: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const AddCustomerPackage = async (req, res) => {
  try {
    const {
      package_id,
      customer_id,
      vendor_package_price_id,
      user_package_name,
      payment_status,
      handling,
      delivery_address_id,
    } = req.body;
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);

    //checking for vendor to customer rights
    const customer = await UserCustomer.findOne({
      where: {
        id: customer_id,
      },
    });
    if (customer.vendor_id !== vendorUser.vendor_id) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }

    //checking for vendor to vendor package rights
    const vendorPackage = await VendorPackage.findOne({
      where: {
        id: package_id,
      },
    });
    if (vendorPackage.vendor_id !== vendorUser.vendor_id) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }

    const userPackage = await CustomerPackage.create({
      user_id: customer_id,
      package_id: package_id,
      payment_status: payment_status,
      vendor_package_price_id: vendor_package_price_id,
      user_package_name: user_package_name,
      quantity: "1",
      created_date: new Date(),
      start_date: new Date(),
      end_date: new Date(),
      customer_delivery_address_id: delivery_address_id,
      pickup_delivery: handling,
    });
    res.json({
      success: true,
      message: "You just Subscribed to a new Package!",
      data: userPackage,
    });
  } catch (error) {
    console.error("Error while Adding or updating customer package: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const UpdateCustomerPackage = async (req, res) => {
  try {
    const {
      package_id,
      customer_id,
      frequency,
      user_package_name,
      payment_status,
      handling,
      delivery_address_id,
      customer_package_id,
    } = req.body;
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    //checking for vendor to customer rights
    const customer = await UserCustomer.findOne({
      where: {
        id: customer_id,
      },
    });
    if (customer.vendor_id !== vendorUser.vendor_id) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }

    //checking for vendor to vendor package rights
    const vendorPackage = await VendorPackage.findOne({
      where: {
        id: package_id,
      },
    });
    if (vendorPackage.vendor_id !== vendorUser.vendor_id) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }
    const userPackage = await CustomerPackage.findByPk(customer_package_id);
    if (!userPackage) {
      return res.status(404).json({ errors: "No Package Found!" });
    }
    package_id && (userPackage.package_id = package_id);
    frequency && (userPackage.frequency = frequency);
    user_package_name && (userPackage.user_package_name = user_package_name);
    payment_status && (userPackage.payment_status = payment_status);
    handling && (userPackage.pickup_delivery = handling);
    delivery_address_id &&
      (userPackage.customer_delivery_address_id = delivery_address_id);

    await userPackage.save();

    res.json({
      success: true,
      message: "You just Update a package!!",
      data: userPackage,
    });
  } catch (error) {
    console.error("Error while Adding or updating customer package: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateVendorPackageItems = async (req, res) => {
  try {
    const { is_default, parentId, new_item_id, package_id, date, quantity_id } =
      req.body;
    const loggedInUserId = loggedInUser(req);
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    const selectedItem = await VendorMenuItems.findOne({
      where: { id: new_item_id, vendor_id: loggedInUserId },
    });
    if (!selectedItem) {
      return res.status(400).json({ error: "Selected item not found!" });
    }
    const selectedPackage = await VendorPackage.findByPk(package_id);
    if (!selectedPackage) {
      return res.status(400).json({ error: "Selected package not found!" });
    }
    if (is_default) {
      const item = await VendorPackageMenuItems.create({
        package_id: package_id,
        menu_item_id: new_item_id,
        menu_item_name: selectedItem.item_name,
        menu_default_group_id: parentId,
        is_default_linked: true,
        package_name: selectedPackage.package_name,
        quantity: selectedItem.quantity,
        menu_date: date,
        sort_id: 0,
        replace_parent: true,
        quantity_id,
      });
      return res.status(200).json({
        success: true,
        message: "You have successfully updated your package",
      });
    }
    const vendorPackageMenuItem = await VendorPackageMenuItems.findByPk(
      parentId
    );
    if (!vendorPackageMenuItem) {
      return res.status(400).json({ error: "Selected item not found!" });
    }
    vendorPackageMenuItem.menu_item_id = selectedItem.id;
    vendorPackageMenuItem.menu_item_name = selectedItem.item_name;
    vendorPackageMenuItem.quantity = selectedItem.quantity;
    quantity_id && (vendorPackageMenuItem.quantity_id = quantity_id);
    await vendorPackageMenuItem.save();
    return res.status(200).json({
      success: true,
      message: "You have successfully updated your package",
    });
  } catch (error) {
    console.error("Error while updating vendor package items: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteVendorPackageItems = async (req, res) => {
  try {
    const { id, date, is_default } = req.body;
    const loggedInUserId = loggedInUser(req);
    if (is_default) {
      if (req.body.quantity_id && req.body.quantity_id != id) {
        await VendorPackageMenuItems.destroy({
          where: { id: id, menu_date: date, quantity_id: req.body.quantity_id },
        });
      } else {
        await VendorPackageMenuItems.destroy({
          where: { id: id, menu_date: date },
        });
      }

      return res.status(200).json({
        success: true,
        message: "Deleted all Add Ors",
      });
    }

    const vendorPackageMenuItem = await VendorPackageMenuItems.findByPk(id);
    if (!vendorPackageMenuItem) {
      return res.status(400).json({ error: "Object is not accessible" });
    }

    await VendorPackageMenuItems.destroy({ where: { id } });
    if (
      vendorPackageMenuItem.menu_default_group_id == 0 &&
      !vendorPackageMenuItem.is_default_linked
    ) {
      await VendorPackageMenuItems.destroy({
        where: { id: id, menu_date: date },
      });
    }
    if (vendorPackageMenuItem.replace_parent) {
      await VendorPackageMenuItems.destroy({
        where: {
          menu_default_group_id: vendorPackageMenuItem.menu_default_group_id,
          menu_date: date,
        },
      });
      //handle the flow for default item deleteion as well
    }
    return res.status(200).json({
      success: true,
      message: "Item Deleted",
    });
  } catch (error) {
    console.error("Error while deleting vendor package items: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateVendorPackageItemsQuantity = async (req, res) => {
  try {
    const { menu_item_id, id } = req.body;
    const loggedInUserId = loggedInUser(req);

    const vendorPackageMenuItem = await VendorPackageMenuItems.findByPk(
      menu_item_id,
      {
        include: [{ model: VendorMenuItems }],
      }
    );
    if (
      !vendorPackageMenuItem ||
      vendorPackageMenuItem?.VendorMenuItem?.vendor_id !== loggedInUserId
    ) {
      return res.status(400).json({ error: "Object is not accessible" });
    }
    id && (vendorPackageMenuItem.quantity_id = Number(id));
    await vendorPackageMenuItem.save();
    return res.status(200).json({
      success: true,
      message: "Item Quantity Updated",
    });
  } catch (error) {
    console.error("Error while getting data: ", error);
    res.status(500).json({ error: "Internal Server Error", detail: error });
  }
};

export const countPackagesOrderItems = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const packages = await VendorPackage.findAll({
      where: { vendor_id: id },
      include: [
        {
          model: CustomerOrder,
          where: { order_date: req.body.selected_date },
          include: [
            {
              model: CustomerOrderItem,
              include: [
                {
                  model: VendorMenuItems,
                },
              ],
            },
          ],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: packages,
    });
  } catch (error) {
    console.error("Error while getting data: ", error);
    res.status(500).json({ error: "Internal Server Error", detail: error });
  }
};

export const countPackagesMenuItems = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req);
    const getVendorPackages = await VendorPackage.findAll({
      where: { vendor_id: vendor_id },
    });
    const getVendorMenuItems = await VendorMenuItems.findAll({
      where: { vendor_id: vendor_id },
    });
    const getLinkCustomers = await VendorCustomerLink.findAll({
      where: { vendor_id: vendor_id, status: 1 },
    });
    const getPaymentMethod = await VendorPaymentMethods.findAll({
      where: { vendor_id: vendor_id },
    });
    res.status(200).json({
      success: true,
      packagesCount: getVendorPackages,
      menuCount: getVendorMenuItems,
      customerLink: getLinkCustomers,
      paymentMethod: getPaymentMethod,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Compress and resize the image using Sharp
    const outputFilePath = path.join(
      __dirname,
      "../../uploads",
      `compressed-${fileName}`
    );
    await sharp(filePath)
      .resize({ width: 500 })
      .jpeg({ quality: 72 })
      .toFile(outputFilePath);

    // Cleanup: remove the original uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: "Image uploaded and processed successfully",
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getAllPackagesDefaultItems = async (req, res) => {
//   const id = loggedInUser(req);
//   const vDays = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];
//   const nextDays = Helper.getNextDatesOfWeek(vDays);
//   console.log(nextDays);
//   for (const days of nextDays) {
//     let obj = {};
//     obj.date = days.Date;
//     obj.day = days.Day;
//     const defaultItems = await VendorPackageDefaultItem.findAll({
//       where: { package_id: 0, all_packages: 1 },
//       include: [
//         { model: VendorDefaultItem, where: { vendor_id: id }, required: true },
//         // {
//         //   model: VendorPackageMenuItems,
//         //   where: { package_id: 0, menu_date: new Date(days.Date) },
//         //   include: [{ model: VendorDefaultItem }],
//         // },
//       ],
//     });
//     const menuItems= await VendorPackageMenuItems.findAll(
//       {
//         where:{menu_default_group_id:}
//       }
//     )

//   }

//   try {
//   } catch (error) {
//     console.log("Error fetching Vendor def items: " + error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const getAllPackagesDefaultItems = async (req, res) => {
  try {
    const userId = loggedInUser(req);
    const results = await VendorPackageDefaultItem.findAll({
      where: { package_id: 0, all_packages: 1 },
      include: [
        {
          model: VendorDefaultItem,
          // include: [VendorMenuQuantity],
        },
      ],
    });
    let resultsArr = [];
    const vDays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const nextDays = Helper.getNextDatesOfWeek(vDays);
    for (const days of nextDays) {
      var nextObject = {};

      const menuResult = await VendorPackageMenuItems.findAll({
        where: {
          package_id: 0,
          menu_default_group_id: 0,
          menu_item_group_id: 0,
          menu_date: new Date(days.Date),
        },
        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });

      nextObject.date = days.Date;
      nextObject.day = days.Day;
      let itemsRecord = [];

      const separateItem = transformArray(menuResult);

      for (const defaultItem of results) {
        let itemData = { ...defaultItem.dataValues, isDefault: true };

        const package_menu_item = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: defaultItem.dataValues.id,
            package_id: 0,
            menu_item_group_id: 0,
            is_default_linked: true,
            menu_date: new Date(days.Date),
          },
          include: [
            {
              model: VendorMenuItems,
              include: [VendorMenuQuantity],
            },
            {
              model: VendorMenuQuantity,
            },
          ],
        });
        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }

        itemData.defaultItem = defaultItem;
        // console.log("pack", days.Date);
        if (package_menu_item) {
          itemData.package_menu_item = package_menu_item;

          defaultItem.VendorPackageMenuItem = package_menu_item;
        }

        //}
        itemsRecord.push(itemData);
      }

      for (const menuItem of separateItem) {
        let itemData = { ...menuItem, menuCheck: true, isDefault: false };
        itemsRecord.push(itemData);
      }

      const vendorAddedPackageItems = await VendorPackageMenuItems.findAll({
        where: {
          package_id: 0,
          menu_date: new Date(days.Date),
          menu_item_group_id: 0,
          menu_default_group_id: 0,
        },

        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });
      let vendorPackageRecords = [];

      itemsRecord = itemsRecord.concat(vendorPackageRecords);
      nextObject.defaultItem = itemsRecord;
      resultsArr.push(nextObject);
    }
    res.status(200).json({ success: true, data: resultsArr });
  } catch (error) {
    console.log("Error fetching Vendor def items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMultipleMenuItems = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await VendorPackageDefaultItem.findAll({
      where: {
        [Op.or]: [{ package_id: 0 }, { package_id: id }],
      },
      include: [
        {
          model: VendorMenuItems,
          include: [VendorMenuQuantity],
        },
      ],
    });

    let resultsArr = [];
    const VPackage = await VendorPackage.findOne({
      where: { id: id },
    });

    const daysArr = [];
    if (VPackage.sun === 1) {
      daysArr.push("Sunday");
    }
    if (VPackage.mon === 1) {
      daysArr.push("Monday");
    }
    if (VPackage.tue === 1) {
      daysArr.push("Tuesday");
    }
    if (VPackage.wed === 1) {
      daysArr.push("Wednesday");
    }
    if (VPackage.thu === 1) {
      daysArr.push("Thursday");
    }
    if (VPackage.fri === 1) {
      daysArr.push("Friday");
    }
    if (VPackage.sat === 1) {
      daysArr.push("Saturday");
    }
    const nextDays = Helper.getNextDatesOfWeekLimit(daysArr);
    for (const days of nextDays) {
      var nextObject = {};

      const menuResult = await VendorPackageMenuItems.findAll({
        where: {
          [Op.or]: [{ package_id: 0 }, { package_id: id }],
          menu_default_group_id: 0,
          menu_date: new Date(days.Date),
        },
        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });

      nextObject.date = days.Date;
      nextObject.day = days.Day;
      let itemsRecord = [];

      const separateItem = transformArray(menuResult);

      for (const defaultItem of results) {
        // results.forEach(async (defaultItem) => {
        let itemData = { ...defaultItem.dataValues, isDefault: true };
        // let itemData = { ...defaultItem };
        //if (defaultItem.id === 2) {
        //const groupItem = getDefaultGroupItem(defaultItem.id, days.Date);

        const package_menu_item = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: defaultItem.id,
            menu_date: new Date(days.Date),
            is_default_linked: true,
          },
          include: [
            {
              model: VendorMenuItems,
              include: [VendorMenuQuantity],
            },
            {
              model: VendorMenuQuantity,
            },
          ],
        });

        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }

        itemData.defaultItem = defaultItem;

        if (package_menu_item) {
          itemData.package_menu_item = package_menu_item;

          defaultItem.VendorPackageMenuItem = package_menu_item;
        }

        //}
        itemsRecord.push(itemData);
      }

      for (const menuItem of separateItem) {
        let itemData = { ...menuItem, menuCheck: true, isDefault: false };
        itemsRecord.push(itemData);
      }

      const vendorAddedPackageItems = await VendorPackageMenuItems.findAll({
        where: {
          [Op.or]: [{ package_id: 0 }, { package_id: id }],

          menu_date: days.Date,
          menu_default_group_id: 0,
        },
        include: [
          {
            model: VendorMenuItems,
            include: [VendorMenuQuantity],
          },
          {
            model: VendorMenuQuantity,
          },
        ],
      });
      let vendorPackageRecords = [];

      for (const defaultItem of vendorAddedPackageItems) {
        let itemData = {
          id: defaultItem.id,
          [Op.or]: [{ package_id: 0 }, { package_id: defaultItem.package_id }],

          item_name: defaultItem.menu_item_name,
          item_id: defaultItem.menu_item_id,
          status: 1,
          is_default_linked: false,
          VendorMenuItem: defaultItem.VendorMenuItem,
          isDefault: false,
          VendorMenuQuantity: defaultItem.VendorMenuQuantity,
        };
        const package_menu_item = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: defaultItem.id,
            menu_date: new Date(days.Date), //check point
            is_default_linked: false,
          },
          include: [
            {
              model: VendorMenuItems,
              include: [VendorMenuQuantity],
            },
            {
              model: VendorMenuQuantity,
            },
          ],
        });
        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }
        vendorPackageRecords.push(itemData);
      }
      itemsRecord = itemsRecord.concat(vendorPackageRecords);
      nextObject.defaultItem = itemsRecord;
      resultsArr.push(nextObject);
    }
    res.status(200).json({ success: true, data: resultsArr });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorCustomerAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const CustomerAddress = await CustomerDeliveryAddress.findAll({
      where: { customer_id: id },
      include: {
        model: CitiesAll,
      },
    });
    res.status(200).json({ success: true, data: CustomerAddress });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorCustomerOrders = async (req, res) => {
  try {
    const customer_id = req.params.id;
    // const vendor_id = loggedInUser(req);
    const fetchOrders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,
      },
      include: [
        {
          model: CustomerDeliveryAddress,
        },
        {
          model: VendorLocations,
        },
      ],
    });
    res.status(200).json({ success: true, data: fetchOrders });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getAllVendorOrders = async (req, res) => {
  try {
    const customer_id = req.params.id;
    // const vendor_id = loggedInUser(req);
    const fetchOrders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,
      },
      include: [
        {
          model: CustomerDeliveryAddress,
        },
        {
          model: VendorLocations,
        },
      ],
    });
    res.status(200).json({ success: true, data: fetchOrders });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCustomerSubscriptionOrders = async (req, res) => {
  try {
    const package_id = req.params.id;
    const fetchData = await VendorPackage.findOne({
      where: {
        id: package_id,
      },
      include: [
        {
          model: CustomerPackage,
          include: [
            { model: UserCustomer },
            { model: CustomerPackageSubscription },
            { model: CustomerOrder },
          ],
        },
      ],
    });
    res.status(200).json({ success: true, data: fetchData });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMsgForPickupOrder = async (req, res) => {
  try {
    const emailTamplete = {
      name: req.body.name,

      orderNumber: req.body.order_id,
      text: `${req.body.vendor_name} is notifiying you that your food order is ready to be picked up. Here are the details:`,
      slot: req.body.timeSlot
        ? `${Helper.formatTime(
            req.body.timeSlot.start_time
          )} - ${Helper.formatTime(req.body.timeSlot.end_time)}`
        : "N/A",
      address: req.body.address,
      location_name: req.body.location_name,
    };
    const subject = "Order Pickup Reminder";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "send-pickup-order-reminder.ejs"),
      emailTamplete
    );

    await sendEmail(req.body.email, subject, "hello", html);
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorWebsiteSetting = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req);
    const webSetting = await VendorWebsiteSetting.findAll({
      where: {
        vendor_id: vendor_id,
      },
    });
    res.status(200).json({
      success: true,
      data: webSetting,
    });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setVendorWebsiteSetting = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req);
    if (req.body.id) {
      const webSetting = await VendorWebsiteSetting.findOne({
        where: {
          id: req.body.id,
        },
      });
      if (webSetting) {
        await webSetting.update({ ...req.body });
        await webSetting.save();
      }
      res.status(200).json({
        success: true,
        data: webSetting,
      });
    } else {
      const webSetting = await VendorWebsiteSetting.create({
        vendor_id: vendor_id,
        title: req.body.title,
        description: req.body.description,
        section_type: req.body.section_type,
        show_hide: 1,
      });
      res.status(200).json({
        success: true,
        data: webSetting,
      });
    }
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteVendorWebsiteSetting = async (req, res) => {
  try {
    console.log(req.params.id);
    await VendorWebsiteSetting.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Deleted Successfuly",
    });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const uploadPackageImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize({ width: 500 })
      .jpeg({ quality: 72 })
      .toBuffer();

    // Set up S3 upload parameters
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `images/${Date.now().toString()}-${req.file.originalname}`,
      Body: resizedImageBuffer,
      ContentType: "image/jpeg",
      // ACL: "public-read",
    };
    console.log("jet", params.Key);

    await s3.send(new PutObjectCommand(params));
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${params.Key}`;

    const id = req.body.id;

    const findPackage = await VendorPackage.findOne({ where: { id: id } });
    findPackage.image = fileUrl;

    await findPackage.save();

    res.status(200).json({
      success: true,
      message: "Image uploaded and processed successfully",
      fileUrl: req.file,
    });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addVendorDefaultItem = async (req, res) => {
  try {
    let fileUrl;
    if (req.file) {
      const resizedImageBuffer = await sharp(req.file.buffer)
        .resize({ width: 500 })
        .jpeg({ quality: 72 })
        .toBuffer();

      // Set up S3 upload parameters
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `images/${Date.now().toString()}-${req.file.originalname}`,
        Body: resizedImageBuffer,
        ContentType: "image/jpeg",
      };

      await s3.send(new PutObjectCommand(params));
      fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${params.Key}`;
    } else {
      fileUrl = req.body.item_image;
    }

    const vendor_id = loggedInUser(req);
    if (req.body.id) {
      const defItem = await VendorDefaultItem.findOne({
        where: {
          id: req.body.id,
        },
      });
      if (defItem) {
        await defItem.update({ ...req.body, item_image: fileUrl });
        await defItem.save();
      }
      res.status(200).json({
        success: true,
        data: defItem,
      });
    } else {
      const defItem = await VendorDefaultItem.create({
        vendor_id: vendor_id,
        name: req.body.name,
        vendor_category_id: req.body.vendor_category_id,
        item_image: fileUrl,
      });
      res.status(200).json({
        success: true,
        data: defItem,
      });
    }
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteVendorDefaultItem = async (req, res) => {
  try {
    console.log("ite", req.params.id);
    await VendorDefaultItem.destroy({
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Deleted Successfuly",
    });
  } catch (error) {
    console.log("Error fetching " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePackageImage = async (req, res) => {
  try {
    const key = req.body.key;
    const bucketName = process.env.S3_BUCKET_NAME;
    const findPackage = await VendorPackage.findOne({
      where: { id: req.body.package_id },
    });
    findPackage.image = "";
    await findPackage.save();
    await Helper.deleteImageFromS3(bucketName, key);

    res.status(200).send({ message: "Image deleted successfully" });
  } catch (error) {
    console.log("Error " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteDefaultItemImage = async (req, res) => {
  try {
    const key = req.body.key;
    const bucketName = process.env.S3_BUCKET_NAME;
    const findPackage = await VendorDefaultItem.findOne({
      where: { id: req.body.id },
    });
    findPackage.item_image = "";
    await findPackage.save();
    await Helper.deleteImageFromS3(bucketName, key);

    res.status(200).send({ message: "Image deleted successfully" });
  } catch (error) {
    console.log("Error " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCustomerPaymentStatus = async (req, res) => {
  try {
    const id = loggedInUser(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;
    const getData = await CustomerPackageSubscription.findAll({
      limit: limit,
      offset: offset,
      order: [["payment_date", "DESC"]],

      include: [
        {
          model: CustomerPackage,

          include: [
            {
              model: VendorPackagePrice,
              attributes: ["id", "status", "frequency", "method"],
            },
            { model: VendorPackage, where: { vendor_id: id }, required: true },

            { model: UserCustomer },
          ],
          required: true,
        },
        {
          model: PaymentMethods,
        },
      ],
    });

    const subData = await Promise.all(
      getData.map(async (item) => {
        const orders = await CustomerOrder.findAll({
          attributes: ["id", "order_date"],
          where: {
            customer_package_subscription_id: item.dataValues.id,
            customer_package_id: item.dataValues.CustomerPackage.dataValues.id,
          },
        });
        return { ...item.dataValues, CustomerOrders: orders };
      })
    );
    console.log(subData.length);
    const count = await CustomerPackageSubscription.findAll({
      include: [
        {
          model: CustomerPackage,
          required: true,
          include: [
            { model: VendorPackagePrice },
            { model: VendorPackage, where: { vendor_id: id }, required: true },

            { model: UserCustomer },
          ],
        },
        {
          model: PaymentMethods,
        },
      ],
    });

    const totalPages = Math.ceil(count.length / limit);

    res
      .status(200)
      .send({ success: true, data: subData, totalPages: totalPages });
  } catch (error) {
    console.log("Error " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getVendorBillingInfo = async (req, res) => {
//   try {
//     const id = loggedInUser(req);
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.pageSize) || 10;
//     const offset = (page - 1) * limit;
//     const getData = await CustomerPackageSubscription.findAll({
//       limit: limit,
//       offset: offset,
//       order: [["payment_date", "DESC"]],

//       include: [
//         {
//           model: CustomerPackage,
//           include: [
//             {
//               model: VendorPackagePrice,
//             },
//             { model: VendorPackage, where: { vendor_id: id }, required: true },
//             { model: CustomerOrder },

//             { model: UserCustomer },
//           ],
//           required: true,
//         },
//         {
//           model: PaymentMethods,
//         },
//       ],
//     });
//     const count = await CustomerPackageSubscription.findAll({
//       include: [
//         {
//           model: CustomerPackage,
//           required: true,
//           include: [
//             { model: VendorPackagePrice },
//             { model: VendorPackage, where: { vendor_id: id }, required: true },
//             { model: CustomerOrder },
//             { model: UserCustomer },
//           ],
//         },
//         {
//           model: PaymentMethods,
//         },
//       ],
//     });

//     const totalPages = Math.ceil(count.length / limit);

//     res
//       .status(200)
//       .send({ success: true, data: getData, totalPages: totalPages });
//   } catch (error) {
//     console.log("Error " + error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
