import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { v4 as uuidv4 } from "uuid";
import Input from "../components/Input";
import Messages from "../components/Messages";
import closeIcon from "../imgs/close.svg";
import menuHamburger from "../imgs/Hamburger_icon.svg";
import chatBubble from "../imgs/ic-chatbuble.svg";
import eyesAdd from "../imgs/ic-eyes-add.svg";
import logoTextUpperNavbar from "../imgs/logo-text-upper-navbar.svg";
import webIcon from "../imgs/web-icon.svg";

export default function Conversation() {
  const [conversationId, setConversationId] = useState<string>(
    () => localStorage.getItem("conversationId") || uuidv4()
  );
  const [conversationHistory, setConversationHistory] = useState<
    { id: string; title: string }[]
  >(() => {
    const strConversationHistory = localStorage.getItem("conversationHistory");
    return (strConversationHistory && JSON.parse(strConversationHistory)) || [];
  });

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
  const [showReferences, setShowReferences] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const MESSAGES_ENDPOINT = `${API_ADDRESS}/assistant/conversation/${conversationId}`;
      const { data } = await axios.get(MESSAGES_ENDPOINT);

      if (data.messages.length === 2) {
        const newConversationHistory = conversationHistory;
        if (
          newConversationHistory.findIndex(
            (item) => item.id === conversationId
          ) === -1
        ) {
          newConversationHistory.push({
            id: conversationId,
            title: data.title,
          });
          localStorage.setItem(
            "conversationHistory",
            JSON.stringify(newConversationHistory)
          );
          setConversationHistory(newConversationHistory);
        }
      }

      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  }, [API_ADDRESS, conversationId]);

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

  function removeRecentSearch(id: string): void {
    const strCurrentConversationHistory = localStorage.getItem(
      "conversationHistory"
    );

    const newConversationHistory =
      strCurrentConversationHistory &&
      (JSON.parse(strCurrentConversationHistory) as {
        id: string;
        title: string;
      }[]);

    const filteredHistory =
      (newConversationHistory &&
        newConversationHistory.filter((item) => item.id !== id)) ||
      [];

    setConversationHistory(filteredHistory);
    localStorage.setItem(
      "conversationHistory",
      JSON.stringify(filteredHistory)
    );

    if (id === conversationId) {
      setConversationId(uuidv4());
    }
  }

  return (
    <main className="app">
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
            {conversationHistory.length === 0 ? (
              <div style={{ width: "100%", textAlign: "center" }}>
                Nothing to show yet
              </div>
            ) : (
              <div style={{ borderLeft: "1px solid white" }}>
                {conversationHistory.reverse().map((item, index) => (
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
                ))}
              </div>
            )}
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
                }}
              >
                <div className="referencesHeader">References</div>
                <div className="referencesBoard">
                  <div style={{ height: "100%", paddingTop: 20 }}>
                    {[
                      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*RAI4cBXe1_zaxVykHz79oA.jpeg",
                      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*RAI4cBXe1_zaxVykHz79oA.jpeg",
                      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*RAI4cBXe1_zaxVykHz79oA.jpeg",
                    ].map((item) => {
                      return (
                        <div className="referenceCard">
                          <img src={webIcon} alt="Reference link" width={20} />
                          <div className="referenceCardContent">
                            <caption className="previewCaption">
                              Esse é um teste que quero fazer com um texto maior
                              glablabl
                            </caption>
                            <img
                              src={item}
                              width={150}
                              alt="Teste"
                              className="previewImage"
                            />
                          </div>
                        </div>
                      );
                    })}
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
