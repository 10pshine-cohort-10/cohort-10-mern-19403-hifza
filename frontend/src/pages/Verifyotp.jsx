import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Verifyotp() {

    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [timer, setTimer] = useState('60');
    const [message, setMessage] = useState('');

    const navigate = useNavigate();

    const email = localStorage.getItem('tempEmail');

    useEffect(()=>{
        if(timer>0){
            const interval = setInterval(()=>{
                setTimer((prev)=> prev - 1);
            }, 1000);
            return ()=> clearInterval(interval);
        }
        

    },[timer])

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate])

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('The otp Length shoud be 6');
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/auth/verify-otp", {
                email: email,
                otp: otp
            })

            alert("Email Verified Successfully! Please Log in");
            localStorage.setItem('tempEmail', email);

            navigate('/');

        }
        catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'OTP is not Valid');
                return;
            }
            else {
                setError('Failed to Verify!')
            }

        }
    }

    async function handleResend(e) {
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
                email: email
            })

            setMessage('The otp is send successfully');
            setTimer('60');

        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
                return;
            } else {
                setError('Server is down');
            }

        }

    }

        return (
        <div className="bg-light min-h-screen flex justify-center items-center p-4">
            <div className="bg-white p-8 text-dark flex flex-col w-full max-w-md border border-gray-200 rounded-2xl shadow-2xl">
                <h2 className="text-2xl text-center font-bold mb-2">Verify Your Email</h2>
                <p className="text-center text-gray-500 text-sm mb-6">
                    We sent a 6-digit code to <strong className="text-dark">{email}</strong>
                </p>
                
                {error && <p className="text-red-500 bg-red-50 p-2 rounded text-center text-sm mb-4">{error}</p>}
                {message && <p className="text-green-600 bg-green-50 p-2 rounded text-center text-sm mb-4">{message}</p>}
                
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1 text-center" htmlFor='otpInput'>Enter OTP</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-3 text-center text-2xl tracking-widest font-mono focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='otpInput'
                            type='text'
                            maxLength='6'
                            placeholder='------'
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                    </div>
                    
                    <button 
                        className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-2 hover:bg-accent/90 transition-all shadow-md" 
                        type='submit'
                    >
                        Verify Account
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">Didn't receive the code?</p>
                    <button 
                        onClick={handleResend}
                        disabled={timer > 0}
                        type='button'
                        className={`text-sm font-bold ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-accent hover:underline cursor-pointer'}`}
                    >
                        {timer > 0 ? `Resend available in ${timer}s` : 'Resend OTP'}
                    </button>
                </div>
            </div>
        </div>
    );
}