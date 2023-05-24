const { sendResponse, AppError } = require("../helpers/utils.js");
const { body, validationResult, param } = require("express-validator");

const user = require("../models/User.js");
const mongoose = require("mongoose");
const validFilters = require("../constant/index.js");

const userController = {};

//Create a user
userController.createUser = [
  body("name").notEmpty().isString().withMessage("Name (String) is required"),
  body("name").custom(async (value) => {
    const existingUser = await user.findOne({ name: value });
    if (existingUser) {
      throw new AppError(400, "Name already in use", "Validation Error");
    }
  }),
  async (req, res, next) => {
    //Express-validator error handling
    const errors = validationResult(req);

    try {
      const { name, role } = req.body;
      if (!errors.isEmpty()) {
        throw new AppError(
          "400",

          errors.array().map((e) => e.msg)[0],
          "Validation Error"
        );
      }

      //mongoose query
      const created = await user.create({ name, role });

      sendResponse(
        res,
        200,
        true,
        created,
        null,
        `Create user ${name} Success`
      );
    } catch (err) {
      next(err);
    }
  },
];
// Get all user
userController.getAllUsers = async (req, res, next) => {
  try {
    const { page = 0, limit = 20, ...filterQuery } = req.query;
    parsedPage = parseInt(page);
    parsedLimit = parseInt(limit);
    const isValidQuery = Object.keys(filterQuery).every((element) =>
      validFilters.includes(element)
    );
    if (!isValidQuery) {
      sendResponse(res, 200, true, [], null, `Find All User Success`);
    }
    const data = await user
      .find(filterQuery)
      .populate("tasks")
      .skip(page)
      .limit(limit);

    sendResponse(res, 200, true, data, null, `Find All User Success`);
  } catch (error) {
    next(error);
  }
};

userController.getUserById = [
  param("id")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid user ID"),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const isValidId = mongoose.Types.ObjectId.isValid(id);
      if (!isValidId) {
        return sendResponse(
          res,
          400,
          false,
          null,
          "Bad Request",
          "Invalid user ID"
        );
      }

      const data = await user.findById(id).populate("tasks");

      if (!data) {
        return sendResponse(
          res,
          404,
          false,
          null,
          "Not Found",
          `User not found with ID: ${id}`
        );
      }

      sendResponse(res, 200, true, data, null, `Found user with ID: ${id}`);
    } catch (err) {
      next(err);
    }
  },
];

userController.assignTask = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all
  try {
    const { id } = req.params;
    const { tasks, unassign } = req.body;
    console.log("console logging tasks: ", tasks);
    const userData = await user.findById(id);
    console.log("console userData tasks: ", userData);
    if (!userData) {
      sendResponse(res, 400, false, null, "Find Error", `User Not Found`);
    }
    //mongoose query
    // const userData = await user.findByIdAndUpdate({ id },{tasks: })
    if (!unassign) {
      userData.tasks = tasks;
    } else {
      userData.tasks = userData.tasks.filter(
        (task) => !tasks.includes(task._id.toString())
      );
    }
    await userData.save();
    console.log("Updated tasks:", userData.tasks);
    sendResponse(
      res,
      200,
      true,
      userData,
      null,
      `Updated Tasks for user with ID: ${id}`
    );

    //this to query data from the reference and append to found result.
  } catch (err) {
    next(err);
  }
};
// export
module.exports = userController;
