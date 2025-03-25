import mongoose, { model } from "mongoose";

const thanksSchema = new mongoose.Schema({
  name: { type: String },
  date: { type: String },
});
export default model("thanksSchema", thanksSchema);
