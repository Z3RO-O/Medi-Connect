import express from 'express';
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  paymentRazorpay,
  verifyRazorpay,
  paymentStripe,
  verifyStripe
} from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
import { hybridCrypto } from '../middleware/hybridCrypto.js';
const userRouter = express.Router();

// STEP 3: Enable encryption for authentication endpoints
userRouter.post('/register', hybridCrypto, registerUser);
userRouter.post('/login', hybridCrypto, loginUser);

// Support both GET (regular) and POST (encrypted) for get-profile
userRouter.get('/get-profile', hybridCrypto, authUser, getProfile);
userRouter.post('/get-profile', hybridCrypto, authUser, getProfile);

// Support both GET (for encrypted fallback) and POST (main method) for update-profile
userRouter.get('/update-profile', hybridCrypto, upload.single('image'), authUser, updateProfile);
userRouter.post('/update-profile', hybridCrypto, upload.single('image'), authUser, updateProfile);

// STEP 4: Enable encryption for medical appointment endpoints
userRouter.post('/book-appointment', hybridCrypto, authUser, bookAppointment);
userRouter.get('/appointments', hybridCrypto, authUser, listAppointment);
userRouter.post('/appointments', hybridCrypto, authUser, listAppointment);
userRouter.post('/cancel-appointment', hybridCrypto, authUser, cancelAppointment);

userRouter.post('/payment-razorpay', authUser, paymentRazorpay);
userRouter.post('/verifyRazorpay', authUser, verifyRazorpay);
userRouter.post('/payment-stripe', authUser, paymentStripe);
userRouter.post('/verifyStripe', authUser, verifyStripe);

export default userRouter;
