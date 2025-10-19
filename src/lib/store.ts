import { create } from 'zustand';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  chatId: string;
}

interface Chat {
  id: string;
  title: string;
  sharedMemory: boolean;
  createdAt: number;
  lastUpdated: number;
}

interface ChatState {
  chats: Chat[];
  currentChat: string | null;
  messages: ChatMessage[];
  setCurrentChat: (chatId: string) => void;
  addChat: (chat: Chat) => void;
  addMessage: (message: ChatMessage) => void;
  toggleSharedMemory: (chatId: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  currentChat: null,
  messages: [],
  setCurrentChat: (chatId) => set({ currentChat: chatId }),
  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  toggleSharedMemory: (chatId) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, sharedMemory: !chat.sharedMemory } : chat
      ),
    })),
}));