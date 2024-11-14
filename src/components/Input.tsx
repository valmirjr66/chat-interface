import { useState } from 'react';

export default function Input(
  props: {
    onSendMessage: (msg: string) => void, waitingAnswer: boolean
  }) {
  const { onSendMessage, waitingAnswer } = props;
  const [text, setText] = useState('');

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setText(text);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (waitingAnswer) {
      return;
    }

    e.preventDefault();
    setText('');
    onSendMessage(text);
  }

  return (
    <div>
      <form onSubmit={e => onSubmit(e)}>
        <input
          onChange={e => onChange(e)}
          value={text}
          type='text'
          placeholder='Pressione ENTER para enviar'
          autoFocus
        />
        <button className='send' disabled={text?.length === 0 || waitingAnswer}>
          Enviar
        </button>
      </form>
    </div>
  );
}