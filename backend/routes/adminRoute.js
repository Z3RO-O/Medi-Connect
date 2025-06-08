import express from 'express';
import {
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  addDoctor,
  allDoctors,
  adminDashboard
} from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
import { optionalDecryptRequest, optionalEncryptResponse } from '../middleware/hybridCrypto.js';
const adminRouter = express.Router();

// Hybrid encrypted routes (support both encrypted and non-encrypted)
adminRouter.post('/login', optionalDecryptRequest, loginAdmin, optionalEncryptResponse);
adminRouter.get('/appointments', optionalDecryptRequest, authAdmin, appointmentsAdmin, optionalEncryptResponse);
adminRouter.post('/appointments', optionalDecryptRequest, authAdmin, appointmentsAdmin, optionalEncryptResponse); // Support POST for encrypted GET
adminRouter.get('/all-doctors', optionalDecryptRequest, authAdmin, allDoctors, optionalEncryptResponse);
adminRouter.post('/all-doctors', optionalDecryptRequest, authAdmin, allDoctors, optionalEncryptResponse); // Support POST for encrypted GET
adminRouter.get('/dashboard', optionalDecryptRequest, authAdmin, adminDashboard, optionalEncryptResponse);
adminRouter.post('/dashboard', optionalDecryptRequest, authAdmin, adminDashboard, optionalEncryptResponse); // Support POST for encrypted GET

// Additional hybrid encrypted routes
adminRouter.post('/change-availability', optionalDecryptRequest, authAdmin, changeAvailablity, optionalEncryptResponse);
adminRouter.post('/cancel-appointment', optionalDecryptRequest, authAdmin, appointmentCancel, optionalEncryptResponse);

// Non-encrypted routes (existing functionality)
adminRouter.post('/add-doctor', authAdmin, upload.single('image'), addDoctor);

export default adminRouter;
