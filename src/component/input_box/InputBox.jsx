import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './InputBox.css'

const InputBox = forwardRef((props, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = props.type === 'password';

    const changehandler = (event) => {
        props.onChange(event)
    }

    const toggleShowPassword = () => {
        setShowPassword((prev) => !prev);
    }

    const inputElement = (
        <input   ref={ref}
                        className={`input ${!(props.isValid) ? 'inValid' : ''} ${isPasswordField ? 'has_toggle' : ''}`}
                        onChange={changehandler}
                        type={isPasswordField && showPassword ? 'text' : props.type}
                        placeholder={props.defualt}
                        dir='auto'
                        style={isPasswordField ? undefined : props.style}></input>
    );

    if (!isPasswordField) {
        return inputElement;
    }

    return (
        <div className='input_password_wrapper' style={props.style}>
            {inputElement}
            <button
                type='button'
                className='input_password_toggle'
                onClick={toggleShowPassword}
                tabIndex={-1}
                title={showPassword ? 'مخفی کردن رمز عبور' : 'نمایش رمز عبور'}
            >
                {showPassword ? <EyeOff size={20} color='black' /> : <Eye size={20} color='black' />}
            </button>
        </div>
    );
});

export default InputBox
