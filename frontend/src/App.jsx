import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Verifyotp from './pages/Verifyotp';
import Editor from './pages/Editor';

function App(){
  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path='/verify-otp' element={<Verifyotp />} />
      <Route path='/editor' element={<Editor />}/>
      <Route path='/editor/:id' element={<Editor />}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;