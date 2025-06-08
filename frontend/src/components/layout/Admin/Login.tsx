import { useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

import { DoctorContext } from '@/context/DoctorContext';
import { AdminContext } from '@/context/AdminContext';
import type { IDoctorContext } from '@/models/doctor';
import type { IAdminContext } from '@/models/doctor';
import { Button } from '@/components/ui/button';
import { smartApi } from '@/utils/smartApi';

const Login = () => {
  const [state, setState] = useState('Admin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { setDToken } = useContext(DoctorContext) as IDoctorContext;
  const { setAToken } = useContext(AdminContext) as IAdminContext;

  const onSubmitHandler = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (state === 'Admin') {
      console.log('🏥 Admin Login: Using encrypted authentication');
      const data = await smartApi.post('/api/admin/login', { email, password });
      if (data.success) {
        setAToken(data.token);
        localStorage.setItem('aToken', data.token);
        console.log('✅ Admin logged in via Smart API');
      } else {
        toast.error(data.message);
      }
    } else {
      console.log('🩺 Doctor Login: Using encrypted authentication');
      const data = await smartApi.post('/api/doctor/login', { email, password });
      if (data.success) {
        setDToken(data.token);
        localStorage.setItem('dToken', data.token);
        console.log('✅ Doctor logged in via Smart API');
      } else {
        toast.error(data.message);
      }
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full ">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full ">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        <Button className="bg-primary text-white w-full py-2 rounded-md text-base cursor-pointer">Login</Button>
        {state === 'Admin' ? (
          <p>
            Doctor Login?{' '}
            <span
              onClick={() => setState('Doctor')}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Admin Login?{' '}
            <span
              onClick={() => setState('Admin')}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
