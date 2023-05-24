const express = require("express");
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  assignTask,
} = require("../controllers/user.controllers.js");

/**
 * @route GET api/users
 * @description Get a list of users
 * @access private
 * @allowedQueries: name
 */
router.get("/", getAllUsers);

/**
 * @route GET api/users/:id
 * @description Get user by id
 * @access public
 */
router.get("/:id", getUserById);

/**
 * @route PUT api/users/:id
 * @description Assign, Unassign task to user with id
 * @access public
 */
router.put("/:id", assignTask);

/**
 * @route POST api/users
 * @description Create a new user
 * @access private, manager
 * @requiredBody: name
 */
router.post("/", createUser);

//export
module.exports = router;
