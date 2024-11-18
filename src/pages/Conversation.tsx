import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { v4 as uuidv4 } from "uuid";
import Input from "../components/Input";
import Messages from "../components/Messages";
import chatImg from "../imgs/chat.png";
import menuHamburger from "../imgs/Hamburger_icon.svg";
import chatBubble from "../imgs/ic-chatbuble.svg";
import eyesAdd from "../imgs/ic-eyes-add.svg";
import logoTextUpperNavbar from "../imgs/logo-text-upper-navbar.svg";

export default function Conversation() {
  const [conversationId, setConversationId] = useState<string>(
    () => localStorage.getItem("conversationId") || uuidv4()
  );

  const API_ADDRESS = process.env.REACT_APP_API_URL;

  const [messages, setMessages] = useState(
    [] as {
      id: string;
      content: string;
      role: string;
      conversationId: string;
    }[]
  );
  const [waitingAnswer, setWaitingAnswer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const MESSAGES_ENDPOINT = `${API_ADDRESS}/assistant/conversation/${conversationId}`;
      const { data } = await axios.get(MESSAGES_ENDPOINT);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  }, [API_ADDRESS, conversationId]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("conversationId", conversationId);
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

    await axios.post(`${API_ADDRESS}/assistant/conversation/message`, {
      role: "user",
      content: message,
      conversationId,
    });

    setWaitingAnswer(false);

    fetchMessages();
  };

  const newConversation = () => {
    setConversationId(uuidv4());
  };

  return (
    <main className="app">
      <header
        className="appHeader"
        style={{
          justifyContent: "center",
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
          width={isMobile ? 300 : 400}
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
              style={{ width: "100%" }}
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
              }}
            >
              Recent searches
            </div>
            <div style={{ borderLeft: "1px solid white" }}>
              {[
                "Internet shutdown and how to deal with it",
                "Can AI fake reality?",
                "Video as Evidence",
                "Internet shutdown",
                "Can AI fake reality?",
                "Video as Evidence",
                "Internet shutdown",
                "Can AI fake reality?",
                "Video as Evidence",
                "Internet shutdown",
                "Can AI fake reality?",
                "Video as Evidence",
                "Último",
              ].map((item, index) => (
                <div
                  style={{ marginTop: index === 0 ? 0 : 20 }}
                  className="recentSearchWrapper"
                >
                  <img
                    src={chatBubble}
                    width={20}
                    alt="Chat bubble"
                    style={{ marginRight: 10 }}
                  />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </nav>
        <section className="appContent">
          <div
            className="conversationWrapper"
            style={{ width: isMobile ? "95%" : "70%" }}
          >
            {messages?.length === 0 ? (
              <img
                src={chatImg}
                width={300}
                className="emptyIcon"
                alt="Empty chat"
              />
            ) : (
              <Messages
                messages={messages}
                waitingAnswer={waitingAnswer}
                onSendMessage={onSendMessage}
              />
            )}
            <Input
              onSendMessage={onSendMessage}
              waitingAnswer={waitingAnswer}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
