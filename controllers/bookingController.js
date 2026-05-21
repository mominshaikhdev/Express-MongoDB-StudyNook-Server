import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

const isPastDate = (dateStr) =>
{
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return d < today;
};

export const createBooking = async (req, res) =>
{
  const { roomId, date, startHour, endHour, specialNote } = req.body || {};
  if (!roomId || !date || startHour == null || endHour == null)
    return res.status(400).json({ message: 'Missing fields' });

  const sH = Number(startHour);
  const eH = Number(endHour);
  if (sH < 8 || sH > 20 || eH < 9 || eH > 21 || eH <= sH)
    return res.status(400).json({ message: 'Invalid time range (08:00-21:00, min 1 hour)' });
  if (isPastDate(date)) return res.status(400).json({ message: 'Date must be today or future' });

  const room = await Room.findById(roomId);
  if (!room) return res.status(404).json({ message: 'Room not found' });

  // Conflict check using $gte / $lte on hours
  const conflict = await Booking.findOne({
    roomId,
    date,
    status: 'confirmed',
    startHour: { $lt: eH },
    endHour: { $gt: sH },
  });
  if (conflict)
    return res.status(409).json({ message: 'Time slot already booked for this room' });

  const totalCost = (eH - sH) * room.hourlyRate;

  const booking = await Booking.create({
    roomId,
    userId: req.user.id,
    date,
    startHour: sH,
    endHour: eH,
    totalCost,
    specialNote: specialNote || '',
  });

  await User.updateOne({ _id: req.user.id }, { $push: { bookings: booking._id } });
  await Room.updateOne({ _id: roomId }, { $inc: { bookingCount: 1 } });

  res.status(201).json({ booking });
};

export const getMyBookings = async (req, res) =>
{
  const bookings = await Booking.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .populate('roomId', 'name image floor');
  res.json({ bookings });
};

export const cancelBooking = async (req, res) =>
{
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.userId) !== String(req.user.id))
    return res.status(403).json({ message: 'Forbidden' });
  if (booking.status === 'cancelled')
    return res.status(400).json({ message: 'Already cancelled' });

  booking.status = 'cancelled';
  await booking.save();

  await User.updateOne({ _id: req.user.id }, { $pull: { bookings: booking._id } });
  await Room.updateOne({ _id: booking.roomId }, { $inc: { bookingCount: -1 } });

  res.json({ message: 'Booking cancelled', booking });
};
