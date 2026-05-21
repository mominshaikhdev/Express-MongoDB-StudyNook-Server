import mongoose from 'mongoose';

const AMENITIES = ['Whiteboard', 'Projector', 'Wi-Fi', 'Power Outlets', 'Quiet Zone', 'Air Conditioning'];

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    image: { type: String, required: true },
    floor: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1, max: 1000 },
    hourlyRate: { type: Number, required: true, min: 0 },
    amenities: {
      type: [{ type: String, enum: AMENITIES }],
      default: [],
    },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ownerName: { type: String, required: true },
    bookingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

roomSchema.index({ name: 'text', description: 'text' });

export const AMENITIES_LIST = AMENITIES;
export default mongoose.model('Room', roomSchema);
