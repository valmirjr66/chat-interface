import { ReactElement } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { v4 as uuidv4 } from "uuid";
import dotsGif from "../imgs/dots.gif";
import { Reference } from "../types";
import MessageBalloon from "./MessageBalloon";

type Message = {
  id: string;
  content: string | ReactElement;
  role: "assistant" | "user";
  conversationId: string;
  annotations?: Reference[];
};

interface MainFrameProps {
  messages: Message[];
  waitingAnswer: boolean;
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
}

export default function MainFrame({
  messages,
  waitingAnswer,
  onSendMessage,
  isLoading,
}: MainFrameProps) {
  const LoadingDots = () => <img src={dotsGif} width={50} alt="Loading" />;

  const loadingMessages: Message[] = [
    {
      conversationId: "loading_conversation",
      id: "1",
      role: "user",
      content: (
        <Skeleton
          style={{ display: "block", width: "15vw" }}
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
          style={{ display: "block", width: "20vw" }}
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
          style={{ display: "block", width: "20vw" }}
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
      {(isLoading ? loadingMessages : messages).map((message, index) => (
        <MessageBalloon
          content={message.content}
          role={message.role}
          isAnchor={messages.length === index + 1}
          id={message.id}
          onSendMessage={onSendMessage}
          annotations={message.annotations}
          key={message.id}
        />
      ))}
      {waitingAnswer && messages[messages.length - 1].role === "user" && (
        <MessageBalloon
          content={<LoadingDots />}
          role="assistant"
          isAnchor
          id="loading_msg"
          onSendMessage={onSendMessage}
          key={uuidv4()}
        />
      )}
    </ul>
  );
}
