import { useContext, useState } from 'react';
import './MainHeader.css'
import AuthContext from '../../store/Authentication/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const MainHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const authCtx = useContext(AuthContext);
    const navigate = useNavigate();

    const logoutHandler = () => {
        authCtx.logout();
        setIsMenuOpen(false);
        navigate('/login');
    }

    return (
        <div className="header">
            {/* دکمه همبرگر برای موبایل */}
            <button 
                className="hamburger" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                ☰
            </button>
            
            <div className={`menu ${isMenuOpen ? 'open' : ''}`}>
                <nav className='navbar'> 
                    <ul>
                        <li>
                            <button className='exit_link' onClick={logoutHandler}>
                                Exit
                            </button>
                        </li>
                        <li><Link to={'/comments'}>Comments</Link></li>
                        <li><a  href={import.meta.env.VITE_TEACHER_SURVEY}          //"https://cessaland.ir/ostad/"
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                    Teacher survey
                            </a></li>
                        <li><Link to={'/rank'}>Rank</Link></li>
                        <li><Link to={'/terminder'}>Terminder</Link></li>
                        {authCtx.isStaff &&
                            <li><Link to={'/admin'}>Admin pannel</Link></li>}
                        {authCtx.isStaff &&
                            <li><Link to={'/admin/comments'}>Comments (Admin)</Link></li>}
                        <li><Link to={'/dashboard'} className='home_link'>Home</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default MainHeader