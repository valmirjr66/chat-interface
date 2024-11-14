import Markdown from "react-markdown";

const members = {
  me: {
    id: "1",
    clientData: {
      color: "lightblue",
      username: "Eu",
    },
  },
  they: {
    id: "2",
    clientData: {
      color: "pink",
      username: "Yoko",
    },
  },
};

export default function Messages(props: {
  messages: { role: string, content: React.ReactNode, id: string }[];
  waitingAnswer: boolean;
  onSendMessage: (msg: string) => void;
}) {
  const { messages, waitingAnswer, onSendMessage } = props;

  const LoadingDots = () => <img src="/dots.gif" width={50} alt="Loading" />;

  return (
    <ul className='messagesList'>
      {messages.map(
        (message, index) =>
          Message(message, messages.length === index + 1, onSendMessage)
      )}
      {waitingAnswer &&
        Message({
          role: "assistant",
          content: <LoadingDots />,
          id: "loading_msg",
        })
      }
    </ul>
  );
}

function Message(
  props: {
    id: string;
    role: string;
    content: React.ReactNode;
    actions?: { type: string; feedbackResponse: string }[];
  },
  isAnchor?: boolean,
  onSendMessage?: (msg:string) => void
) {
  const { id, role, content, actions } = props;
  const member = role === "user" ? members.me : members.they;

  const className =
    member.id === members.me.id
      ? 'messagesMessage currentMember'
      : 'messagesMessage';

  return (
    <>
      <li key={id} className={className}>
        <span
          className='avatar'
          style={{ backgroundColor: member.clientData.color }}
        />
        <div className='messageContent'>
          <div className='username'>{member.clientData.username}</div>
          <div className='text'>
            {typeof content === "string" ? (
              <Markdown>{content}</Markdown>
            ) : (
              content
            )}
          </div>
          <div style={{ width: "100%" }}>
            {actions?.map((action) => {
              const className = {
                positive: "primary",
                negative: "cancel",
              }[action.type];

              return (
                <button
                  className={className}
                  disabled={!isAnchor}
                  onClick={() => onSendMessage?.(action?.feedbackResponse)}
                >
                  {action?.feedbackResponse}
                </button>
              );
            })}
          </div>
        </div>
      </li>
      {isAnchor && <div id="anchor" />}
    </>
  );
}
