import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Patient/general/Header';
import SpecialityMenu from '@/components/layout/Patient/general/SpecialityMenu';
import TopDoctors from '@/components/layout/Patient/general/TopDoctors';
import Banner from '@/components/layout/Patient/general/Banner';
import { AppContext } from '@/context/AppContext';
import type { IPatientAppContext } from '@/models/patient';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useContext(AppContext) as IPatientAppContext;

  return (
    <div>
      <Header />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />

      {/* Floating Action Button for My Appointments */}
      {token && (
        <button
          onClick={() => navigate('/my-appointments')}
          className="fixed bottom-6 right-6 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 z-50 flex items-center gap-2 cursor-pointer"
          title="My Appointments"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="hidden sm:inline">My Appointments</span>
        </button>
      )}
    </div>
  );
};

export default Home;
