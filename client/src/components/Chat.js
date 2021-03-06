import React from 'react'
import Hoc from '../hoc/hoc'
import WebSocketInstance from '../websocket'
import { connect } from 'react-redux';


class Chat extends React.Component {

    state = {message: ''}

    initialiseChat() {
        WebSocketInstance.connect(this.props.match.params.chatID)
        this.waitForSocketConnection(() => {
            WebSocketInstance.addCallbacks(this.setMessages.bind(this), this.addMessage.bind(this))
            WebSocketInstance.fetchMessages(
                this.props.username,
                this.props.match.params.chatID
            )
        })
    }

    constructor(props) {
        super(props)
        this.initialiseChat()
    }

    componentWillReceiveProps(newProps) {
        if (this.props.match.params.chatID !== newProps.match.params.chatID) {
            WebSocketInstance.disconnect()
            WebSocketInstance.connect(newProps.match.params.chatID)
            this.waitForSocketConnection(() => {
                WebSocketInstance.fetchMessages(
                    newProps.username,
                    newProps.match.params.chatID
                )
            })
        }
    }

    waitForSocketConnection(callback) {
        const component = this
        setTimeout(
            function () {
                if (WebSocketInstance.state() === 1) {
                    console.log("Connection is made")
                    callback()
                    return
                } else {
                    console.log("wait for connection...")
                    component.waitForSocketConnection(callback)
                }
            }, 100)
    }

    addMessage(message) {
        this.setState({ messages: [...this.state.messages, message] })
    }

    setMessages(messages) {
        this.setState({ messages: messages.reverse() })
    }

    messageChangeHandler = (event) => {
        this.setState({
            message: event.target.value
        })
    }

    sendMessageHandler = (e) => {
        e.preventDefault()
        const messageObject = {
            from: this.props.username,
            content: this.state.message,
            chatId: this.props.match.params.chatID
        }
        WebSocketInstance.newChatMessage(messageObject)
        this.setState({
            message: ''
        })
    }

    renderMessages = (messages) => {
        // const currentUser = "admin"
        const currentUser = this.props.username
        return messages.map((message, i, arr) => (
            <li
                key={message.id}
                // style={{ marginBottom: arr.length - 1 === i ? "300px" : "15px" }}
                style={{ padding: arr.length - 1 === i ? "0 0 100px 0" : "0" }}
                className={message.author === currentUser ? 'sent' : 'replies'}>
                <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                <p>{message.content}
                    <br />
                    <small className={message.author === currentUser ? 'sent' : 'replies'}>
                        {this.renderTimestamp(message.timestamp)}
                    </small>
                </p>
            </li>
        ))
    }

    renderTimestamp = timestamp => {
        let prefix = ''
        const timeDiff = Math.round((new Date().getTime() - new Date(timestamp).getTime()) / 60000)
        if (timeDiff < 1) { // less than one minute ago
            prefix = 'just now...';
        } else if (timeDiff < 60 && timeDiff > 1) { // less than sixty minutes ago
            prefix = `${timeDiff} minutes ago`;
        } else if (timeDiff < 24 * 60 && timeDiff > 60) { // less than 24 hours ago
            prefix = `${Math.round(timeDiff / 60)} hours ago`;
        } else if (timeDiff < 31 * 24 * 60 && timeDiff > 24 * 60) { // less than 7 days ago
            prefix = `${Math.round(timeDiff / (60 * 24))} days ago`;
        } else {
            prefix = `${new Date(timestamp)}`;
        }
        return prefix
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    render() {
        const messages = this.state.messages
        return (
            <Hoc>
                <div className="messages">
                    <ul id="chat-log">
                        {
                            messages &&
                            this.renderMessages(messages)
                        }
                        <div style={{ float:"left", clear: "both" }}
                            ref={(el) => { this.messagesEnd = el; }}>
                        </div>
                    </ul>
                </div>
                <div className="message-input">
                    <form onSubmit={this.sendMessageHandler}>
                        <div className="wrap">
                            <input
                                onChange={this.messageChangeHandler}
                                value={this.state.message}
                                required
                                id="chat-message-input"
                                type="text"
                                placeholder="Write your message..." />
                            <i className="fa fa-paperclip attachment" aria-hidden="true"></i>
                            <button id="chat-message-submit" className="submit">
                                <i className="fa fa-paper-plane" aria-hidden="true"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </Hoc>
        )
    }
}

const mapStateToProps = state => {
    return {
        username: state.username
    }
}

export default connect(mapStateToProps)(Chat); 