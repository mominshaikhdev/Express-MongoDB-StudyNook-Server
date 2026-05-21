import { Router } from 'express';
import
{
  getAmenities,
  getLatestRooms,
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getMyListings,
} from '../controllers/roomController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.get('/amenities', getAmenities);
router.get('/latest', getLatestRooms);
router.get('/my-listings', authMiddleware, getMyListings);
router.get('/', getRooms);
router.get('/:id', getRoomById);
router.post('/', authMiddleware, createRoom);
router.put('/:id', authMiddleware, updateRoom);
router.patch('/:id', authMiddleware, updateRoom);
router.delete('/:id', authMiddleware, deleteRoom);
export default router;
