import { isMobile } from "react-device-detect";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import downloadIcon from "../imgs/ic-download.svg";
import myAvatar from "../imgs/ic-me.svg";
import aiAvatar from "../imgs/logo-eye.svg";
import { Reference } from "../types";

const members = {
  user: {
    id: "1",
    clientData: {
      username: "ME",
    },
  },
  assistant: {
    id: "2",
    clientData: {
      username: "WITNESS LENS",
    },
  },
};

interface MessageBalloonProps {
  key: string;
  role: "assistant" | "user";
  content: React.ReactNode;
  actions?: { type: string; feedbackResponse: string }[];
  references?: Reference[];
  isAnchor?: boolean;
  onSendMessage?: (msg: string) => void;
}

const MessageBalloon: React.FC<MessageBalloonProps> = ({
  role,
  content,
  actions,
  references,
  isAnchor,
  onSendMessage,
}) => {
  const member = members[role];

  const className =
    member.id === members.user.id
      ? "messagesMessage currentMember"
      : "messagesMessage";

  return (
    <>
      <li className={className}>
        <img
          className="avatar"
          alt={member.clientData.username}
          src={role === "user" ? myAvatar : aiAvatar}
        />
        <div
          className="messageContent"
          style={{ marginBottom: isAnchor ? 30 : 0 }}
        >
          <div className="username">{member.clientData.username}</div>
          <div
            className="messageText"
            style={{ maxWidth: isMobile || role === "assistant" ? "70%" : 400 }}
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
          {references &&
            references
              .filter((item) => item?.displayName)
              .map((reference, index) => {
                return (
                  <a
                    href={reference?.downloadURL}
                    download={reference?.displayName}
                    target="_blank"
                    rel="noreferrer"
                    className="downloadFile"
                    key={index}
                    style={{ marginTop: isMobile ? 10 : 20 }}
                  >
                    {`[${index + 1}]. `}
                    {reference?.displayName}
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
};

export default MessageBalloon;
