const { sendResponse, AppError } = require("../helpers/utils.js");
const { body, validationResult } = require("express-validator");
const Task = require("../models/Task.js");
const mongoose = require("mongoose");

const TaskController = {};
//Create a Task
TaskController.createTask = [
  body("name").notEmpty().withMessage("Name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  async (req, res, next) => {
    // Express-validator error handling
    const errors = validationResult(req);
    try {
      const { ...info } = req.body;
      if (!errors.isEmpty()) {
        const errorMessages = errors
          .formatWith((error) => error.msg)
          .array()[0];
        return sendResponse(
          res,
          400,
          false,
          null,
          "Validation Error",
          errorMessages
        );
      }

      const existingName = await Task.findOne({ name: info.name });
      if (existingName) {
        return sendResponse(
          res,
          402,
          false,
          null,
          "Bad Request",
          `Task with name: ${info.name} already exists!`
        );
      }
      // Mongoose query
      const created = await Task.create(info);

      return sendResponse(
        res,
        200,
        true,
        created,
        null,
        `Create Task ${info.name} Success`
      );
    } catch (err) {
      next(err);
    }
  },
];

//Get all Task
TaskController.getAllTasks = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all
  try {
    const { sortBy, orderBy, name, status, isDeleted } = req.query;
    let filter = {};
    console.log(name, status);
    let data;
    let order;
    if (orderBy === "ascending") {
      order = 1;
    } else {
      order = -1;
    }

    if (name) {
      filter.name = name;
    }
    if (status) {
      filter.status = status;
    }
    //mongoose query
    if (sortBy) {
      data = await Task.find({
        name: name,
        status: status,
        isDeleted: false,
      }).sort({
        sortBy: order,
      });
    } else {
      data = await Task.find(filter);
      sendResponse(res, 200, true, data, null, "Found list of Tasks success");
    }
  } catch (err) {
    next(err);
  }
};
TaskController.getTaskById = async (req, res, next) => {
  //in real project you will getting condition from from req then construct the filter object for query
  // empty filter mean get all

  try {
    let { id } = req.params;
    const isIdValid = mongoose.Types.ObjectId.isValid(id);

    if (!isIdValid) {
      sendResponse(res, 404, false, null, "Bad Request", "ID invalid");
      return;
    }
    let filter = {};
    if (id) {
      filter = id;
    }
    //mongoose query
    const data = await Task.findById(filter).populate("assignee");
    if (!data) {
      sendResponse(res, 404, false, null, "Not Found", "Task not found");
      return;
    }
    //this to query data from the reference and append to found result.

    sendResponse(res, 200, true, data, null, `Found task with ${id}`);
  } catch (err) {
    next(err);
  }
};

//Update a Task
TaskController.updateTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, softDelete } = req.body;
    // dont find task that is archived
    const taskToUpdate = await Task.findOne({
      _id: id,
      status: { $ne: "archive" },
    });
    if (softDelete) {
      taskToUpdate.isDeleted = true;
      console.log(
        "🚀 ~ file: task.controllers.js:124 ~ TaskController.updateTaskById= ~ taskToUpdate:",
        taskToUpdate
      );
    } else {
      if (!taskToUpdate) {
        return sendResponse(
          res,
          404,
          false,
          null,
          "Not Found",
          "Task not found"
        );
      }

      if (taskToUpdate.status === "done" && status !== "archive") {
        return sendResponse(
          res,
          400,
          false,
          null,
          "Validation Error",
          "When the status is set to done, it can't be changed to other value except archive"
        );
      }

      taskToUpdate.status = status;
    }

    const updatedTask = await taskToUpdate.save();

    return sendResponse(
      res,
      200,
      true,
      updatedTask,
      null,
      "Update Task success"
    );
  } catch (err) {
    next(err);
  }
};

//Delete Task
TaskController.deleteTaskById = async (req, res, next) => {
  //in real project you will getting id from req. For updating and deleting, it is recommended for you to use unique identifier such as _id to avoid duplication
  const { id } = req.params;
  // empty target mean delete nothing
  const targetId = null;
  //options allow you to modify query. e.g new true return lastest update of data
  const options = { new: true };
  try {
    //mongoose query
    const updated = await Task.findByIdAndDelete(targetId, options);

    sendResponse(
      res,
      200,
      true,
      { data: updated },
      null,
      "Delete Task success"
    );
  } catch (err) {
    next(err);
  }
};
//export
module.exports = TaskController;
