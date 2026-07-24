import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './VerifyEmail.css';
import ToastContext from '../../store/Toast/ToastContext';

const VerifyEmail = () => {
    const { userId, token } = useParams(); 
    const navigate = useNavigate();
    const { showToast } = useContext(ToastContext);
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('در حال بررسی و فعال‌سازی حساب کاربری...');

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                const response = await axios.post(`http://127.0.0.1:8000/api/users/verify-email/${userId}/${token}`);
                setStatus('success');
                const successMessage = response.data.message || 'حساب کاربری شما با موفقیت فعال شد';
                setMessage(successMessage);
                showToast(successMessage, 'success');
            } catch (error) {
                setStatus('error');
                let errMessage;
                if (error.response && error.response.data) {
                    errMessage = error.response.data.error || error.response.data.message || 'لینک تایید نامعتبر یا منقضی شده است';
                } else {
                    errMessage = 'ارتباط با سرور برقرار نشد. لطفاً مجدداً تلاش کنید';
                }
                setMessage(errMessage);
                showToast(errMessage, 'error');
            }
        };

        if (userId && token) {
            verifyAccount();
        } else {
            setStatus('error');
            setMessage('لینک فعال‌سازی ناقص یا نامعتبر است.');
        }
    }, [userId, token]);

    return (
        <div className='verify_email'>
            {status === 'loading' && <span className='icon loading'>⏳</span>}
            {status === 'success' && <span className='icon'>✅</span>}
            {status === 'error' && <span className='icon'>❌</span>}

            <p className='message'>{message}</p>

            {status === 'success' && (
                <button className='button' onClick={() => navigate('/login')}>
                    ورود به سامانه
                </button>
            )}

            {status === 'error' && (
                <>
                    <button className='button' onClick={() => navigate('/login')}>
                        بازگشت به صفحه ورود
                    </button>
                    <Link to="/signup" className='text'>ساخت اکانت جدید</Link>
                </>
            )}
        </div>
    );
};

export default VerifyEmail;