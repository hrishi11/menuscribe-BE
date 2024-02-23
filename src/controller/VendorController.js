import { Sequelize, Op } from "sequelize";
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
} from "../config/Models/relations.js";
import multer from "multer";
import path from "path";
import Helper from "../utils/Helper.js";
import { loggedInUser } from "../middleware/Auth.js";
import { log } from "console";

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

export const getCustomers = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const results = await UserCustomer.findAll({
      where: { vendor_id: loggedInUserId },
      order: [["id", "DESC"]],
      include: [
        {
          model: CustomerPackage,
          attributes: ["id"],
          include: [
            {
              model: VendorPackage,
              attributes: ["id", "package_name"],
            },
          ],
        },
      ],
      subQuery: false, // Disable subquery to make GROUP BY work in the main query
      group: ["UserCustomer.id"],
    });
    res.status(200).json({ success: true, data: results });
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
    const vendor = await Vendor.findOne({
      where: { id: loggedInUserId },
    });

    const locations = await VendorLocations.findAll({
      where: { vendor_id: vendor.id },
    });

    const result = {
      ...vendor.dataValues,
      locations: { ...locations },
    };

    res.status(200).json({ message: "OK", success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Error fetching vendor", error });
  }
};

export const setVendor = async (req, res) => {
  try {
    const { id, vendor_name } = req.body;    
    const vendor = await Vendor.findByPk(id);
    vendor.vendor_name = vendor_name;
    vendor.save();
    res
      .status(200)
      .json({
        message: "vendor data updated success fully",
        success: true,
        data: vendor,
      });
  } catch (error) {
    res.status(500).json({ message: "error Setting vendor", success: false });
  }
};

export const setVendorLocation = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const reqBody = req.body;

    const locations = await VendorLocations.findAll({
      where: { vendor_id: loggedInUserId },
    });
    const isGonnaUpdate = locations.filter((l) => l.id === req.body.id);
    if (isGonnaUpdate.length > 0) {
      const location = await VendorLocations.findByPk(isGonnaUpdate[0].id);
      const { location_name, address, city_id } = reqBody;

      location.location_name = location_name;
      location.address = address;
      location.city_id = city_id;

      location.save();
      res
        .status(200)
        .json({
          message: "Vendor location updated successfully",
          success: true,
          data: location,
        });
    } else {
      const { location_name, address, city_id, vendor_id } = reqBody;
      const locationSet = await VendorLocations.create({
        location_name,
        address,
        city_id,
        vendor_id,
      });
      res
        .status(200)
        .json({
          message: "Vendor location save successfully",
          success: true,
          data: locationSet,
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error on saving vendor location", success: false });
  }
};

export const getDeliveriesByCreateDate = async (req, res) => {
  try {
    const { created_date } = req.body;
    const userDateObj = new Date(created_date);
    console.log(userDateObj.getDate());
    const loggedInUserId = loggedInUser(req);
    const results = await CustomerOrder.findAll({
      where: { is_ready: 1 },
      include: [
        {
          model: UserCustomer,
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
        },
        //
      ],
    });
    let finalResult = [];
    for (let result of results) {
      // console.log(typeof result.created_date)
      const { created_date: currentDateObj } = result;
      const dateMatch =
        (currentDateObj.getFullYear() === userDateObj.getFullYear()) &
        (currentDateObj.getMonth() === userDateObj.getMonth()) &
        (currentDateObj.getDate() === userDateObj.getDate());

      // console.log(currentDateObj.getFullYear() , userDateObj.getFullYear())
      // console.log(currentDateObj.getMonth() , userDateObj.getMonth())
      // console.log(currentDateObj.getDate() , userDateObj.getDate()+1)

      if (dateMatch) {
        finalResult.push(result);
        // console.log(result);
      }
    }
    res.status(200).json({ success: true, data: finalResult });
  } catch (error) {
    console.log("Error fetching customer_order: " + error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      error_details: error,
    });
  }
};

