import type { IAppointment } from './appointment';

export interface IDoctorAdmin {
  _id: string;
  image: string;
  name: string;
  speciality: string;
  available: boolean;
}

export interface IDashData {
  doctors: number;
  appointments: number;
  patients: number;
  latestAppointments: IAppointment[];
}

export interface IAdminContext {
  aToken: string;
  setAToken: React.Dispatch<React.SetStateAction<string>>;
  doctors: IDoctorAdmin[];
  getAllDoctors: () => Promise<void>;
  changeAvailability: (docId: string) => Promise<void>;
  appointments: IAppointment[];
  getAllAppointments: () => Promise<void>;
  getDashData: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  dashData: IDashData | null;
}

export interface IDoctorDashData {
  earnings: number;
  appointments: number;
  patients: number;
  latestAppointments: IAppointment[];
}

export interface DoctorProfile {
  _id: string;
  name: string;
  email: string;
  image: string;
  degree: string;
  experience: string;
  about: string;
  fees: number;
  address: {
    line1: string;
    line2: string;
  };
  available: boolean;
  speciality: string;
  phone?: string;
  slots_booked?: Record<string, string[]>;
}

export interface IDoctorContext {
  dToken: string;
  setDToken: React.Dispatch<React.SetStateAction<string>>;
  backendUrl: string;
  appointments: IAppointment[];
  getAppointments: () => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  completeAppointment: (appointmentId: string) => Promise<void>;
  dashData: IDoctorDashData | null;
  getDashData: () => Promise<void>;
  profileData: DoctorProfile | null;
  setProfileData: React.Dispatch<React.SetStateAction<DoctorProfile | null>>;
  getProfileData: () => Promise<void>;
}
