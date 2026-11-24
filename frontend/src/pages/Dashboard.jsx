import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Notecard from '../components/Notecard';

export default function Dashboard() {
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setError('');
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/');
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            try {
                const [notesRes, profileRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/notes/', config),
                    axios.get('http://localhost:5000/api/auth/profile', config)
                ]);

                setNotes(notesRes.data);
                setUser(profileRes.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/');
                } else {
                    setError('Failed to load data.');
                }
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    const handleDelete = async (id) => {
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) { navigate('/'); return; }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        try {
            await axios.delete(`http://localhost:5000/api/notes/${id}`, config);
            setMessage('The note was deleted successfully.');
            setNotes(notes.filter((note) => note.id !== id));
        } catch (err) {
            if (err.response) {
                setError(err.response.data.error);
            } else {
                setError('Server is down');
            }
        }
    };

    const handleUpdate = (id) => {
        navigate(`/editor/${id}`);
    };

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-light min-h-screen flex flex-col items-center py-8 px-4">

            {/* 1. Header Bar */}
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md p-4 flex justify-between items-center mb-8 border border-gray-200">
                <h2 className="text-2xl text-dark font-bold">
                    {user ? `${user.name}'s Dashboard` : "Your Dashboard"}
                </h2>

                <div className="flex items-center gap-4">
                    {/* Avatar/Link - Now a perfect circle */}
                    <Link
                        to='/profile'
                        className="flex items-center justify-center bg-light text-dark font-bold rounded-full w-10 h-10 shadow-sm hover:bg-light/80 hover:scale-105 transition-all"
                    >
                        {user ? user.name.charAt(0).toUpperCase() : 'P'}
                    </Link>
                    <button
                        className="bg-accent text-white font-bold rounded-lg px-4 py-2 cursor-pointer hover:bg-dark transition-colors shadow-sm"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* 2. Error / Success Messages */}
            {error && <p className="text-red-500 bg-red-100 px-4 py-2 rounded-lg font-bold mb-4">{error}</p>}
            {message && <p className="text-green-600 bg-green-100 px-4 py-2 rounded-lg font-bold mb-4">{message}</p>}

            <div className="w-full max-w-5xl mb-8">
                <input
                    type="text"
                    placeholder=" Search notes by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
            </div>

            {/* 3. Create Button */}
            <div className="w-full max-w-5xl mb-8">
                <button
                    className="bg-accent text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-dark hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/editor')}
                >
                    + Create New Note
                </button>
            </div>

            {/* 4. Notes Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                        <p className="text-2xl font-bold text-dark">No notes found!</p>
                        <p className="text-gray-500">Click "+ Create New Note" to get started.</p>
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <Notecard
                            key={note.id}
                            note={note}
                            deleteNote={handleDelete}
                            updateNote={handleUpdate}
                        />
                    ))
                )}
            </div>
        </div>
    );
}