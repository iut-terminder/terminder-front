import { useContext, useState } from 'react';
import './MainHeader.css'
import AuthContext from '../../store/Authentication/AuthContext';
import { Link } from 'react-router-dom';

const MainHeader = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const authCtx = useContext(AuthContext);
    
    const submithandler = () => {
        authCtx.logout();
    }

    return (
        <div className="header">
            <div className='profile'>
                <img className='picture' src='/profile.png' alt='profile' />
            </div>
            
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
                        
                        <li><Link to={'/comments'}>Comments</Link></li>
                        <li><Link to={'/survey'}>Teacher survey</Link></li>
                        <li><Link to={'/terminder'}>Terminder</Link></li>
                        {authCtx.isStaff &&
                            <li><Link to={'/admin'}>Admin pannel</Link></li>}
                        <li><Link to={'/dashboard'} className='home_link'>Home</Link></li>
                    </ul>
                </nav>
            </div>
        </div>
    );
};

export default MainHeader