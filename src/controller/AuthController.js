import { Op } from 'sequelize';
import crypto from 'crypto';
import asyncHandler from "express-async-handler";
import generateToken, { invalidateToken } from "../utils/utils.js";
import {
    UserVendor,
    UserCustomer
} from '../config/Models/relations.js';

// Function to find a user by email
function hashPassword(password) {
    return crypto.createHash('md5').update(password).digest('hex');
}

function matchPassword(user, password) {
    const hashedPassword = hashPassword(password);
    return user.password === hashedPassword;
}

export const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserVendor.findOne({
            where: {
                [Op.or]: [{ email }, { phone: email }],
            },
        });
        if (user && matchPassword(user, password)) {
            const token = generateToken(res, user.id);
            res.status(201).json({
                status: 'success',
                id: user.id,
                email: user.email,
                type: 'admin',
                token: token

            });
        } else {
            res.status(500).json({ status: 'failed', error: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error fetching login details:', error.stack);
        res.status(500).json({ status: 'failed', error: 'Internal Server Error' });
    }
});

export const logoutUser = asyncHandler(async (req, res) => {

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (token) {
        invalidateToken(token);
       // return res.json({ message: 'Logout successful' });
        return res.status(200).json({ message: 'User is Logeed out.' });

    }

    res.status(400).json({ error: 'Invalid request' });


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
            res.status(201).json({
                success: true,
                id: user.id,
                email: user.email,
                type: 'customer',
                token: token
            });
        } else {
            res.status(500).json({ status: 'failed', error: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error fetching login details:', error.stack);
        res.status(500).json({ status: 'failed', error: 'Internal Server Error' });
    }
});

export const refreshToken = asyncHandler(async (req, res) => {
    const refreshToken = req.body.refreshToken;
  
    // Check if refreshToken is present
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is missing' });
    }
  
    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  
      // TODO: Check if the user with the userId from decoded data exists in your database
      // If not, return an error
  
      // Generate a new access token
      const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, {
        expiresIn: '15m', // You can adjust the expiration time
      });
  
      res.json({ token: newAccessToken });
    } catch (err) {
      console.error(err);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  });
