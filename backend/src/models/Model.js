import mongoose from 'mongoose'

const modelSchema = new mongoose.Schema(
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
    brandId: {
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
  },
  {
    timestamps: true,
  },
)

const Model = mongoose.model('Model', modelSchema)

export default Model
