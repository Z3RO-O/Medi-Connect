import { createContext } from "react";
import type { ReactNode } from 'react';

import type { IDoctorAppContext } from '@/models/doctor'

export const AppContext = createContext({} as IDoctorAppContext)

interface AppContextProviderProps {
    children: ReactNode;
}

const AppContextProvider = (props: AppContextProviderProps) => {

    const currency = import.meta.env.VITE_CURRENCY
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate: string) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Function to calculate the age eg. ( 20_01_2000 => 24 )
    const calculateAge = (dob: string) => {
        const today = new Date()
        const birthDate = new Date(dob)
        const age = today.getFullYear() - birthDate.getFullYear()
        return age
    }

    const value: IDoctorAppContext = {
        backendUrl,
        currency,
        slotDateFormat,
        calculateAge,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider