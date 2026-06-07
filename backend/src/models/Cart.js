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
cartSchema.pre('save', async function() {
  try {
    // Если корзина пустая, просто обнуляем
    if (!this.items || this.items.length === 0) {
      this.totalAmount = 0;
      this.itemCount = 0;
      return;
    }

    // Получаем все товары из корзины
    const Product = mongoose.model('Product');
    const productIds = this.items.map(item => item.productId);
    
    if (productIds.length === 0) {
      this.totalAmount = 0;
      this.itemCount = 0;
      return;
    }
    
    const products = await Product.find({ id: { $in: productIds } });
    
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
  } catch (error) {
    console.error('Cart middleware error:', error.message);
    this.totalAmount = 0;
    this.itemCount = 0;
  }
});

// Метод для получения полной информации о корзине
cartSchema.methods.getFullCart = async function() {
  try {
    const Product = mongoose.model('Product');
    const productIds = this.items.map(item => item.productId);
    
    // Если нет товаров, возвращаем пустую корзину
    if (!productIds || productIds.length === 0) {
      return {
        id: this._id,
        userId: this.userId,
        items: [],
        totalAmount: 0,
        itemCount: 0,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }
    
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
  } catch (error) {
    console.error('Ошибка getFullCart:', error.message);
    // Возвращаем базовую информацию о корзине даже при ошибке
    return {
      id: this._id,
      userId: this.userId,
      items: [],
      totalAmount: 0,
      itemCount: 0,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
};

export default mongoose.model('Cart', cartSchema);
