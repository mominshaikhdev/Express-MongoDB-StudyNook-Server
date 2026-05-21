import { Router } from 'express';
import { createBooking, getMyBookings, cancelBooking } from '../controllers/bookingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);
router.post('/', createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);
export default router;
