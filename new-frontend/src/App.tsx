import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { DoctorContext } from '@/context/DoctorContext';
import { AdminContext } from '@/context/AdminContext';

// Patient components
import PatientNavbar from '@/components/layout/Patient/general/Navbar';
import Footer from '@/components/layout/Patient/general/Footer';
import Home from '@/components/layout/Patient/Home';
import Doctors from '@/components/layout/Patient/Doctors';
import Login from '@/components/layout/Patient/Login';
import About from '@/components/layout/Patient/About';
import Contact from '@/components/layout/Patient/Contact';
import Appointment from '@/components/layout/Patient/Appointment';
import MyAppointments from '@/components/layout/Patient/MyAppointments';
import MyProfile from '@/components/layout/Patient/MyProfile';
import Verify from '@/components/layout/Patient/Verify';

// Meeting components
import NewMeetingPage from '@/components/layout/Meet/NewMeet/NewMeet';
import JoinMeetingPage from '@/components/layout/Meet/JoinMeet/JoinMeet';
import MeetingPage from '@/components/layout/Meet/Meeting/[id]/page';

// Admin components
import AdminNavbar from '@/components/layout/Admin/Navbar';
import AdminSidebar from '@/components/layout/Admin/Sidebar';
import Dashboard from '@/components/layout/Admin/Admin/Dashboard';
import AllAppointments from '@/components/layout/Admin/Admin/AllAppointments';
import AddDoctor from '@/components/layout/Admin/Admin/AddDoctor';
import DoctorsList from '@/components/layout/Admin/Admin/DoctorsList';
import AdminLogin from '@/components/layout/Admin/Login';

// Doctor components
import DoctorDashboard from '@/components/layout/Admin/Doctor/DoctorDashboard';
import DoctorAppointments from '@/components/layout/Admin/Doctor/DoctorAppointments';
import DoctorProfile from '@/components/layout/Admin/Doctor/DoctorProfile';

const App = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  if (aToken) {
    // Admin view
    return (
      <div className="bg-[#F8F9FD]">
        <ToastContainer />
        <AdminNavbar />
        <div className="flex items-start">
          <AdminSidebar />
          <Routes>
            <Route path="/" element={<Navigate to="/admin-dashboard" />} />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctor />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
          </Routes>
        </div>
      </div>
    );
  }

  if (dToken) {
    // Doctor view (using AdminNavbar/AdminSidebar)
    return (
      <div className="bg-[#F8F9FD]">
        <ToastContainer />
        <AdminNavbar />
        <div className="flex items-start">
          <AdminSidebar />
          <Routes>
            <Route path="/" element={<Navigate to="/doctor-dashboard" />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor-appointments" element={<DoctorAppointments />} />
            <Route path="/doctor-profile" element={<DoctorProfile />} />
            <Route path="/join" element={<JoinMeetingPage />} />
            <Route path="/new" element={<NewMeetingPage />} />
            <Route path="/meeting/:id" element={<MeetingPage />} />
          </Routes>
        </div>
      </div>
    );
  }

  // Patient view
  return (
    <div className="mx-4">
      <PatientNavbar />
      <div className="sm:mx-[6%]">
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:speciality" element={<Doctors />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment/:docId" element={<Appointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/join" element={<JoinMeetingPage />} />
          <Route path="/new" element={<NewMeetingPage />} />
          <Route path="/meeting/:id" element={<MeetingPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
