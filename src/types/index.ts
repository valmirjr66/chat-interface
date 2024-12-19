export type Reference = {
  _id: string;
  fileId: string;
  downloadURL: string;
  displayName: string;
  previewImageURL?: string;
};

export type Message = {
  id: string;
  content: string;
  role: "assistant" | "user";
  conversationId: string;
  references?: Reference[];
};

export type Conversation = {
  _id: string;
  title: string;
  createdAt: string;
};