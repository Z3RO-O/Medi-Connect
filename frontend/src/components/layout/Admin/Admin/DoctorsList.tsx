import { useContext, useEffect } from 'react';

import { AdminContext } from '@/context/AdminContext';
import type { IAdminContext, IDoctorAdmin } from '@/models/doctor';

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(
    AdminContext
  ) as IAdminContext;

  console.log('🔍 DoctorsList: Context values:', { 
    doctorsCount: doctors?.length, 
    hasChangeAvailability: !!changeAvailability,
    hasToken: !!aToken 
  });

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-5 gap-y-6">
        {doctors && doctors.length > 0 ? (
          doctors.map((item: IDoctorAdmin, index: number) => (
            <div
              className="border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group"
              key={index}
            >
              <img
                className="doctor-card-image group-hover:bg-primary transition-all duration-500 w-full h-48"
                src={item.image}
                alt={item.name}
              />
              <div className="p-4">
                <p className="text-[#262626] text-lg font-medium">{item.name}</p>
                <p className="text-[#5C5C5C] text-sm">{item.speciality}</p>
                <div className="mt-2 flex items-center gap-1 text-sm">
                  <input
                    onChange={() => {
                      console.log('🎯 CHECKBOX CLICKED for doctor:', item.name, 'ID:', item._id);
                      changeAvailability(item._id);
                    }}
                    type="checkbox"
                    checked={item.available}
                    className="cursor-pointer"
                  />
                  <p>Available</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                className="w-12 h-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No doctors registered
            </h3>
            <p className="text-gray-500 mb-6 max-w-md">
              No doctors have been added to the system yet. Start by adding the first doctor to your platform.
            </p>
            <button
              onClick={() => window.location.href = '/admin/add-doctor'}
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all cursor-pointer"
            >
              Add Doctor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
