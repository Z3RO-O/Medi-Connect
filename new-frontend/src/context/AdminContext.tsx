import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import type { ReactNode } from 'react';

import type { IAdminContext } from '@/models/doctor'

export const AdminContext = createContext({} as IAdminContext)

interface AdminContextProviderProps {
    children: ReactNode;
}

const AdminContextProvider = (props: AdminContextProviderProps) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState<string>(localStorage.getItem('aToken') ? localStorage.getItem('aToken') as string : '')
    const [appointments, setAppointments] = useState<IAdminContext["appointments"]>([])
    const [doctors, setDoctors] = useState<IAdminContext["doctors"]>([])
    const [dashData, setDashData] = useState<IAdminContext["dashData"]>(null)

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
        }

    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId: string) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
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


    // Getting all appointment data from Database using API
    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
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

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId: string) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
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

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

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

    const value = {
        aToken, setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider