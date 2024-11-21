import { Request, Response, NextFunction } from "express";
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

interface CustomRequest extends Request {
    userId?: string;
  }

const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized. No token provided." });
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string }; ;
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }

    req.userId = decoded.userId; 
    next();
  } catch (error) {
    console.error("Error while verifying token:", error);
    res.status(401).json({ message: "Unauthorized. Token verification failed." });
  }
};

export default verifyToken;
