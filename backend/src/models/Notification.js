import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['new_order', 'order_status', 'new_product', 'promo'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  relatedId: {
    type: String,
    default: null,
  },
  relatedType: {
    type: String,
    enum: ['order', 'product', null],
    default: null,
  },
}, {
  timestamps: true,
});

// Индекс для быстрого поиска непрочитанных
notificationSchema.index({ userId: 1, isRead: 1, isDeleted: 1, createdAt: -1 });

// Виртуальное поле для определения нового уведомления (до 24 часов)
notificationSchema.virtual('isNew').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffHours = (now - created) / (1000 * 60 * 60);
  return diffHours <= 24 && !this.isRead;
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
