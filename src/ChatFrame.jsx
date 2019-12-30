import React, {PureComponent} from 'react';
import Div100vh from 'react-div-100vh';
import Chat from './Chat';
import MessageInput from './MessageInput';
import './ChatFrame.scss';
import {initialChatHistory} from './initialChatHistory';
import {MessageDirection} from './Chat/chat.enum';

class ChatFrame extends PureComponent {

    state = {
        chatHistory: initialChatHistory,
        message: ''
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.count !== this.state.count) {
            this.setState({chatHistory: initialChatHistory});
        }
    }

    onSendMessage = (message) => {
        this.setState({
            chatHistory: [...this.state.chatHistory, {
                text: message,
                direction: MessageDirection.OUT,
                timestamp: Date.now()
            }]
        })
    };

    onMessageChange = (message) => {
        this.setState({message});
    };

    render = () => (
        <Div100vh className="chat-frame">
            <header className="chat-frame__header">
                Header
            </header>
            <Chat messages={this.state.chatHistory} message={this.state.message}/>
            <MessageInput onSendMessage={this.onSendMessage} onChangeMessage={this.onMessageChange}/>
        </Div100vh>
    )
    ;
}

export default ChatFrame;
