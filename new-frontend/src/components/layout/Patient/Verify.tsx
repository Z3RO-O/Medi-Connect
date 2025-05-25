import axios from 'axios';
import { useContext, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify';

import { AppContext } from '@/context/PatientAppContext';
import type { IPatientAppContext } from '@/models/patient'

const Verify = () => {

    const [searchParams] = useSearchParams()

    const success = searchParams.get("success")
    const appointmentId = searchParams.get("appointmentId")

    const { backendUrl, token } = useContext(AppContext) as IPatientAppContext

    const navigate = useNavigate()

    // Function to verify stripe payment
    const verifyStripe = async () => {

        try {

            const { data } = await axios.post(backendUrl + "/api/user/verifyStripe", { success, appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }

            navigate("/my-appointments")

        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
                toast.error((error as { message: string }).message)
            } else {
                toast.error('An error occurred')
            }
            console.log(error)
        }

    }

    useEffect(() => {
        if (token && appointmentId && success) {
            verifyStripe()
        }
    }, [token, appointmentId, success])

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className="w-20 h-20 border-4 border-gray-300 border-t-4 border-t-primary rounded-full animate-spin"></div>
        </div>
    )
}

export default Verify