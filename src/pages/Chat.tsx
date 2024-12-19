import { useCallback, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io, Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import History from "../components/History";
import Input from "../components/Input";
import MainFrame from "../components/MainFrame";
import ReferencesBoard from "../components/ReferencesBoard";
import useToaster from "../hooks/useToaster";
import menuHamburger from "../imgs/Hamburger_icon.svg";
import logoTextUpperNavbar from "../imgs/logo-text-upper-navbar.svg";
import httpCallers from "../service";
import { Message } from "../types";

export default function Chat() {
  const socketRef = useRef<Socket | null>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(`${process.env.REACT_APP_WS_URL}`, {
        extraHeaders: { userId: localStorage.getItem("userId")! },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      if (conversationId) {
        socketRef.current.on(
          "message",
          ({
            conversationId: incomingConversationId,
            textSnapshot,
            referencesSnapshot,
            finished,
          }) => {
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

                latestMsg.content = textSnapshot;
                latestMsg.references = referencesSnapshot;

                return [...newState, latestMsg];
              });
            }
          }
        );
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversationId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const { triggerToast } = useToaster({ type: "error" });

  const fetchMessages = useCallback(async () => {
    setIsLoadingMessages(true);

    try {
      const { data } = await httpCallers.get(
        `assistant/conversations/${conversationId}`
      );

      setMessages(data.messages);
    } catch (err) {
      const typedError = err as { status: number };
      // TODO: remove this gambiarra
      if (typedError.status !== 404) {
        setMessages([]);
        triggerToast(
          "Something wen't wrong while fetching the messages, please try again 😟"
        );
      }
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, triggerToast]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, fetchMessages]);

  useEffect(() => {
    // TODO: remove this gambiarra
    setTimeout(() => {
      const element = document.getElementById("list-of-messages");
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }, 1000);
  }, [conversationId]);

  const onSendMessage = async (message: string) => {
    const currentConversationId = conversationId ?? uuidv4();

    setMessages((prevState) => [
      ...prevState,
      {
        id: "temp_id",
        content: message,
        role: "user",
        conversationId: currentConversationId,
      },
    ]);

    setWaitingAnswer(true);
    setConversationId(currentConversationId);

    try {
      socketRef.current?.send({
        conversationId: currentConversationId,
        content: message,
      });
    } catch {
      triggerToast(
        "Something wen't wrong while sending the message, please try again 😟"
      );
    }
  };

  const newConversation = () => {
    setConversationId(null);
  };

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
        <History
          showMenu={showMenu}
          conversationId={conversationId}
          setConversationId={setConversationId}
          newConversation={newConversation}
        />
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
              <MainFrame
                isLoading={isLoadingMessages}
                messages={messages?.length === 0 ? [] : messages}
                waitingAnswer={waitingAnswer}
                onSendMessage={onSendMessage}
              />
              <ReferencesBoard
                showReferences={showReferences}
                conversationId={conversationId}
              />
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
