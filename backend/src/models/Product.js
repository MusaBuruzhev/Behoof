import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
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
    priceHistory: {
      type: [{
        date: {
          type: Date,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length > 0;
        },
        message: 'История цен не может быть пустой'
      }
    },
    description: {
      type: String,
      default: '',
    },
    characteristics: {
      type: [{
        trait: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          default: '',
        },
      }],
      default: [],
    },
    brand: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    subcategoryId: {
      type: String,
      required: true,
    },
    modelId: {
      type: String,
      required: true,
    },
    traitRatings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length >= 1 && arr.length <= 10;
        },
        message: 'Количество изображений должно быть от 1 до 10'
      }
    },
reviews: {
      type: [{
        userId: {
          type: String,
          required: true,
        },
        userName: {
          type: String,
          required: true,
        },
        userAvatar: {
          type: String,
          default: null,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 2000,
        },
        traitRatings: {
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    sku: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

productSchema.virtual('price').get(function() {
  if (this.priceHistory && this.priceHistory.length > 0) {
    const sortedHistory = this.priceHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
    return sortedHistory[0].price;
  }
  return 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema)

export default Product
