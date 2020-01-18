import React from 'react';
import {format} from "date-fns";
import './MessageBubble.scss';

const MessageBubble = (props) => (
        <div className={`message-bubble message-bubble--${props.message.direction}`}>
            <div className={`message-bubble__content message-bubble__content--${props.message.direction}`}>
                <b>{props.message.id}</b>-{props.message.text}
                -<b>{props.index}</b>
                -<b>{props.style.height}</b>
            </div>
            <span className={`message-bubble__time message-bubble__time--${props.message.direction}`}>
                    {format(props.message.timestamp, 'MM/dd/yyyy H:mm:ss')}
                </span>
        </div>
    );

export default MessageBubble;
