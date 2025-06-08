import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import type { IDoctorContext, DoctorProfile } from '@/models/doctor';
import { smartApi } from '@/utils/smartApi';

export const DoctorContext = createContext({} as IDoctorContext);

interface DoctorContextProviderProps {
  children: ReactNode;
}

const DoctorContextProvider = (props: DoctorContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [dToken, setDToken] = useState<string>(
    localStorage.getItem('dToken') ? (localStorage.getItem('dToken') as string) : ''
  );
  const [appointments, setAppointments] = useState<IDoctorContext['appointments']>([]);
  const [dashData, setDashData] = useState<IDoctorContext['dashData']>(null);
  const [profileData, setProfileData] = useState<DoctorProfile | null>(null);

  // Getting Doctor appointment data from Database using API
  const getAppointments = async () => {
    try {
      console.log('🩺 Doctor Portal: Fetching encrypted appointments');
      const data = await smartApi.get('/api/doctor/appointments', {
        headers: { dToken }
      }) as { success: boolean; appointments: IDoctorContext['appointments']; message?: string };

      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log('✅ Doctor appointments loaded via Smart API');
      } else {
        toast.error(data.message || 'Failed to load appointments');
      }
    } catch (error: unknown) {
      console.error('❌ Doctor appointments loading error:', error);
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        toast.error((error as { message: string }).message);
      } else {
        toast.error('An error occurred while loading appointments');
      }
    }
  };

  // Getting Doctor profile data from Database using API
  const getProfileData = async () => {
    try {
      console.log('🩺 Doctor Portal: Fetching encrypted profile');
      const data = await smartApi.get('/api/doctor/profile', { 
        headers: { dToken } 
      }) as { profileData: DoctorProfile };
      
      setProfileData(data.profileData);
      console.log('✅ Doctor profile loaded via Smart API');
    } catch (error: unknown) {
      console.error('❌ Doctor profile loading error:', error);
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        toast.error((error as { message: string }).message);
      } else {
        toast.error('An error occurred while loading profile');
      }
    }
  };

  // Function to cancel doctor appointment using API (NOW WITH SMART ENCRYPTION)
  const cancelAppointment = async (appointmentId: string) => {
    try {
      console.log('🩺 Doctor: Cancelling appointment with encryption');
      const data = await smartApi.post('/api/doctor/cancel-appointment', 
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
        console.log('✅ Appointment cancelled via Smart API');
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        toast.error((error as { message: string }).message);
      } else {
        toast.error('An error occurred');
      }
      console.log(error);
    }
  };

  // Function to Mark appointment accepted using API (NOW WITH SMART ENCRYPTION)
  const completeAppointment = async (appointmentId: string) => {
    try {
      console.log('🩺 Doctor: Completing appointment with encryption');
      const data = await smartApi.post('/api/doctor/complete-appointment',
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAppointments();
        getDashData();
        console.log('✅ Appointment completed via Smart API');
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        toast.error((error as { message: string }).message);
      } else {
        toast.error('An error occurred');
      }
      console.log(error);
    }
  };

  // Getting Doctor dashboard data using API
  const getDashData = async () => {
    try {
      console.log('🩺 Doctor Portal: Fetching encrypted dashboard data');
      const data = await smartApi.get('/api/doctor/dashboard', {
        headers: { dToken }
      }) as { success: boolean; dashData: IDoctorContext['dashData']; message?: string };

      if (data.success) {
        setDashData(data.dashData);
        console.log('✅ Doctor dashboard loaded via Smart API');
      } else {
        toast.error(data.message || 'Failed to load dashboard');
      }
    } catch (error: unknown) {
      console.error('❌ Doctor dashboard loading error:', error);
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        toast.error((error as { message: string }).message);
      } else {
        toast.error('An error occurred while loading dashboard');
      }
    }
  };

  const value: IDoctorContext = {
    dToken,
    setDToken,
    backendUrl,
    appointments,
    getAppointments,
    cancelAppointment,
    completeAppointment,
    dashData,
    getDashData,
    profileData,
    setProfileData,
    getProfileData
  };

  return <DoctorContext.Provider value={value}>{props.children}</DoctorContext.Provider>;
};

export default DoctorContextProvider;
