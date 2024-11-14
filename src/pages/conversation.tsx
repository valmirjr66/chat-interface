import axios from 'axios';
import { useEffect, useState } from 'react';
import Messages from '../components/Messages';
import Input from '../components/Input';

export default function Conversation() {
  const conversationId = document.location.search?.replace('?', '');

  const API_ADDRESS = 'http://localhost:4000/api';

  const [messages, setMessages] = useState([] as {
    id: string,
    content: string,
    role: string,
    conversationId: string
  }[]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);

  const fetchMessages = async() => {
    try {
      const { data } =
        await axios.get(`${API_ADDRESS}/assistant/conversation/${conversationId}`);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    const element = document.getElementById("anchor");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onSendMessage = async(message: string) => {
    setMessages(prevState => [...prevState, {
      id: "temp_id",
      content: message,
      role: 'user',
      conversationId
    }]);

    setWaitingAnswer(true);

    await axios.post(`${API_ADDRESS}/assistant/conversation/message`,
      {
        role: "user",
        content: message,
        conversationId
      });

    setWaitingAnswer(false);

    fetchMessages();
  };

  const newConversation = () => {
    document.location.href = '';
  };

  return (
    <main className='app'>
      <button className='secondary' onClick={newConversation}>Nova conversa</button>
      <div
        className='appContent'
        style={{ justifyContent: messages?.length === 0 ? 'space-around' : 'unset' }}
      >
        {
          messages?.length === 0 ?
            <img src='/chat.png' width={300} className='emptyIcon' /> :
            <Messages messages={messages} waitingAnswer={waitingAnswer} onSendMessage={onSendMessage} />
        }
        <Input onSendMessage={onSendMessage} waitingAnswer={waitingAnswer} />
      </div>
    </main >
  );
}
