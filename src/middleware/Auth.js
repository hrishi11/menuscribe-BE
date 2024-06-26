import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { isTokenValid } from "../utils/utils.js";
import { UserVendor, VendorEmployee, VendorEmployeeLocations } from "../config/Models/relations.js";
import { Op } from "sequelize";

export const protect = asyncHandler(async (req, res, next) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  if (!token || !isTokenValid(token)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Token is valid, proceed with the request
  next();
});

export const loggedInUser = (req) => {
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded.userId;
};

export const loggedInUserLocation=async(req)=>{
  const loggedInUserId = loggedInUser(req);

  // const id= req.params.id 
  const vendorUser = await UserVendor.findOne({where:{id:loggedInUserId}, include:[{model:VendorEmployee}]});


  // const loggedInUserData = await UserCustomer.findOne({
  //   where: { id: loggedInUserId },
  // });
  const emp_ids= vendorUser.dataValues.VendorEmployees.map((item)=>item.dataValues.id)
  const locations= await VendorEmployeeLocations.findAll({where:{vendor_employee_id:{
    [Op.in]:[...emp_ids]
  }}})
  const location_id= locations.map((item)=>item.vendor_location_id)
  return location_id
}
