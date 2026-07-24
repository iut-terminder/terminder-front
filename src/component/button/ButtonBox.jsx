import './ButtonBox.css'

const ButtonBox = (props) => {
     const submithandler = (event) => {
        props.onClick(event)
    }

    return <button   className='SubmitBox'
                    onClick={submithandler} 
                    style={props.style}
                    disabled={props.loading}>{props.defualt}</button>
};

export default ButtonBox