import React, {useState, useEffect, useContext} from 'react';
import './SignUp.css'
import { Link, useNavigate } from 'react-router-dom';
import InputBox from '../../component/input_box/InputBox';
import ToastContext from '../../store/Toast/ToastContext';

const SignUp = () => {
    const { showToast } = useContext(ToastContext);
    const navigate = useNavigate();
    const [signUpInput, setSignUpInput] = useState({
        enteredStudentNo: '',
        enteredFirstName: '',
        enteredLastName: '',
        enteredPhone: '',
        /*enteredEmail: '',*/
        enteredPass1: '',
        enteredPass2: ''
    });
    const [isValidInput, setIsValidInput] = useState({
        isValidStudentNo: true,
        //isValidEmail: true,
        isValidPass1: true,
        isValidPass2: true,
    });
    const [activeSubmit, setActiveSubmit] = useState(false)
    const [loading, setLoading] = useState(false)

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
        setSignUpInput((prevState) => {
            return {...prevState, enteredStudentNo: event.target.value};
        });
    }

    const fisrtnamechangehandler = (event) => {
        setSignUpInput((prevState) => {
            return {...prevState, enteredFirstName: event.target.value}
        })
    }

    const lastnamechangehandler = (event) => {
        setSignUpInput((prevState) => {
            return {...prevState, enteredLastName: event.target.value}
        })
    }

    const phonechangehandler = (event) => {
        setSignUpInput((prevState) => {
            return {...prevState, enteredPhone: event.target.value}
        })
    }

    /*const emailchangehandler = (event) => {
        if (event.target.value.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(event.target.value.trim())) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidEmail: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidEmail: false}
            })
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredEmail: event.target.value}
        })
    }*/

    const pass1changehandler = (event) => {
        if (event.target.value.trim().length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass1: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass1: false}
            })
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredPass1: event.target.value}
        })
    }

    const pass2changehandler = (event) => {
        if (event.target.value.trim().length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass2: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass2: false}
            })
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredPass2: event.target.value}
        })
    }

    useEffect(() => {
        setActiveSubmit(//isValidInput.isValidEmail &&
                        isValidInput.isValidStudentNo &&
                        isValidInput.isValidPass1 &&
                        isValidInput.isValidPass2
        );
    }, [//isValidInput.isValidEmail,
        isValidInput.isValidStudentNo,
        isValidInput.isValidPass1, 
        isValidInput.isValidPass2])

    const submithandler = async (event) => {
        event.preventDefault();

        let StudentNo = signUpInput.enteredStudentNo.trim();
        //let Email = signUpInput.enteredEmail.trim();
        let pass1 = signUpInput.enteredPass1.trim();
        let pass2 = signUpInput.enteredPass2.trim();
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
        setSignUpInput((prevState) => {
            return {...prevState, enteredStudentNo: StudentNo};
        });

        /*if (Email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidEmail: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidEmail: false}
            })
            Hasreturned = true;
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredEmail: Email}
        })*/

        if (pass1.length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass1: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass1: false}
            })
            Hasreturned = true;
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredPass1: pass1}
        })

        if (pass2.length >= 6) {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass2: true}
            })
        } else {
            setIsValidInput((prevState) => {
                return {...prevState, isValidPass2: false}
            })
            Hasreturned = true;
        }
        setSignUpInput((prevState) => {
            return {...prevState, enteredPass1: pass2}
        })

        if (signUpInput.enteredPass1.trim() !== signUpInput.enteredPass2.trim() || Hasreturned){
            showToast('لطفاً اطلاعات فرم را به‌درستی تکمیل کنید', 'error');
            return ;
        }

        setLoading(true)
        try
        {
            const respone = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                student_no: signUpInput.enteredStudentNo,
                first_name: signUpInput.enteredFirstName,
                last_name: signUpInput.enteredLastName,
                //email: signUpInput.enteredEmail,
                phone: signUpInput.enteredPhone,
                password: signUpInput.enteredPass1
                }),
            });
            const data = await respone.json()

            if (!respone.ok) {
                const firstError = data.error || data.message || Object.values(data)?.[0]?.[0];
                throw new Error(firstError || 'ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.');
            }

            showToast(data.message || 'ثبت‌نام با موفقیت انجام شد. لینک فعال‌سازی به ایمیل شما ارسال گردید.', 'success');
            navigate('/login');
        } catch(error) {
            showToast(error.message || 'ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید.', 'error');
        }
        setLoading(false)
    }

    return (
        <div className='signup'>
            <InputBox type='text' value={signUpInput.enteredStudentNo} onChange={studentnochangehandler} isValid={isValidInput.isValidStudentNo} defualt='*شماره دانشجویی' style={{ width: '50%', height: '8%' }} />
            <InputBox type="text" value={signUpInput.enteredFirstName} onChange={fisrtnamechangehandler} isValid='true' defualt='نام' style={{ width: '50%', height: '8%' }} />
            <InputBox type="text" value={signUpInput.enteredLastName}  onChange={lastnamechangehandler}  isValid='true' defualt='نام خانوادگی' style={{ width: '50%', height: '8%' }} />
            <InputBox type="text" value={signUpInput.enteredPhone}     onChange={phonechangehandler}     isValid='true' defualt='شماره' style={{ width: '50%', height: '8%' }} />
            {/*<InputBox type="text" value={signUpInput.enteredEmail}     onChange={emailchangehandler}     isValid={isValidInput.isValidEmail} defualt='*ایمیل' style={{ width: '50%', height: '8%' }} />*/}
            <InputBox type="password" value={signUpInput.enteredPass1} onChange={pass1changehandler}     isValid={isValidInput.isValidPass1} defualt='*رمز عبور' style={{ width: '50%', height: '8%' }} />
            <InputBox type="password" value={signUpInput.enteredPass2} onChange={pass2changehandler}     isValid={isValidInput.isValidPass2} defualt='*تکرار رمز عبور' style={{ width: '50%', height: '8%' }} />
            {!loading && 
                <button className='button' disabled={!activeSubmit} onClick={submithandler}> ثبت نام </button>
            }
            {loading && <p style={{color: 'white'}}> ...loading </p>}
            <Link to="/login" className='text'>حساب کاربری دارید؟</Link>
        </div>
    );
}

export default SignUp