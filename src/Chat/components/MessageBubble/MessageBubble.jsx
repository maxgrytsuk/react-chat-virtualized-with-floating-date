import React, { PureComponent } from 'react';
import {format} from "date-fns";
import './MessageBubble.scss';

class MessageBubble extends PureComponent {
    render() {
        return (
            <div className={`message-bubble message-bubble--${this.props.message.direction}`}>
                <div className={`message-bubble__content message-bubble__content--${this.props.message.direction}`}>
                    {this.props.message.text}
                </div>
                <span className={`message-bubble__time message-bubble__time--${this.props.message.direction}`}>
                    {format(this.props.message.timestamp, 'MM/dd/yyyy H:mm:ss')}
                </span>
            </div>
        );
    }
}

export default MessageBubble;
