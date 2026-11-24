import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Profile() {

    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {

        const fetchData = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/');
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            try {
                const [data] = await Promise.all([
                    axios.get('http://localhost:5000/api/auth/profile', config)
                ]);

                setUser(data.data);

            } catch (err) {
                if (err.response) {
                    setError(err.response.data.error);
                } else {
                    setError('server is down');
                }
            }

        }

        fetchData();

    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };


    return (
        <div className="bg-light min-h-screen">
            <div className="flex items-center shadow-2xl">
                <h3 className="text-dark p-6 font-bold text-xl ">{user ? `${user.name}'s Profile` : "Your Profile"}</h3>
                <div className="ml-auto">
                    <button className="bg-dark h-auto p-2 m-3 rounded-lg text-white hover:bg-dark/50 hover:text-dark" onClick={() => navigate('/dashboard')}>Dashboard</button>
                </div>
            </div>
            {error && <p className="bg-red-500">{error}</p>}
            {user ? (
                <div className="p-10">
                    <p className="p-4"><strong >Name: </strong><div className="mt-4 brightness-80 bg-light p-2 rounded-lg shadow-2xl">{user.name}</div></p>
                    <p className="p-4"><strong >Username: </strong><div className="mt-4 brightness-80 bg-light p-2 rounded-lg shadow-2xl">{user.username}</div></p>
                    <p className="p-4"><strong >Email: </strong><div className="mt-4 brightness-80 bg-light p-2 rounded-lg shadow-2xl">{user.email}</div></p>
                    <p className="p-4"><strong >Created At: </strong><div className="mt-4 brightness-80 bg-light p-2 rounded-lg shadow-2xl">{String(user.created_at)}</div></p>
                </div>) :
                <p className="bg-pink-500">Loading...</p>}

            <div className="flex">
                <button className="ml-auto p-4 m-8 bg-dark text-white hover:bg-dark/50 hover:text-dark shadow-2xl rounded-lg" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
}