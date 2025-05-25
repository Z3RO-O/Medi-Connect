import { useContext, useEffect } from 'react'

import { DoctorContext } from '@/context/DoctorContext'
import { AppContext } from '@/context/DoctorAppContext'
import { assets } from '@/assets/assets'
import type { IDoctorContext, IDoctorAppContext } from '@/models/doctor'
import type { IAppointment } from '@/models/appointment'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } = useContext(DoctorContext) as IDoctorContext
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext) as IDoctorAppContext

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='w-full max-w-6xl m-5 '>

      <p className='mb-3 text-lg font-medium'>All Appointments</p>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_0.5fr_1fr_2fr_2fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Vitals</p>
          <p>Fees</p>
          <p>Action</p>
        </div>
        {appointments.map((item: IAppointment, index: number) => (
          <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_0.5fr_1fr_2fr_2fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
            <p className='max-sm:hidden'>{index}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='text-xs inline border border-primary px-2 rounded-full'>
                {item.payment?'Online':'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <div className='py-1'>
              {item.vitals ? (
                <div className='flex gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 flex items-center justify-center bg-red-100 rounded-full'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
                      </svg>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>Heart Rate</p>
                      <p className='text-sm font-medium'>{item.vitals.bpm || '-'} <span className='text-xs'>BPM</span></p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-7 h-7 flex items-center justify-center bg-blue-100 rounded-full'>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                      </svg>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500'>SpO2</p>
                      <p className='text-sm font-medium'>{item.vitals.spo2 || '-'} <span className='text-xs'>%</span></p>
                    </div>
                  </div>
                </div>
              ) : (
                <span className='text-gray-400 text-xs flex items-center justify-center h-full'>No vitals</span>
              )}
            </div>
            <p>{currency}{item.amount}</p>
            {item.cancelled
              ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
              : item.isCompleted
                ? <p className='text-green-500 text-xs font-medium'>Accepted</p>
                : <div className='flex'>
                  <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                  <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                </div>
            }
          </div>
        ))}
      </div>

    </div>
  )
}

export default DoctorAppointments