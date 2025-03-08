// types/conversation.ts
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type Conversation = {
  id: string;
  title: string;
  date: Date;
  preview: string;
  messages: Message[];
};
