import styles from '@/styles/Home.module.css';
import { useState } from 'react';

export default function Input({ onSendMessage, waitingAnswer }) {
  const [text, setText] = useState('');

  function onChange(e) {
    const text = e.target.value;
    setText(text);
  }

  function onSubmit(e) {
    if (waitingAnswer) return;

    e.preventDefault();
    setText('');
    onSendMessage(text);
  }

  return (
    <div className={styles.input}>
      <form onSubmit={e => onSubmit(e)}>
        <input
          onChange={e => onChange(e)}
          value={text}
          type='text'
          placeholder='Pressione ENTER para enviar'
          autoFocus
        />
        <button className='primary' disabled={text?.length === 0 || waitingAnswer}>Send</button>
      </form>
    </div>
  );
}