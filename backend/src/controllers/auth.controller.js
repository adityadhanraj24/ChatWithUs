import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";
import { env } from "../lib/env.js";
import "dotenv/config";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email Already Exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: savedUser._id,
        fullName: savedUser.fullName,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
        friends: savedUser.friends,
        blockedUsers: savedUser.blockedUsers,
      });

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, env.CLIENT_URL);
      } catch (error) {
        console.error("Caught error in auth.controller during sendWelcomeEmail:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid User Data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Creditial" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    generateToken(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
      friends: user.friends,
      blockedUsers: user.blockedUsers,
    });
  } catch (error) {
    console.error("Error in login controller: ", error)
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "development" ? false : true,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) return res.status(400).json({ message: "Profile Pic is required" });

    const userId = req.user._id;

    let secureUrl = profilePic;

    if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY) {
      try {
        const uploadeResponse = await cloudinary.uploader.upload(profilePic);
        secureUrl = uploadeResponse.secure_url;
      } catch (uploadError) {
        console.warn("Cloudinary upload failed:", uploadError.message);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: secureUrl }, { new: true }).select("-password");
    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in update profile:", error);
    res.status(500).json({ message: "Internal server error: " + error.message });
  }
};