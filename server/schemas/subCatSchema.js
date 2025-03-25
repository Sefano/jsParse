import mongoose, { model } from "mongoose";

const subcategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
});
export default model("subcategorySchema", subcategorySchema);
