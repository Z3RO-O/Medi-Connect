import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { DoctorContext } from '@/context/DoctorContext';
import { AdminContext } from '@/context/AdminContext';
import type { IDoctorContext, IAdminContext } from '@/models/doctor';

const Navbar = () => {
  const { dToken, setDToken } = useContext(DoctorContext) as IDoctorContext;
  const { aToken, setAToken } = useContext(AdminContext) as IAdminContext;

  const navigate = useNavigate();

  const logout = () => {
    navigate('/');
    if (dToken) {
      setDToken('');
      localStorage.removeItem('dToken');
    }
    if (aToken) {
      setAToken('');
      localStorage.removeItem('aToken');
    }
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <p onClick={() => navigate('/')} className="font-semibold text-lg cursor-pointer">
          Medi Connect
        </p>
        <p className="border-2 px-2.5 py-0.5 rounded-full border-primary">
          {aToken ? 'Admin' : 'Doctor'}
        </p>
      </div>
      <button
        onClick={() => logout()}
        className="bg-primary text-white text-sm px-10 py-2 rounded-full cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
