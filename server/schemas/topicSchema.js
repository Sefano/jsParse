import mongoose, { model } from "mongoose";
import subCatSchema from "./subCatSchema.js";
import thanksSchema from "./thanksSchema.js";

const topicSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: String },
  registerDate: { type: String },
  description: { type: String },
  magnetLink: { type: String },
  size: { type: String },
  torrentLink: { type: String },
  thanks: { type: [thanksSchema.schema] },
});

export default model("topicSchema", topicSchema);
