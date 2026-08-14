import { useState, useContext } from 'react';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';
import './Comments.css';

const MAX_LENGTH = 5000;

const Comments = () => {
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);

    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    const submitHandler = async (event) => {
        event.preventDefault();

        const trimmed = text.trim();
        if (trimmed.length === 0) {
            showToast('متن کامنت نمی‌تواند خالی باشد', 'error');
            return;
        }

        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (authCtx.isLoggedIn) {
                headers.Authorization = `Bearer ${authCtx.access}`;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/comments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ text: trimmed }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'ارسال کامنت انجام نشد');
            }

            showToast(data.message || 'کامنت شما با موفقیت ثبت شد', 'success');
            setText('');
        } catch (error) {
            showToast(error.message || 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="comments_page">
            <div className="comments_box">
                <h2 className="comments_title">نظر یا پیشنهاد خود را با ما در میان بگذارید</h2>
                <p className="comments_subtitle">
                    هر نظر، انتقاد یا پیشنهادی دارید همینجا برایمان بنویسید.
                </p>
                <form onSubmit={submitHandler} className="comments_form">
                    <textarea
                        className="comments_textarea"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="متن خود را اینجا بنویسید..."
                        maxLength={MAX_LENGTH}
                        disabled={loading}
                        rows={7}
                    />
                    <div className="comments_char_count">
                        {text.length} / {MAX_LENGTH}
                    </div>
                    <button type="submit" className="comments_submit_btn" disabled={loading || text.trim().length === 0}>
                        {loading ? 'در حال ارسال...' : 'ارسال'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Comments;
