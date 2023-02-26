const User = require("../models/userModels");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const { validateMongoId } = require("../utils/validateMongodbId");
const jwt = require("jsonwebtoken");

// Register User
const registerUser = asyncHandler(async (req, res) => {
  // first find User has already registered or not
  const email = req.body.email;
  const findUser = await User.findOne({ email });
  if (!findUser) {
    // Create a New User
    const newUser = await User.create(req.body);
    //   await newUser.save();
    res.status(201).json({
      status: "success",
      User: newUser,
    });
  } else {
    // User already Exist
    throw new Error("User Already Exist");
  }
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check user exist or not
  const findUser = await User.findOne({ email });
  if (findUser && (await findUser.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(
      findUser?._id,
      {
        refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
    });
  } else {
    throw new Error("Invalid Credential");
  }
});

// Handle Refresh Token
const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("refresh Token Required for Cookie");
  }
  const refreshToken = cookie?.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    throw new Error("There is No Refresh Token present");
  }
  jwt.verify(refreshToken, process.env.SECRET_KEY, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is Something Wrong With refresh Token");
    }
    const accessToken = generateToken(user?.id);
    res.json({ accessToken });
  });
});

// Update a User
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.user;
  validateMongoId(id);
  try {
    const user = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { new: true }
    );
    res.json({
      status: "success",
      message: "User Updated Successfully",
      user,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a All User
const getAllUser = asyncHandler(async (req, res) => {
  try {
    const getUser = await User.find();
    res.json({
      status: "success",
      Result: getUser.length,
      Users: getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Get a Single User
const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const getUser = await User.findById(id);
    res.json({
      status: "success",
      user: getUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Delete a User
const deleteUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoId(_id);
  try {
    const deleteUser = await User.findByIdAndDelete(_id);
    if (!deleteUser) {
      throw new Error("User Already Deleted");
    }
    res.json({
      status: "success",
      message: "User Deleted Successfully",
      user: deleteUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Block-User
const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const block = await User.findByIdAndUpdate(
      id,
      { isBlocked: true },
      { new: true }
    );
    res.json({
      message: "User Blocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

// Unblock-User
const unBlockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const unBlock = await User.findByIdAndUpdate(
      id,
      { isBlocked: false },
      { new: true }
    );
    res.json({
      message: "User Unblocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  getAllUser,
  getaUser,
  deleteUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
};
