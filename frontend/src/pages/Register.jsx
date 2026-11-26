import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [conpass, setConpass] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        const emailRegex = /^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/;
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

        if (!emailRegex.test(email)) {
            setError('Email is Invalid');
            return;
        }

        if (!passRegex.test(pass)) {
            setError('Password must contain 8 character including 1 uppercase letter, 1 number and 1 special character.');
            return;
        }

        if (pass !== conpass) {
            setError('Password and conpass must be same');
            return;
        }


        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                name: name,
                username: username,
                email: email,
                password: pass
            });

            localStorage.setItem('tempEmail', email)

            navigate('/verify-otp')
        }
        catch(err){
            if(err.response){
                setError(err.response.data.error || 'Registeration Failed')
            }
            else{
                setError('Server is down')
            }
        }

    }



    return (
        <div className="bg-light min-h-screen flex justify-center items-center p-4">
            <div className="bg-white p-8 text-dark flex flex-col w-full max-w-md border border-gray-200 rounded-2xl shadow-2xl">
                <h2 className="text-2xl text-center font-bold mb-6">Create an Account</h2>
                
                {error && <p className="text-red-500 bg-red-50 p-2 rounded text-center text-sm mb-4">{error}</p>}
                
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='nameInput'>Name</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='nameInput'
                            type='text'
                            placeholder='Hifza Khan'
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='usernameInput'>Username</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='usernameInput'
                            type='text'
                            placeholder='hifzakhan'
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='emailInput'>Email</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='emailInput'
                            type='email'
                            placeholder='you@example.com'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='passInput'>Password</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='passInput'
                            type='password'
                            placeholder='••••••••'
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="font-bold text-sm mb-1" htmlFor='conpassInput'>Confirm Password</label>
                        <input
                            className="border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 focus:ring-2 focus:outline-none focus:ring-accent focus:border-transparent transition-all"
                            id='conpassInput'
                            type='password'
                            placeholder='••••••••'
                            value={conpass}
                            onChange={(e) => setConpass(e.target.value)}
                        />
                    </div>

                    <button 
                        className="w-full bg-accent text-white font-bold py-3 rounded-lg mt-2 hover:bg-accent/90 hover:-translate-y-1 transition-all duration-300 shadow-md" 
                        type='submit'
                    >
                        Register
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <a href="/" className="text-accent font-bold hover:underline">Log in</a>
                </p>
            </div>
        </div>
    );
}