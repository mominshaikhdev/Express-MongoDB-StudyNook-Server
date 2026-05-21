import Room, { AMENITIES_LIST } from '../models/Room.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

export const getAmenities = (_req, res) => res.json({ amenities: AMENITIES_LIST });

export const getLatestRooms = async (_req, res) =>
{
  const rooms = await Room.find().sort({ createdAt: -1 }).limit(6);
  res.json({ rooms });
};

export const getRooms = async (req, res) =>
{
  const { search, amenities, minRate, maxRate, minFloor, maxFloor } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (amenities)
  {
    const arr = Array.isArray(amenities) ? amenities : String(amenities).split(',').filter(Boolean);
    if (arr.length) filter.amenities = { $in: arr };
  }
  if (minRate || maxRate)
  {
    filter.hourlyRate = {};
    if (minRate) filter.hourlyRate.$gte = Number(minRate);
    if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
  }
  if (minFloor || maxFloor)
  {
    // floor stored as string
    filter.$expr = {
      $and: [
        ...(minFloor
          ? [{ $gte: [{ $toInt: { $ifNull: ['$floor', '0'] } }, Number(minFloor)] }]
          : []),
        ...(maxFloor
          ? [{ $lte: [{ $toInt: { $ifNull: ['$floor', '0'] } }, Number(maxFloor)] }]
          : []),
      ],
    };
  }
  const rooms = await Room.find(filter).sort({ createdAt: -1 });
  res.json({ rooms });
};

export const getRoomById = async (req, res) =>
{
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json({ room });
};

export const createRoom = async (req, res) =>
{
  const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body || {};
  if (!name || !description || !image || !floor || capacity == null || hourlyRate == null)
    return res.status(400).json({ message: 'Missing required fields' });

  const owner = await User.findById(req.user.id).select('name');
  if (!owner) return res.status(404).json({ message: 'User not found' });

  const cleanAmenities = Array.isArray(amenities)
    ? amenities.filter((a) => AMENITIES_LIST.includes(a))
    : [];

  const room = await Room.create({
    name,
    description,
    image,
    floor: String(floor),
    capacity: Number(capacity),
    hourlyRate: Number(hourlyRate),
    amenities: cleanAmenities,
    ownerId: req.user.id,
    ownerName: owner.name,
  });
  res.status(201).json({ room });
};

export const updateRoom = async (req, res) =>
{
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (String(room.ownerId) !== String(req.user.id))
    return res.status(403).json({ message: 'Forbidden: not the owner' });

  const fields = ['name', 'description', 'image', 'floor', 'capacity', 'hourlyRate', 'amenities'];
  for (const f of fields)
  {
    if (req.body[f] !== undefined)
    {
      if (f === 'amenities')
      {
        room.amenities = Array.isArray(req.body.amenities)
          ? req.body.amenities.filter((a) => AMENITIES_LIST.includes(a))
          : [];
      } else if (f === 'capacity' || f === 'hourlyRate')
      {
        room[f] = Number(req.body[f]);
      } else
      {
        room[f] = req.body[f];
      }
    }
  }
  await room.save();
  res.json({ room });
};

export const deleteRoom = async (req, res) =>
{
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  if (String(room.ownerId) !== String(req.user.id))
    return res.status(403).json({ message: 'Forbidden: not the owner' });

  // Pull all bookings of this room from users' bookings arrays
  const bookings = await Booking.find({ roomId: room._id }).select('_id userId');
  const ids = bookings.map((b) => b._id);
  if (ids.length)
  {
    await User.updateMany({ bookings: { $in: ids } }, { $pull: { bookings: { $in: ids } } });
    await Booking.deleteMany({ _id: { $in: ids } });
  }
  await room.deleteOne();
  res.json({ message: 'Room deleted successfully' });
};

export const getMyListings = async (req, res) =>
{
  const rooms = await Room.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
  res.json({ rooms });
};
