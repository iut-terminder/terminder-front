//import logo from './logo.svg';
import './App.css';
import { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from '../src/store/Authentication/AuthContext'
import VerifyEmail from './pages/login_signup_pages/VerifyEmail';
import Login from './pages/login_signup_pages/Login'
import SignUp from './pages/login_signup_pages/SignUp'
import ForgotPassword from './pages/login_signup_pages/ForgotPassword';
import ResetPassword from './pages/login_signup_pages/ResetPassword';
import MainPage from './pages/MainPage/MainPage';
import MainHeader from './pages/MainPage/MainHeader';
import AddDeptLesson from './pages/Admin/AddDeptLesson'
import Terminder from './pages/Terminder/Terminder';
import Comments from './pages/Comment/Comments';
import AdminComments from './pages/Comment/AdminComments';

function App() {
  const authCtx = useContext(AuthContext);

  return (
    <Router>
      <div className="app-container">
        {authCtx.isLoggedIn && 
          <div className='fixed_header'>
            <MainHeader></MainHeader>
          </div>
        }
        <div className='APP'>
          <Routes>
            <Route path='/' element={<Navigate to="/login" />} />
            {!authCtx.isLoggedIn &&
              <Route path='/login' element={<Login />} /> }
            {!authCtx.isLoggedIn &&
              <Route path='/signup' element={<SignUp />} />}
            {!authCtx.isLoggedIn &&
              <Route path='/forgotpassword' element={<ForgotPassword />} />}

            {authCtx.isLoggedIn &&
              <Route path='/login' element={<Navigate to="/dashboard" />} /> }
            {authCtx.isLoggedIn &&
              <Route path='/signup' element={<Navigate to="/dashboard"/>} />}
            {authCtx.isLoggedIn &&
              <Route path='/forgotpassword' element={<Navigate to="/dashboard"/>} />}
            
            {authCtx.isLoggedIn && <Route path='/dashboard' element={<MainPage />} />}
            {!authCtx.isLoggedIn && <Route path='/dashboard' element={<Navigate to="/login" />} />}
            {!authCtx.isLoggedIn && <Route path='/terminder' element={<Navigate to="/login" />} />}
            {!authCtx.isLoggedIn && <Route path='/survey' element={<Navigate to="/login" />} />}

            {authCtx.isLoggedIn && 
              <Route path='/comments' element={<Comments />} />}
            {!authCtx.isLoggedIn && <Route path='/comments' element={<Navigate to="/login" />} />}

            {authCtx.isLoggedIn && authCtx.isStaff &&
              <Route path='/admin' element={<AddDeptLesson />} />}
            {authCtx.isLoggedIn && !authCtx.isStaff &&
              <Route path='/admin' element={<Navigate to="/dashboard" />} />}
            {!authCtx.isLoggedIn &&
              <Route path='/admin' element={<Navigate to="/login" />} />}

            {/* لیست کامنت‌ها در پنل ادمین — فقط برای ادمین قابل دسترسی است */}
            {authCtx.isLoggedIn && authCtx.isStaff &&
              <Route path='/admin/comments' element={<AdminComments />} />}
            {authCtx.isLoggedIn && !authCtx.isStaff &&
              <Route path='/admin/comments' element={<Navigate to="/dashboard" />} />}
            {!authCtx.isLoggedIn &&
              <Route path='/admin/comments' element={<Navigate to="/login" />} />}

            {authCtx.isLoggedIn && <Route path='/terminder' element={<Terminder />} />}
            {!authCtx.isLoggedIn && <Route path='/terminder' element={<Navigate to="/login" />} />}

            <Route path="/verify-email/:userId/:token" element={<VerifyEmail />} />
            <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
          </Routes>
          <p className='Made'>
            Made with ❤️ Atid Khodaei /&/ Amirhossein Zendevani /&/<span className='quaalla'>Quaalla</span>
          </p>
        </div>
      </div>
    </Router>
  );
}

export default App;
