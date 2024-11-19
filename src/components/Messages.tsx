import Markdown from "react-markdown";
import dotsGif from "../imgs/dots.gif";
import { isMobile } from "react-device-detect";
import downloadIcon from "../imgs/ic-download.svg";

type Annotation = {
  text: string;
  start_index: number;
  end_index: number;
  file_citation: { file_id: string };
  displayName: string;
  downloadURL: string;
};

const members = {
  me: {
    id: "1",
    clientData: {
      color: "lightblue",
      username: "Me",
    },
  },
  they: {
    id: "2",
    clientData: {
      color: "pink",
      username: "Witness Lens",
    },
  },
};

function uniqueByProperty<T>(
  array: { [key: string]: string }[],
  property: string
) {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[property];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  }) as T[];
}

export default function Messages(props: {
  messages: {
    role: string;
    content: React.ReactNode;
    id: string;
    annotations?: Annotation[];
  }[];
  waitingAnswer: boolean;
  onSendMessage: (msg: string) => void;
}) {
  const { messages, waitingAnswer, onSendMessage } = props;

  const LoadingDots = () => <img src={dotsGif} width={50} alt="Loading" />;

  return (
    <ul className="messagesList">
      {messages.map((message, index) =>
        Message(message, messages.length === index + 1, onSendMessage)
      )}
      {waitingAnswer &&
        Message(
          {
            role: "assistant",
            content: <LoadingDots />,
            id: "loading_msg",
          },
          true
        )}
    </ul>
  );
}

function Message(
  props: {
    id: string;
    role: string;
    content: React.ReactNode;
    actions?: { type: string; feedbackResponse: string }[];
    annotations?: Annotation[];
  },
  isAnchor?: boolean,
  onSendMessage?: (msg: string) => void
) {
  const { id, role, content, actions, annotations } = props;
  const parsedAnnotations: Annotation[] =
    annotations && typeof annotations === "string"
      ? uniqueByProperty(JSON.parse(annotations), "displayName")
      : [];

  const member = role === "user" ? members.me : members.they;

  const className =
    member.id === members.me.id
      ? "messagesMessage currentMember"
      : "messagesMessage";

  return (
    <>
      <li key={id} className={className}>
        <span
          className="avatar"
          style={{ backgroundColor: member.clientData.color }}
        />
        <div
          className="messageContent"
          style={{ marginBottom: isAnchor ? 30 : 0 }}
        >
          <div className="username">{member.clientData.username}</div>
          <div
            className="messageText"
            style={{ maxWidth: isMobile ? "80%" : 400 }}
          >
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
          {parsedAnnotations &&
            parsedAnnotations.map((annotation) => {
              return (
                <a
                  href={annotation.downloadURL}
                  download={annotation.displayName}
                  className="downloadFile"
                >
                  <img
                    src={downloadIcon}
                    width={20}
                    alt="Download file"
                    style={{ marginRight: 4 }}
                  />
                  {annotation.displayName}
                </a>
              );
            })}
        </div>
      </li>
      {isAnchor && <div id="anchor" />}
    </>
  );
}
