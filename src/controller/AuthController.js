import { Op, where } from "sequelize";
import crypto from "crypto";
import asyncHandler from "express-async-handler";
import generateToken, { invalidateToken } from "../utils/utils.js";
import {
  UserVendor,
  UserCustomer,
  Vendor,
  VendorSettings,
  VendorLocations,
  CustomerDeliveryAddress,
  VendorEmployee,
} from "../config/Models/relations.js";
import { Console, log } from "console";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import ejs from "ejs";
import { sendEmail } from "../utils/email.js";
import Helper from "../utils/Helper.js";
import Twilio from "twilio";
import { create } from "domain";
import { VendorRoles } from "../config/Models/VendorModels/VendorRole.js";

// Function to find a user by email
function hashPassword(password) {
  return crypto.createHash("md5").update(password).digest("hex");
}

function matchPassword(user, password) {
  const hashedPassword = hashPassword(password);
  return user.password === hashedPassword;
}

export const authUser = asyncHandler(async (req, res) => {
  const { email, password, vendorEmployeeId } = req.body;
  console.log(req.body);
  try {
    const emp = await VendorEmployee.findOne({
      where: { id: vendorEmployeeId },
      include: [
        {
          model: Vendor,
        },
      ],
    });

    const user = await UserVendor.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }],
      },
      include: [{ model: VendorRoles }],
    });
    // console.log(emp.dataValues.vendor_id);
    if (user && matchPassword(user, password)) {
      const token = generateToken(res, user.id, emp.dataValues.vendor_id);
      res.status(201).json({
        status: "success",
        id: user.id,
        email: user.email,
        type: user.dataValues.VendorRole.role,
        token: token,
      });
    } else {
      res
        .status(500)
        .json({ status: "failed", error: "Invalid username or password." });
    }
  } catch (error) {
    console.error("Error fetching login details:", error.stack);
    res.status(500).json({ status: "failed", error: "Internal Server Error" });
  }
});

