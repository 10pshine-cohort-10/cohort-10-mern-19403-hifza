import { useState } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('')

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const emailRegex = /^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/;
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

        if (!emailRegex.test(email)) {
            setError('Invalid Email Address');
            return;
        }

        if (pass.length === 0) {
            setError('Please enter your password.');
            return;
        }

        if (!passRegex.test(pass)) {
            setError('Password must contain: 1. Atleast one UpperCase Letter 2. Atleast one number 3. Atleast one special character 4. Must be * Characters long.');
            return;
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email: email,
                pass: pass
            });


            localStorage.setItem('token', response.data.token);

            navigate('/dashboard');
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error || 'Login Failed!');
            }
            else {
                setError('Server is down!');

            }
        }


    }

    return (
        <div className="bg-light min-h-screen flex justify-center items-center p-4">
            <div className="bg-white p-8 text-dark flex flex-col w-full max-w-md border border-gray-200 rounded-2xl shadow-2xl">
                <h2 className="text-2xl text-center font-bold mb-6">Welcome Back</h2>
                
                {error && <p className="text-red-500 bg-red-50 p-2 rounded text-center text-sm mb-4">{error}</p>}
                
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='Email'>Email</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='Email'
                            type='email'
                            placeholder='you@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='Pass'>Password</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='Pass'
                            type='password'
                            placeholder='••••••••'
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                    </div>

                    <button 
                        className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-2 hover:bg-accent/90 hover:-translate-y-1 transition-all duration-300 shadow-md" 
                        type='submit'
                    >
                        Login
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account? <Link to="/register" className="text-accent font-bold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}