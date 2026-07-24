import Modal from './Modal';
import './ConflictModal.css';

const ConflictModal = ({ isOpen, lesson, conflictingLessons, onConfirm, onCancel }) => {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} title='تداخل زمانی'>
            <p className='conflict_modal_text'>
                درس «{lesson?.lesson_name}» با درس‌های زیر تداخل زمانی دارد
            </p>
            <ul className='conflict_modal_list'>
                {conflictingLessons.map((l) => (
                    <li key={l.id}>{l.lesson_name} ({l.lesson_id})</li>
                ))}
            </ul>
            <p className='conflict_modal_question'>آیا می‌خواهید همچنان این درس را انتخاب کنید؟</p>
            <div className='conflict_modal_actions'>
                <button type='button' className='conflict_btn confirm' onClick={onConfirm}>
                    بله، انتخاب کن
                </button>
                <button type='button' className='conflict_btn cancel' onClick={onCancel}>
                    انصراف
                </button>
            </div>
        </Modal>
    );
};

export default ConflictModal;
