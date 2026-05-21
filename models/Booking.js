import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    startHour: { type: Number, required: true, min: 8, max: 20 },
    endHour: { type: Number, required: true, min: 9, max: 21 },
    totalCost: { type: Number, required: true, min: 0 },
    specialNote: { type: String, default: '', maxlength: 500 },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

bookingSchema.index({ roomId: 1, date: 1, status: 1 });

export default mongoose.model('Booking', bookingSchema);
