import Modal from './Modal';
import './ConflictModal.css';

const RemovedLessonsModal = ({ isOpen, removedLessons, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title='به‌روزرسانی برنامه'>
            <p className='conflict_modal_text'>
                درس‌های زیر دیگر در سامانه وجود ندارند و از برنامه‌ی شما حذف شدند
            </p>
            <ul className='conflict_modal_list'>
                {removedLessons.map((l) => (
                    <li key={l.id || l.lesson_id}>{l.lesson_name} ({l.lesson_id})</li>
                ))}
            </ul>
            <div className='conflict_modal_actions'>
                <button type='button' className='conflict_btn cancel' onClick={onClose}>
                    متوجه شدم
                </button>
            </div>
        </Modal>
    );
};

export default RemovedLessonsModal;
