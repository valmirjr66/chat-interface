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
import { Message, Reference } from "../types";

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
        ({
          conversationId: incomingConversationId,
          textSnapshot,
          annotationsSnapshot,
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
              latestMsg.annotations = annotationsSnapshot;

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

  const [allReferences, setAllReferences] = useState<Reference[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const { triggerToast } = useToaster({
    messageContent: "Something wen't wrong, please try again 😟",
    type: "error",
  });

  const fetchMessages = useCallback(async () => {
    try {
      const { data } = await httpCallers.get(
        `assistant/conversations/${conversationId}`
      );

      setMessages(data.messages);
      setAllReferences(data.references);
    } catch {
      setMessages([]);
      triggerToast();
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, triggerToast]);

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
      triggerToast();
    }
  };

  const newConversation = () => {
    setConversationId(uuidv4());
    setAllReferences([]);
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
                isLoadingMessages={isLoadingMessages}
                allReferences={allReferences}
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
