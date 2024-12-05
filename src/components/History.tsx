import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import closeIcon from "../imgs/close.svg";
import whiteChatBubble from "../imgs/ic-chatbuble-white.svg";
import greenChatBubble from "../imgs/ic-chatbuble-green.svg";
import eyesAdd from "../imgs/ic-eyes-add.svg";
import httpCallers from "../service";
import { Conversation } from "../types";
import useToaster from "../hooks/useToaster";

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
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<
    Conversation[]
  >([]);

  const { triggerToast } = useToaster({
    messageContent:
      "Something wen't wrong while loading your history, please try again 😟",
    type: "error",
  });

  async function removeRecentSearch(id: string) {
    try {
      await httpCallers.delete(`assistant/conversations/${id}`);

      if (id === conversationId) {
        newConversation();
      }

      setConversationHistory((prevState) =>
        prevState.filter((item) => item.id !== id)
      );
    } catch {
      triggerToast();
    }
  }

  const fetchConversationsHistory = useCallback(async () => {
    try {
      const { data } = await httpCallers.get(`assistant/conversations`);

      const sortedHistory = (data.conversations as Conversation[]).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setConversationHistory(sortedHistory);
    } catch {
      setConversationHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchConversationsHistory();
  }, [fetchConversationsHistory]);

  return (
    <nav
      className="appNav"
      style={{
        display: isMobile && !showMenu ? "none" : "block",
        position: isMobile ? "fixed" : "relative",
        overflowY: "auto",
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
        >
          {isLoadingHistory ? (
            <>
              <Skeleton height={130} />
              <Skeleton height={80} style={{ marginTop: 32 }} />
            </>
          ) : (
            conversationHistory.map((item, index) => (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  onClick={() => {
                    setConversationId(item.id);
                    localStorage.setItem("conversationId", item.id);
                  }}
                  style={{
                    marginTop: index === 0 ? 0 : 20,
                    color: item.id === conversationId ? "#9CF609" : "#FFF",
                  }}
                  className="recentSearchWrapper"
                >
                  <img
                    src={
                      item.id === conversationId
                        ? greenChatBubble
                        : whiteChatBubble
                    }
                    width={20}
                    alt="Chat bubble"
                    style={{ marginRight: 10 }}
                  />
                  {item.title}
                </div>
                <img
                  src={closeIcon}
                  width={20}
                  alt="Remove"
                  className="closeIcon"
                  style={{ margin: "0px 10px", cursor: "pointer" }}
                  onClick={() => removeRecentSearch(item.id)}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </nav>
  );
}
