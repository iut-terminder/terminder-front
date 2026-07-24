import React, {useState, useEffect, useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'
import InputBox from '../../component/input_box/InputBox';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';

const Login = () => {
    const [loginInput, setLoginInput] = useState({
            enteredStudentNo: '',
            enteredPass: '',
        });
    
    const [isValidInput, setIsValidInput] = useState({
            isValidStudentNo: true,
            isValidPass: true,
        });
    const [activeSubmit, setActiveSubmit] = useState(true)
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    const Navigate = useNavigate();
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);

    const studentnochangehandler = (event) => {
        if (event.target.value.trim().length > 8 || event.target.value.trim().length < 7 || !/^\d+$/.test(event.target.value.trim())) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidStudentNo: false}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidStudentNo: true}
            })
        }
        setLoginInput((prevState) => {
            return {...prevState, enteredStudentNo: event.target.value};
        });
    }

    const passchangehandler = (event) => {
        if (event.target.value.trim().length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass: false}
            })
        }
        setLoginInput((prevState) => {
            return {...prevState, enteredPass: event.target.value}
        })
    }

    useEffect(() => {
        setActiveSubmit(isValidInput.isValidStudentNo
                        && isValidInput.isValidPass);
    }, [isValidInput.isValidStudentNo, isValidInput.isValidPass]);

    const submithandler = async (event) => {
        event.preventDefault()

        let StudentNo = loginInput.enteredStudentNo.trim();
        let pass = loginInput.enteredPass.trim();
        let Hasreturned = false;

        if (StudentNo.length > 8 || StudentNo.length < 7 || !/^\d+$/.test(StudentNo)) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidStudentNo: false}
            })
            Hasreturned = true;
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidStudentNo: true}
            })
        }
        setLoginInput((prevState) => {
            return {...prevState, enteredStudentNo: StudentNo};
        });

        if (pass.length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass: false}
            })
            Hasreturned = true;
        }
        setLoginInput((prevState) => {
            return {...prevState, enteredPass: pass}
        })

        if (Hasreturned){
            return;
        }

        setLoading(true);
        setLoginError('');
        try
        {
            const respone = await fetch('http://127.0.0.1:8000/api/users/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                student_no: loginInput.enteredStudentNo,
                password: loginInput.enteredPass,
                }),
            });
            const data = await respone.json()
            
            if (!respone.ok) {
                throw new Error(data.detail || 'شماره دانشجویی یا رمز عبور اشتباه است');
            }

            const accessPayload = JSON.parse(atob(data.access.split(".")[1]));
            const accessExp = accessPayload.exp;               
            const accessExpDate = accessExp * 1000;  

            // decode refresh token
            const refreshPayload = JSON.parse(atob(data.refresh.split(".")[1]));
            const refreshExp = refreshPayload.exp;
            const refreshExpDate = refreshExp * 1000;

            console.log("Access expires:", accessExpDate);
            console.log("Refresh expires:", refreshExpDate);

            authCtx.login(data.access, data.refresh, accessExpDate, refreshExpDate);
            showToast('ورود با موفقیت انجام شد', 'success');
            Navigate("/dashboard");
        } catch(error) {
            const errMessage = error.message || 'ورود ناموفق بود. لطفاً دوباره تلاش کنید';
            setLoginError(errMessage);
            showToast(errMessage, 'error');
        }
        setLoading(false);
    }

    return (
        <div className='login'>
            <InputBox type="text" value={loginInput.enteredStudentNo} onChange={studentnochangehandler} isValid={isValidInput.isValidStudentNo} defualt='شماره دانشجویی' style={{ width: '50%', height: '8%' }} />
            <InputBox type="password" value={loginInput.enteredPass} onChange={passchangehandler}     isValid={isValidInput.isValidPass} defualt='رمز عبور' style={{ width: '50%', height: '8%' }} />
            {!loading && <button className='button' disabled={!activeSubmit} onClick={submithandler}> ورود </button>}
            {loading && <p style={{color: 'white'}}> Loading... </p>}
            <div className='option'>
                <Link to="/signup" className='text'>ساخت اکانت جدید</Link>
                <Link to="/forgotpassword" className='text'>فراموشی رمز عبور</Link>
            </div>
        </div>
    );
}

export default Login