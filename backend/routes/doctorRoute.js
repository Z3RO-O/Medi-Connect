import express from 'express';
import {
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  doctorList,
  changeAvailablity,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile
} from '../controllers/doctorController.js';
import authDoctor from '../middleware/authDoctor.js';
import { hybridCrypto } from '../middleware/hybridCrypto.js';
const doctorRouter = express.Router();

// STEP 7: Final encryption - Low priority endpoints
doctorRouter.post('/login', hybridCrypto, loginDoctor);
doctorRouter.get('/list', hybridCrypto, doctorList);
doctorRouter.post('/list', hybridCrypto, doctorList); // Support encrypted POST

// STEP 5: Enable encryption for doctor portal endpoints
doctorRouter.get('/appointments', hybridCrypto, authDoctor, appointmentsDoctor);
doctorRouter.post('/appointments', hybridCrypto, authDoctor, appointmentsDoctor); // Support encrypted POST
doctorRouter.post('/cancel-appointment', hybridCrypto, authDoctor, appointmentCancel);
doctorRouter.post('/complete-appointment', hybridCrypto, authDoctor, appointmentComplete);
doctorRouter.get('/dashboard', hybridCrypto, authDoctor, doctorDashboard);
doctorRouter.post('/dashboard', hybridCrypto, authDoctor, doctorDashboard); // Support encrypted POST
doctorRouter.get('/profile', hybridCrypto, authDoctor, doctorProfile);
doctorRouter.post('/profile', hybridCrypto, authDoctor, doctorProfile); // Support encrypted POST
doctorRouter.post('/update-profile', hybridCrypto, authDoctor, updateDoctorProfile);

// Non-encrypted routes
doctorRouter.post('/change-availability', authDoctor, changeAvailablity);

export default doctorRouter;
