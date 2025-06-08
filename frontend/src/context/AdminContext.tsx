import axios from 'axios';
import { createContext, useState } from 'react';
import { toast } from 'react-toastify';
import type { ReactNode } from 'react';

import type { IAdminContext } from '@/models/doctor';
import { smartApi } from '@/utils/smartApi';

export const AdminContext = createContext({} as IAdminContext);

interface AdminContextProviderProps {
  children: ReactNode;
}

const AdminContextProvider = (props: AdminContextProviderProps) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [aToken, setAToken] = useState<string>(
    localStorage.getItem('aToken') ? (localStorage.getItem('aToken') as string) : ''
  );
  const [appointments, setAppointments] = useState<IAdminContext['appointments']>([]);
  const [doctors, setDoctors] = useState<IAdminContext['doctors']>([]);
  const [dashData, setDashData] = useState<IAdminContext['dashData']>(null);

  // Getting all Doctors data from Database using API
  const getAllDoctors = async () => {
    try {
      console.log('🏥 Admin Portal: Fetching encrypted all-doctors');
      const data = await smartApi.get('/api/admin/all-doctors', {
        headers: { aToken }
      });
      if (data.success) {
        setDoctors(data.doctors);
        console.log('✅ All doctors loaded via Smart API');
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
    }
  };

  // Function to change doctor availablity using API (NOW WITH SMART ENCRYPTION)
  const changeAvailability = async (docId: string) => {
    try {
      console.log('🔥 CHECKBOX CLICKED! Doctor ID:', docId);
      console.log('🏥 Admin: Changing doctor availability with encryption');
      const data = await smartApi.post('/api/admin/change-availability',
        { docId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors();
        console.log('✅ Doctor availability changed via Smart API');
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
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
    }
  };

  // Getting all appointment data from Database using API
  const getAllAppointments = async () => {
    try {
      console.log('🏥 Admin Portal: Fetching encrypted appointments');
      const data = await smartApi.get('/api/admin/appointments', {
        headers: { aToken }
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
        console.log('✅ All appointments loaded via Smart API');
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

  // Function to cancel appointment using API (NOW WITH SMART ENCRYPTION)
  const cancelAppointment = async (appointmentId: string) => {
    try {
      console.log('🏥 Admin: Cancelling appointment with encryption');
      const data = await smartApi.post('/api/admin/cancel-appointment',
        { appointmentId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success(data.message);
        getAllAppointments();
        console.log('✅ Admin appointment cancelled via Smart API');
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

  // Getting Admin Dashboard data from Database using API
  const getDashData = async () => {
    try {
      console.log('🏥 Admin Portal: Fetching encrypted dashboard');
      const data = await smartApi.get('/api/admin/dashboard', {
        headers: { aToken }
      });

      if (data.success) {
        setDashData(data.dashData);
        console.log('✅ Admin dashboard loaded via Smart API');
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      console.log(error);
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
    }
  };

  const value = {
    aToken,
    setAToken,
    doctors,
    getAllDoctors,
    changeAvailability,
    appointments,
    getAllAppointments,
    getDashData,
    cancelAppointment,
    dashData
  };

  return <AdminContext.Provider value={value}>{props.children}</AdminContext.Provider>;
};

export default AdminContextProvider;
