import mongoose from 'mongoose'

const subcategorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    productIds: {
      type: [String],
      default: [],
    },
    isAllCategory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Subcategory = mongoose.model('Subcategory', subcategorySchema)

export default Subcategory
