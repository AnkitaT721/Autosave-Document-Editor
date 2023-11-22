const mongoose = require("mongoose");

const docSchema = new mongoose.Schema({
  _id: String,
  data: Object,
});

module.exports = mongoose.model("document", docSchema);
