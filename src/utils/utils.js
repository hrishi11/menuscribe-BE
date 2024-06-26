import jwt from "jsonwebtoken";
const invalidTokens = new Set();

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  // res.cookie('jwt', token, {
  //     httpOnly: true,
  //     secure: process.env.NODE_ENV !== 'development',
  //     sameSite: 'strict',
  //     maxAge: 30 * 24 * 60 * 60 * 100,
  // });
  return token;
};

export const invalidateToken = (token) => {
  // Add the token to the set of invalid tokens
  invalidTokens.add(token);
};

export const isTokenValid = (token) => {
  // Check if the token is in the set of invalid tokens

  return !invalidTokens.has(token);
};

export default generateToken;
