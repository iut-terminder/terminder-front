import './Modal.css';

const Modal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className='modal_overlay' onClick={onClose}>
            <div className='modal_box' onClick={(e) => e.stopPropagation()}>
                <div className='modal_header'>
                    {title && <p className='modal_title'>{title}</p>}
                    <button type='button' className='modal_close' onClick={onClose} title='بستن'>
                        ✕
                    </button>
                </div>
                <div className='modal_content'>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
