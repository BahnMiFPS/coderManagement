const express = require("express");
const router = express.Router();
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
} = require("../controllers/task.controllers.js");
const { assignTask } = require("../controllers/user.controllers.js");

//Read
/**
 * @route GET api/task
 * @description get list of Tasks
 * @access public
 */
router.get("/", getAllTasks);

/**
 * @route GET api/task/:id
 * @description Get task by id
 * @access public
 */
router.get("/:id", getTaskById);

//Create
/**
 * @route POST api/task
 * @description create a Task
 * @access private
 */
router.post("/", createTask);

//Put
/**
 * @route PUT api/task
 * @description Assign a task to a user or unassign them
 * @access private
 */
router.put("/", assignTask);

/**
 * @route PUT api/task/:id
 * @description Update the status of a task.
 * @access private
 */
router.put("/:id", updateTaskById);

/**
 * @route PUT api/task/:id
 * @description Soft delete a task by id.
 * @access private
 */
router.put("/:id", deleteTaskById);
//export
module.exports = router;
