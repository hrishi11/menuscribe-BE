import { Sequelize, Op, Model, where } from "sequelize";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  UserCustomer,
  CustomerPackage,
  VendorPackage,
  VendorPackageDefaultItem,
  VendorPackageMenuItems,
  UserVendor,
  CustomerOrder,
  VendorMenuItems,
  CustomerOrderItem,
  VendorCustomerLink,
  VendorSettings,
  CustomerDeliveryAddress,
  CitiesAll,
  Vendor,
  VendorPackageFrequency,
  CustomerSubscription,
  VendorLocations,
  VendorPackagePrice,
  CustomerPackageRequest,
  VendorPaymentMethods,
  PaymentMethods,
  VendorCouponPackages,
  VendorEmployee,
  VendorEmployeeLocations,
} from "../config/Models/relations.js";
import crypto from "crypto";
import { loggedInUser, loggedInUserLocation } from "../middleware/Auth.js";
import Helper from "../utils/Helper.js";
import twilio from "twilio";
import { log } from "console";
import { sequelize } from "../config/dbConfig.js";
import { QueryTypes } from "sequelize";
import { sendEmail } from "../utils/email.js";
import {
  filterOrderDatesFromExistingOrder,
  getOrderCountDates,
  getPackageAvailableDays,
  sortingDatesInDecendingOrder,
  sortingDatesInDecendingOrderFromDateStrings,
} from "../utils/OrderCreateHelpers.js";
import { EventLog } from "../config/Models/VendorModels/EventLog.js";
import { CustomerPackageSubscription } from "../config/Models/CustomerModels/CustomerPackageSubscription.js";
import { VendorPackageSlots } from "../config/Models/VendorModels/VendorPackageSlots.js";
import { truncate } from "fs";
import { VendorLocationPostalRegions } from "../config/Models/VendorModels/VendorLocationPostalRegion.js";
import { PostalRegions } from "../config/Models/VendorModels/PostalRegion.js";
import { VendorLocationHolidays } from "../config/Models/VendorModels/VendorLocationHolidays.js";
import { VendorCities } from "../config/Models/VendorModels/VendorCities.js";
import { VendorDefaultItem } from "../config/Models/VendorModels/VendorDefaultItems.js";
import { Plans } from "../config/Models/VendorModels/Plans.js";
import { CustomerPaymentMethod } from "../config/Models/CustomerModels/CustomerPaymentMethod.js";
import { PlatformVendorBilling } from "../config/Models/VendorModels/PlatformVendorBilling.js";
import { VendorCustomerPaymentLog } from "../config/Models/VendorModels/VendorCustomerPaymentLog.js";

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

