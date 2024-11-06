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

export default function Messages({ messages, waitingAnswer }) {
  const LoadingDots = () => <img src='/dots.gif' width={50} />

  return (
    <ul className={styles.messagesList}>
      {messages.map((message, index) => Message(message, messages.length === index + 1))}
      {waitingAnswer && Message({ role: 'assistant', content: <LoadingDots />, id: 'loading_msg' })}
    </ul>
  );
}

function Message({ role, content, id }, isAnchor) {
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
        </div>
      </li>
      {isAnchor && <div id="anchor" />}
    </>
  );
}