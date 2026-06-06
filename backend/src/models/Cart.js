import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
  itemCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Middleware для пересчёта totals перед сохранением
cartSchema.pre('save', function(next) {
  // Если корзина пустая, пропускаем обновление totals
  if (this.items.length === 0) {
    this.totalAmount = 0;
    this.itemCount = 0;
    return next();
  }

  // Получаем все товары из корзины
  const Product = mongoose.model('Product');
  const productIds = this.items.map(item => item.productId);
  
  Product.find({ id: { $in: productIds } })
    .then(products => {
      // Создаём мапу для быстрого доступа
      const productMap = new Map(products.map(p => [p.id, p]));

      // Пересчитываем totals
      let totalAmount = 0;
      let itemCount = 0;

      this.items.forEach(item => {
        const product = productMap.get(item.productId);
        if (product) {
          totalAmount += product.price * item.quantity;
          itemCount += item.quantity;
        }
      });

      this.totalAmount = totalAmount;
      this.itemCount = itemCount;

      next();
    })
    .catch(error => {
      next(error);
    });
});

// Метод для получения полной информации о корзине
cartSchema.methods.getFullCart = async function() {
  const Product = mongoose.model('Product');
  const productIds = this.items.map(item => item.productId);
  const products = await Product.find({ id: { $in: productIds } });
  
  const productMap = new Map(products.map(p => [p.id, p]));
  
  const items = this.items.map(item => {
    const product = productMap.get(item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: product ? product.toJSON() : null,
      subtotal: product ? product.price * item.quantity : 0,
    };
  }).filter(item => item.product !== null);

  return {
    id: this._id,
    userId: this.userId,
    items,
    totalAmount: this.totalAmount,
    itemCount: this.itemCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Cart', cartSchema);
