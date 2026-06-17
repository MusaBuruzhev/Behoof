import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
 {
 id: {
 type: String,
 required: true,
 unique: true,
 },
 userId: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'User',
 required: true,
 },
 items: [{
 productId: {
 type: String,
 required: true,
 },
 name: {
 type: String,
 required: true,
 },
 price: {
 type: Number,
 required: true,
 },
 quantity: {
 type: Number,
 default: 1,
 },
 image: {
 type: String,
 default: '',
 },
 }],
 totalAmount: {
 type: Number,
 required: true,
 },
 status: {
 type: String,
 enum: ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering', 'completed', 'cancelled'],
 default: 'pending',
 },
 deliveryType: {
 type: String,
 enum: ['pickup', 'delivery'],
 default: 'pickup',
 },
 deliveryAddress: {
 type: String,
 default: '',
 },
 pickupDate: {
 type: Date,
 },
 preorderMessage: {
 type: String,
 default: '',
 },
 verificationCode: {
 type: String,
 default: '',
 },
 codeVerified: {
 type: Boolean,
 default: false,
 },
 contactPhone: {
 type: String,
 required: true,
 },
 contactName: {
 type: String,
 required: true,
 },
 isDeleted: {
 type: Boolean,
 default: false,
 },
 deletedAt: {
 type: Date,
 default: null,
 },
 },
 {
 timestamps: true,
 }
);

orderSchema.virtual('isActive').get(function() {
 return ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'].includes(this.status) && !this.isDeleted;
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export default mongoose.model('Order', orderSchema);
