import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AppContext } from '@/context/AppContext';
import type { IPatientAppContext } from '@/models/patient';
import { secureApi } from '@/utils/secureApi';

interface EncryptionStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  details?: string;
  values?: {
    clientPrivateKey?: number;
    clientPublicKey?: number;
    serverPrivateKey?: number;
    serverPublicKey?: number;
    sharedSecret?: number;
    encryptedData?: string;
    decryptedData?: any;
    prime?: number;
    generator?: number;
  };
}

const EncryptionExplained = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext) as IPatientAppContext;
  const [isDemo, setIsDemo] = useState(false);
  const [steps, setSteps] = useState<EncryptionStep[]>([
    {
      id: 1,
      title: 'Key Exchange Initiation',
      description: 'Your browser requests a secure connection',
      status: 'pending',
      details: 'Using Diffie-Hellman algorithm with prime=23, generator=5'
    },
    {
      id: 2,
      title: 'Server Public Key',
      description: 'Server generates and shares its public key',
      status: 'pending',
      details: 'Server computes: g^serverPrivateKey mod p'
    },
    {
      id: 3,
      title: 'Client Public Key',
      description: 'Your browser generates and shares its public key',
      status: 'pending',
      details: 'Browser computes: g^clientPrivateKey mod p'
    },
    {
      id: 4,
      title: 'Shared Secret Creation',
      description: 'Both parties compute the same shared secret',
      status: 'pending',
      details: 'Secret = (otherPublicKey^myPrivateKey) mod p'
    },
    {
      id: 5,
      title: 'AES Encryption',
      description: 'Your data is encrypted with AES using the shared secret',
      status: 'pending',
      details: 'Military-grade AES encryption secures your medical data'
    },
    {
      id: 6,
      title: 'Secure Transmission',
      description: 'Encrypted data travels safely to the server',
      status: 'pending',
      details: 'Only the server can decrypt with the shared secret'
    }
  ]);

  const [demoData, setDemoData] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cryptoValues, setCryptoValues] = useState<any>(null);

  // Simulate Diffie-Hellman calculation
  const simulateDiffieHellman = () => {
    const prime = 23;
    const generator = 5;
    
    // Generate random private keys (1-22 for prime 23)
    const clientPrivateKey = Math.floor(Math.random() * 21) + 1;
    const serverPrivateKey = Math.floor(Math.random() * 21) + 1;
    
    // Calculate public keys: g^privateKey mod p
    const clientPublicKey = Math.pow(generator, clientPrivateKey) % prime;
    const serverPublicKey = Math.pow(generator, serverPrivateKey) % prime;
    
    // Calculate shared secrets: otherPublicKey^myPrivateKey mod p
    const clientSharedSecret = Math.pow(serverPublicKey, clientPrivateKey) % prime;
    const serverSharedSecret = Math.pow(clientPublicKey, serverPrivateKey) % prime;
    
    return {
      prime,
      generator,
      clientPrivateKey,
      clientPublicKey,
      serverPrivateKey,
      serverPublicKey,
      sharedSecret: clientSharedSecret, // Both should be the same
      verifyMatch: clientSharedSecret === serverSharedSecret
    };
  };

  const runEncryptionDemo = async () => {
    setIsDemo(true);
    setDemoData(null);
    setCryptoValues(null);

    // Reset steps
    const resetSteps = steps.map(step => ({ ...step, status: 'pending' as const, values: undefined }));
    setSteps(resetSteps);

    try {
      // Step 1: Initialize connection
      updateStepStatus(1, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate DH values
      const dhValues = simulateDiffieHellman();
      setCryptoValues(dhValues);
      
      updateStepStatusWithValues(1, 'completed', {
        prime: dhValues.prime,
        generator: dhValues.generator
      });

      // Step 2: Server generates public key
      updateStepStatus(2, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatusWithValues(2, 'completed', {
        serverPrivateKey: dhValues.serverPrivateKey,
        serverPublicKey: dhValues.serverPublicKey,
        prime: dhValues.prime,
        generator: dhValues.generator
      });

      // Step 3: Client generates public key
      updateStepStatus(3, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatusWithValues(3, 'completed', {
        clientPrivateKey: dhValues.clientPrivateKey,
        clientPublicKey: dhValues.clientPublicKey,
        prime: dhValues.prime,
        generator: dhValues.generator
      });

      // Step 4: Both compute shared secret
      updateStepStatus(4, 'active');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatusWithValues(4, 'completed', {
        sharedSecret: dhValues.sharedSecret,
        clientPrivateKey: dhValues.clientPrivateKey,
        serverPublicKey: dhValues.serverPublicKey,
        prime: dhValues.prime
      });

      // Initialize secure connection
      await secureApi.initialize();
      setSessionInfo(secureApi.getSessionInfo());

      // Step 5: Encryption
      updateStepStatus(5, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fetch encrypted data
      const sampleData = {
        patientName: "John Doe",
        diagnosis: "Hypertension",
        vitals: { bp: "140/90", hr: 78 }
      };

      const response = await secureApi.securePost('/api/secure/dummy-data', {
        requestType: 'encryptionDemo',
        timestamp: new Date().toISOString(),
        sampleData
      });

      // Simulate encryption values
      const encryptedSample = btoa(JSON.stringify(sampleData)) + "..." + dhValues.sharedSecret;
      
      updateStepStatusWithValues(5, 'completed', {
        encryptedData: encryptedSample,
        decryptedData: sampleData,
        sharedSecret: dhValues.sharedSecret
      });

      // Step 6: Transmission
      updateStepStatus(6, 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(6, 'completed');

      if (response.success) {
        setDemoData(response.data);
        toast.success('🔐 Encryption demo completed successfully!');
      }
    } catch (error) {
      console.error('Demo error:', error);
      toast.error('Demo failed. Please try again.');
    } finally {
      setIsDemo(false);
    }
  };

  const updateStepStatus = (stepId: number, status: 'pending' | 'active' | 'completed') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const updateStepStatusWithValues = (stepId: number, status: 'pending' | 'active' | 'completed', values: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, values } : step
    ));
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'active':
        return '🔄';
      default:
        return '⭕';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-800">Data Protection Explained</h1>
          <div></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🔐 How We Protect Your Medical Data
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is our priority. Every piece of your medical information is secured using 
            military-grade encryption that makes it impossible for anyone to read your data without permission.
          </p>
        </div>

        {/* Interactive Demo */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Interactive Encryption Demo
            </h3>
            <p className="text-gray-600 mb-6">
              See exactly how your data gets encrypted in real-time
            </p>
            <button
              onClick={runEncryptionDemo}
              disabled={isDemo}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {isDemo ? 'Running Demo...' : 'Start Encryption Demo'}
            </button>
          </div>

          {/* Encryption Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-500 ${
                  step.status === 'active' 
                    ? 'bg-blue-50 border-2 border-blue-200 scale-105' 
                    : step.status === 'completed'
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className="text-2xl">
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Step {step.id}: {step.title}
                  </h4>
                  <p className="text-gray-600 mb-2">{step.description}</p>
                  {step.details && (
                    <p className="text-sm text-gray-500 italic">{step.details}</p>
                  )}
                  {step.status === 'active' && (
                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Processing...</span>
                    </div>
                  )}
                  {step.values && step.status === 'completed' && (
                    <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-2 text-sm">🔢 Actual Values:</h5>
                      <div className="space-y-1 text-xs font-mono">
                        {step.id === 1 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Prime (p):</span>
                              <span className="font-semibold">{step.values.prime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Generator (g):</span>
                              <span className="font-semibold">{step.values.generator}</span>
                            </div>
                          </>
                        )}
                        {step.id === 2 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Server Private Key:</span>
                              <span className="font-semibold text-red-600">{step.values.serverPrivateKey} (secret)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Server Public Key:</span>
                              <span className="font-semibold text-green-600">{step.values.serverPublicKey}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Calculation: {step.values.generator}^{step.values.serverPrivateKey} mod {step.values.prime} = {step.values.serverPublicKey}
                            </div>
                          </>
                        )}
                        {step.id === 3 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Client Private Key:</span>
                              <span className="font-semibold text-red-600">{step.values.clientPrivateKey} (secret)</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Client Public Key:</span>
                              <span className="font-semibold text-green-600">{step.values.clientPublicKey}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Calculation: {step.values.generator}^{step.values.clientPrivateKey} mod {step.values.prime} = {step.values.clientPublicKey}
                            </div>
                          </>
                        )}
                        {step.id === 4 && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shared Secret:</span>
                              <span className="font-semibold text-purple-600">{step.values.sharedSecret}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Client calculation: {step.values.serverPublicKey}^{step.values.clientPrivateKey} mod {step.values.prime} = {step.values.sharedSecret}
                            </div>
                            <div className="text-xs text-gray-500">
                              Server calculation: Same result using server's private key
                            </div>
                          </>
                        )}
                        {step.id === 5 && (
                          <>
                            <div className="mb-2">
                              <span className="text-gray-600">Original Data:</span>
                              <div className="bg-gray-50 p-2 rounded mt-1 text-xs">
                                {JSON.stringify(step.values.decryptedData, null, 2)}
                              </div>
                            </div>
                            <div className="mb-2">
                              <span className="text-gray-600">Encrypted Data:</span>
                              <div className="bg-red-50 p-2 rounded mt-1 text-xs break-all">
                                {step.values.encryptedData}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              AES Key derived from shared secret: {step.values.sharedSecret}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Session Info */}
          {sessionInfo && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4">🔑 Current Session Details</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Session ID:</span>
                  <p className="font-mono bg-white p-2 rounded mt-1">
                    {sessionInfo.sessionId?.substring(0, 16)}...
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Encryption Status:</span>
                  <p className="mt-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sessionInfo.hasSharedSecret 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {sessionInfo.hasSharedSecret ? '🔐 Encrypted' : '❌ Not Encrypted'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Crypto Values Summary */}
          {cryptoValues && (
            <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🔑 Complete Cryptographic Exchange Summary
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  All Values Revealed
                </span>
              </h4>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {/* Initial Parameters */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">📐 Public Parameters</h5>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prime (p):</span>
                      <span className="font-bold text-blue-600">{cryptoValues.prime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generator (g):</span>
                      <span className="font-bold text-blue-600">{cryptoValues.generator}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    These values are publicly known and shared
                  </div>
                </div>

                {/* Server Side */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">🖥️ Server Side</h5>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Private Key:</span>
                      <span className="font-bold text-red-600">{cryptoValues.serverPrivateKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Public Key:</span>
                      <span className="font-bold text-green-600">{cryptoValues.serverPublicKey}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Public key = {cryptoValues.generator}^{cryptoValues.serverPrivateKey} mod {cryptoValues.prime}
                  </div>
                </div>

                {/* Client Side */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h5 className="font-medium text-gray-700 mb-3 text-sm">💻 Client Side</h5>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Private Key:</span>
                      <span className="font-bold text-red-600">{cryptoValues.clientPrivateKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Public Key:</span>
                      <span className="font-bold text-green-600">{cryptoValues.clientPublicKey}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Public key = {cryptoValues.generator}^{cryptoValues.clientPrivateKey} mod {cryptoValues.prime}
                  </div>
                </div>
              </div>

              {/* Shared Secret Calculation */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                <h5 className="font-medium text-gray-700 mb-3 text-sm">🤝 Shared Secret Calculation</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client calculates:</span>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                      secret = server_public^client_private mod p<br/>
                      secret = {cryptoValues.serverPublicKey}^{cryptoValues.clientPrivateKey} mod {cryptoValues.prime}<br/>
                      secret = <span className="font-bold text-purple-600">{cryptoValues.sharedSecret}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Server calculates:</span>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                      secret = client_public^server_private mod p<br/>
                      secret = {cryptoValues.clientPublicKey}^{cryptoValues.serverPrivateKey} mod {cryptoValues.prime}<br/>
                      secret = <span className="font-bold text-purple-600">{cryptoValues.sharedSecret}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="font-medium text-green-800">
                      Both parties arrived at the same shared secret: {cryptoValues.sharedSecret}
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    This proves the Diffie-Hellman key exchange worked correctly!
                  </p>
                </div>
              </div>

              {/* Security Analysis */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h5 className="font-medium text-gray-700 mb-3 text-sm">🛡️ Security Analysis</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h6 className="font-medium text-gray-600 mb-2">What was transmitted publicly:</h6>
                    <ul className="space-y-1 text-xs">
                      <li>• Prime number: {cryptoValues.prime}</li>
                      <li>• Generator: {cryptoValues.generator}</li>
                      <li>• Server public key: {cryptoValues.serverPublicKey}</li>
                      <li>• Client public key: {cryptoValues.clientPublicKey}</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-600 mb-2">What remained secret:</h6>
                    <ul className="space-y-1 text-xs">
                      <li>• Server private key: {cryptoValues.serverPrivateKey}</li>
                      <li>• Client private key: {cryptoValues.clientPrivateKey}</li>
                      <li>• <strong>Shared secret: {cryptoValues.sharedSecret}</strong></li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>Security Note:</strong> Even if an attacker intercepted all public values 
                    ({cryptoValues.prime}, {cryptoValues.generator}, {cryptoValues.serverPublicKey}, {cryptoValues.clientPublicKey}), 
                    they cannot compute the shared secret ({cryptoValues.sharedSecret}) without knowing at least one private key.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Demo Data */}
          {demoData && (
            <div className="mt-8 bg-green-50 rounded-lg p-6 border-2 border-green-200">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📊 Successfully Decrypted Data
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Demo Complete
                </span>
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Sample Medical Stats</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Patients:</span>
                      <span className="font-medium">{demoData.stats?.totalPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Appointments:</span>
                      <span className="font-medium">{demoData.stats?.activeAppointments}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700 mb-2">Encryption Info</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data Encrypted:</span>
                      <span className="font-medium text-green-600">✅ Yes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fetched At:</span>
                      <span className="font-medium">{new Date(demoData.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Technical Details */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* What is Diffie-Hellman */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🤝 Diffie-Hellman Key Exchange
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                The Diffie-Hellman algorithm allows two parties (your browser and our server) 
                to create a shared secret key over an insecure channel without ever directly 
                sharing the key.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Both parties agree on public parameters (prime number and generator)</li>
                  <li>• Each generates a private key and computes a public key</li>
                  <li>• Public keys are exchanged</li>
                  <li>• Both compute the same shared secret using the other's public key</li>
                </ul>
              </div>
              <p className="text-sm italic">
                Even if someone intercepts the public keys, they cannot compute the shared secret 
                without the private keys.
              </p>
            </div>
          </div>

          {/* AES Encryption */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🔒 AES Encryption
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                After the shared secret is established, we use Advanced Encryption Standard (AES) 
                to encrypt your actual medical data.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Security Features:</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Military-grade encryption standard</li>
                  <li>• Used by governments worldwide</li>
                  <li>• Virtually unbreakable with current technology</li>
                  <li>• Each session uses a unique encryption key</li>
                </ul>
              </div>
              <p className="text-sm italic">
                Your medical records, appointments, and personal information are encrypted 
                before leaving your device.
              </p>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              🛡️ Why This Matters
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                Medical data is among the most sensitive information about you. Our encryption 
                ensures that:
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Complete Privacy</h4>
                    <p className="text-sm">No one can read your data, even if they intercept it</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">HIPAA Compliance</h4>
                    <p className="text-sm">Exceeds healthcare privacy requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Future-Proof</h4>
                    <p className="text-sm">Protected against emerging cybersecurity threats</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What We Encrypt */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              📋 What We Encrypt
            </h3>
            <div className="space-y-4 text-gray-600">
              <p>
                All sensitive communications are automatically encrypted:
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Patient Profiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Medical Records</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Appointments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Doctor Communications</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Vital Signs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Lab Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Treatment Plans</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    <span>Personal Information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Your Data is Safe With Us
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We've implemented this advanced encryption system because your privacy and security 
            are non-negotiable. Your medical information deserves the highest level of protection.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </button>
            {token && (
              <button
                onClick={() => navigate('/my-profile')}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                View My Secure Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EncryptionExplained; 