async function isCodeVendorUnique(pin) {
  const existingUser = await UserVendor.findOne({
    where: {
      verification_code: pin,
    },
  });
  return !existingUser;
}
export const managerSignup = async (req, res) => {
  try {
    console.log(req.body);

    let pin = Helper.generateRandomPin(6);
    while (!(await isCodeVendorUnique(pin))) {
      pin = Helper.generateRandomPin(6);
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = Twilio(accountSid, authToken);

    const sendSms = await client.messages.create({
      // body: `click the following link to create a new account http://localhost:5173/customer-onboard/${pin}.`,
      body: `Verification code: ${pin}`,
      from: "+16474928950",
      to: "+1" + req.body.phone,
    });

    const findUser = await UserVendor.findOne({
      where: { email: req.body.email },
    });
    if (findUser) {
      return res.status(200).json({
        status: true,
        message: "Manager already exist",
        user: findUser,
      });
    }
    const hashedPassword = hashPassword(req.body.password);
    const newUser = await UserVendor.create({
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      role: "Manager",
    });

    newUser.verification_code = `${pin}`;
    await newUser.save();

    // const emailTamplete = {

    //   code: pin,
    // };
    // const subject = "Verification Code";
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    // const html = await ejs.renderFile(
    //   join(__dirname, "..", "..", "views", "verificaiton-code.ejs"),
    //   emailTamplete
    // );

    // await sendEmail(newUser.email, subject, "hello", html);

    return res.status(200).json({
      status: true,
      message: "Manager saved successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const checkManagerEmail = async (req, res) => {
  try {
    const findUser = await UserVendor.findOne({
      where: { email: req.body.email },
    });
    console.log("req", req.body);
    if (findUser) {
      if (
        findUser.dataValues.verification_code &&
        findUser.dataValues.verification_code != ""
      ) {
        const emailTamplete = {
          code: findUser.dataValues.verification_code,
        };
        const subject = "Verification Code";
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const html = await ejs.renderFile(
          join(__dirname, "..", "..", "views", "verificaiton-code.ejs"),
          emailTamplete
        );

        await sendEmail(findUser.email, subject, "hello", html);
        return res.status(200).json({
          status: false,
          message: "User Already Existed but verification is required",
        });
      }
      return res
        .status(200)
        .json({ status: false, message: "User Already Existed" });
    } else {
      return res.status(200).json({ status: true, message: "user not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
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

export const setCustomerSignup = async (req, res) => {
  try {
    console.log("this", req.body);

    const findUser = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });
    if (findUser) {
      return res.status(200).json({
        status: true,
        message: "Customer number already exist",
        user: findUser,
      });
    }

    let pin = Helper.generateRandomPin(6);
    while (!(await isCodeUnique(pin))) {
      pin = Helper.generateRandomPin(6);
    }
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = Twilio(accountSid, authToken);
    await client.messages.create({
      body: `Verification code: ${pin}`,
      from: "+16474928950",
      to: "+1" + req.body.phone,
    });

    const hashedPassword = hashPassword(req.body.password);
    const newUser = await UserCustomer.create({
      password: hashedPassword,
      phone: req.body.phone,
      city_id: req.body.city_id,
      email: req.body.email || null,
    });

    newUser.verification_code = `${pin}`;
    await newUser.save();

    // const emailTamplete = {

    //   code: pin,
    // };
    // const subject = "Verification Code";
    // const __filename = fileURLToPath(import.meta.url);
    // const __dirname = dirname(__filename);
    // const html = await ejs.renderFile(
    //   join(__dirname, "..", "..", "views", "verificaiton-code.ejs"),
    //   emailTamplete
    // );

    // await sendEmail(newUser.email, subject, "hello", html);

    return res.status(200).json({
      status: true,
      message: "Manager saved successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const resendCustomerOtp = async (req, res) => {
  try {
    const findUser = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });
    if (findUser) {
      let pin = Helper.generateRandomPin(6);
      while (!(await isCodeUnique(pin))) {
        pin = Helper.generateRandomPin(6);
      }
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = Twilio(accountSid, authToken);
      await client.messages.create({
        body: `Verification code: ${pin}`,
        from: "+16474928950",
        to: "+1" + req.body.phone,
      });
      findUser.verification_code = pin;
      await findUser.save();
      return res
        .status(200)
        .json({ status: true, message: "Resend code successfully" });
    } else {
      return res
        .status(200)
        .json({ status: true, message: "Number not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};
export const updateCustomerInfo = async (req, res) => {
  try {
    const findUser = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });

    if (findUser) {
      findUser.first_name = req.body.first_name;
      findUser.last_name = req.body.last_name;
      findUser.email = req.body.email;

      await findUser.save();
      res.status(201).json({
        status: "success",
        message: "Info updated successfully",
        data: findUser,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Not updated internal server error",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const addCustomerAddress = async (req, res) => {
  // console.log("API HIT")
  try {
    const reqBody = req.body;

    const fetchUser = await UserCustomer.findOne({
      where: {
        id: reqBody.id,
      },
    });
    if (reqBody.postal) {
      const postal = await PostalRegions.findOne({
        where: { POSTAL_CODE: reqBody.postal },
      });
      fetchUser.postal_id = postal?.dataValues.id;
    }
    fetchUser.tp_user = 1;
    await fetchUser.save();

    const result = await CustomerDeliveryAddress.create({
      address: reqBody.address,
      delivery_instructions: reqBody.delivery_instructions,
      city_id: parseInt(reqBody.city.id),
      postal: reqBody.postal ? reqBody.postal : "",
      vendor_added: reqBody.vendor_added ? reqBody.vendor_added : 0,
      status: 1,
      address_type: reqBody.address_type,
      customer_id: reqBody.id,
      latitude: reqBody.latitude,
      longitude: reqBody.longitude,
      unit_number: reqBody.unit_number ? reqBody.unit_number : "",
    });
    await result.save();
    res.status(200).json({
      status: true,
      message: "Customer delivery address created successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Faild to save customer address" });
  }
};

export const updateCustomerPhone = async (req, res) => {
  try {
    const findUser = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });
    const checkNumber = await UserCustomer.findOne({
      where: { phone: req.body.newPhone },
    });
    if (checkNumber) {
      return res.status(200).json({ message: "Number already exist" });
    }
    if (findUser) {
      let pin = Helper.generateRandomPin(6);
      while (!(await isCodeUnique(pin))) {
        pin = Helper.generateRandomPin(6);
      }
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const client = Twilio(accountSid, authToken);
      await client.messages.create({
        body: `Verification code: ${pin}`,
        from: "+16474928950",
        to: "+" + req.body.newPhone,
      });
      findUser.verification_code = pin;
      await findUser.save();
      findUser.phone = req.body.newPhone;
      await findUser.save();
      return res.status(201).json({
        status: "success",
        message: "Phone number updated successfully",
        phone: findUser.phone,
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Not updated internal server error",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};
export const verifCustomerOtp = async (req, res) => {
  try {
    console.log(req.body);
    const findUser = await UserCustomer.findOne({
      where: { phone: req.body.phone },
    });
    console.log(findUser.dataValues.verification_code);
    if (
      `${findUser.dataValues.verification_code}` === req.body.verification_code
    ) {
      const token = generateToken(res, findUser.id);
      findUser.verification_code = 0;
      await findUser.save();
      res.status(201).json({
        status: "success",
        id: findUser.id,

        token: token,
        message: "User verified successfully",
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Wrong verification code" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};
export const verifyManagerOtp = async (req, res) => {
  try {
    const findUser = await UserVendor.findOne({
      where: { email: req.body.email },
    });
    console.log(req.body.email);
    console.log(findUser.dataValues.verification_code);
    if (
      `${findUser.dataValues.verification_code}` === req.body.verification_code
    ) {
      const token = generateToken(res, findUser.id);
      findUser.verification_code = 0;
      await findUser.save();
      res.status(201).json({
        status: "success",
        id: findUser.id,
        email: findUser.email,
        type: findUser.role,
        token: token,
        message: "User verified successfully",
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Wrong verification code" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
      error: error,
    });
  }
};
export const logoutUser = asyncHandler(async (req, res) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];

  if (token) {
    invalidateToken(token);
    // return res.json({ message: 'Logout successful' });
    return res.status(200).json({ message: "User is Logeed out." });
  }

  res.status(400).json({ error: "Invalid request" });

  // res.cookie('jwt', '', {
  //     httpOnly: true,
  //     expires: new Date(0),
  // });
  // res.status(200).json({ message: 'User is Logeed out.' });
});

export const customerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserCustomer.findOne({
      where: {
        [Op.or]: [{ email }, { phone: email }],
      },
    });
    if (user && matchPassword(user, password)) {
      const token = generateToken(res, user.id);
      return res.status(201).json({
        success: true,
        id: user.id,
        email: user.email,
        type: "customer",
        token: token,
      });
    } else {
      return res
        .status(500)
        .json({ status: "failed", error: "Invalid username or password." });
    }
    res.json({ status: "succssfull" });
  } catch (error) {
    console.error("Error fetching login details:", error.stack);
    res.status(500).json({ status: "failed", error: "Internal Server Error" });
  }
});
function generateUniqueIdentifier() {
  const timestamp = Date.now().toString().slice(-7); // Extract last 7 digits of current timestamp
  const randomNumber = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0"); // Generate random 7-digit number
  return timestamp + randomNumber;
}

export const sendForgetPasswordMsg = asyncHandler(async (req, res) => {
  try {
    const role = req.body.role;
    let user;
    if (role === "customer") {
      user = await UserCustomer.findOne({
        where: {
          [Op.or]: [{ email: req.body.email }, { phone: req.body.email }],
        },
      });
    } else {
      user = await UserVendor.findOne({
        where: {
          [Op.or]: [{ email: req.body.email }, { phone: req.body.email }],
        },
      });
    }

    if (user) {
      // const findVendor = await UserVendor.findByPk(reqBody.data.user_id);
      user.verification_code = generateUniqueIdentifier().substring(0, 9);

      await user.save();
      const role = req.body.role ? req.body.role : "undefiend";
      const emailTamplete = {
        text: `${user.dataValues.first_name} ${user.dataValues.last_name} click on the link and reset your password`,
        link: `https://menuscribe.com/reset/forgotpassword/${role}/${user.verification_code}`,
      };
      const subject = "Reset your password";
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const html = await ejs.renderFile(
        join(__dirname, "..", "..", "views", "forget-password-template.ejs"),
        emailTamplete
      );

      await sendEmail(req.body.email, subject, "hello", html);

      res.status(201).json({
        success: true,
      });
    } else {
      res.status(500).send({ message: "Email not found" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "failed", error: "Invalid username or password." });
  }
});

export const verifyForgetPasswordLink = asyncHandler(async (req, res) => {
  try {
    const role = req.body.role;
    let user;
    if (role === "customer") {
      user = await UserCustomer.findOne({
        where: {
          [Op.or]: [{ verification_code: req.body.verification_code }],
        },
      });
    } else {
      user = await UserVendor.findOne({
        where: {
          [Op.or]: [{ verification_code: req.body.verification_code }],
        },
      });
    }
    if (
      user &&
      (req.body.verification_code = user.dataValues.verification_code)
    ) {
      res.status(201).json({
        status: "success",
        message: "Enter your Password",
      });
    } else {
      res.status(500).json({ status: "failed", error: "Link is Expired" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", error: "Internal server error" });
  }
});

export const resetForgetPassword = asyncHandler(async (req, res) => {
  try {
    const role = req.body.role ? req.body.role : "null";
    let user;
    if (role === "customer") {
      user = await UserCustomer.findOne({
        where: {
          [Op.or]: [{ verification_code: req.body.verification_code }],
        },
      });
    } else {
      user = await UserVendor.findOne({
        where: {
          [Op.or]: [{ verification_code: req.body.verification_code }],
        },
      });
    }

    if (user) {
      const hashedPassword = hashPassword(req.body.password);
      user.password = hashedPassword;
      await user.save();
      res.status(201).json({
        status: "success",
        message: "Enter your Password",
      });
    } else {
      res
        .status(500)
        .json({ status: "failed", error: "Internal server error" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "failed", error: "Internal server error" });
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken;

  // Check if refreshToken is present
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // TODO: Check if the user with the userId from decoded data exists in your database
    // If not, return an error

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m", // You can adjust the expiration time
      }
    );

    res.json({ token: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid refresh token" });
  }
});
