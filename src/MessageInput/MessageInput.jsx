import React, {PureComponent} from 'react';
import Textarea from 'react-textarea-autosize';
import './MessageInput.scss';

class MessageInput extends PureComponent {

    state = {
        message: '',
    };

    onSendButtonClick = () => {
        this.sendMessage();
    };

    onChange = (e) => {
        this.setState({message: e.target.value});
        this.props.onChangeMessage(e.target.value);
    };

    onKeyDown = (e) => {
        if (e.keyCode === 13 && e.ctrlKey === true) {
            e.preventDefault();
            this.sendMessage();
        }
    };

    sendMessage = () => {
        if (this.state.message.trim()) {
           this.props.onSendMessage(this.state.message.trim());
           this.setState({message: ''});
        }
    };

    render = () => (
        <div className={'message-input'}>
            <Textarea
                className={'message-input__text'}
                placeholder={'Type your message'}
                value={this.state.message}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
            />
            <button onClick={this.onSendButtonClick} disabled={!this.state.message.trim()}>Send</button>
        </div>
    );

}

export default MessageInput;
