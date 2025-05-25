export interface IUserData {
  image: string;
  name: string;
  dob: string;
}

export interface IDocData {
  image: string;
  name: string;
}

export interface IVitals {
  bpm?: number;
  spo2?: number;
}

export interface IAppointment {
  _id: string;
  userData: IUserData;
  docData: IDocData;
  vitals?: IVitals;
  slotDate: string;
  slotTime: string;
  amount: number;
  cancelled?: boolean;
  isCompleted?: boolean;
  payment?: boolean;
}
