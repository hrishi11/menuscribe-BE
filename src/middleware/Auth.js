import jwt from 'jsonwebtoken';
import asyncHandler from "express-async-handler";
import { isTokenValid } from "../utils/utils.js";

export const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token || !isTokenValid(token)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    // Token is valid, proceed with the request
    next();
});

export const loggedInUser = (req) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
}