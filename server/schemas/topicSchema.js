import mongoose, { model } from "mongoose";
import subCatSchema from "./subCatSchema.js";

const topicSchema = new mongoose.Schema({
  title: { type: String },
  author: { type: String },
  registerDate: { type: String },
  description: { type: String },
  magnetLink: { type: String },
  size: { type: String },
  torrentLink: { type: String },
  thanks: [
    {
      username: String,
      date: String,
    },
  ],
});

export default model("topicSchema", topicSchema);
