import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String }, // optional for google users
    photoURL: { type: String, required: true },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
