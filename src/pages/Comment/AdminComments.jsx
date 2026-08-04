import { useState, useEffect, useContext, useCallback } from 'react';
import AuthContext from '../../store/Authentication/AuthContext';
import ToastContext from '../../store/Toast/ToastContext';
import './AdminComments.css';

const API_BASE = 'http://127.0.0.1:8000/api';

const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
        return new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit',
        }).format(new Date(isoString));
    } catch (_) {
        return isoString;
    }
};

const AdminComments = () => {
    const authCtx = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);

    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchComments = useCallback(async (pageToFetch) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/comments?page=${pageToFetch}`, {
                headers: { Authorization: `Bearer ${authCtx.access}` },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'دریافت کامنت‌ها انجام نشد');
            }

            setComments(data.comments || []);
            setTotalPages(data.total_pages || 1);
            setTotal(data.total || 0);
        } catch (error) {
            showToast(error.message || 'ارتباط با سرور برقرار نشد. لطفاً دوباره تلاش کنید', 'error');
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authCtx.access]);

    useEffect(() => {
        fetchComments(page);
    }, [page, fetchComments]);

    const goToPage = (newPage) => {
        if (newPage < 1 || newPage > totalPages || newPage === page) return;
        setPage(newPage);
    };

    const userLabel = (user) => {
        if (!user) return 'ناشناس';
        const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
        return name ? `${name} (${user.student_no})` : user.student_no || 'ناشناس';
    };

    return (
        <div className="admin_comments_page">
            <div className="admin_comments_header">
                <h2 className="admin_comments_title">لیست کامنت‌ها</h2>
                <span className="admin_comments_total">{total} کامنت</span>
            </div>

            {loading && <p className="admin_comments_status">در حال بارگذاری...</p>}

            {!loading && comments.length === 0 && (
                <p className="admin_comments_status">هنوز کامنتی ثبت نشده است</p>
            )}

            {!loading && comments.length > 0 && (
                <ul className="admin_comments_list">
                    {comments.map((comment) => (
                        <li key={comment._id} className="admin_comment_item">
                            <div className="admin_comment_meta">
                                <span className="admin_comment_user">{userLabel(comment.user)}</span>
                                <span className="admin_comment_date">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="admin_comment_text">{comment.text}</p>
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="admin_comments_pagination">
                    <button
                        className="admin_comments_page_btn"
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1 || loading}
                    >
                        قبلی
                    </button>
                    <span className="admin_comments_page_indicator">
                        صفحه {page} از {totalPages}
                    </span>
                    <button
                        className="admin_comments_page_btn"
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages || loading}
                    >
                        بعدی
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminComments;
