import { useState } from "react";
import btnSearch from "../imgs/btn-search.svg";
import referenceIcon from "../imgs/ic-reference.svg";
import { isMobile } from "react-device-detect";

export default function Input(props: {
  onSendMessage: (msg: string) => void;
  waitingAnswer: boolean;
  toggleReferences: () => void;
}) {
  const { onSendMessage, waitingAnswer, toggleReferences } = props;
  const [text, setText] = useState("");

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setText(text);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (waitingAnswer) {
      return;
    }

    e.preventDefault();
    setText("");
    onSendMessage(text);
  }

  return (
    <div
      style={{ display: "flex", justifyContent: "flex-start" }}
    >
      <form onSubmit={(e) => onSubmit(e)} style={{ width: "75%" }}>
        <input
          onChange={(e) => onChange(e)}
          value={text}
          type="text"
          placeholder="Ask me anything"
          autoFocus
          spellCheck={false}
        />
        <button className="send" disabled={text?.length === 0 || waitingAnswer}>
          <img src={btnSearch} width={50} alt="Search" />
        </button>
      </form>
      <div
        className="referenceIconWrapper"
        style={{ display: isMobile ? "flex" : "none" }}
        onClick={() => toggleReferences()}
      >
        <img src={referenceIcon} alt="References" width={30} />
      </div>
    </div>
  );
}
