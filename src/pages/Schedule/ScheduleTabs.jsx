import './ScheduleTabs.css';

const ScheduleTabs = ({ slots, activeIndex, onSelect }) => {
    return (
        <div className='schedule_tabs'>
            {slots.map((slot, idx) => (
                <button
                    key={idx}
                    type='button'
                    className={`schedule_tab ${idx === activeIndex ? 'active' : ''} ${!slot ? 'empty' : ''}`}
                    onClick={() => onSelect(idx)}
                >
                    {slot ? `برنامه ${idx + 1}` : `+`}
                </button>
            ))}
        </div>
    );
};

export default ScheduleTabs;
