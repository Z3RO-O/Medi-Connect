import { createContext, useState } from "react";
import type { ReactNode } from 'react';
import axios from 'axios'
import { toast } from 'react-toastify'

import type { IDoctorContext } from '@/models/doctor'

export const DoctorContext = createContext({} as IDoctorContext)

interface DoctorContextProviderProps {
    children: ReactNode;
}

const DoctorContextProvider = (props: DoctorContextProviderProps) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState<string>(localStorage.getItem('dToken') ? localStorage.getItem('dToken') as string : '')
    const [appointments, setAppointments] = useState<IDoctorContext["appointments"]>([])
    const [dashData, setDashData] = useState<IDoctorContext["dashData"]>(null)
    const [profileData, setProfileData] = useState<unknown>(null)

    // Getting Doctor appointment data from Database using API
    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error: unknown) {
            console.log(error)
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
        }
    }

    // Getting Doctor profile data from Database using API
    const getProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            console.log(data.profileData)
            setProfileData(data.profileData)

        } catch (error: unknown) {
            console.log(error)
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
        }
    }

    // Function to cancel doctor appointment using API
    const cancelAppointment = async (appointmentId: string) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // after creating dashboard
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
            console.log(error)
        }

    }

    // Function to Mark appointment accepted using API
    const completeAppointment = async (appointmentId: string) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // Later after creating getDashData Function
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
            console.log(error)
        }

    }

    // Getting Doctor dashboard data using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error: unknown) {
            console.log(error)
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
        }

    }

    const value: IDoctorContext = {
        dToken, setDToken, backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )

}

export default DoctorContextProvider