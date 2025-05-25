import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import NewMeetingPage from '@/components/layout/Meet/NewMeet/NewMeet.tsx';
import JoinMeetingPage from '@/components/layout/Meet/JoinMeet/JoinMeet.tsx';
import MeetingPage from '@/components/layout/Meet/Meeting/[id]/page.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/join" element={<JoinMeetingPage />} />
        <Route path="/new" element={<NewMeetingPage />} />
        <Route path="/meeting/:id" element={<MeetingPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
