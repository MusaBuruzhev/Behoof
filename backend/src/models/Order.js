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
 productId: {
 type: String,
 required: true,
 },
 status: {
 type: String,
 enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
 default: 'pending',
 },
 pickupAt: {
 type: Date,
 required: true,
 },
 contactPhone: {
 type: String,
 default: '',
 },
 comment: {
 type: String,
 default: '',
 },
 },
 {
 timestamps: true,
 }
);

export default mongoose.model('Order', orderSchema);
