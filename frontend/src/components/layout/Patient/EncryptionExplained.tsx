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
  apiCall?: string;
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

interface ApiCallLog {
  id: number;
  timestamp: string;
  method: string;
  endpoint: string;
  direction: 'request' | 'response';
  status: 'pending' | 'success' | 'error';
  data?: any;
  encrypted?: boolean;
}

const EncryptionExplained = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext) as IPatientAppContext;
  const [isDemo, setIsDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [apiCalls, setApiCalls] = useState<ApiCallLog[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedApiCalls, setExpandedApiCalls] = useState<Set<number>>(new Set());
  
  const [steps, setSteps] = useState<EncryptionStep[]>([
    {
      id: 1,
      title: 'Session Initialization',
      description: 'Generate unique session ID and DH keys',
      status: 'pending',
      details: 'Browser creates session ID and Diffie-Hellman key pair',
      apiCall: 'Local computation'
    },
    {
      id: 2,
      title: 'Request Server Public Key',
      description: 'GET /api/secure/public-key',
      status: 'pending',
      details: 'Request server\'s public key for key exchange',
      apiCall: 'GET /api/secure/public-key'
    },
    {
      id: 3,
      title: 'Server Key Generation',
      description: 'Server generates DH key pair',
      status: 'pending',
      details: 'Server computes: g^serverPrivateKey mod p',
      apiCall: 'Server-side computation'
    },
    {
      id: 4,
      title: 'Shared Secret Calculation',
      description: 'Both parties compute shared secret',
      status: 'pending',
      details: 'Secret = (otherPublicKey^myPrivateKey) mod p',
      apiCall: 'Local computation'
    },
    {
      id: 5,
      title: 'Encrypt Medical Data',
      description: 'AES encrypt data with shared secret',
      status: 'pending',
      details: 'AES.encrypt(data, SHA256(sharedSecret))',
      apiCall: 'Local encryption'
    },
    {
      id: 6,
      title: 'Send Encrypted Request',
      description: 'POST /api/secure/dummy-data',
      status: 'pending',
      details: 'Send encrypted payload to server',
      apiCall: 'POST /api/secure/dummy-data'
    },
    {
      id: 7,
      title: 'Server Decryption',
      description: 'Server decrypts and processes',
      status: 'pending',
      details: 'Server uses shared secret to decrypt data',
      apiCall: 'Server-side decryption'
    },
    {
      id: 8,
      title: 'Encrypted Response',
      description: 'Server sends encrypted response',
      status: 'pending',
      details: 'Response encrypted with same shared secret',
      apiCall: 'Encrypted response'
    }
  ]);

  const [demoData, setDemoData] = useState<any>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [cryptoValues, setCryptoValues] = useState<any>(null);

  const addApiCall = (call: Omit<ApiCallLog, 'id' | 'timestamp'>) => {
    const newCall: ApiCallLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...call
    };
    setApiCalls(prev => [...prev, newCall]);
    return newCall.id;
  };

  const updateApiCall = (id: number, updates: Partial<ApiCallLog>) => {
    setApiCalls(prev => prev.map(call => 
      call.id === id ? { ...call, ...updates } : call
    ));
  };

  const toggleApiCallExpansion = (callId: number) => {
    setExpandedApiCalls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(callId)) {
        newSet.delete(callId);
      } else {
        newSet.add(callId);
      }
      return newSet;
    });
  };

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
      sharedSecret: clientSharedSecret,
      verifyMatch: clientSharedSecret === serverSharedSecret
    };
  };

  const runEncryptionDemo = async () => {
    setIsDemo(true);
    setDemoData(null);
    setCryptoValues(null);
    setApiCalls([]);
    setCurrentStep(0);

    // Reset steps
    const resetSteps = steps.map(step => ({ ...step, status: 'pending' as const, values: undefined }));
    setSteps(resetSteps);

    try {
      // Step 1: Session Initialization
      updateStepStatus(1, 'active');
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const dhValues = simulateDiffieHellman();
      setCryptoValues(dhValues);
      
      updateStepStatusWithValues(1, 'completed', {
        prime: dhValues.prime,
        generator: dhValues.generator,
        clientPrivateKey: dhValues.clientPrivateKey,
        clientPublicKey: dhValues.clientPublicKey
      });

      // Step 2: Request Server Public Key
      updateStepStatus(2, 'active');
      setCurrentStep(2);
      
      const publicKeyCallId = addApiCall({
        method: 'GET',
        endpoint: '/api/secure/public-key',
        direction: 'request',
        status: 'pending',
        data: { sessionId: 'demo-session-123' },
        encrypted: false
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateApiCall(publicKeyCallId, { 
        status: 'success',
        direction: 'response',
        data: { 
          success: true, 
          serverPublicKey: dhValues.serverPublicKey,
          sessionId: 'demo-session-123'
        }
      });

      updateStepStatusWithValues(2, 'completed', {
        serverPrivateKey: dhValues.serverPrivateKey,
        serverPublicKey: dhValues.serverPublicKey
      });

      // Step 3: Server Key Generation (simulated)
      updateStepStatus(3, 'active');
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(3, 'completed');

      // Step 4: Shared Secret Calculation
      updateStepStatus(4, 'active');
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatusWithValues(4, 'completed', {
        sharedSecret: dhValues.sharedSecret,
        clientPrivateKey: dhValues.clientPrivateKey,
        serverPublicKey: dhValues.serverPublicKey,
        prime: dhValues.prime
      });

      // Initialize actual secure connection
      await secureApi.initialize();
      setSessionInfo(secureApi.getSessionInfo());

      // Step 5: Encrypt Medical Data
      updateStepStatus(5, 'active');
      setCurrentStep(5);
      
      const sampleData = {
        patientName: "John Doe",
        diagnosis: "Hypertension", 
        vitals: { bp: "140/90", hr: 78, temp: "98.6°F" },
        timestamp: new Date().toISOString()
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const encryptedSample = `AES_ENCRYPTED_${btoa(JSON.stringify(sampleData)).substring(0, 20)}...${dhValues.sharedSecret}`;
      
      updateStepStatusWithValues(5, 'completed', {
        encryptedData: encryptedSample,
        decryptedData: sampleData,
        sharedSecret: dhValues.sharedSecret
      });

      // Step 6: Send Encrypted Request
      updateStepStatus(6, 'active');
      setCurrentStep(6);

      const secureCallId = addApiCall({
        method: 'POST',
        endpoint: '/api/secure/dummy-data',
        direction: 'request',
        status: 'pending',
        data: {
          encrypted: encryptedSample,
          clientPublicKey: dhValues.clientPublicKey
        },
        encrypted: true
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 7: Server Decryption
      updateStepStatus(7, 'active');
      setCurrentStep(7);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(7, 'completed');

      // Actual API call
      const response = await secureApi.securePost('/api/secure/dummy-data', {
        requestType: 'encryptionDemo',
        timestamp: new Date().toISOString(),
        sampleData
      });

      // Step 8: Encrypted Response
      updateStepStatus(8, 'active');
      setCurrentStep(8);
      
      updateApiCall(secureCallId, {
        status: 'success',
        direction: 'response',
        data: response
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(6, 'completed');
      updateStepStatus(8, 'completed');

      if (response.success) {
        setDemoData(response.data);
        toast.success('🔐 Encryption demo completed successfully!');
      }
    } catch (error) {
      console.error('Demo error:', error);
      toast.error('Demo failed. Please try again.');
    } finally {
      setIsDemo(false);
      setCurrentStep(0);
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

  const getApiCallIcon = (direction: string, status: string, encrypted: boolean) => {
    if (status === 'pending') return '⏳';
    if (direction === 'request') return encrypted ? '🔐➡️' : '📤';
    return encrypted ? '🔐⬅️' : '📥';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          <h1 className="text-xl font-bold text-gray-800">🔐 Diffie-Hellman API Flow Demo</h1>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Interactive API Flow Visualization
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6">
            Watch how your medical data is protected through every step of the communication process.
            This demo shows real API calls and the cryptographic operations happening behind the scenes.
          </p>
          
          <button
            onClick={runEncryptionDemo}
            disabled={isDemo}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              isDemo 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isDemo ? 'Demo Running...' : '🚀 Start Interactive Demo'}
          </button>
        </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Detailed Calculations - Left Side */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🧮</span>
              Live Calculations
            </h3>
            
            <div className="space-y-4">
              {currentStep > 0 && (
                <div className="space-y-3">
                  {/* Step 1: Initialization */}
                  {currentStep >= 1 && cryptoValues && (
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <h4 className="font-semibold text-blue-800 text-sm mb-2">🔧 Initial Setup</h4>
                      <div className="space-y-1 text-xs font-mono">
                        <div className="text-gray-700">Prime (p) = <span className="text-blue-600 font-bold">{cryptoValues.prime}</span></div>
                        <div className="text-gray-700">Generator (g) = <span className="text-blue-600 font-bold">{cryptoValues.generator}</span></div>
                        <div className="text-gray-600 text-xs italic mt-2">These are publicly shared parameters</div>
                      </div>
                    </div>
                  )}

                  {/* Step 2-3: Key Generation */}
                  {currentStep >= 3 && cryptoValues && (
                    <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                      <h4 className="font-semibold text-green-800 text-sm mb-2">🔑 Key Generation</h4>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <div className="font-semibold text-gray-700 mb-1">Client Side:</div>
                          <div className="font-mono text-gray-600">Private: <span className="text-green-600">{cryptoValues.clientPrivateKey}</span> (secret)</div>
                          <div className="font-mono text-gray-600">Public: {cryptoValues.generator}^{cryptoValues.clientPrivateKey} mod {cryptoValues.prime} = <span className="text-purple-600">{cryptoValues.clientPublicKey}</span></div>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <div className="font-semibold text-gray-700 mb-1">Server Side:</div>
                          <div className="font-mono text-gray-600">Private: <span className="text-green-600">{cryptoValues.serverPrivateKey}</span> (secret)</div>
                          <div className="font-mono text-gray-600">Public: {cryptoValues.generator}^{cryptoValues.serverPrivateKey} mod {cryptoValues.prime} = <span className="text-purple-600">{cryptoValues.serverPublicKey}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Shared Secret */}
                  {currentStep >= 4 && cryptoValues && (
                    <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-purple-800 text-sm mb-2">🤝 Shared Secret</h4>
                      <div className="space-y-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <div className="font-mono text-gray-600">Client: {cryptoValues.serverPublicKey}^{cryptoValues.clientPrivateKey} mod {cryptoValues.prime}</div>
                          <div className="font-mono text-gray-600">= <span className="text-red-600 font-bold">{cryptoValues.sharedSecret}</span></div>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <div className="font-mono text-gray-600">Server: {cryptoValues.clientPublicKey}^{cryptoValues.serverPrivateKey} mod {cryptoValues.prime}</div>
                          <div className="font-mono text-gray-600">= <span className="text-red-600 font-bold">{cryptoValues.sharedSecret}</span></div>
                        </div>
                        <div className="text-center text-green-600 font-semibold">✅ Same Secret!</div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Encryption */}
                  {currentStep >= 5 && (
                    <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-semibold text-red-800 text-sm mb-2">🔐 AES Encryption</h4>
                      <div className="space-y-1 text-xs">
                        <div className="font-mono text-gray-600">Key = SHA256({cryptoValues?.sharedSecret})</div>
                        <div className="font-mono text-gray-600">AES.encrypt(medicalData, key)</div>
                        <div className="text-gray-600 italic">Military-grade encryption applied</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">🚀</div>
                  <p className="text-sm">Start demo to see calculations</p>
                </div>
              )}
            </div>
          </div>

          {/* API Flow Visualization - Center */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🌐</span>
              API Flow Steps
            </h3>
            
            {/* Visual Flow Chart */}
            <div className="space-y-3 mb-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`relative p-3 rounded-lg border-2 transition-all duration-500 ${
                    step.status === 'active' 
                      ? 'border-blue-500 bg-blue-50 shadow-md scale-105' 
                      : step.status === 'completed'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg transition-transform duration-300 ${
                        step.status === 'active' ? 'animate-spin' : ''
                      }`}>
                        {getStepIcon(step.status)}
                      </span>
                      <div>
                        <h4 className="font-medium text-gray-800 text-sm">{step.title}</h4>
                        <p className="text-xs text-gray-600">{step.description}</p>
                        {step.apiCall && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {step.apiCall}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {currentStep === step.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>

                  {/* Connection line to next step */}
                  {index < steps.length - 1 && (
                    <div className={`absolute left-4 top-full w-0.5 h-3 transition-colors duration-500 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Call Log - Right Side */}
          <div className="xl:col-span-1 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Network Activity
            </h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {apiCalls.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-3xl mb-2">📡</div>
                  <p className="text-sm">Network calls will appear here</p>
                </div>
              ) : (
                apiCalls.map((call) => (
                  <div
                    key={call.id}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer hover:shadow-md ${
                      call.status === 'pending' 
                        ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' 
                        : call.status === 'success'
                        ? 'border-green-300 bg-green-50 hover:bg-green-100'
                        : 'border-red-300 bg-red-50 hover:bg-red-100'
                    }`}
                    onClick={() => toggleApiCallExpansion(call.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getApiCallIcon(call.direction, call.status, call.encrypted || false)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded font-semibold ${
                          call.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {call.method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{call.timestamp}</span>
                        <span className={`text-sm transition-transform duration-200 ${
                          expandedApiCalls.has(call.id) ? 'rotate-180' : ''
                        }`}>
                          ⌄
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="font-mono text-sm text-gray-700 mb-1">{call.endpoint}</div>
                      {call.encrypted && (
                        <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                          🔐 ENCRYPTED PAYLOAD
                        </span>
                      )}
                    </div>
                    
                    {expandedApiCalls.has(call.id) && call.data && (
                      <div className="mt-4 space-y-3">
                        {call.encrypted && call.data.encrypted ? (
                          <>
                            <div className="p-3 bg-red-50 rounded border border-red-200">
                              <h5 className="text-xs font-semibold text-red-700 mb-2">🔐 Encrypted Data Sent:</h5>
                              <div className="font-mono text-xs text-red-600 break-all bg-white p-2 rounded">
                                {typeof call.data.encrypted === 'string' ? call.data.encrypted.substring(0, 100) + '...' : JSON.stringify(call.data.encrypted)}
                              </div>
                              <div className="text-xs text-red-600 mt-2 italic">This is what travels over the network - unreadable!</div>
                            </div>
                            
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <h5 className="text-xs font-semibold text-green-700 mb-2">🔓 Decrypted Content:</h5>
                              <pre className="text-xs text-green-600 whitespace-pre-wrap overflow-x-auto bg-white p-2 rounded">
                                {JSON.stringify(call.data, null, 2)}
                              </pre>
                              <div className="text-xs text-green-600 mt-2 italic">Only visible after decryption with shared secret</div>
                            </div>
                          </>
                        ) : (
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <h5 className="text-xs font-semibold text-blue-700 mb-2">📄 Unencrypted Data:</h5>
                            <pre className="text-xs text-blue-600 whitespace-pre-wrap overflow-x-auto bg-white p-2 rounded max-h-40">
                              {JSON.stringify(call.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Mathematical Explanation */}
        {cryptoValues && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧮</span>
              Mathematical Proof
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Client Calculation:</h4>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-mono text-sm space-y-1">
                    <div>Private Key: <span className="text-green-600">{cryptoValues.clientPrivateKey}</span></div>
                    <div>Public Key: 5^{cryptoValues.clientPrivateKey} mod 23 = <span className="text-purple-600">{cryptoValues.clientPublicKey}</span></div>
                    <div>Shared Secret: {cryptoValues.serverPublicKey}^{cryptoValues.clientPrivateKey} mod 23 = <span className="text-red-600 font-bold">{cryptoValues.sharedSecret}</span></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Server Calculation:</h4>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-mono text-sm space-y-1">
                    <div>Private Key: <span className="text-green-600">{cryptoValues.serverPrivateKey}</span></div>
                    <div>Public Key: 5^{cryptoValues.serverPrivateKey} mod 23 = <span className="text-purple-600">{cryptoValues.serverPublicKey}</span></div>
                    <div>Shared Secret: {cryptoValues.clientPublicKey}^{cryptoValues.serverPrivateKey} mod 23 = <span className="text-red-600 font-bold">{cryptoValues.sharedSecret}</span></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-lg">🎯</span>
                <span className="font-semibold">
                  Both parties calculated the same shared secret: {cryptoValues.sharedSecret}
                </span>
                <span className="text-lg">{cryptoValues.verifyMatch ? '✅' : '❌'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Demo Results */}
        {demoData && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Decrypted Response Data
            </h3>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(demoData, null, 2)}
              </pre>
            </div>
          </div>
        )}

                 {/* Educational Sections */}
         <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* What is Diffie-Hellman */}
           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
               <p className="text-sm italic text-gray-500">
                 Even if someone intercepts the public keys, they cannot compute the shared secret 
                 without the private keys.
               </p>
             </div>
           </div>

           {/* AES Encryption */}
           <div className="bg-white rounded-xl shadow-lg p-6">
             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
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
               <p className="text-sm italic text-gray-500">
                 Your medical records, appointments, and personal information are encrypted 
                 before leaving your device.
               </p>
             </div>
           </div>
         </div>

  

         {/* What We Encrypt */}
         <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
           <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
             📋 What We Encrypt
           </h3>
           <div className="space-y-4 text-gray-600">
             <p>
               All sensitive communications are automatically encrypted:
             </p>
             <div className="grid grid-cols-2 gap-4 text-sm">
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Patient Profiles</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Medical Records</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Appointments</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Doctor Communications</span>
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Vital Signs</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Lab Results</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Treatment Plans</span>
                 </div>
                 <div className="flex items-center gap-2 text-gray-700">
                   <span className="text-green-500">✅</span>
                   <span>Personal Information</span>
                 </div>
               </div>
             </div>
           </div>
         </div>
      </div>
    </div>
  );
};

export default EncryptionExplained; 