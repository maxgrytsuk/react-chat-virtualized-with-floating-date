import React, {PureComponent} from 'react';
import Div100vh from 'react-div-100vh';
import Chat from './Chat';
import MessageInput from './MessageInput';
import './ChatFrame.scss';
import {initialChatHistory} from './initialChatHistory';
import {MessageDirection} from './Chat/chat.enum';

export const MESSAGES_PER_PAGE = 50;

class ChatFrame extends PureComponent {

    state = {
        chatHistory: initialChatHistory.sort((a, b) => b.timestamp - a.timestamp).slice(0, MESSAGES_PER_PAGE),
        newMessages: {
            items: [],
            page: 0
        },
        page: 0,
        draftMessage: ''
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.page !== this.state.page) {
            console.log('this.state.page', this.state.page);
            const start = this.state.page * MESSAGES_PER_PAGE;
            const items = initialChatHistory.slice(start, start + MESSAGES_PER_PAGE);
            this.setState({newMessages: {items, page: this.state.page}});
        }
    }

    onSendMessage = (message) => {
        this.setState({
            newMessages: {
                items: [{
                    text: message,
                    direction: MessageDirection.OUT,
                    timestamp: Date.now()
                }],
                page: undefined
            }
        });
    };

    onMessageChange = (draftMessage) => {
        this.setState({draftMessage});
    };

    onScrollTop = (page) => {
        page = page + 1;
        this.setState({page});
    };

    render = () => (
        <Div100vh className="chat-frame">
            <header className="chat-frame__header">
                Header
            </header>
            <Chat chatHistory={this.state.chatHistory} newMessages={this.state.newMessages}
                  draftMessage={this.state.draftMessage} onScrollTop={this.onScrollTop}/>
            <MessageInput onSendMessage={this.onSendMessage} onChangeMessage={this.onMessageChange}/>
        </Div100vh>
    );
}

export default ChatFrame;
