import mongoose from 'mongoose'

const characteristicValueSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    groupId: {
      type: String,
      required: true,
      index: true,
    },
    traitName: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    normalizedValue: {
      type: String,
      default: '',
    },
    unit: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

characteristicValueSchema.index({ groupId: 1, traitName: 1 })

const CharacteristicValue = mongoose.model('CharacteristicValue', characteristicValueSchema)

export default CharacteristicValue