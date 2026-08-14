import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import InputBox from '../../component/input_box/InputBox';
import './ForgotPassword.css';
import ToastContext from '../../store/Toast/ToastContext';

const ResetPassword = () => {
    const { userId, token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useContext(ToastContext);

    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [isValidPass1, setIsValidPass1] = useState(true);
    const [isValidPass2, setIsValidPass2] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | 'success' | 'error'
    const [message, setMessage] = useState('');

    const pass1changehandler = (event) => {
        setPassword1(event.target.value);
        if (event.target.value.trim().length >= 6) {
            setIsValidPass1(true);
        }
    };

    const pass2changehandler = (event) => {
        setPassword2(event.target.value);
        if (event.target.value.trim().length > 0) {
            setIsValidPass2(true);
        }
    };

    const submithandler = async (event) => {
        event.preventDefault();

        const pass1 = password1.trim();
        const pass2 = password2.trim();
        let hasError = false;

        if (pass1.length < 6) {
            setIsValidPass1(false);
            hasError = true;
        } else {
            setIsValidPass1(true);
        }

        if (pass2 !== pass1 || pass2.length === 0) {
            setIsValidPass2(false);
            hasError = true;
        } else {
            setIsValidPass2(true);
        }

        if (hasError) {
            return;
        }

        setLoading(true);
        setStatus(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/reset-password/${userId}/${token}`,
                { new_password1: pass1, new_password2: pass2 }
            );
            setStatus('success');
            const successMessage = response.data.message || 'رمز عبور شما با موفقیت تغییر کرد';
            setMessage(successMessage);
            showToast(successMessage, 'success');
        } catch (error) {
            setStatus('error');
            if (error.response && error.response.data) {
                const data = error.response.data;
                const firstError =
                    data.error ||
                    data.message ||
                    data.new_password1?.[0] ||
                    data.new_password2?.[0];
                const errMessage = firstError || 'لینک بازنشانی نامعتبر یا منقضی شده است';
                setMessage(errMessage);
                showToast(errMessage, 'error');
            } else {
                const errMessage = 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید';
                setMessage(errMessage);
                showToast(errMessage, 'error');
            }
        }
        setLoading(false);
    };

    if (status === 'success') {
        return (
            <div className='forgot_Password'>
                <p style={{ color: 'white', textAlign: 'center', padding: '0 1.5rem', lineHeight: '1.8' }}>
                    {message}
                </p>
                <button className='button' onClick={() => navigate('/login')}>
                    ورود به سامانه
                </button>
            </div>
        );
    }

    return (
        <div className='forgot_Password'>
            <p style={{ color: 'white', textAlign: 'center', padding: '0 1.5rem' }}>
                رمز عبور جدید خود را وارد کنید
            </p>
            <InputBox
                type="password"
                value={password1}
                onChange={pass1changehandler}
                isValid={isValidPass1}
                defualt='رمز عبور جدید'
                style={{ width: '50%', height: '8%' }}
            />
            <InputBox
                type="password"
                value={password2}
                onChange={pass2changehandler}
                isValid={isValidPass2}
                defualt='تکرار رمز عبور جدید'
                style={{ width: '50%', height: '8%' }}
            />
            {status === 'error' && (
                <p style={{ color: '#ff8080', textAlign: 'center', padding: '0 1.5rem' }}>{message}</p>
            )}
            {!loading && <button className='button' onClick={submithandler}> تغییر رمز عبور </button>}
            {loading && <p style={{ color: 'white' }}> ...در حال ارسال </p>}
            <Link to="/login" className='text'>بازگشت به صفحه ورود</Link>
        </div>
    );
};

export default ResetPassword;
