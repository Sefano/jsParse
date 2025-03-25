import mongoose, { model } from "mongoose";
import subCatSchema from "./subCatSchema.js";

const categorySchema = new mongoose.Schema({
  categoryTitle: { type: String, required: true },
  categoryLink: { type: String, required: true },
  subcategories: { type: [subCatSchema.schema] },
});

export default model("categorySchema", categorySchema);