export const savePackages = async (req, res) => {
  try {
    const packagesData = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    // Loop through the data and associate each package with the vendor
    for (const packageData of packagesData) {
      const packageInstance = await CustomerPackage.create({
        user_id: loggedInUserId,
        package_id: packageData.id,
        payment_status: 0,
        frequency_id: packageData.frequency.id,
        user_package_name: packageData.user_package_name,
        created_date: new Date(),
        start_date: packageData.start_date,
        quantity: 1,
        customer_delivery_address_id: 0,
        pickup_delivery: 1,
        // end_date: new Date(),
      });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

export const checkExistingUser = async (req, res) => {
  try {
    const { phone } = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    const existingUser = await UserCustomer.findOne({
      where: {
        phone,
        vendor_id: loggedInUserId,
      },
      include: [
        {
          model: VendorCustomerLink,
        },
        {
          model: CustomerPackage,
        },
      ],
    });

    if (!existingUser) {
      return res
        .status(200)
        .json({ status: false, message: "Phone Number does not exist." });
    } else {
      return res.status(200).json({
        status: true,
        data: existingUser,
        message: "Phone number exists.",
      });
    }
  } catch (error) {
    console.error("Error fetching customers:", error.stack);
    return res
      .status(500)
      .json({ status: "failed", error: "Internal Server Error" });
  }
};

export const updateCustomerPackage = async (req, res) => {
  try {
    const { id, customer_delivery_address_id } = req.body;
    const currentPackage = await CustomerPackage.findOne({
      where: { id: id },
      include: [
        { model: CustomerDeliveryAddress, include: [{ model: PostalRegions }] },
        {
          model: VendorPackage,
          include: [
            {
              model: VendorLocations,
              include: [
                {
                  model: VendorLocationPostalRegions,
                  include: [{ model: PostalRegions }],
                },
              ],
            },
          ],
        },
      ],
    });
    const code = await CustomerDeliveryAddress.findOne({
      where: { id: customer_delivery_address_id },
      include: [{ model: PostalRegions }],
    });

    const filterData =
      currentPackage.dataValues.VendorPackage.dataValues.VendorLocation.dataValues.VendorLocationPostalRegions.filter(
        (item) =>
          item.dataValues.PostalRegion?.dataValues.POSTAL_CODE ==
          code.dataValues.PostalRegion.POSTAL_CODE
      );

    if (filterData.length > 0) {
      const vendorLocation = (currentPackage.customer_delivery_address_id =
        customer_delivery_address_id);
      currentPackage.save();
      return res.status(200).json({
        message: "Customer Package updated successfully",
        success: true,
      });
    } else {
      res.status(200).json({
        success: false,
        message: "Sorry, This package don't deliver to the selected address",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error Updating customer address id", success: false });
  }
};

export const saveExistingCustomer = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;
    const findCustomer = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });

    if (findCustomer) {
      const customer = findCustomer.dataValues;
      const createLink = await VendorCustomerLink.create({
        vendor_id: id,
        customer_id: customer.id,
        package_id: 0,
        status: 1,
      });
      res.status(200).json({
        message: "Link Created successfully",
        customer: customer,
        success: true,
      });
    } else {
      res
        .status(500)
        .json({ message: "Error Link Customer with Vendor", success: false });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error Link Customer with Vendor", success: false });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const reqBody = req.body;
    const userCustomer = await UserCustomer.findOne({
      where: { email: reqBody.email },
    });
    if (userCustomer) {
      // const customerDeliveryAddress = await CustomerDeliveryAddress.findAll({
      //   where: { customer_id: userCustomer.id },
      //   include: CitiesAll,
      // });

      return res.json({
        message: "User found!",
        found: true,
        // CustomerDeliveryAddress: customerDeliveryAddress,
      });
    }
    res.status(200).json({ message: "User not found!", found: false });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getPackagesWithoutLoginByVendorId = async (req, res) => {
  try {
    // const vendorUser = await UserVendor.findByPk(vendor_id);
    let id;
    if (req.body.id) {
      id = req.body.id;
    } else {
      id = loggedInUser(req).userId;
    }

    const packages = await VendorPackage.findAll({
      where: { vendor_id: id },
      include: [
        // {
        //   model: VendorPackageDefaultItem,
        // },
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

    const results = [];
    for (const packge of packages) {
      const newPackge = { ...packge.dataValues };
      const finalDefaultItems = [];
      const defaultItem = await VendorPackageDefaultItem.findAll({
        where: { package_id: { [Op.in]: [0, packge.dataValues.id] } },
      });
      for (const item of defaultItem) {
        const defaultitem = {
          ...item.dataValues,
          VendorPackageMenuItems: defaultItem,
        };
        const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: item.id,
            // menu_date: order.order_date,
          },
        });
        defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
        finalDefaultItems.push(defaultitem);
      }

      const defaultitem = {
        item_name: "For All Packages",
      };
      const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
        where: {
          menu_default_group_id: 0,
          all_packages: 1,

          // menu_date: order.order_date,
        },
      });
      defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
      finalDefaultItems.push(defaultitem);

      newPackge.VendorPackageDefaultItems = finalDefaultItems;
      results.push(newPackge);
    }

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getResturantDetails = async (req, res) => {
  try {
    let resturant;
    if (req.body.resturantPublicUrl) {
      resturant = await VendorSettings.findOne({
        where: { public_url: req.body.resturantPublicUrl },
      });
    } else {
      const vendor_id = loggedInUser(req).userId;
      resturant = await VendorSettings.findOne({
        where: { vendor_id: vendor_id },
      });
    }

    res.json({
      message: "Successfull",
      success: true,
      data: resturant,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Faild to get resturant details", success: false });
  }
};

export const addCustomerLink = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req).userId;

    console.log(req.body);
    const addCustomerLink = await VendorCustomerLink.create({
      vendor_id,
      customer_id: req.body.id,
      status: 1,
    });
    await addCustomerLink.save();
    res.json({
      message: "Successfull",
      success: true,
      data: addCustomerLink,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Faild to add customer link", success: false });
  }
};
export const saveCustomer = async (req, res) => {
  const userData = req.body;

  const loggedInUserId = loggedInUser(req).userId;
  const charset = "abcdefghijklmnopqrstuvwxyz";
  let password = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  // const hashedPassword = hashPassword(password);
  let createdUser;
  try {
    // Creating the user if it doesn't exists.
    if (!userData.id) {
      const hashedPassword = hashPassword(password);
      if (userData.address.postal) {
        const checkPostalRegion = await VendorLocationPostalRegions.findAll({
          include: [
            {
              model: PostalRegions,
              where: { POSTAL_CODE: userData.address.postal.split(" ")[0] },
              required: true,
            },
          ],
        });
        if (checkPostalRegion.length == 0) {
          console.log("posta Error");
          return res.json({ message: "postal code not found", success: false });
        }
      }
      const postal = await PostalRegions.findOne({
        where: { POSTAL_CODE: reqBody.postal.split(" ")[0] },
      });

      createdUser = await UserCustomer.create({
        //   id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        password: hashedPassword,
        email: userData.email,
        phone: userData.phone,
        address_1: userData.address?.address,
        address_2: userData.address?.address_2
          ? userData.address.address_2
          : "",
        postal_id: postal.dataValues.id,
        postal_code: userData.address.postal,
        created_date: new Date(),
        status: 0,
        city_id: userData.address.city.city_id,
        last_login: new Date(),
        last_order: 1,
        vendor_id: loggedInUserId,
      });
    } else {
      createdUser = await UserCustomer.findOne({
        where: { id: userData.id },
      });
    }
    if (!userData.id) {
      const packages = [];
      const packagesDetails = [];
      // Finding the selected packages according the user selected packages.
      for (let step = 0; step < userData.orderPackages.length; step++) {
        const packageDetails = await VendorPackage.findOne({
          where: { id: userData.orderPackages[step].package },
        });
        // console.log(packageDetails, "packageDetails packages");

        packages.push(packageDetails.id);
        packagesDetails.push(packageDetails);
      }
      // console.log(packages, "packages packages");
      // Creating the customer_package based on packages array
      if (packages.length > 0) {
        for (let i = 0; i < packages.length; i++) {
          // console.log(packages[i], "{io}\n", userData.orderPackages[i], "\n");
          // Creating the Customer Packages
          const customerPackage = await CustomerPackage.create({
            user_id: createdUser.id,
            package_id: packages[i],

            payment_status:
              userData.orderPackages[i].payment === "Paid" ? "1" : "0",
            frequency_id: userData.orderPackages[i].frequency,
            user_package_name: userData.orderPackages[i].package_name,
            quantity: "1",
            customer_delivery_address_id: 0,
            delivery_slot_id: userData.orderPackages[i].timeSlotId,
            pickup_delivery:
              userData.orderPackages[i].pickup_delivery === "Pickup"
                ? "1"
                : "2",
            created_date: new Date(),
            status: 1,
            start_date: userData.orderPackages[i].start_date,
            end_date: userData.orderPackages[i].end_date,
          });
          // console.log(customerPackage)
          // Creating Customer Subscriptions
          const customerSubscription = await CustomerSubscription.create({
            customer_package_id: customerPackage.id,
            customer_package_frequency_id: userData.orderPackages[i].frequency,
            created_date: new Date(),
            start_date: userData.orderPackages[i].start_date,
            end_date: userData.orderPackages[i].end_date,
          });
        }
      }
    }
    for (let i = 0; i < userData.orderPackages.length; i++) {
      const VendorCustomer = await VendorCustomerLink.create({
        vendor_id: loggedInUserId,
        customer_id: createdUser.id,
        package_id: userData.orderPackages[i].package,
        delivery_instructions: userData.delivery_instruction,
        status: 1,
        created_at: new Date(),
      });
    }
    const vendorName = await Vendor.findOne({
      where: { id: createdUser.vendor_id },
    });
    const name = vendorName.dataValues.vendor_name;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    let pin = Helper.generateRandomPin(8);
    while (!(await isCodeUnique(pin))) {
      pin = Helper.generateRandomPin(8);
    }

    await createdUser.update({
      verification_code: pin,
    });

    // await client.messages.create({
    //   // body: `click the following link to create a new account http://localhost:5173/customer-onboard/${pin}.`,
    //   body: `${name} has created a new account for you. Click the link to activate your account and choose your meal/package: https://menuscribe.com/customer-onboard/${pin} //  Your temporary password is ${password}`,
    //   from: "+16474928950",
    //   to: "+1" + userData.phone,
    //   // to: "+923019475033",
    // });

    const emailTamplete = {
      content: `${name} has created a new account for you so you can select your meal package. Click the link to
      activate your account and use temporary password to login. Once you login, you can see their meal package options. `,
      temp_password: `Your temporary password is ${password}`,
      link: `https://menuscribe.com/customer-onboard/${pin}`,
    };
    const subject = "Email Verification";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "email-template.ejs"),
      emailTamplete
    );

    await sendEmail(createdUser.email, subject, "hello", html);

    // if (send) {
    //   results.password = hashedPassword;
    //   await results.save();
    // }
    // const to = userData.email;
    // const subject = 'Test Email';
    // const text = `Create the following link to create a new account http://localhost:5173/customer-onboard/${pin}.`;

    // sendEmail(to, subject, text);

    res.json({
      success: true,
      message: "Data inserted successfully",
      data: createdUser,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", error_detail: error });
  }
};

export const createUserFromOrderConformation = async (req, res) => {
  try {
    const { user, packages } = req.body;
    const customer_id = loggedInUser(req).userId;
    const userRes = await UserCustomer.create({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      subscribe:
        "Receive order norifications and other communications from Menuscribe",
      address_1: user.address.address,
      vendor_id: packages[0].vendor_id || 1,
      password: hashPassword(user.password),
    });
    await userRes.save();
    const id = userRes.dataValues.id;
    const checkUserAddress = await CustomerDeliveryAddress.findAll({
      where: { customer_id: customer_id, address_type: user.address.place },
    });
    if (checkUserAddress.length > 0) {
      return res.json({
        message: "double-address_type",
        type: user.address.place,
        success: false,
      });
    }
    const saveDeliveryAddress = await CustomerDeliveryAddress.create({
      customer_id: customer_id,
      address: user.address.address ? user.address.address : "",
      address_type: user.address.place,
      city_id: user.address.city.id,
      postal: user.address.postal ? user.address.postal : "",
      latitude: user.address.latitude,
      unit_number: user.address.unit_number ? user.address.unit_number : "",
      longitude: user.address.longitude,
      status: 1,
    });
    await saveDeliveryAddress.save();

    for (const pack of packages) {
      const savedRequest = await CustomerPackageRequest.create({
        user_id: userRes.dataValues.id,
        package_id: pack.id,
        payment_status: 0,
        pickup_delivery: pack.pickup_delivery,
        frequency_id: pack.frequency.id ? pack.frequency.id : 0,
        timeslot_id:
          pack.pickup_delivery === 1
            ? pack.pickup_time_slot.id
            : pack.delivery_time_slot.id,
        customer_delivery_address_id: pack.customer_delivery_address.id,
        vendor_location_id: pack.vendor_location_id,
        user_package_name: pack.user_package_name,
        quantity: 1,
        created_date: new Date(),
        start_date: new Date(pack.start_date),
        request_type: "NEW",
        approve_at: null,
        status: 0,
        deleted: 0,
      });
    }

    // Sending the email
    const vendorUser = await UserVendor.findByPk(userRes.vendor_id);
    const vendor = await Vendor.findByPk(userRes.vendor_id);
    const requests = await CustomerPackageRequest.findAll({
      where: { user_id: userRes.id },
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
    const emailRes = await sendEmail(userRes.email, subject, "hello", html);
    res.json({
      message: "User created successfully.",
      success: true,
      data: requests,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Failed to create user from order conformation" });
  }
};

export const createPackageRequensts = async (req, res) => {
  try {
    const { packages, email, addressId } = req.body;
    if (!packages) {
      res.status(403).json({ message: "No Packages found", success: false });
    }
    const userRes = await UserCustomer.findOne({
      where: { email },
    });
    // console.log(userRes);
    for (const pack of packages) {
      const savedRequest = await CustomerPackageRequest.create({
        user_id: userRes.id,
        package_id: pack.id,
        payment_status: 0,
        pickup_delivery: pack.pickup_delivery,
        frequency_id: pack.frequency.id ? pack.frequency.id : 0,
        timeslot_id:
          pack.pickup_delivery === 1
            ? pack.pickup_time_slot.id
            : pack.delivery_time_slot.id,
        customer_delivery_address_id: addressId,
        vendor_location_id: pack.vendor_location_id,
        user_package_name: pack.user_package_name,
        quantity: 1,
        created_date: new Date(),
        start_date: new Date(pack.start_date),
        request_type: "NEW",
        approve_at: null,
        status: 0,
        deleted: 0,
      });
      // requests.push({...savedRequest.dataValues})
    }

    // Sending the email
    const vendorUser = await UserVendor.findByPk(userRes.vendor_id);
    const vendor = await Vendor.findByPk(userRes.vendor_id);
    const requests = await CustomerPackageRequest.findAll({
      where: { user_id: userRes.id },
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
    const emailRes = await sendEmail(userRes.email, subject, "hello", html);
    res.json({ message: "Requests created successfully", success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

async function isCodeUnique(pin) {
  const existingUser = await UserCustomer.findOne({
    where: {
      verification_code: pin,
    },
  });
  return !existingUser;
}

export const getCustomerPackageRequest = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req).userId;
    const requests = await CustomerPackageRequest.findAll({
      where: { user_id: loggedInUserId },
      include: [
        {
          model: UserCustomer,
          attributes: ["id", "first_name", "last_name", "phone", "email"],
        },
        {
          model: VendorPackage,
          include: [{ model: Vendor }],
          // attributes: ["id", "first_name", "last_name"],
        },

        {
          model: VendorPackagePrice,
          // attributes: ["id", "first_name", "last_name"],
        },
        // {
        //   model: VendorPackageFrequency,
        //   // attributes: ["id", "first_name", "last_name"],
        // },
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
        {
          model: VendorPackageSlots,
        },
      ],
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const setCustomerOrderStatus = async (req, res) => {
  try {
    const findOrder = await CustomerOrder.update(
      { status: req.body.status },
      { where: { id: req.body.id } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.log("Error: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getCustomer = async (req, res) => {
  // const Id = req.params.id;
  const Id = loggedInUser(req).userId;
  try {
    const result = await UserCustomer.findOne({
      where: { id: Id },
      include: [
        {
          model: CitiesAll,
          as: "CitiesAll",
        },
      ],
    });
    if (result.status === 2) {
      res
        .status(200)
        .json({ success: true, data: { id: result.id, phone: result.phone } });
    } else {
      res.status(200).json({ success: true, data: result });
    }
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorOrders = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;
    const response = await CustomerOrder.findAll({
      include: [
        {
          model: CustomerOrderItem,
          required: false,
          include: [
            {
              model: VendorPackageMenuItems,
              include: [{ model: VendorMenuItems }],
            },
          ],
        },
        {
          model: UserCustomer,
        },
        {
          model: VendorPackageSlots,
        },
        {
          model: CustomerPackage,
          as: "CustomerPackage",
          required: true,
          include: [
            {
              model: VendorPackage,
              as: "VendorPackage",
              required: true,
              where: { vendor_id: id },
              include: [
                {
                  model: Vendor,
                },
                {
                  model: VendorLocations,
                  include: [{ model: CitiesAll }],
                },
                {
                  model: VendorPackageDefaultItem,
                  include: [{ model: VendorDefaultItem }],
                },
              ],
            },
          ],
        },
      ],
    });

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the start of the day

    // Create an array to hold the data for each day
    const dataForLast7Days = [];

    // Loop through the last 7 days
    for (let i = -1; i > -22; i--) {
      // Calculate the date for the current iteration
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - i); // Subtract i days

      // Format startDate to match the date format 'YYYY-MM-DD'
      const formattedStartDate = formatDate(startDate); // Get 'YYYY-MM-DD' format

      // Filter the data for the current day
      const dataForCurrentDay = response.filter((item) => {
        if (item.order_date && item.order_date.includes(formattedStartDate)) {
          return true; // Include items with createdAt matching the current day
        }
        return false; // Skip items without a createdAt field or those not matching the current day
      });

      // Add the filtered data to the array
      dataForLast7Days.push({
        date: newFormateDate(startDate),
        data: dataForCurrentDay,
      });
    }

    // Function to format date as 'YYYY-MM-DD'

    res.status(200).json({
      success: true,
      data: dataForLast7Days,
      response: response,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function newFormateDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[date.getMonth()];
  return `${day}-${month}`;
}
export const getCustomerWithAddress = async (req, res) => {
  const { id } = req.query;
  try {
    // console.log(
    //   `Service Enter - ${req.originalUrl} - ${req.method}`,
    //   JSON.stringify(req.query)
    // );
    const loggedInUserId = loggedInUser(req).userId;
    const customer = await UserCustomer.findOne({
      where: { id },
      include: [
        {
          model: CustomerDeliveryAddress,
          // attributes: ["address", "id"],
          include: CitiesAll,
        },

        {
          model: CustomerPackage,
          attributes: [
            "id",
            "package_id",
            "payment_status",
            "pickup_delivery",
            "customer_delivery_address_id",
            "frequency_id",
            "user_package_name",
          ],
          include: [
            {
              model: VendorPackage,
              attributes: ["package_name"],
            },
            { model: VendorPackagePrice },
          ],
        },
      ],
    });
    if (customer.vendor_id !== loggedInUserId) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }
    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error while fetching Customer with address: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// export const checkTempPassword = async (res, req) => {
//   // const tempPassword=
//   try {
//     const results = await UserCustomer.findOne({
//       where: {  },
//     });
//   } catch (error) {}
// };

export const getCustomerByVc = async (req, res) => {
  const Id = req.params.id;
  try {
    const results = await UserCustomer.findOne({
      where: { verification_code: Id },
    });
    // if (results) {
    //   const accountSid = process.env.TWILIO_ACCOUNT_SID;
    //   const authToken = process.env.TWILIO_AUTH_TOKEN;
    //   const client = twilio(accountSid, authToken);
    //   const send = await client.messages.create({
    //     // body: `click the following link to create a new account http://localhost:5173/customer-onboard/${pin}.`,
    //     body: `Email: ${results.email}  Password: ${results.password}`,
    //     from: "+16474928950",
    //     to: results.phone,
    //     // to: "+923019475033",
    //   });
    if (results) {
      res.status(200).json({ success: true, data: results });
    }

    //   .then((message) => {

    //     res.status(200).json({ success: true, data: results });
    //   })
    //   .catch((error) => {
    //     res.send(500).json({ error: "message not send" });
    //   });
    // }
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function hashPassword(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

export const updateCustomerPassword = async (req, res) => {
  try {
    const customerData = req.body;
    // Find the existing item
    const existingCustomer = await UserCustomer.findByPk(customerData.id);

    if (!existingCustomer) {
      return res.status(404).json({ error: "Item not found" });
    }
    let pin = Helper.generateRandomPin(4);
    while (!(await isPinUnique(pin))) {
      pin = Helper.generateRandomPin(4);
    }
    // Update the existing item's properties
    existingCustomer.password = hashPassword(customerData.password);
    existingCustomer.status = 2;
    existingCustomer.verification_pin = pin;
    // Save the updated item
    await existingCustomer.save();
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    client.messages
      .create({
        // body: `click the following link to create a new account http://localhost:5173/customer-onboard/${pin}.`,
        body: `Use the pin for verification ${pin}.`,
        from: "+16474928950",
        to: "+1" + existingCustomer.phone,
        // to: "+923019475033",
      })
      .then((message) => console.log(message.sid));

    // const to = existingCustomer.email;
    // const subject = 'Test Email';
    // const text = `Use the pin for verification ${pin}.`;

    // sendEmail(to, subject, text);

    res.status(200).json({ success: true, data: { id: existingCustomer.id } });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function isPinUnique(pin) {
  const existingUser = await UserCustomer.findOne({
    where: {
      verification_code: pin,
      status: {
        [Sequelize.Op.ne]: 1,
      },
    },
  });
  return !existingUser;
}

export const checkVerificationPin = async (req, res) => {
  try {
    const customerData = req.body;
    // Find the existing item
    const pinVerify = await UserCustomer.findOne({
      where: {
        verification_pin: customerData.pin,
        id: customerData.id,
      },
    });

    if (!pinVerify) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ success: true, data: { id: pinVerify.id } });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateCustomer = async (req, res) => {
  try {
    const customerData = req.body;
    // Find the existing item
    const existingCustomer = await UserCustomer.findByPk(customerData.id);

    if (!existingCustomer) {
      return res.status(404).json({ error: "Item not found" });
    }
    // Update the existing item's properties
    existingCustomer.first_name = customerData.first_name;
    existingCustomer.last_name = customerData.last_name;
    existingCustomer.email = customerData.email;
    existingCustomer.phone = customerData.phone;
    existingCustomer.address_1 = customerData.address;
    existingCustomer.delivery_instruction = customerData.delivery_instruction;
    existingCustomer.postal_code = customerData.postal_code;
    existingCustomer.city_id = customerData.city;
    existingCustomer.status = 1;

    // Save the updated item
    await existingCustomer.save();

    res.status(200).json({ success: true, data: existingCustomer.id });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPackages = async (req, res) => {
  const { ids } = req.body;
  try {
    const results = await CustomerPackage.findAll({
      include: [
        {
          model: VendorPackage,
        },
      ],
      where: { package_id: ids },
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id, start_date, end_date } = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    // Find the existing item
    const existingSubscription = await CustomerSubscription.findByPk(id);
    // const existingSubscription = await CustomerSubscription.create({
    //   customer_package_id: customerPackage.id,
    //   customer_package_frequency_id: 2,
    //   created_date: new Date(),
    //   start_date: new Date(start_order_date),
    //   end_date: new Date(last_order_date),
    // });

    if (!existingSubscription) {
      return res.status(404).json({ error: "Item not found" });
    }
    // Update the existing item's properties
    // existingSubscription.start_date = start_date;
    // existingSubscription.end_date = end_date;
    // Save the updated item
    const finalSubscription = await existingSubscription.save();

    const customerPackage = await CustomerPackage.findOne({
      where: { id: finalSubscription.customer_package_id },
    });

    const vendorP = await VendorPackage.findOne({
      where: { id: customerPackage.package_id },
    });

    // Getting the day, date and month name between the package start and package end date.
    const CustomerGivenDates = Helper.getDateMonthDayBetweenTwoDates(
      start_date,
      end_date
    );

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

    // Getting All the orders based on userId, VendorId, packageId
    const existingOrders = await CustomerOrder.findAll({
      where: {
        user_id: customerPackage.user_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
        customer_package_id: customerPackage.id,
      },
    });

    // Checking whether the order for the cutomer given dates are already being created or not.
    let orderDates = customerOrderCount;

    existingOrders.forEach((or) => {
      orderDates = orderDates.filter(
        (date) => date.dateString !== or.order_date
      );
    });

    let start_order_date;
    let last_order_date;
    const dateArray = orderDates.map((date) => date.fullDate);

    if (!Array.isArray(dateArray) || dateArray.length === 0) {
      return res
        .status(500)
        .json({ message: "No dates available after filtering" });
    } else {
      // Sort the array of dates in descending order
      dateArray.sort((a, b) => b.getTime() - a.getTime());
      start_order_date = dateArray[dateArray.length - 1];
      last_order_date = dateArray[0];
    }

    // Updating the customer package & customer_package_subscription end_date according to the current last order date
    let savedCustomerPackage;
    let savedCustomerSubscription;

    if (orderDates.length > 0) {
      customerPackage.end_date = new Date(last_order_date);
      savedCustomerPackage = await customerPackage.save();

      const customerPackageSubscription = await CustomerSubscription.findOne({
        where: { customer_package_id: customerPackage.id },
      });
      if (customerPackageSubscription) {
        customerPackageSubscription.end_date = new Date(last_order_date);

        savedCustomerSubscription = await customerPackageSubscription.save();
      } else {
        savedCustomerSubscription = await CustomerSubscription.create({
          customer_package_id: customerPackage.id,
          customer_package_frequency_id: 2,
          created_date: new Date(),
          start_date: new Date(start_order_date),
          end_date: new Date(last_order_date),
        });
      }
    }

    for (let x = 0; x < orderDates.length; x++) {
      const customerOrder = await CustomerOrder.create({
        user_id: customerPackage.user_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
        created_date: new Date(),
        customer_package_id: customerPackage.id,
        order_date: orderDates[x].fullDate,
        is_ready: 0,
        is_delivered: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        delivery_img: "",
        // delivered_time: new Date(),
        customer_delivery_address_id: 0,
        customer_package_subscription_id: savedCustomerSubscription.id,
      });
    }

    const customerUser = await UserCustomer.findByPk(customerPackage.user_id);
    const vendorUser = await UserVendor.findByPk(vendorP.vendor_id);
    const vendor = await Vendor.findByPk(1);

    const finalPackageAvailableDays = [];
    PackageAvailableDays.forEach((day) => {
      finalPackageAvailableDays.push(fullDayNames[days.indexOf(day)]);
    });

    let deliveryAddressObj;
    if (savedCustomerPackage.pickup_delivery === 1) {
      deliveryAddressObj = await VendorLocations.findOne({
        where: { id: savedCustomerPackage?.vendor_location_id },
        include: { model: CitiesAll },
      });
    } else {
      deliveryAddressObj = await CustomerDeliveryAddress.findOne({
        where: { id: savedCustomerPackage?.customer_delivery_address_id },
        include: { model: CitiesAll },
      });
    }

    const emailTamplete = {
      customer: `${vendor.vendor_name} customer`,
      content: `${vendorUser.first_name} has created a new food order for you. Please log in to your account to see the upcoming orders.`,
      // content: `${vendorUser.first_name} has created a new food order for you. Please log in to your account to see the upcoming orders.`,
      package_name: vendorP.package_name,
      start_order_date: Helper.getDateFromString(start_date + "T00:00:00"),
      end_order_date: Helper.getDateFromString(end_date + "T00:00:00"),
      meals_count: orderDates.length,
      days: finalPackageAvailableDays,
      pickup_delivery:
        savedCustomerPackage.pickup_delivery === 2 ? "Delivery" : "Pickup",
      delivery_window: "11:00AM - 2:00PM",
      delivery_address: `Delivery address: ${deliveryAddressObj?.address}
                        ${deliveryAddressObj?.CitiesAll?.city}
                        ${deliveryAddressObj?.CitiesAll?.state}
                        ${deliveryAddressObj?.postal || ""}`,
      link: `https://menuscribe.com/customer-dashboard`,
    };
    const subject = "Your customer order has been created";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "renew-package.ejs"),
      emailTamplete
    );
    const emailRes = await sendEmail(
      customerUser.email,
      subject,
      "hello",
      html
    );

    res.status(200).json({
      success: true,
      message: "Subscription dates updated successfully",
      orderDates,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const updateCustomerOrder = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req).userId;
    const vendorUser = await UserVendor.findByPk(loggedInUserId);
    // const user = await CustomerOrder.findOne({
    //   where: { vendor_id: vendorUser },
    // });

    const [updatedRowsCount, updatedRows] = await CustomerOrder.update(
      { is_ready: req.body.is_ready },
      { where: { vendor_id: vendorUser.vendor_id, id: req.body.id } }
    );
    return res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
export const getCustomersByOrderDate = async (req, res) => {
  const { selected_date } = req.body;
  const date = new Date(selected_date);

  const loggedInUserId = loggedInUser(req).userId;
  const vendorUser = await UserVendor.findByPk(loggedInUserId);

  try {
    let orders = await CustomerOrder.findAll({
      include: [
        {
          model: UserCustomer,
          as: "UserCustomer",
          attributes: ["first_name", "last_name", "phone"],
        },
        {
          model: CustomerPackage,
          as: "Package",
          attributes: ["id"],
          include: [
            {
              model: VendorPackage,
              as: "VendorPackage",
              attributes: ["Package_name"],
            },
          ],
        },
        {
          model: CustomerOrderItem,
          as: "CustomerOrderItems",

          include: [
            {
              model: VendorMenuItems,
              attributes: ["item_name"],
              where: { id: sequelize.col("CustomerOrderItems.item_id") },
            },
          ],
        },
      ],
      where: {
        vendor_id: vendorUser.vendor_id,
        order_date: date,
      },
    });

    return res.status(200).send(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const renewPackageSubscription = async (req, res) => {
  try {
    const { customer_id, packages } = req.body;
    const loggedInUserId = loggedInUser(req).userId;

    let results = [];

    const vendorP = await VendorPackage.findOne({
      where: { id: packages.package_id },
    });
    const customerOrderCount = getOrderCountDates(
      packages.start_date,
      packages.end_date,
      vendorP
    );

    // Getting All the orders based on userId, VendorId, packageId
    const existingOrders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
      },
    });

    // Checking whether the order for the cutomer given dates are already being created or not.
    const orderDates = filterOrderDatesFromExistingOrder(
      customerOrderCount,
      existingOrders
    );
    // Checking if there is any order need to create or not.
    if (!Array.isArray(orderDates) || orderDates.length === 0) {
      res.status(500).json({ message: "Order already exists" }); // If the input is not an array or empty, return null

      return;
    }

    const sortedDates = sortingDatesInDecendingOrder(orderDates);
    const start_order_date = sortedDates[sortedDates.length - 1];
    const last_order_date = sortedDates[0];

    // Updating the customer package & customer_package_subscription end_date according to the current last order date
    let savedCustomerPackage;
    let savedCustomerSubscription;

    if (orderDates.length > 0) {
      const customerPackage = await CustomerPackage.findByPk(
        packages.customer_package_id
      );
      customerPackage.end_date = new Date(last_order_date);
      savedCustomerPackage = await customerPackage.save();

      const customerPackageSubscription = await CustomerSubscription.findOne({
        where: { customer_package_id: packages.customer_package_id },
      });
      if (customerPackageSubscription) {
        customerPackageSubscription.end_date = new Date(last_order_date);
        savedCustomerSubscription = await customerPackageSubscription.save();
      } else {
        savedCustomerSubscription = await CustomerSubscription.create({
          customer_package_id: packages.customer_package_id,
          customer_package_frequency_id: 2,
          created_date: new Date(),
          start_date: new Date(start_order_date),
          end_date: new Date(last_order_date),
        });
      }
    }

    // Creating orders
    for (let x = 0; x < orderDates.length; x++) {
      const customerOrder = await CustomerOrder.create({
        user_id: customer_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
        created_date: new Date(),
        order_date: orderDates[x].fullDate,
        customer_package_id: packages.customer_package_id,
        is_ready: 0,
        is_delivered: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
        delivery_img: "",
        // delivered_time: new Date(),
        customer_delivery_address_id: 0,
        customer_package_subscription_id: savedCustomerSubscription.id,
      });
    }
    const customerUser = await UserCustomer.findByPk(customer_id);
    const vendorUser = await UserVendor.findByPk(vendorP.vendor_id);
    const vendor = await Vendor.findByPk(1);

    const finalPackageAvailableDays = [];
    const PackageAvailableDays = getPackageAvailableDays(vendorP);
    PackageAvailableDays.forEach((day) => {
      finalPackageAvailableDays.push(fullDayNames[days.indexOf(day)]);
    });

    let deliveryAddressObj;

    if (savedCustomerPackage.pickup_delivery === 1) {
      deliveryAddressObj = await VendorLocations.findOne({
        where: { id: savedCustomerPackage?.vendor_location_id },
        include: { model: CitiesAll },
      });
    } else {
      deliveryAddressObj = await CustomerDeliveryAddress.findOne({
        where: { id: savedCustomerPackage?.customer_delivery_address_id },
        include: { model: CitiesAll },
      });
    }

    // if (orderDates > 0) {

    const emailTamplete = {
      customer: customerUser.first_name,
      content: `${vendor.vendor_name} has created a new food order for you. Please log in to your account to see the upcoming orders.`,
      package_name: vendorP.package_name,
      start_order_date: Helper.getDateFromString(
        packages.start_date + "T00:00:00"
      ),
      end_order_date: Helper.getDateFromString(packages.end_date + "T00:00:00"),
      meals_count: orderDates.length,
      days: finalPackageAvailableDays,
      pickup_delivery:
        savedCustomerPackage.pickup_delivery === 2 ? "Delivery" : "Pickup",
      delivery_window: "11:00AM - 2:00PM",
      delivery_address: `Delivery address: ${deliveryAddressObj?.address}
                        ${deliveryAddressObj?.CitiesAll?.city}
                        ${deliveryAddressObj?.CitiesAll?.state}
                        ${deliveryAddressObj?.postal || ""}`,
      link: `https://menuscribe.com/customer-dashboard`,
    };
    const subject = "Your customer order has been created";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "renew-package.ejs"),
      emailTamplete
    );
    const emailRes = await sendEmail(
      customerUser.email,
      subject,
      "hello",
      html
    );
    // }

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

export const getOrderCreationDates = async (req, res) => {
  try {
    const {
      customer_id,
      start_date,
      end_date,
      package_id,
      customer_package_id,
    } = req.body;

    const loggedInUserId = loggedInUser(req).userId;

    const vendorP = await VendorPackage.findOne({
      where: { id: package_id },
    });

    const customerOrderCount = getOrderCountDates(
      start_date,
      end_date,
      vendorP
    );
    // console.log(req.body);
    let orderDates;

    if (customer_package_id) {
      // Getting All the orders based on userId, VendorId, packageId
      const existingOrders = await CustomerOrder.findAll({
        where: {
          user_id: customer_id,
          vendor_id: loggedInUserId,
          customer_package_id,
        },
      });

      // Checking whether the order for the cutomer given dates are already being created or not.
      orderDates = filterOrderDatesFromExistingOrder(
        customerOrderCount,
        existingOrders
      );
    } else {
      orderDates = customerOrderCount;
    }

    // Checking if there is any order need to create or not.
    if (!Array.isArray(orderDates) || orderDates.length === 0) {
      res.status(200).json({ message: "Order already exists", data: [] }); // If the input is not an array or empty, return null
      return;
    }
    const sortedDates = sortingDatesInDecendingOrder(orderDates);

    res.json({ message: "Successfull", data: sortedDates });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error Getting Order Creation Dates", success: false });
  }
};

export const getOrderCancelationDates = async (req, res) => {
  try {
    const { customer_id, customer_package_id, package_id } = req.body;

    const loggedInUserId = loggedInUser(req).userId;
    // console.log(req.body);
    // res.json({ message: "OK" });
    // return;
    const existingOrders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,
        vendor_id: loggedInUserId,
        customer_package_id,
        package_id,
      },
    });
    const cancelOrderDates = existingOrders.map((or) => or.order_date);
    const sortedDatess =
      sortingDatesInDecendingOrderFromDateStrings(cancelOrderDates);
    res.json({ message: "Successfull", data: sortedDatess });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Getting Order Cancelation Dates",
      success: false,
    });
  }
};
export const cancelCustomerPackage = async (req, res) => {
  try {
    const { customer_id, customer_package_id, package_id, reason } = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    await CustomerOrder.destroy({
      where: {
        user_id: customer_id,
        vendor_id: loggedInUserId,
        package_id,
        customer_package_id,
      },
    });

    if (reason) {
      const response = await EventLog.create({
        customer_package_id,
        package_id,
        vendor_id: loggedInUserId,
        customer_id,
        details: reason,
        email: 1,
        sms: 0,
        type: "CANCEL PACKAGE",
      });
      await response.save();
    }

    //////////////////////////////////////////////////////////////////
    const customer = await UserCustomer.findByPk(customer_id);

    console.log(req.body.reason);
    const emailTamplete = {
      name: "hanzla",
      items: req.body.dates,
      reason: `${req.body.reason}`,
    };

    const subject = "Your meal package has been cancelled";
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const html = await ejs.renderFile(
      join(__dirname, "..", "..", "views", "cancel-package.ejs"),
      emailTamplete
    );

    await sendEmail(customer.dataValues.email, subject, "hello", html);

    const customerPackage = await CustomerPackage.findOne({
      where: { id: customer_package_id },
    });

    customerPackage.status = 0;
    await customerPackage.save();

    // Setting the customer package subscription end_date= today
    const customerPackageSubscription = await CustomerSubscription.findOne({
      where: { customer_package_id },
    });

    customerPackageSubscription.end_date = new Date();
    await customerPackageSubscription.save();

    res.json({
      message: "Customer Package deleted succesfully!",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Getting Order Cancelation Dates",
      success: false,
    });
  }
};

export const filterOrderDates = async (req, res) => {
  try {
    const { id, start_date, end_date } = req.body;

    const loggedInUserId = loggedInUser(req).userId;
    // Find the existing item
    const existingSubscription = await CustomerSubscription.findByPk(id);

    if (!existingSubscription) {
      return res.status(404).json({ error: "Item not found" });
    }

    const customerPackage = await CustomerPackage.findOne({
      where: { id: existingSubscription.customer_package_id },
    });

    const vendorP = await VendorPackage.findOne({
      where: { id: customerPackage.package_id },
    });

    // Getting the day, date and month name between the package start and package end date.
    const CustomerGivenDates = Helper.getDateMonthDayBetweenTwoDates(
      start_date,
      end_date
    );

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

    // Getting All the orders based on userId, VendorId, packageId
    const existingOrders = await CustomerOrder.findAll({
      where: {
        user_id: customerPackage.user_id,
        vendor_id: loggedInUserId,
        package_id: vendorP.id,
      },
    });

    // Checking whether the order for the cutomer given dates are already being created or not.
    let orderDates = customerOrderCount;
    existingOrders.forEach((or) => {
      orderDates = orderDates.filter(
        (date) => date.dateString !== or.order_date
      );
    });

    res.status(200).json({
      success: true,
      message: "Order dates filtered successfully",
      orderDates,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to filter order dates", success: false });
  }
};

export const getCustomerPackages = async (req, res) => {
  //const { id } = req.body;
  const id = req.params.id;
  try {
    const customer = await UserCustomer.findOne({
      where: { id: id },
    });

    let vendorSetting, CustomerAddress, vendor;
    if (customer) {
      vendorSetting = await VendorSettings.findOne({
        where: { id: customer.vendor_id },
      });
      vendor = await Vendor.findAll({
        where: { id: customer.vendor_id },
      });

      CustomerAddress = await CustomerDeliveryAddress.findAll({
        where: { customer_id: id },
        include: {
          model: CitiesAll,
        },
      });
    }
    const rawQuery = `
    SELECT
      vendor_package_menu_items.*,
      vendor_package.id AS vendor_package_id,
      customer_orders.id AS order_id,
      MAX(customer_orders.created_date) AS max_created_date,
      MAX(customer_orders.is_delivered) AS max_is_delivered,
      MAX(customer_orders.total) AS max_total
    FROM vendor_package_menu_items
    INNER JOIN vendor_package ON vendor_package_menu_items.package_id = vendor_package.id
    INNER JOIN customer_package ON vendor_package.id = customer_package.package_id
    INNER JOIN customer_orders ON customer_package.id = customer_orders.customer_package_id
    WHERE customer_orders.user_id = 1
    GROUP BY vendor_package_menu_items.id, vendor_package_id, order_id;
  `;

    const resultsForMenuItems = await sequelize.query(rawQuery, {
      replacements: { id: id },

      type: QueryTypes.SELECT,
    });

    const packages = await CustomerPackage.findAll({
      // where: { user_id: id, payment_status: 1 },
      where: { user_id: id },
      include: [
        {
          model: VendorPackage,
          include: [
            {
              model: VendorPackageDefaultItem,
              include: [
                {
                  model: VendorPackageMenuItems,
                  include: [{ model: VendorMenuItems }],
                },
              ],
            },
            {
              model: VendorPackageSlots,
            },
          ],
        },
        {
          model: CustomerOrder,
          where: { order_date: { [Op.gte]: new Date() } },
          required: false,
        },
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
          model: VendorLocations,
          include: CitiesAll,
        },

        {
          model: CustomerSubscription,
        },
      ],
    });

    let results = [];

    for (const packge of packages) {
      const newPackge = { ...packge.dataValues };

      let orders = [];

      if (packge.CustomerOrders) {
        for (const order of packge.CustomerOrders) {
          const newOrder = { ...order.dataValues };

          const defaultItems = await VendorPackageDefaultItem.findAll({
            // where: { package_id: packge.package_id },
            where: {
              [Op.or]: [{ package_id: 0 }, { package_id: packge.package_id }],
            },
          });

          let finalItems = [];

          for (const item of defaultItems) {
            const defaultitem = { ...item.dataValues };

            const vendorPackageMenuItems = await VendorPackageMenuItems.findAll(
              {
                where: {
                  menu_default_group_id: item.id,
                  menu_date: new Date(order.order_date),
                },
              }
            );
            const customerOrderItem = await CustomerOrderItem.findOne({
              where: { order_id: order.id, menu_group_id: item.id },
            });
            defaultitem.CustomerOrderItem = customerOrderItem;
            defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
            finalItems.push(defaultitem);
          }

          const defaultitem = { item_name: "For All Packages" };

          const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
            where: {
              menu_default_group_id: 0,
              menu_date: new Date(order.order_date),
              all_packages: 1,
            },
          });

          defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
          finalItems.push(defaultitem);

          newOrder.items = finalItems;
          orders.push(newOrder);
        }
      }
      let finalOrders = [];
      const orderDates = orders.map((order) => order.order_date);
      const sortedIndexes = Helper.sortDatesAndGetIndices(orderDates);
      sortedIndexes.forEach((i) => finalOrders.push(orders[i]));

      newPackge.CustomerOrders = finalOrders;
      results.push(newPackge);
    }

    res.status(200).json({
      success: true,
      data: {
        results,
        resultsForMenuItems,
        vendorSetting,
        CustomerAddress,
        vendor,
      },
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setOrderItemFromCustomerDashboard = async (req, res) => {
  try {
    const reqBody = req.body;
    const existingOrderItem = await CustomerOrderItem.findOne({
      where: {
        order_id: reqBody.order_id,
        menu_default_group_id: reqBody.menu_default_group_id,
      },
    });

    if (existingOrderItem) {
      existingOrderItem.item_id = reqBody.item_id;
      await existingOrderItem.save();
      res.json({
        message: "Order Item updated successfully",
        success: true,
        data: existingOrderItem,
      });
    } else {
      const orderitem = await CustomerOrderItem.create({
        ...reqBody,
      });
      res.json({
        message: "New OrderItem created successfylly",
        success: true,
        data: orderitem,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Faild to set order Item from Customer dashboard",
      success: false,
    });
  }
};
export const getVendorPackageByDate = async (req, res) => {
  try {
    const { date } = req.body;
    const loggedInUserId = loggedInUser(req).userId;

    const user = await UserCustomer.findOne({
      where: { id: loggedInUserId },
    });

    const vendorPackages = await VendorPackage.findAll({
      where: { vendor_id: user.vendor_id },
      include: [
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackageSlots,
        },
        {
          model: VendorLocations,
          include: CitiesAll,
        },
      ],
    });
    const result = [];
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    const dateObj = new Date(date.dateObject);
    const day = days[dateObj.getDay()];

    const customerDeliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { customer_id: loggedInUserId, address_type: "HOME" },
      include: CitiesAll,
    });
    for (let packge of vendorPackages) {
      const newPackge = { ...packge.dataValues };
      let finalItems = [];
      // Finding Menu items for that specific date
      for (const item of packge.VendorPackageDefaultItems) {
        const defaultitem = { ...item.dataValues };

        const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: item.id,
            menu_date: new Date(date.dateStr),
          },
          include: VendorMenuItems,
        });
        // console.log({
        //   menu_default_group_id: item.id,
        //   menu_date: new Date(date.dateStr),
        // })

        defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
        finalItems.push(defaultitem);
      }
      newPackge.VendorPackageDefaultItems = finalItems;
      // console.log(newPackge[day]);
      newPackge[day] === 1 &&
        result.push({
          ...newPackge,
          CustomerDeliveryAddress: customerDeliveryAddress,
        });
    }

    res.json({
      message: "successfull",
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vendor package by date",
    });
    console.log(error);
  }
};

export const getCustomerPackagess = async (req, res) => {
  const id = req.params.id;
  try {
    const packages = await CustomerPackage.findAll({
      // where: { user_id: id, payment_status: 1 },
      where: { user_id: id },
      include: [
        {
          model: CustomerOrder,
          where: { order_date: { [Op.gte]: new Date() } },
        },
      ],
    });

    let temp = [];

    for (const packge of packages) {
      const newPackge = { ...packge.dataValues };

      let orders = [];
      for (const order of packge.CustomerOrders) {
        const newOrder = { ...order.dataValues };

        const defaultItems = await VendorPackageDefaultItem.findAll({
          where: { package_id: packge.package_id },
        });
        let finalItems = [];
        for (const item of defaultItems) {
          const defaultitem = { ...item.dataValues };
          const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
            where: {
              menu_default_group_id: item.id,
              menu_date: order.order_date,
            },
          });
          defaultitem.VendorpackageMenuItems = vendorPackageMenuItems;
          finalItems.push(defaultitem);
        }

        newOrder.items = finalItems;
        orders.push(newOrder);
      }
      newPackge.CustomerOrders = orders;
      temp.push(newPackge);
    }

    res.json({ message: "Successfull", success: true, data: temp });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to get Customer Package from 2",
      success: false,
    });
  }
};
export const getCustomerActivePackages = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req).userId;
    const id = req.params.id;
    const packages = await CustomerPackage.findAll({
      // where: { user_id: id, payment_status: 1 },
      where: { user_id: id },
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
    // Adding order_start and order_end Date  to the packages Objects
    const result = [];
    for (const pack of packages) {
      const ordersAll = await CustomerOrder.findAll({
        where: {
          customer_package_id: pack.id,
          user_id: pack.user_id,
          vendor_id: loggedInUserId,
          package_id: pack.package_id,
        },
      });
      const allDates = [];
      ordersAll.forEach((or) => {
        allDates.push(or.order_date);
      });

      const order_start = Helper.getLargestDateStringArray(allDates);
      const order_end = Helper.getSmallestDateStringArray(allDates);
      result.push({ ...pack.dataValues, order_start, order_end });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function getUpcomingOrder(objects) {
  const currentDate = new Date(); // Get current date

  // Convert date strings to Date objects and filter out invalid dates
  objects[0].order_date;
  const orders = objects
    .map((obj, index) => {
      return {
        ...obj.dataValues,
        order_date: new Date(obj.order_date),
      };
    })
    .filter((obj) => !isNaN(obj.order_date) && obj.order_date > currentDate); // Filter out past dates
  // Sort orders by date in ascending order
  orders.sort((a, b) => a.order_date - b.order_date);

  // Return the first 20 upcoming orders or less if there are fewer than 20
  return orders.slice(0, 20);
}

export const deleteHolidays = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req).userId;
    const locationIds = await loggedInUserLocation(req);

    const findHoliday = await VendorLocationHolidays.findOne({
      where: { id: req.params.id },
    });
    await findHoliday.destroy();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getHolidays = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req).userId;
    const locationIds = await loggedInUserLocation(req);
    const holidays = await VendorLocationHolidays.findAll({
      where: { vendor_location_id: { [Op.in]: [...locationIds] } },
    });

    res.status(200).json({
      success: true,
      data: holidays,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setHolidays = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req).userId;
    const vendorLocaiton = await VendorEmployeeLocations.findOne({
      where: { vendor_employee_id: vendor_id },
      include: [{ model: VendorLocations }],
    });
    const locationIds = await loggedInUserLocation(req);
    const getData = await VendorLocationHolidays.findAll({
      where: { date: new Date(req.body.date) },
    });

    if (getData.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Date already exist",
      });
    }
    const setDate = await VendorLocationHolidays.create({
      date: req.body.date,
      vendor_location_id:
        vendorLocaiton.dataValues.VendorLocation.dataValues.id,
      created_at: new Date(),
    });

    return res.status(200).json({
      success: true,
      data: getData,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const setOrder = async (req, res) => {
  try {
    const { pack, orderItems } = req.body;
    const loggedInUserId = loggedInUser(req).userId;

    const customerPackage = await CustomerPackage.create({
      user_id: loggedInUserId,
      package_id: pack.id,
      payment_status: 0,
      frequency_id: 0,
      user_package_name: "",
      created_date: new Date(),
      start_date: new Date(),
      quantity: 1,
      customer_delivery_address_id:
        pack.pickup_delivery === 2 ? pack.CustomerDeliveryAddress.id : 0,
      vendor_location_id:
        pack.pickup_delivery === 1 ? pack.VendorLocation.id : 0,
      pickup_delivery: pack.pickup_delivery,
      // end_date: new Date(),
    });
    const customerPackageSubscription = await CustomerSubscription.create({
      customer_package_id: customerPackage.id,
      customer_package_frequency_id: 0,
      created_date: new Date(),
      start_date: new Date(),
      end_date: new Date(),
    });
    const deliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { id: pack.CustomerDeliveryAddress.id },
      include: [{ model: CitiesAll }],
    });

    const customerOrder = await CustomerOrder.create({
      user_id: loggedInUserId,
      vendor_id: pack.vendor_id,
      package_id: pack.id,
      created_date: new Date(),
      customer_package_id: customerPackage.id,
      order_date: new Date(),
      is_ready: 0,
      is_delivered: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
      delivery_img: "",
      // delivered_time: new Date(),
      delivery_address: `${deliveryAddress?.dataValues.address}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.city}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.state},${deliveryAddress?.dataValues.postal}`,
      customer_delivery_address_id:
        pack.pickup_delivery === 2 ? pack.CustomerDeliveryAddress.id : 0,
      vendor_location_id:
        pack.pickup_delivery === 1 ? pack.VendorLocation.id : 0,
      customer_package_subscription_id: customerPackageSubscription.id,
    });

    orderItems.forEach(async (ditem) => {
      const createdOrderItem = await CustomerOrderItem.create({
        order_id: customerOrder.id,
        item_id: ditem.VendorPackageMenuItemsId
          ? ditem.VendorPackageMenuItemsId
          : 0,
        menu_group_id: ditem.VendorPackageDefaultItemsId,
      });
    });

    res.json({ message: "successfull", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failled to set orders", success: false });
  }
};

export const getCurrentSubscription = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;
    const locationIds = await loggedInUserLocation(req);
    const user_id = req.params.id;
    const subscription = await CustomerPackage.findAll({
      where: { user_id: user_id },
      include: [
        {
          model: CustomerPackageSubscription,
          include: [
            {
              model: CustomerOrder,
            },
          ],
        },
        { model: UserCustomer, where: { vendor_id: id }, required: true },
        {
          model: VendorPackage,
          include: [
            {
              model: CustomerOrder,
              where: {
                user_id: user_id,
              },
              required: false,
            },
            {
              model: Vendor,
            },
          ],
        },
        { model: VendorPackagePrice },
      ],
    });

    const infoPromises = subscription.map(async (item) => {
      const orders = await CustomerOrder.findAll({
        where: {
          user_id: user_id,
          customer_package_id: item.dataValues.id,
        },
        include: [
          {
            model: CustomerDeliveryAddress,
            include: [CitiesAll],
          },
          {
            model: CustomerPackage,
            include: [
              {
                model: VendorPackage,
                include: [{ model: VendorLocations, include: [CitiesAll] }],
              },
            ],
          },
          {
            model: VendorEmployee,
            include: [UserVendor],
          },
        ],
      });

      return { ...item.dataValues, orders: orders };
    });

    const info = await Promise.all(infoPromises);

    return res.status(200).json({
      success: true,
      data: info,
    });
  } catch (error) {
    console.log("Error fetching Subscription Info: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getUpcomingOrders = async (req, res) => {
  try {
    const vendor_id = loggedInUser(req).userId;
    const locationIds = await loggedInUserLocation(req);
    const id = req.params.id;
    const userInfo = await UserCustomer.findOne({
      where: { id: id },
      include: [{ model: VendorCustomerLink }],
    });
    const response = await CustomerOrder.findAll({
      where: { user_id: id },
      include: [
        {
          model: VendorPackage,
          // where:{vendor_location_id:{[Op.in]:[...locationIds]}},
          include: [
            {
              model: VendorPackageDefaultItem,
              include: [
                {
                  model: VendorPackageMenuItems,
                  required: false,
                  // where: { menu_date: selected_date_Obj },
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
    let orders;
    const finalOrders = [];

    if (response.length > 0) {
      orders = getUpcomingOrder(response);
      for (const order of orders) {
        const newOrder = { ...order };
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
    }

    res.status(200).json({
      success: true,
      userInfo: userInfo,
      completeOrders: response,
      data: orders,
    });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateCustomerProfile = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;
    req.body;
    if (!id) {
      throw {
        code: 404,
        message: "internal server error",
      };
    }
    const updateUser = await UserCustomer.findByPk(id);
    updateUser.email = req.body.email ? req.body.email : updateUser.email;
    updateUser.phone = req.body.phone ? req.body.phone : updateUser.phone;
    updateUser.first_name = req.body.first_name
      ? req.body.first_name
      : updateUser.first_name;
    updateUser.last_name = req.body.last_name
      ? req.body.last_name
      : updateUser.last_name;
    updateUser.city_id = req.body.city_id
      ? req.body.city_id
      : updateUser.city_id;
    updateUser.state = req.body.state ? req.body.state : updateUser.state;
    await updateUser.save();
    // console.log("user", updateUser);
    if (updateUser) {
      res.status(200).json({ message: "Customer updated successfully" });
    } else {
      throw {
        code: 404,
        message: "internal server error",
      };
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
};
export const saveCustomerOrder = async (req, res) => {
  const { ids } = req.body;
  try {
    const loggedInUserId = loggedInUser(req).userId;
    const results = await CustomerPackage.findAll({
      include: [
        {
          model: VendorPackage,
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
              ],
            },
          ],
        },
      ],
      where: { package_id: ids },
    });

    results.forEach(async (customerPackage) => {
      let arr = [];
      let daysCount;
      let totalAmount;
      if (customerPackage.VendorPackage.sun === 1) {
        arr.push("sunday");
      }
      if (customerPackage.VendorPackage.mon === 1) {
        arr.push("monday");
      }
      if (customerPackage.VendorPackage.tue === 1) {
        arr.push("tuesday");
      }
      if (customerPackage.VendorPackage.wed === 1) {
        arr.push("wednesday");
      }
      if (customerPackage.VendorPackage.thu === 1) {
        arr.push("thursday");
      }
      if (customerPackage.VendorPackage.fri === 1) {
        arr.push("friday");
      }
      if (customerPackage.VendorPackage.sat === 1) {
        arr.push("saturday");
      }

      if (customerPackage.frequency === "daily") {
        daysCount = 1;
      } else if (customerPackage.frequency === "weekly") {
        daysCount = 5;
      } else if (customerPackage.frequency === "monthly") {
        daysCount = 20;
      }
      if (customerPackage.frequency === "daily") {
        totalAmount = customerPackage.VendorPackage.price_daily;
      } else if (customerPackage.frequency === "weekly") {
        totalAmount = customerPackage.VendorPackage.price_weekly;
      } else if (customerPackage.frequency === "monthly") {
        totalAmount = customerPackage.VendorPackage.price_monthly;
      }

      const nextDays = Helper.getNextDatesOfWeek(arr);
      //console.log(nextDays)

      nextDays.forEach(async (days) => {
        let deliveryTime = `${days.Date}T${customerPackage.VendorPackage.delivery_schedule_start}`;
        const createdOrder = await CustomerOrder.create({
          user_id: loggedInUserId,
          vendor_id: customerPackage.VendorPackage.vendor_id,
          package_id: customerPackage.VendorPackage.id,
          created_date: new Date(),
          is_ready: 0,
          is_delivered: 0,
          subtotal: 0,
          tax: 0,
          total: totalAmount,
          delivery_img: "",
          delivered_time: new Date(deliveryTime),
        });

        customerPackage.VendorPackage.VendorPackageDefaultItems.forEach(
          async (ditem) => {
            const createdOrderItem = await CustomerOrderItem.create({
              order_id: createdOrder.id,
              item_id: ditem.VendorMenuItem.id,
            });
          }
        );
      });
    });
    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const customerOrderById = async (id) => {
  try {
    const orders = await CustomerOrder.findAll({
      where: { user_id: id },
      include: {
        model: VendorPackage,
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

      // console.log(isActive);
      // console.log(currentDate.getDate(), today.getDate());
    });
    return {
      code: 200,
      message: "Data fetch Successfully",
      activeOrders: activeOrders,
    };
  } catch (error) {}
};

export const getCustomerOrderFromId = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await customerOrderById(id);
    res.status(200).json({
      success: true,
      data: response.activeOrders,
    });
  } catch (error) {
    res.status(400).json({ message: "Error getting Customer order", error });
  }
};

export const updatePickupDeliveryStatus = async (req, res) => {
  try {
    const findFrequency = await VendorPackagePrice.findOne({
      where: {
        package_id: req.params.id,
        frequency: req.body.frequency,
        method: req.body.method,
      },
    });
    if (findFrequency) {
      findFrequency.status = req.body.status ? 1 : 0;
      await findFrequency.save();
      return res.status(200).json({
        success: true,
        data: findFrequency,
        message: "frequency updated successfully",
      });
    }
    return res.json({ success: false, message: "frequency not found" });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error in updating pickup delivery status update",
      error,
    });
  }
};
export const cancelCustomerOrder = async (req, res) => {
  const customerData = req.body;
  try {
    const customer = await CustomerPackage.findOne({
      where: {
        user_id: customerData.customer_id,
        package_id: customerData.package_id,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    // Update the existing item's properties
    customer.payment_status = 0;
    await customer.save();

    res.status(200).json({ success: true, data: customer.id });
  } catch (error) {
    console.log("Error fetching customer: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCustomerAddress = async (req, res) => {
  try {
    let loggedInUserId;
    if (req?.query?.id && typeof req.query.id === "number") {
      loggedInUserId = req.query.id;
    } else {
      loggedInUserId = loggedInUser(req).userId;
    }
    const result = await CustomerDeliveryAddress.findAll({
      where: { customer_id: loggedInUserId },
      include: { model: CitiesAll },
    });
    res
      .status(200)
      .json({ message: "Customer delivery address found", data: result });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Faild get customer delivery address", details: error });
  }
};

export const setCustomerAddress = async (req, res) => {
  // console.log("API HIT")
  try {
    const reqBody = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    const checkUserAddress = await CustomerDeliveryAddress.findAll({
      where: {
        customer_id: reqBody.customer_id,
        address_type: reqBody.address_type,
      },
    });
    if (checkUserAddress.length > 0) {
      return res.json({
        message: "double-address_type",
        type: reqBody.address_type,
        success: false,
      });
    }
    const postal = await PostalRegions.findOne({
      where: { POSTAL_CODE: reqBody.postal.split(" ")[0] },
    });
    const user = await UserCustomer.findOne({
      where: { id: reqBody.customer_id },
    });
    user.postal_id = postal.dataValues.id;
    await user.save();
    const result = await CustomerDeliveryAddress.create({
      address: reqBody.address,
      delivery_instructions: reqBody.delivery_instructions,
      city_id: parseInt(reqBody.city.id),
      postal: reqBody.postal,
      vendor_added: reqBody.vendor_added ? reqBody.vendor_added : 0,
      status: 1,
      address_type: reqBody.address_type,
      customer_id: reqBody.customer_id,
      latitude: reqBody.latitude,
      longitude: reqBody.longitude,

      unit_number: reqBody.unit_number ? reqBody.unit_number : "",
    });
    await result.save();
    res.status(200).json({
      message: "Customer delivery address created successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to save customer address" });
  }
};

export const getVendorPackageForCustomer = async (req, res) => {
  try {
    const fetchData = await VendorPackage.findAll({
      include: [
        {
          model: Vendor,
          include: [
            {
              model: VendorCities,
              where: { city_id: req.params.id },
              required: true,
            },
          ],
        },
        {
          model: VendorPackageDefaultItem,
          include: [{ model: VendorDefaultItem }],
        },
        {
          model: VendorPackagePrice,
          where: { frequency: "monthly" },
          required: false,
        },
      ],
    });
    let getPackages = [];
    fetchData.forEach((pkg) => {
      pkg.dataValues.VendorPackagePrices.map((price) =>
        getPackages.push({
          ...pkg.dataValues,
          VendorPackagePrices: price.dataValues,
        })
      );
    });

    res.status(200).json({
      message: "Packages fetch successfully",
      status: true,
      data: getPackages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCustomerAddressFromCustomerDashboard = async (req, res) => {
  try {
    const reqBody = req.body;
    const loggedInUserId = loggedInUser(req).userId;

    const postal = await PostalRegions.findOne({
      where: { POSTAL_CODE: reqBody.postal.split(" ")[0] },
    });
    const user = await UserCustomer.findOne({
      where: { id: loggedInUserId },
    });
    user.postal_id = postal.dataValues.id;
    await user.save();

    const dAddress = await CustomerDeliveryAddress.findByPk(reqBody.id);

    dAddress.address = reqBody.address;
    dAddress.delivery_instructions = reqBody.delivery_instructions;
    dAddress.city_id = parseInt(reqBody.city_id);
    dAddress.postal = reqBody.postal;
    dAddress.address_type = reqBody.address_type;

    const result = await dAddress.save();

    res.status(200).json({
      message: "Customer delivery address Updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "Faild to save customer address" });
  }
};

export const updateCustomerAddress = async (req, res) => {
  try {
    let address;
    const addressData = req.body;
    if (addressData.id === 0 || addressData.id === undefined) {
      address = await CustomerDeliveryAddress.create({
        address: addressData.address,
        customer_id: addressData.customer_id,
        city_id: addressData.city_id,
        postal: addressData.postal,
        delivery_instructions: addressData.delivery_instructions,
        status: 1,
      });
    } else {
      address = await CustomerDeliveryAddress.findByPk(addressData.id);
      if (!address) {
        return res.status(404).json({ error: "Item not found" });
      }
      address.address = addressData.address;
      address.city_id = addressData.city_id;
      address.postal = addressData.postal;
      (address.delivery_instructions = addressData.delivery_instructions),
        await address.save();
    }
    res.status(200).json({ success: true, data: address });
  } catch (error) {
    console.log("Error saving address: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteCustomerAddress = async (req, res) => {
  const addressId = req.params.id;
  const id = loggedInUser(req).userId;
  try {
    const check = await CustomerPackage.findAll({
      where: { customer_delivery_address_id: addressId, user_id: id },
      include: [
        { model: VendorPackage, attributes: ["package_name", "id"] },
        { model: UserCustomer },
        { model: CustomerDeliveryAddress },
      ],
    });
    if (check.length > 0) {
      const resp = [];
      const data = await Promise.all(
        check.map(async (item) => {
          const orders = await CustomerOrder.findAll({
            where: {
              user_id: item.dataValues.UserCustomer?.id,
              package_id: item.dataValues.VendorPackage?.id,
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
            (data) =>
              data.data.UserCustomer?.id == item.dataValues.UserCustomer?.id
          );
          if (activeOrders.length != 0) {
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
        message: "Cannot delete this address",
        data: resp,
      });
    }
    const results = await CustomerDeliveryAddress.destroy({
      where: { id: addressId },
    });
    res.status(200).json({ success: true, data: check });
  } catch (error) {
    console.log("Error deleting address: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const saveAllCustomerOrders = async (req, res) => {
  const allPackages = req.body;
  // console.log(allPackages, 'all package');
  const result = await CustomerPackage.findAll({
    where: {
      payment_status: 1,
    },
    include: [
      {
        model: VendorPackage,
      },
    ],
  });

  for (let i = 0; i < result.length; i++) {
    const deliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { id: result[i].customer_delivery_address_id },
      include: [{ model: CitiesAll }],
    });
    await CustomerOrder.create({
      user_id: result[i]?.user_id,
      vendor_id: result[i].VendorPackage.vendor_id,
      package_id: result[i].package_id,
      created_date: result[i].created_date,
      delivery_address: `${deliveryAddress?.dataValues.address}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.city}, ${deliveryAddress?.dataValues.CitiesAll?.dataValues.state},${deliveryAddress?.dataValues.postal}`,

      is_ready: 0,
      is_delivered: 0,
      subtotal: 0,
      tax: 0,
      total: result[i].VendorPackage.price_monthly,
      customer_delivery_address_id: result[i].customer_delivery_address_id,
    });
    await CustomerPackage.destroy({
      where: { id: result[i].id },
    });
  }

  res.status(200).json({ success: true, data: "update" });
};

// export const getCustomerActiveSubscriptions = async (req, res) => {
//   const loggedInUserId = loggedInUser(req).userId;

//   try {
//     const result = await CustomerSubscription.findAll({
//       where: {
//         user_id: loggedInUserId,
//       },
//     });

//     res
//       .status(200)
//       .json({ message: "Active subscription found", data: result });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "failed to get customer active subscription" });
//   }
// };

export const getCustomerActiveSubscriptions = async (req, res) => {
  const loggedInUserId = loggedInUser(req).userId;

  try {
    // Query the customer_package table to find the user_id associated with the logged-in user
    const result = await CustomerPackage.findAll({
      where: {
        user_id: loggedInUserId,
      },
    });
    const data = await CustomerPackageSubscription.findAll({
      include: [
        {
          model: CustomerPackage,
          include: [{ model: VendorPackage }],
          where: { user_id: loggedInUserId },
        },
        { model: CustomerOrder },
      ],
    });

    // console.log("customerPackage", customerPackage);

    // If no customer package is found for the logged-in user, return an error
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    // Use the user_id to filter customer subscriptions
    // const result = await CustomerSubscription.findAll({
    //   where: {
    //     customer_package_id: customerPackage[0].user_id,
    //   },
    // });

    res
      .status(200)
      .json({ message: "Active subscriptions found", data: result, sub: data });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "Failed to get customer active subscriptions" });
  }
};

export const getCustomerCustomerPackageRequest = async (req, res) => {
  try {
    const result = await CustomerPackageRequest.findAll();
    res
      .status(200)
      .json({ message: "customer package request found", data: result });
  } catch (error) {
    res.status(500).json({ error: "failed to get customer package request" });
  }
};

export const setInitCustomerPackageRequest = async (req, res) => {
  try {
    const reqBody = req.body.packages;

    const user = await UserCustomer.findByPk(req.body.id);
    const address = await CustomerDeliveryAddress.findOne({
      where: { customer_id: req.body.id },
    });
    for (const pack of reqBody) {
      const savedRequest = await CustomerPackageRequest.create({
        user_id: req.body.id,
        package_id: pack.id,
        payment_status: 0,
        pickup_delivery: 1,
        frequency_id: 0,
        timeslot_id: 0,
        customer_delivery_address_id: address.dataValues.id,
        vendor_location_id: pack.vendor_location_id,
        user_package_name: pack.package_name,
        quantity: 1,
        created_date: new Date(),
        start_date: new Date(),
        request_type: "NEW",
        status: 0,
        deleted: 0,
      });
    }
    // const vendor = await Vendor.findByPk(user.dataValues.vendor_id);
    // const requests = await CustomerPackageRequest.findAll({
    //   where: { user_id: user.dataValues.id },
    //   include: [
    //     {
    //       model: VendorLocations,
    //       include: [
    //         { model: VendorPaymentMethods, include: PaymentMethods },
    //         { model: CitiesAll },
    //       ],
    //     },
    //     {
    //       model: VendorPackage,
    //     },
    //   ],
    // });
    // const emailTamplete = {
    //   restaurant_name: vendor.vendor_name,
    //   requests,
    // };
    // const subject =
    //   "Account created successfully and requests are send to the vendor";
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    // const html = await ejs.renderFile(
    //   join(
    //     __dirname,
    //     "..",
    //     "..",
    //     "views",
    //     "create-account-with-package-request.ejs"
    //   ),
    //   emailTamplete
    // );
    // await sendEmail(user.dataValues.email, subject, "hello", html);
    res.json({ message: "Successful", success: true });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Failed to set customer package request" });
  }
};

export const getAllCustomerOrders = async (req, res) => {
  try {
    const userId = loggedInUser(req).userId;
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.pageSize) || 10;
    const offset = (page - 1) * limit;
    let getData;
    let count;
    if (req.body.type === "pre") {
      getData = await CustomerOrder.findAll({
        limit: limit,
        offset: offset,
        order: [["order_date", "DESC"]],

        include: [
          { model: Plans },
          { model: CustomerDeliveryAddress, include: [{ model: CitiesAll }] },
        ],

        where: { order_date: { [Op.lt]: new Date() }, user_id: userId },
      });
      count = await CustomerOrder.findAll({
        where: { order_date: { [Op.lt]: new Date() }, user_id: userId },
      });
    } else {
      getData = await CustomerOrder.findAll({
        limit: limit,
        offset: offset,
        order: [["order_date", "ASC"]],

        include: [
          { model: Plans },
          { model: CustomerDeliveryAddress, include: [{ model: CitiesAll }] },
        ],
        where: { order_date: { [Op.gt]: new Date() }, user_id: userId },
      });
      count = await CustomerOrder.findAll({
        where: { order_date: { [Op.gt]: new Date() }, user_id: userId },
      });
    }

    const totalPages = Math.ceil(count.length / limit);

    res
      .status(200)
      .send({ success: true, data: getData, totalPages: totalPages });
  } catch (error) {
    console.log("Error " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getVendorPackageByLocation = async (req, res) => {
  try {
    const { date } = req.body;
    const loggedInUserId = loggedInUser(req).userId;
    const vendor_location_id = req.body.vendor_location_id;
    const user = await UserCustomer.findOne({
      where: { id: loggedInUserId },
    });
    const whereClause = {
      vendor_id: user.vendor_id,
    };

    if (vendor_location_id) {
      whereClause.vendor_location_id = vendor_location_id;
    }

    const vendorPackages = await VendorPackage.findAll({
      where: whereClause,
      include: [
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackagePrice,
          where: { frequency: "tiffinplan" },
          required: true,
        },
        // {
        //   model: VendorPackageSlots,
        // },
        // {
        //   model: VendorLocations,
        //   include: CitiesAll,
        // },
      ],
    });
    const result = [];
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    // const dateObj = new Date(date.dateObject);
    // const day = days[dateObj.getDay()];

    const customerDeliveryAddress = await CustomerDeliveryAddress.findOne({
      where: { customer_id: loggedInUserId, address_type: "HOME" },
      include: CitiesAll,
    });
    for (let packge of vendorPackages) {
      const newPackge = { ...packge.dataValues };
      let finalItems = [];
      // Finding Menu items for that specific date
      for (const item of packge.VendorPackageDefaultItems) {
        const defaultitem = { ...item.dataValues };

        const vendorPackageMenuItems = await VendorPackageMenuItems.findAll({
          where: {
            menu_default_group_id: item.id,
            // menu_date: new Date(date.dateStr),
          },
          include: VendorMenuItems,
        });
        // console.log({
        //   menu_default_group_id: item.id,
        //   menu_date: new Date(date.dateStr),
        // })

        defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
        finalItems.push(defaultitem);
      }
      newPackge.VendorPackageDefaultItems = finalItems;
      // console.log(newPackge[day]);
      // newPackge[day] === 1 &&
      result.push({
        ...newPackge,
        CustomerDeliveryAddress: customerDeliveryAddress,
      });
    }

    res.json({
      message: "successfull",
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vendor package by date",
    });
    console.log(error);
  }
};

export const getCustomerDeliveryLocations = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;
    const locations = await CustomerDeliveryAddress.findAll({
      where: { customer_id: id },
      include: [{ model: CitiesAll }],
    });

    res.json({
      message: "successfull",
      success: true,
      data: locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vendor package by date",
    });
    console.log(error);
  }
};

export const getSelectedCustomerPackage = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req).userId;

    const vendorPackages = await CustomerPackage.findAll({
      where: { user_id: loggedInUserId, tiffinplan: 1, status: 1 },
      include: [
        {
          model: VendorPackage,

          include: [
            // {
            //   model: VendorPackageDefaultItem,
            // },
            {
              model: Vendor,
            },
            {
              model: VendorPackagePrice,
              where: { frequency: "tiffinplan", method: "delivery" },
              required: true,
            },
          ],
        },
        {
          model: UserCustomer,
        },
      ],
    });

    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

    const result = await Promise.all(
      vendorPackages.map(async (packge) => {
        // let finalItems = [];
        // Finding Menu items for that specific date
        const defaultItems = await VendorPackageDefaultItem.findAll({
          where: {
            package_id: { [Op.in]: [0, packge.dataValues.package_id] },
          },
        });

        // packge.VendorPackage.VendorPackageDefaultItems = [...defaultItems];

        const newPackage = {
          ...packge.dataValues,
        };

        const finalItems = await Promise.all(
          defaultItems.map(async (item) => {
            const defaultitem = { ...item.dataValues };
            const vendorPackageMenuItems = await VendorPackageMenuItems.findAll(
              {
                where: {
                  menu_default_group_id: item.id,
                },
                include: VendorMenuItems,
              }
            );
            defaultitem.VendorPackageMenuItems = vendorPackageMenuItems;
            return defaultitem;
          })
        );
        newPackage.VendorPackage.dataValues.VendorPackageDefaultItems =
          finalItems;

        return { ...newPackage };
      })
    );
    console.log(
      result[0].VendorPackage.dataValues.VendorPackageDefaultItems.length
    );

    res.json({
      message: result,
      success: true,
      data: [...result],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get vendor package by date",
    });
    console.log(error);
  }
};

export const customerPackageCancelByCustomer = async (req, res) => {
  try {
    const { customer_package_id } = req.body;
    const customer_id = loggedInUser(req).userId;
    const orders = await CustomerOrder.findAll({
      where: {
        user_id: customer_id,

        customer_package_id,
      },
    });

    for (const order of orders) {
      await CustomerOrderItem.destroy({ where: { order_id: order.id } });
    }
    for (const order of orders) {
      await order.destroy();
    }
    //////////////////////////////////////////////////////////////////

    const customerPackage = await CustomerPackage.findOne({
      where: { id: customer_package_id },
    });

    customerPackage.status = 0;
    await customerPackage.save();

    // Setting the customer package subscription end_date= today
    const customerPackageSubscription = await CustomerSubscription.findOne({
      where: { customer_package_id },
    });

    customerPackageSubscription.end_date = new Date();
    await customerPackageSubscription.save();

    res.json({
      message: "Customer Package deleted succesfully!",
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error Getting Order Cancelation Dates",
      success: false,
    });
  }
};

export const getCustomerPaymentMethod = async (req, res) => {
  try {
    const customer_id = loggedInUser(req).userId;
    const paymentMethods = await CustomerPaymentMethod.findOne({
      where: { customer_id },
    });
    let detail = {};
    if (paymentMethods) {
      detail = {
        cardNumber: `${paymentMethods.dataValues.card_number}`.slice(-4),
        id: paymentMethods.id,
        card_type: paymentMethods.dataValues.card_type,
        first_name: paymentMethods.dataValues.first_name,
        last_name: paymentMethods.dataValues.last_name,
      };
    }
    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};
export const updateCustomerPaymentMethod = async (req, res) => {
  try {
    const customer_id = loggedInUser(req).userId;
    const paymentMethods = await CustomerPaymentMethod.findOne({
      where: { customer_id },
    });
    let detail = {};
    if (paymentMethods) {
      paymentMethods.card_number = req.body.cardNumber;
      paymentMethods.first_name = req.body.first_name;
      paymentMethods.last_name = req.body.last_name;
      paymentMethods.cvv = req.body.cvv;
      paymentMethods.expiry_month = req.body.expiry_month;
      paymentMethods.expiry_year = req.body.expiry_year;
      await paymentMethods.save();
    }
    res.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};
export const getCustomerDeliveryAddress = async (req, res) => {
  try {
    const vendor_id = req.params.id;
    const customer_id = loggedInUser(req).userId;
    const customerAddresses = await CustomerDeliveryAddress.findAll({
      where: { customer_id },
      include: [{ model: CitiesAll }],
    });
    const vendorLocations = await VendorLocations.findAll({
      where: { vendor_id },
      include: [{ model: VendorLocationPostalRegions }],
    });
    let vendorPostalRegionIds = [];
    vendorLocations.forEach((location) =>
      location.dataValues.VendorLocationPostalRegions.forEach((postal) =>
        vendorPostalRegionIds.push(parseInt(postal.dataValues.postal_region_id))
      )
    );
    console.log(vendorPostalRegionIds);
    const filteredCustomerAddresses = customerAddresses.filter((address) =>
      vendorPostalRegionIds.includes(address.dataValues.postal_region_id)
    );
    const notMatchedAddresses = customerAddresses.filter(
      (address) =>
        !vendorPostalRegionIds.includes(address.dataValues.postal_region_id)
    );
    // console.log(filteredCustomerAddresses[0]?.postal_region_id);
    res.json({
      success: true,
      data: filteredCustomerAddresses,
      notMatched: notMatchedAddresses,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};

export const updateCustomerPackageAddressByCustomer = async (req, res) => {
  try {
    const customer_id = loggedInUser(req).userId;
    const customerPackage = await CustomerPackage.findOne({
      where: { id: req.body.id },
    });
    (customerPackage.customer_delivery_address_id = req.body.address_id),
      await customerPackage.save();
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error,
      success: false,
    });
  }
};

export const getCustomerBillingInfo = async (req, res) => {
  try {
    const id = loggedInUser(req).userId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * limit;
    const getData = await VendorCustomerPaymentLog.findAll({
      limit: limit,
      offset: offset,
      order: [["payment_date", "DESC"]],
      where: { customer_id: id },

      include: [
        {
          model: Plans,
        },
        {
          model: CustomerPackage,
          include: [{ model: VendorPackage }, { model: VendorPackagePrice }],
        },
        {
          model: Vendor,
          attributes: ["vendor_name"],
        },
      ],
    });
    const count = await VendorCustomerPaymentLog.findAll({
      include: [
        {
          model: Plans,
        },
      ],
    });

    const totalPages = Math.ceil(count.length / limit);

    res
      .status(200)
      .send({ success: true, data: getData, totalPages: totalPages });
  } catch (error) {
    console.log("Error " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
