import InputBox from '../../component/input_box/InputBox';
import React, {useState, useContext} from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css'
import ToastContext from '../../store/Toast/ToastContext';

const ForgotPassword = () => {
    const { showToast } = useContext(ToastContext);
    const [studentNo, setStudentNo] = useState('');
    const [isValidStudentNo, setIsValidStudentNo] = useState(true);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null); // null | 'success' | 'error'
    const [message, setMessage] = useState('');

    const studentnochangehandler = (event) => {
        setStudentNo(event.target.value);
        if (event.target.value.trim().length > 0) {
            setIsValidStudentNo(true);
        }
    }

    const submithandler = async (event) => {
        event.preventDefault();

        const trimmed = studentNo.trim();
        if (trimmed.length === 0) {
            setIsValidStudentNo(false);
            return;
        }
        setIsValidStudentNo(true);

        setLoading(true);
        setStatus(null);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/users/request-password-reset', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ student_no: trimmed }),
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                throw new Error(data.error || 'sth went wrong!');
            }

            setStatus('success');
            const successMessage = data.message || 'در صورتی که این شماره دانشجویی در سامانه ثبت شده باشد، لینک بازنشانی رمز عبور به ایمیل شما ارسال خواهد شد';
            setMessage(successMessage);
            showToast(successMessage, 'success');
        } catch (error) {
            setStatus('error');
            const errMessage = 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید';
            setMessage(errMessage);
            showToast(errMessage, 'error');
        }
        setLoading(false);
    }

    return (
        <div className='forgot_Password'>
            {status === 'success' ? (
                <>
                    <p style={{ color: 'white', textAlign: 'center', padding: '0 1.5rem', lineHeight: '1.8' }}>{message}</p>
                    <p style={{ color: 'rgb(180, 190, 205)', textAlign: 'center', padding: '0 1.5rem', fontSize: '0.9rem' }}>
                        هنوز حساب کاربری نساخته‌اید؟
                    </p>
                    <Link to="/signup" className='text'>ساخت اکانت جدید</Link>
                    <Link to="/login" className='text'>بازگشت به صفحه ورود</Link>
                </>
            ) : (
                <>
                    <p style={{ color: 'white', textAlign: 'center', padding: '0 1.5rem' }}>
                        شماره دانشجویی خود را وارد کنید تا لینک بازنشانی رمز عبور برای ایمیل شما ارسال شود
                    </p>
                    <InputBox
                        type="text"
                        value={studentNo}
                        onChange={studentnochangehandler}
                        isValid={isValidStudentNo}
                        defualt='شماره دانشجویی'
                        style={{ width: '50%', height: '8%' }}
                    />
                    {status === 'error' && (
                        <p style={{ color: '#ff8080', textAlign: 'center', padding: '0 1.5rem' }}>{message}</p>
                    )}
                    {!loading && <button className='button' onClick={submithandler}> ارسال لینک بازنشانی </button>}
                    {loading && <p style={{color: 'white'}}> در حال ارسال... </p>}
                    <Link to="/login" className='text'>حساب کاربری دارید؟</Link>
                </>
            )}
        </div>
    );
}

export default ForgotPassword
