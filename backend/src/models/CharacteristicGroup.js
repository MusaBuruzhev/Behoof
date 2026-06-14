import mongoose from 'mongoose'

const characteristicGroupSchema = new mongoose.Schema(
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
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    traitNames: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length > 0
        },
        message: 'Группа должна содержать хотя бы одну характеристику',
      },
    },
    categoryId: {
      type: String,
      default: null,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const CharacteristicGroup = mongoose.model('CharacteristicGroup', characteristicGroupSchema)

export default CharacteristicGroup