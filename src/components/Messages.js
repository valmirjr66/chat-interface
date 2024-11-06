import styles from '@/styles/Home.module.css';
import Markdown from 'react-markdown';

const members = {
  me: {
    id: '1',
    clientData: {
      color: 'lightblue',
      username: 'Eu',
    },
  },
  they: {
    id: '2',
    clientData: {
      color: 'pink',
      username: 'Yoko',
    },
  }
};

export default function Messages({ messages, waitingAnswer, onSendMessage }) {
  const LoadingDots = () => <img src='/dots.gif' width={50} />

  return (
    <ul className={styles.messagesList}>
      {messages.map((message, index) => Message(message, messages.length === index + 1, onSendMessage))}
      {waitingAnswer && Message({ role: 'assistant', content: <LoadingDots />, id: 'loading_msg' })}
    </ul>
  );
}

function Message({ id, role, content, actions }, isAnchor, onSendMessage) {
  const member = role === 'user' ? members.me : members.they;

  const className = member.id === members.me.id ?
    `${styles.messagesMessage} ${styles.currentMember}` : styles.messagesMessage;

  return (
    <>
      <li key={id} className={className}>
        <span
          className={styles.avatar}
          style={{ backgroundColor: member.clientData.color }}
        />
        <div className={styles.messageContent}>
          <div className={styles.username}>
            {member.clientData.username}
          </div>
          <div className={styles.text}>
            {
              typeof content === 'string' ?
                <Markdown>{content}</Markdown> : content
            }
          </div>
          <div style={{ width: '100%' }}>
            {
              actions?.map(action => {
                const className = {
                  positive: 'primary',
                  negative: 'cancel'
                }[action.type];

                return <button className={className} onClick={() => onSendMessage(action?.feedbackResponse)}>
                  {action?.feedbackResponse}
                </button>
              })
            }
          </div>
        </div>
      </li>
      {isAnchor && <div id="anchor" />}
    </>
  );
}