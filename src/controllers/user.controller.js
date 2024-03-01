import { asyncHandler } from "../utils/asyncHandler.js"
import { APIResponse } from "../utils/APIResponse.js"
import { APIError } from "../utils/APIError.js"
import { User } from "../models/user.model.js"
import { Todo } from "../models/todo.model.js"

// const options = {
//     httpOnly: true,
//     secure: true,
// }

const generateAccessTokenAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

    } catch (error) {
        throw new APIError(500, "Something went wrong while generating tokens for user.")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { fullName, email, username, password } = req.body;

    const requiredFields = [fullName, email, username, password];

    if (requiredFields.some((field) => field === undefined || field.trim() === "")) {
        console.log("Fields:", requiredFields);
        throw new APIError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new APIError(409, "User already exists")
    }

    const user = await User.create({
        fullName,
        email,
        username: username.toLowerCase(),
        password,
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new APIError(500, "Something went wrong while registering the user")
    }

    return res
        .status(201)
        .json(new APIResponse(200, createdUser, "User is registered Successfully."))

})

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new APIError(400, "Username or Email is required.")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new APIError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new APIError(404, "Password is not valid")
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
        .status(200)
        .json(new APIResponse(200,
            loggedInUser, accessToken, refreshToken
        ))
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, {
        $unset: {
            refreshToken: 1
        }
    },
        {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new APIResponse(200, {}, "User is logged out successfully.")
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {
    if (!req.user) {
        throw new APIError(404, "User is not logged in")
    }

    const user = req.user

    return res
        .status(200)
        .json(new APIResponse(200, user, "User fetched Successfully."))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getTodos
}