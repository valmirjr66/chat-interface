import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import Skeleton from "react-loading-skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import Input from "../components/Input";
import Messages from "../components/Messages";
import closeIcon from "../imgs/close.svg";
import menuHamburger from "../imgs/Hamburger_icon.svg";
import chatBubble from "../imgs/ic-chatbuble.svg";
import eyesAdd from "../imgs/ic-eyes-add.svg";
import logoTextUpperNavbar from "../imgs/logo-text-upper-navbar.svg";
import webIcon from "../imgs/web-icon.svg";
import httpCallers from "../service";

type Reference = {
  fileId: string;
  downloadURL: string;
  displayName: string;
  previewImageURL?: string;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};

type Message = {
  id: string;
  content: string;
  role: string;
  conversationId: string;
};

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  const [conversationId, setConversationId] = useState<string>(
    () => localStorage.getItem("conversationId") || uuidv4()
  );

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_WS_URL}`, {
        extraHeaders: { userId: localStorage.getItem("userId")! },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      socketRef.current.on(
        "message",
        ({ conversationId: incomingConversationId, snapshot, finished }) => {
          if (finished) {
            setWaitingAnswer(false);
          }
          
          if (incomingConversationId === conversationId) {
            setMessages((prevState) => {
              const newState = [...prevState];

              if (newState[newState.length - 1].role === "user") {
                newState.push({
                  id: `packet-${uuidv4()}`,
                  conversationId,
                  role: "assistant",
                  content: "",
                });
              }

              const latestMsg = newState.pop()!;

              latestMsg.content = snapshot;

              return [...newState, latestMsg];
            });
          }
        }
      );
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  const [conversationHistory, setConversationHistory] = useState<
    Conversation[]
  >([]);

  const [allReferences, setAllReferences] = useState<Reference[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const triggerErrorToast = () => {
    toast("Something wen't wrong, please try again 😟", {
      position: "top-right",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      type: "error",
    });
  };

  const fetchConversationsHistory = useCallback(
    async (showLoading?: boolean) => {
      try {
        showLoading && setIsLoadingHistory(true);

        const { data } = await httpCallers.get(`assistant/conversations`);

        setConversationHistory(
          (data.conversations as Conversation[]).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch {
        setConversationHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    []
  );

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await httpCallers.get(
        `assistant/conversations/${conversationId}`
      );

      setMessages(data.messages);
      setAllReferences(data.references);
      fetchConversationsHistory();
    } catch {
      setMessages([]);
      triggerErrorToast();
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, fetchConversationsHistory]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("conversationId", conversationId);
      setMessages([]);
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    const element = document.getElementById("anchor");
    element?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchConversationsHistory(true);
  }, [fetchConversationsHistory]);

  const onSendMessage = async (message: string) => {
    setMessages((prevState) => [
      ...prevState,
      {
        id: "temp_id",
        content: message,
        role: "user",
        conversationId,
      },
    ]);

    setWaitingAnswer(true);

    try {
      socketRef.current?.send({ conversationId, content: message });
    } catch {
      triggerErrorToast();
    }
  };

  const newConversation = () => {
    setConversationId(uuidv4());
    setAllReferences([]);
  };

  async function removeRecentSearch(id: string) {
    await httpCallers.delete(`assistant/conversations/${id}`);

    if (id === conversationId) {
      newConversation();
    }

    await fetchConversationsHistory(true);
  }

  return (
    <main className="app">
      <ToastContainer />
      <header
        className="appHeader"
        style={{
          justifyContent: isMobile ? "space-around" : "flex-end",
        }}
      >
        {isMobile && (
          <img
            src={menuHamburger}
            alt="Menu"
            width={30}
            style={{ marginRight: 20, cursor: "pointer" }}
            onClick={() => setShowMenu((prevState) => !prevState)}
          />
        )}
        <img
          src={logoTextUpperNavbar}
          alt="WITNESS LENS - Empowering People with Knowledge"
          width={isMobile ? 200 : 400}
          style={{ marginRight: 30 }}
        />
      </header>
      <div className="appWrapper">
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
                        filter:
                          item.id === conversationId
                            ? "invert(76%) sepia(16%) saturate(7326%) hue-rotate(62deg) brightness(282%) contrast(93%)"
                            : "unset",
                      }}
                      className="recentSearchWrapper"
                    >
                      <img
                        src={chatBubble}
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
        <section className="appContent">
          <div
            style={{
              width: isMobile ? "95%" : "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="appInner">
              <Messages
                isLoading={isLoadingMessages}
                messages={messages?.length === 0 ? [] : messages}
                waitingAnswer={waitingAnswer}
                onSendMessage={onSendMessage}
              />
              <div
                className="referencesWrapper"
                style={{
                  display: isMobile && !showReferences ? "none" : "flex",
                  position: isMobile ? "fixed" : "relative",
                  right: isMobile ? 100 : "unset",
                  width: isMobile ? "unset" : "25%",
                  height: isMobile ? "70vh" : "60vh",
                }}
              >
                <div className="referencesHeader">References</div>
                <div className="referencesBoard">
                  <div
                    style={{
                      height: "100%",
                      paddingTop: 20,
                      width: "100%",
                    }}
                  >
                    {isLoadingMessages ? (
                      <Skeleton
                        count={3}
                        height={150}
                        style={{ width: "100%", marginBottom: 32 }}
                      />
                    ) : (
                      allReferences.map((item) => {
                        return (
                          <a
                            href={item.downloadURL}
                            className="referenceCard"
                            target="_blank"
                            key={item.fileId}
                            rel="noreferrer"
                          >
                            <img
                              src={webIcon}
                              alt="Reference link"
                              width={20}
                            />
                            <div className="referenceCardContent">
                              <caption className="previewCaption">
                                {item.displayName}
                              </caption>
                              <img
                                src={item.previewImageURL}
                                width="100%"
                                alt="Teste"
                                className="previewImage"
                              />
                            </div>
                          </a>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Input
              onSendMessage={onSendMessage}
              waitingAnswer={waitingAnswer}
              toggleReferences={() =>
                setShowReferences((prevState) => !prevState)
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
