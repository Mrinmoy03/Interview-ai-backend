const userModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
/**
 * @desc Register a new user expect user model contain user name, email, password, confirm password
 * @route POST /api/auth/register
 * @access public
 */

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const userExists = await userModel.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            if (userExists.email === email) {
                return res.status(400).json({ message: "User already exists with this email address" });
            }
            if (userExists.username === username) {
                return res.status(400).json({ message: "User already exists with this username" });
            }
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashedPassword });
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        })
        res.status(201).json({
            message: "User registered successfully", user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });


    } catch (error) {
        console.error("Error in registerUserController:", error);
        res.status(500).json({ message: "Error registering user", error: error.message, details: error });
    }
}

/**
 * @name loginUserController
 * @description login a user , expects email and password in the body
 * @access public
 * @route POST /api/auth/login
 */

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Invalid email"
            })
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid password"
            })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        })
        res.status(200).json({
            message: "User loggedIn successfully.",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.error("Error in loginUserController:", error);
        res.status(500).json({ message: "Error logging in user", error: error.message, details: error });
    }
}

/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token", { httpOnly: true, sameSite: "none", secure: true })

    res.status(200).json({
        message: "User logged out successfully"
    })
}



/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}




module.exports = { registerUserController, loginUserController, logoutUserController, getMeController };