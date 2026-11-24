import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function Editor() {
    const [error, setError] = useState('');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');

    const { id } = useParams();

    const navigate = useNavigate();

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],     // lists
            [{ 'header': [1, 2, 3, false] }],                 // headers
            ['clean']                                         // remove formatting
        ],
    };

    useEffect(() => {
        if (id) {
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
                }

                try {
                    const res = await axios.get('http://localhost:5000/api/notes/', config);

                    const noteToEdit = res.data.find((note) => note.id === parseInt(id));

                    if (noteToEdit) {
                        setTitle(noteToEdit.title);
                        setContent(noteToEdit.content);
                    }
                }
                catch (err) {
                    if (err.response) {
                        setError(err.response.data.error)
                    }
                    else {
                        setError('Server is down')
                    }

                }

            }

            fetchData();
        }

    }, [id, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/');
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const response = await axios.post('http://localhost:5000/api/notes/', {
                title: title,
                content: content
            }, config);

            setMessage(`${title} is created`);
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (err) {
            if (err.response) {
                setError(err.response.data.error)
            }
            else {
                setError('Server is down')
            }
        }

    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/');
            return;
        }

        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        try {
            const response = await axios.put(`http://localhost:5000/api/notes/${id}`, {
                title: title,
                content: content
            }, config);

            setMessage(`${title} is updated`);
            setTimeout(() => navigate('/dashboard'), 1000);

        } catch (err) {
            if (err.response) {
                setError(err.response.data.error)
            }
            else {
                setError('Server is down')
            }
        }

    }

    return (
        <div className="bg-light min-h-screen flex flex-col items-center py-10 px-4">
            {/* Top Navigation Bar */}
            <div className="w-full max-w-md flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-dark">
                    {id ? 'Edit Note' : 'Create Note'}
                </h1>
                <button
                    className="bg-dark text-white rounded-lg px-4 py-2 shadow-md hover:bg-dark/80 transition-all"
                    onClick={() => navigate('/dashboard')}
                >
                    Back to Dashboard
                </button>
            </div>

            {/* Error/Success Messages */}
            {error && <p className="text-red-600 font-bold mb-4 bg-red-100 px-4 py-2 rounded-lg">{error}</p>}
            {message && <p className="text-green-700 font-bold mb-4 bg-green-100 px-4 py-2 rounded-lg">{message}</p>}

            {/* The Form (Used for BOTH Create and Update) */}
            <form
                className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col gap-6 border border-gray-200"
                onSubmit={id ? handleUpdate : handleSubmit}
            >
                {/* Title Input Group */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-dark" htmlFor='titleInput'>Title</label>
                    <input
                        className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                        id='titleInput'
                        type='text'
                        maxLength='100'
                        placeholder='Enter Title'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onFocus={(e) => e.target.select()}
                    />
                </div>

                {/* Content Input Group */}
                <div className="flex flex-col gap-2">
                    <label className="font-bold text-dark" htmlFor='contentInput'>Content</label>
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={setContent}
                        modules={modules}
                        placeholder="Write your note here..."
                        className="bg-white rounded-lg"
                    />
                </div>

                {/* Submit Button */}
                <button
                    className="bg-accent text-white font-bold py-3 rounded-lg shadow-lg hover:bg-opacity-90 hover:-translate-y-1 transition-all duration-300 mt-2"
                    type='submit'
                >
                    {id ? 'Update Note' : 'Create Note'}
                </button>
            </form>
        </div>
    );
}