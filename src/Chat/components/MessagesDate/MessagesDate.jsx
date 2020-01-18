import React from 'react';
import './MessagesDate.scss';


const MessagesDate = (props) => {
    return props.date ? (
        <div className={'messages-date'}>
            <span className={'messages-date__text'}>{props.date}</span>
            {props.index && <span>-{props.index}</span>}
            {props.style && <span>-{props.style.height}</span>}
        </div>
    ) : null;
};

export default MessagesDate;
