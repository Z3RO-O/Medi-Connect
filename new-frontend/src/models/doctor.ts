import type { IAppointment } from './appointment'

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

export interface IDoctorAppContext {
  backendUrl: string;
  currency: string;
  slotDateFormat: (slotDate: string) => string;
  calculateAge: (dob: string) => number;
}

export interface IDoctorDashData {
  earnings: number;
  appointments: number;
  patients: number;
  latestAppointments: IAppointment[];
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
  profileData: any;
  setProfileData: React.Dispatch<React.SetStateAction<any>>;
  getProfileData: () => Promise<void>;
}
