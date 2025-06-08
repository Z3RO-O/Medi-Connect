import express from 'express';
import { optionalDiffieHellman, optionalDecryptRequest, optionalEncryptResponse } from '../middleware/hybridCrypto.js';

const secureRouter = express.Router();

// Apply crypto middleware to all routes
secureRouter.use(optionalDiffieHellman);

// Route to get server's public key for Diffie-Hellman key exchange
secureRouter.get('/public-key', (req, res) => {
  const sessionId = req.headers['session-id'] || 'default';
  console.log(`Providing public key for session: ${sessionId}`);
  
  res.json({
    success: true,
    serverPublicKey: req.dh.getPublicKey(),
    sessionId: sessionId
  });
});

// Secure dummy data endpoint - encrypted communication
secureRouter.post('/dummy-data', optionalDecryptRequest, optionalEncryptResponse, (req, res) => {
  console.log('Dummy data request received and decrypted:', req.body);
  
  // Generate dummy patient data
  const dummyData = {
    patients: [
      {
        id: 1,
        name: 'John Doe',
        age: 32,
        condition: 'Hypertension',
        lastVisit: '2024-12-01',
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          temperature: '98.6°F'
        }
      },
      {
        id: 2,
        name: 'Jane Smith',
        age: 28,
        condition: 'Diabetes Type 2',
        lastVisit: '2024-11-28',
        vitals: {
          bloodPressure: '110/70',
          heartRate: 68,
          temperature: '97.8°F'
        }
      },
      {
        id: 3,
        name: 'Mike Johnson',
        age: 45,
        condition: 'Asthma',
        lastVisit: '2024-12-03',
        vitals: {
          bloodPressure: '130/85',
          heartRate: 78,
          temperature: '98.2°F'
        }
      }
    ],
    stats: {
      totalPatients: 156,
      activeAppointments: 23,
      completedToday: 12,
      emergencyCases: 2
    },
    timestamp: new Date().toISOString(),
    message: 'Encrypted data successfully retrieved!',
    encrypted: true
  };

  res.json({
    success: true,
    data: dummyData
  });
});

// Test endpoint for regular (non-encrypted) communication
secureRouter.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Non-encrypted test endpoint working!',
    timestamp: new Date().toISOString()
  });
});

export default secureRouter; 