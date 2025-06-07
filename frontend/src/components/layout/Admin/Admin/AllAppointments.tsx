import { useEffect, useContext } from 'react';

import { assets } from '@/assets/assets';
import { AdminContext } from '@/context/AdminContext';
import { AppContext } from '@/context/AppContext';
import type { IAdminContext } from '@/models/doctor';
import type { IPatientAppContext } from '@/models/patient';
import type { IAppointment } from '@/models/appointment';

const AllAppointments = () => {
  const { aToken, appointments, cancelAppointment, getAllAppointments } = useContext(
    AdminContext
  ) as IAdminContext;
  const { slotDateFormat, calculateAge, currencySymbol } = useContext(
    AppContext
  ) as IPatientAppContext;

  useEffect(() => {
    if (aToken) {
      getAllAppointments();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5 ">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_0.5fr_1fr_2fr_2fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Vitals</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item: IAppointment, index: number) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_0.5fr_1fr_2fr_2fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img src={item.userData.image} className="w-8 rounded-full" alt="" />{' '}
              <p>{item.userData.name}</p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <div className="flex items-center gap-2">
              <img src={item.docData.image} className="w-8 rounded-full bg-gray-200" alt="" />{' '}
              <p>{item.docData.name}</p>
            </div>
            <div className="py-1">
              {item.vitals ? (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-red-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-red-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Heart Rate</p>
                      <p className="text-sm font-medium">
                        {item.vitals.bpm || '-'} <span className="text-xs">BPM</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 flex items-center justify-center bg-blue-100 rounded-full">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-blue-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">SpO2</p>
                      <p className="text-sm font-medium">
                        {item.vitals.spo2 || '-'} <span className="text-xs">%</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 text-xs flex items-center justify-center h-full">
                  No vitals
                </span>
              )}
            </div>
            <p>
              {currencySymbol}
              {item.amount}
            </p>
            {item.cancelled ? (
              <p className="text-red-400 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <div className="flex flex-col gap-1">
                {item.meetingId && (
                  <button
                    onClick={() => window.open(`/meeting/${item.meetingId}?name=Admin`, '_blank')}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Join
                  </button>
                )}
                <p className="text-green-500 text-xs font-medium">Accepted</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {item.meetingId && (
                  <button
                    onClick={() => window.open(`/meeting/${item.meetingId}?name=Admin`, '_blank')}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Join
                  </button>
                )}
                <img
                  onClick={() => cancelAppointment(item._id)}
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
