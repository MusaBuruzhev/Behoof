import mongoose from 'mongoose'

const brandSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    categoryId: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const Brand = mongoose.model('Brand', brandSchema)

export default Brand
