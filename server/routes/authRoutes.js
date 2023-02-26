const express = require("express");
const route = express.Router();
const {
  registerUser,
  loginUser,
  getAllUser,
  getaUser,
  deleteUser,
  updateUser,
  blockUser,
  unBlockUser,
  handleRefreshToken,
} = require("../controller/userController");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

route.post("/register", registerUser);
route.post("/login", loginUser);
route.get("/refresh", handleRefreshToken);
route.put("/user-edit", authMiddleware, updateUser);
route.get("/all-users", getAllUser);
route.get("/:id", authMiddleware, isAdmin, getaUser);
route.delete("/user-delete", authMiddleware, deleteUser);
route.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
route.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

module.exports = route;
