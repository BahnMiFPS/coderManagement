const mongoose = require("mongoose");
//Create schema
const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["manager", "employee"], default: "employee" },
  tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
});
//Create and export model
const User = mongoose.model("User", userSchema);
module.exports = User;