export const setDelivered = async (req, res) => {
  try {
    const data = req.body;
    let order = await CustomerOrder.findByPk(data.id);
    if (!order) {
      return res.status(404).json({ error: "Order didn't found" });
    }
    order.is_delivered = data.is_delivered;
    await order.save();
    res.status(200).json({
      sucss: true,
      message: "order delevery updated sucssfully",
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

export const getPackages = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    // const loggedInUserData = await UserCustomer.findOne({
    //   where: { id: loggedInUserId },
    // });
    const results = await VendorPackage.findAll({
      where: { vendor_id: loggedInUserId },
      include: [
        {
          model: VendorPackageDefaultItem,
        },
        {
          model: VendorPackagePrice,
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
    const results = await VendorPackage.findOne({
      include: [
        {
          model: VendorPackageDefaultItem,
          include: [
            {
              model: VendorMenuItems,
            },
            // {
            //   model: VendorPackageMenuItems,
            // },
          ],
        },
        {
          model: VendorPackageCities,
          include: [
            {
              model: CitiesActive,
              attributes: ["id", "city_name"],
            },
          ],
        },
        {
          model: VendorPackagePrice,
        },
      ],
      where: { id: id, vendor_id: loggedInUserId },
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching packages: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addItem = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    upload.single("file")(req, res, async (err) => {
      const imageBuffer = req.file ? req.file.buffer : "";
      const itemData = req.body;
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({ error: "File upload failed" });
      }
      const quantity = Helper.getStringCount(itemData.item_quantity);
      const item = await VendorMenuItems.create({
        vendor_id: loggedInUserId,
        item_name: itemData.item_name,
        quantity: quantity,
        units: itemData.units,
        item_category: itemData.item_category,
        veg: itemData.veg,
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
          measure: itemData.unit,
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

export const getItems = async (req, res) => {
  try {
    const loggedInUserId = loggedInUser(req);
    const results = await VendorMenuItems.findAll({
      where: { vendor_id: loggedInUserId },
    });
    res.status(200).json({ success: true, data: results });
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
      existingItem.veg = itemData.veg ? "v" : "o";
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
      package_id: itemData.package_id,
      item_name: itemData.item_name,
      status: 1,
    });

    res.status(200).json({ success: true, data: item.id });
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

export const savePackage = async (req, res) => {
  try {
    const packageData = req.body;
    const loggedInUserId = loggedInUser(req);

    // Check if packageData.id exists
    if (packageData.id) {
      // Update existing record
      const existingPackage = await VendorPackage.findByPk(packageData.id);

      if (!existingPackage) {
        return res.status(404).json({ error: "Package not found" });
      }

      // Update the existing package
      await existingPackage.update({
        package_name: packageData.package_name,
        pickup: packageData.pickup === true || packageData.pickup === 1 ? 1 : 0,
        delivery:
          packageData.delivery === true || packageData.delivery === 1 ? 1 : 0,
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

      // Update package prices
      await updatePackagePrices(packageData);

      return res
        .status(200)
        .json({ success: true, data: { id: existingPackage.id } });
    }

    // Create a new record
    const packageCreate = await VendorPackage.create({
      vendor_id: loggedInUserId,
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
  const frequencies = ["single", "weekly", "monthly"];
  console.log("p data", packageData);
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

export const getDefaultItems = async (req, res) => {
  try {
    const { id } = req.params;
    const results = await VendorPackageDefaultItem.findAll({
      where: { package_id: id },
      include:[
        {
          model:VendorMenuItems
        }
      ]
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
      nextObject.date = days.Date;
      nextObject.day = days.Day;
      let itemsRecord = [];

      //let itemRelatedRecord = [];
      for (const defaultItem of results) {
        // results.forEach(async (defaultItem) => {
        let itemData = { ...defaultItem.dataValues };
        // let itemData = { ...defaultItem };
        //if (defaultItem.id === 2) {
        //const groupItem = getDefaultGroupItem(defaultItem.id, days.Date);
        const package_menu_item = await VendorPackageMenuItems.findOne({
          where: {
            menu_group_id: defaultItem.id,
            menu_date: days.Date,
            is_default_linked: true,
          },
          include: {
            model: VendorMenuItems,
          },
        });
        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
          //itemRelatedRecord.push(package_menu_item);
        }

        // console.log('date', days.Date)
        // console.log('d id', defaultItem.id)
        //itemData.defaultItem = defaultItem;

        // if (package_menu_item) {
        //  // itemData.package_menu_item = package_menu_item;
        //   //console.log("pmi", package_menu_item.menu_date)
        //   // console.log(package_menu_item)
        //   //defaultItem.VendorPackageMenuItem = package_menu_item;
        // }

        //}
        //console.log("item data", itemData)
        itemsRecord.push(itemData);
        //console.log("item record", itemsRecord)
      }

      const vendorAddedPackageItems = await VendorPackageMenuItems.findAll({
        where: {
          package_id: id,
          menu_date: days.Date,
          menu_group_id: 0,
        },
        include:[
          {
            model:VendorMenuItems
          }
        ]
      });
      console.log('vendorAddedPackageItems',vendorAddedPackageItems)
      let vendorPackageRecords = [];

      for (const defaultItem of vendorAddedPackageItems) {
        // results.forEach(async (defaultItem) => {
        let itemData = {
          id: defaultItem.id,
          package_id: defaultItem.package_id,
          item_name: defaultItem.menu_item_name,
          item_id: defaultItem.menu_item_id,
          status: 1,
          is_default_linked: false,
          VendorMenuItem:defaultItem.VendorMenuItem
        };
        //if (defaultItem.id === 2) {
        //const groupItem = getDefaultGroupItem(defaultItem.id, days.Date);
        const package_menu_item = await VendorPackageMenuItems.findOne({
          where: {
            menu_group_id: defaultItem.id,
            menu_date: days.Date,
            is_default_linked: false,
          },
          include: {
            model: VendorMenuItems,
          },
        });
        if (package_menu_item) {
          itemData.itemRelated = package_menu_item;
        }
        vendorPackageRecords.push(itemData);
      }
      itemsRecord = itemsRecord.concat(vendorPackageRecords);
      nextObject.defaultItem = itemsRecord;
      //nextObject.itemRelated = itemRelatedRecord;
      resultsArr.push(nextObject);
    }

    res.status(200).json({ success: true, data: resultsArr });
  } catch (error) {
    console.log("Error fetching default items: " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getDefaultGroupItem(id, date) {
  const package_menu_item = await VendorPackageMenuItems.findAll({
    // where: {
    //   menu_group_id: id,
    //   menu_date: date,
    // }
  });
  return package_menu_item; //Helper.isObjectEmpty(package_menu_item) ? package_menu_item : [];
}

export const addItemToDay = async (req, res) => {
  try {
    const itemData = req.body;
    const selectedItem = await VendorMenuItems.findOne({
      where: { id: itemData.item_selected },
    });
    console.log(itemData, "DATA, DATA\n", "selectedItem\n", selectedItem);
    const item = await VendorPackageMenuItems.create({
      package_id: itemData.package_id,
      menu_item_id: itemData.item_selected,
      menu_item_name: selectedItem.item_name,
      menu_group_id: itemData.adOrid !== "" ? itemData.adOrid : 0,
      is_default_linked: itemData.is_default_linked,
      package_name: itemData.package_name,
      quantity: selectedItem.quantity,
      menu_date: itemData.date,
      sort_id: itemData.sort !== "" ? itemData.sort : 0,
    });

    res.status(200).json({ success: true, data: item.id });
  } catch (error) {
    // console.log('Error fetching default items: ' + error);
    res.status(500).json({ error: "Internal Server Error", dataError: error });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const data = req.body;
    const currentDate = new Date(data.selected_date);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    const currentDay = Helper.formatDate(currentDate);
    const dayAbbreviated = Helper.getAbbreviatedDayName(currentDay.dayName);

    const loggedInUserId = loggedInUser(req);
    const results = await UserCustomer.findAll({
      include: [
        {
          model: CustomerPackage,
          where: { payment_status: 1 },
          include: [
            {
              model: VendorPackage,
              where: { [dayAbbreviated]: 1 },
              include: [
                {
                  model: VendorPackageDefaultItem,
                  include: [
                    {
                      model: VendorPackageMenuItems,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      where: {
        vendor_id: loggedInUserId,
      },
    });

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.log("Error fetching customer orders : " + error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getOrderSummary = async (req, res) => {
  try {
    const data = req.body;

    const currentDate = new Date(data.selected_date);
    const formattedDate = currentDate
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    const formattedNextDay = nextDay
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const currentDay = Helper.formatDate(currentDate);
    const dayAbbreviated = Helper.getAbbreviatedDayName(currentDay.dayName);

    const loggedInUserId = loggedInUser(req);
    // const results = await CustomerOrder.findAll({
    //   include: [
    //     {
    //       model: CustomerOrderItem,
    //       include: [
    //         {
    //           model: VendorMenuItems,
    //         }
    //       ],
    //     },
    //   ],
    //   where: {
    //     vendor_id: loggedInUserId,
    //     delivered_time: {
    //       [Op.gte]: formattedDate,
    //       [Op.lt]: formattedNextDay
    //     }
    //   }
    // });

    const results = await UserCustomer.findAll({
      include: [
        {
          model: CustomerPackage,
          where: { payment_status: 1 },
          include: [
            {
              model: VendorPackage,
              where: { [dayAbbreviated]: 1 },
              include: [
                {
                  model: VendorPackageDefaultItem,
                  include: [
                    {
                      model: VendorPackageMenuItems,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],

      where: {
        vendor_id: loggedInUserId,
      },
    });

    console.log("results", results);
    // Initialize an empty object to store item counts
    const itemCounts = {};

    // // Iterate through the orders array
    for (const order of results) {
      // Extract CustomerOrderItems from each order
      const customerOrderItems =
        order.CustomerPackage.VendorPackage.VendorPackageDefaultItems;

      // Iterate through CustomerOrderItems
      for (const item of customerOrderItems) {
        const itemId = item.item_id;

        // If the itemId is not in itemCounts, initialize it with count 1
        if (!itemCounts[itemId]) {
          itemCounts[itemId] = 1;
        } else {
          // If the itemId is already in itemCounts, increment the count
          itemCounts[itemId]++;
        }
        if (item.VendorPackageMenuItem) {
          const itemId = item.VendorPackageMenuItem.menu_item_id;
          if (!itemCounts[itemId]) {
            itemCounts[itemId] = 1;
          } else {
            // If the itemId is already in itemCounts, increment the count
            itemCounts[itemId]++;
          }
        }
      }
    }

    const itemPromises = Object.keys(itemCounts).map((itemId) =>
      getMenuItem(parseInt(itemId)).then((item) => ({
        item,
        item_id: parseInt(itemId),
        count: itemCounts[itemId],
      }))
    );
    const itemCountArray = await Promise.all(itemPromises);

    res.status(200).json({ success: true, data: itemCountArray });
    //  res.status(200).json({ success: true, data: { results, itemCountArray }});
  } catch (error) {
    console.log("Error fetching customer orders : " + error);
    res.status(500).json({ error: "Internal Server Error" });
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
    console.log(
      `Service Enter - ${req.originalUrl} - ${req.method}`,
      JSON.stringify(req.body)
    );
    const loggedInUserId = loggedInUser(req);
    const packages = await VendorPackage.findAll({
      where: {
        vendor_id: loggedInUserId,
      },
      include: [
        {
          model: VendorPackageFrequency,
          attributes: ["frequency_name"],
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
    // console.log(`Service Enter - ${req.originalUrl} - ${req.method}`, JSON.stringify(req.body));
    const {
      package_id,
      customer_id,
      frequency,
      user_package_name,
      payment_status,
      handling,
      delivery_address_id,
    } = req.body;
    const loggedInUserId = loggedInUser(req);

    //checking for vendor to customer rights
    const customer = await UserCustomer.findOne({
      where: {
        id: customer_id,
      },
    });
    if (customer.vendor_id !== loggedInUserId) {
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
    if (vendorPackage.vendor_id !== loggedInUserId) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }

    const userPackage = await CustomerPackage.create({
      user_id: customer_id,
      package_id: package_id,
      payment_status: payment_status,
      frequency: frequency,
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
    // console.log(`Service Enter - ${req.originalUrl} - ${req.method}`, JSON.stringify(req.body));
    const {
      package_id,
      customer_id,
      frequency,
      user_package_name,
      payment_status,
      handling,
      delivery_address_id,
      customer_package_id
    } = req.body;
    const loggedInUserId = loggedInUser(req);

    //checking for vendor to customer rights
    const customer = await UserCustomer.findOne({
      where: {
        id: customer_id,
      },
    });
    if (customer.vendor_id !== loggedInUserId) {
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
    if (vendorPackage.vendor_id !== loggedInUserId) {
      return res
        .status(401)
        .json({ errors: "You Cannot access this resource" });
    }
    const userPackage = await CustomerPackage.findByPk(customer_package_id)
    if(!userPackage){
      return res
      .status(404)
      .json({ errors: "No Package Found!" });
    }
    package_id && (userPackage.package_id = package_id)
    frequency && (userPackage.frequency = frequency)
    user_package_name && (userPackage.user_package_name = user_package_name)
    payment_status && (userPackage.payment_status = payment_status)
    handling && (userPackage.pickup_delivery = handling)
    delivery_address_id && (userPackage.customer_delivery_address_id = delivery_address_id)

    await userPackage.save()

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

