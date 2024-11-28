import { isMobile } from "react-device-detect";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import dotsGif from "../imgs/dots.gif";
import downloadIcon from "../imgs/ic-download.svg";
import myAvatar from "../imgs/ic-me.svg";
import aiAvatar from "../imgs/logo-eye.svg";
import Skeleton from "react-loading-skeleton";
import { ReactElement } from "react";

type Annotation = {
  text: string;
  start_index: number;
  end_index: number;
  file_citation: { file_id: string };
  displayName: string;
  downloadURL: string;
};

type Message = {
  id: string;
  content: string | ReactElement;
  role: string;
  conversationId: string;
};

const members = {
  me: {
    id: "1",
    clientData: {
      username: "Me",
    },
  },
  they: {
    id: "2",
    clientData: {
      username: "WITNESS LENS",
    },
  },
};

export default function Messages(props: {
  messages: Message[];
  waitingAnswer: boolean;
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}) {
  const { messages, waitingAnswer, onSendMessage, isLoading } = props;

  const LoadingDots = () => <img src={dotsGif} width={50} alt="Loading" />;

  const loadingMessages: Message[] = [
    {
      conversationId: "loading_conversation",
      id: "1",
      role: "user",
      content: (
        <Skeleton
          style={{ display: "block", width: '15vw' }}
          height={50}
          baseColor="#57577d"
          highlightColor="#7d7da3"
          borderRadius={10}
        />
      ),
    },
    {
      conversationId: "loading_conversation",
      id: "2",
      role: "assistant",
      content: (
        <Skeleton
          style={{ display: "block", width: '20vw' }}
          height={200}
          baseColor="#585858"
          highlightColor="#7f7f7f"
          borderRadius={10}
        />
      ),
    },
    {
      conversationId: "loading_conversation",
      id: "3",
      role: "user",
      content: (
        <Skeleton
          style={{ display: "block", width: '20vw' }}
          height={50}
          baseColor="#57577d"
          highlightColor="#7d7da3"
          borderRadius={10}
        />
      ),
    },
  ];

  return (
    <ul
      className="messagesList"
      style={{
        fontSize: isMobile ? 14 : "unset",
        height: isMobile ? "70vh" : "60vh",
      }}
    >
      {(isLoading ? loadingMessages : messages).map((message, index) =>
        MessageBalloon(message, messages.length === index + 1, onSendMessage)
      )}
      {waitingAnswer &&
        MessageBalloon(
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

function MessageBalloon(
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
      ? JSON.parse(annotations)
      : [];

  const member = role === "user" ? members.me : members.they;

  const className =
    member.id === members.me.id
      ? "messagesMessage currentMember"
      : "messagesMessage";

  return (
    <>
      <li key={id} className={className}>
        <img
          className="avatar"
          alt={member.clientData.username}
          src={member.clientData.username === "Me" ? myAvatar : aiAvatar}
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
              <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
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
            parsedAnnotations
              .filter((item) => item.displayName)
              .map((annotation, index) => {
                return (
                  <a
                    href={annotation.downloadURL}
                    download={annotation.displayName}
                    target="_blank"
                    rel="noreferrer"
                    className="downloadFile"
                    key={index}
                    style={{ marginTop: isMobile ? 10 : 20 }}
                  >
                    {`[${index + 1}]. `}
                    {annotation.displayName}
                    <img
                      src={downloadIcon}
                      width={20}
                      alt="Download file"
                      style={{ marginLeft: 6 }}
                    />
                  </a>
                );
              })}
        </div>
      </li>
      {isAnchor && <div id="anchor" />}
    </>
  );
}
