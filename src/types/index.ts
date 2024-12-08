export type Reference = {
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
  annotations?: Reference[];
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
};