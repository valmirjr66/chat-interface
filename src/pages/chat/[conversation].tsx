import Calendar from '@/components/Calendar';
import Input from '@/components/Input';
import Messages from '@/components/Messages';
import styles from '@/styles/Home.module.css';
import { Box, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Conversation() {
  const router = useRouter();
  const conversationId = router.query.conversation;
  const API_ADDRESS = 'http://localhost:4000/api'

  const [messages, setMessages] = useState([]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalItems, setModalItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`${API_ADDRESS}/assistant/conversation/${conversationId}`);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    const element = document.getElementById("anchor");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [messages])

  const onSendMessage = async (message) => {
    setMessages(prevState => [...prevState, {
      id: "temp_id",
      content: message,
      role: 'user',
      conversationId
    }]);

    setWaitingAnswer(true);

    await axios.post(`${API_ADDRESS}/message`,
      {
        role: "user",
        content: message,
        conversationId
      });

    setWaitingAnswer(false);

    fetchMessages();
  }

  const newConversation = () => {
    router.push(`/`);
  }

  const toggleModal = () => setShowModal(prevState => !prevState)

  const loadItemsByDate = async (year, month, day) => {
    try {
      const { data } = await axios.get(`${API_ADDRESS}/planning/${year}/${month}/${day}`);

      if (data.items.length === 0) return;

      setSelectedDate(new Date(`${year}-${month}-${day}`));
      setModalItems(data.items);
      setShowCalendar(false);
      toggleModal();
    } catch {
      setModalItems([]);
    }
  }

  const boxStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Modal
        open={showModal}
        onClose={toggleModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={boxStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            What do we have for {selectedDate.toDateString()}
          </Typography>
          {
            modalItems.map(item => (
              <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {item}
              </Typography>
            ))
          }
        </Box>
      </Modal>

      <div style={{ position: 'fixed' }}>
        <button onClick={() => setShowCalendar(prevState => !prevState)}>Calendar</button>
        <Calendar show={showCalendar} loadItemsByDate={loadItemsByDate} />
      </div>
      <main className={styles.app}>
        <button className='secondary' onClick={newConversation}>Nova conversa</button>
        <div className={styles.appContent} style={{ justifyContent: messages?.length === 0 ? 'space-around' : 'unset' }}>
          {
            messages?.length === 0 ?
              <img src='/chat.png' width={300} className={styles.emptyIcon} /> :
              <Messages messages={messages} waitingAnswer={waitingAnswer} onSendMessage={onSendMessage} />
          }
          <Input onSendMessage={onSendMessage} waitingAnswer={waitingAnswer} />
        </div>
      </main >
    </>
  )
}
