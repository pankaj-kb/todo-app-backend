import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = await req.header("Authorization")?.replace("Bearer ", "");
        console.log("token at 10: ", token)

        if (!token) {
            throw new APIError(401, "Unauthorized request");
        }

        const decodedToken = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken)

        const findUserById = async (userId) => {
            return await User.findById(userId).select("-password -refreshToken")
        };

        const user = await findUserById(decodedToken?._id);

        if (!user) {
            throw new APIError(401, "Authentication Error.");
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        throw new APIError(401, error?.message || "Invalid Access token");
    }
});
