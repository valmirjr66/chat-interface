import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { TypeAnimation } from "react-type-animation";
import { io, Socket } from "socket.io-client";
import useToaster from "../hooks/useToaster";
import closeIcon from "../imgs/close.svg";
import greenChatBubble from "../imgs/ic-chatbuble-green.svg";
import whiteChatBubble from "../imgs/ic-chatbuble-white.svg";
import eyesAdd from "../imgs/ic-eyes-add.svg";
import httpCallers from "../service";
import { Conversation } from "../types";

interface HistoryProps {
  showMenu: boolean;
  conversationId: string;
  newConversation: () => void;
  setConversationId: (conversationId: string) => void;
}

export default function History({
  showMenu,
  newConversation,
  conversationId,
  setConversationId,
}: HistoryProps) {
  function createTypeAnimationSequence(input: string) {
    const words = input.split(" ");
    const result = [];
    for (let i = 1; i <= words.length; i++) {
      result.push(words.slice(0, i).join(" "));
    }
    return [
      ...result,
      (element: HTMLElement | null) =>
        element?.classList.remove("customCursorTypeAnimation"),
    ];
  }

  const getAnimatedTitle = useCallback(
    (title: string) => (
      <TypeAnimation
        sequence={createTypeAnimationSequence(title)}
        speed={90}
        wrapper="span"
        cursor={false}
        className="customCursorTypeAnimation"
      />
    ),
    []
  );

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_WS_URL}`, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on("newConversation", ({ _id, title, createdAt }) => {
        setHistory((prevState) => [
          { _id, title, createdAt, animatedTitle: getAnimatedTitle(title) },
          ...prevState,
        ]);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId, getAnimatedTitle]);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [history, setHistory] = useState<
    {
      _id: string;
      title: string;
      createdAt: string;
      animatedTitle: ReactElement;
    }[]
  >([]);

  const { triggerToast } = useToaster({
    messageContent: "Something wen't wrong, please try again 😟",
    type: "error",
  });

  async function removeHistoryItem(id: string) {
    try {
      await httpCallers.delete(`assistant/conversations/${id}`);

      if (id === conversationId) {
        newConversation();
      }

      setHistory((prevState) => prevState.filter((item) => item._id !== id));
    } catch {
      triggerToast();
    }
  }

  useEffect(() => {
    const fetchConversationHistory = async () => {
      try {
        const { data } = await httpCallers.get(`assistant/conversations`);

        const sortedHistory = (data.conversations as Conversation[]).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const decoratedHistory = sortedHistory.map((item) => ({
          ...item,
          animatedTitle: getAnimatedTitle(item.title),
        }));

        setHistory(decoratedHistory);
      } catch {
        triggerToast();
        setHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchConversationHistory();
  }, [getAnimatedTitle, triggerToast]);

  return (
    <nav
      className="appNav"
      style={{
        display: isMobile && !showMenu ? "none" : "block",
        position: isMobile ? "fixed" : "relative"
      }}
    >
      <div
        style={{
          padding: "30px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.5)",
        }}
      >
        <button
          className="secondary"
          onClick={newConversation}
          style={{ width: "100%", borderRadius: 30 }}
        >
          Create new chat
          <img src={eyesAdd} alt="New chat" width={40} />
        </button>
      </div>
      <div
        style={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          padding: 20,
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
            border: "1px solid white",
            padding: "15px 0px",
            borderRadius: 15,
          }}
        >
          Recent Searches
        </div>
        <div
          style={{
            borderLeft: isLoadingHistory ? "" : "1px solid white",
          }}
          className="historyList"
        >
          {isLoadingHistory ? (
            <>
              <Skeleton height={130} />
              <Skeleton height={80} style={{ marginTop: 32 }} />
            </>
          ) : (
            history.map((item, index) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                key={item._id}
              >
                <div
                  onClick={() => {
                    setConversationId(item._id);
                    localStorage.setItem("conversationId", item._id);
                  }}
                  style={{
                    marginTop: index === 0 ? 0 : 20,
                    color: item._id === conversationId ? "#9CF609" : "#FFF",
                  }}
                  className="recentSearchWrapper"
                >
                  <img
                    src={
                      item._id === conversationId
                        ? greenChatBubble
                        : whiteChatBubble
                    }
                    width={20}
                    alt="Chat bubble"
                    style={{ marginRight: 10 }}
                  />
                  {item.animatedTitle}
                </div>
                <img
                  src={closeIcon}
                  width={20}
                  alt="Remove"
                  className="closeIcon"
                  style={{ margin: "0px 10px", cursor: "pointer" }}
                  onClick={() => removeHistoryItem(item._id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </nav>
  );
}
