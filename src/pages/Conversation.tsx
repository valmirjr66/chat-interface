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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Reference = {
  fileId: string;
  downloadURL: string;
  displayName: string;
  previewImageURL?: string;
};

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

  const [allReferences, setAllReferences] = useState<Reference[]>([]);

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
      setAllReferences(data.references);
    } catch {
      setMessages([]);
      triggerErrorToast();
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

    try {
      await axios.post(`${API_ADDRESS}/assistant/conversation/message`, {
        role: "user",
        content: message,
        conversationId,
      });

      fetchMessages();
    } catch {
      triggerErrorToast();
    } finally {
      setWaitingAnswer(false);
    }
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
            {conversationHistory.length > 0 && (
              <>
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
              </>
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
                  <div
                    style={{
                      height: "100%",
                      paddingTop: 20,
                    }}
                  >
                    {allReferences.map((item) => {
                      return (
                        <a
                          href={item.downloadURL}
                          className="referenceCard"
                          target="_blank"
                          key={item.fileId}
                          rel="noreferrer"
                        >
                          <img src={webIcon} alt="Reference link" width={20} />
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
