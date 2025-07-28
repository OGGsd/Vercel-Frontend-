import { create } from "zustand";
import type { MessagesStoreType } from "../types/zustand/messages";
import {
  filterMessagesByCurrentUser,
  isMessageOwnedByCurrentUser,
  logUserIsolationViolation,
  getCurrentUserId
} from "../utils/user-isolation-utils";

export const useMessagesStore = create<MessagesStoreType>((set, get) => ({
  displayLoadingMessage: false,
  deleteSession: (id) => {
    set((state) => {
      const updatedMessages = state.messages.filter(
        (msg) => msg.session_id !== id,
      );
      return { messages: updatedMessages };
    });
  },
  messages: [],
  setMessages: (messages) => {
    const filteredMessages = filterMessagesByCurrentUser(messages);
    set(() => ({ messages: filteredMessages }));
  },
  addMessage: (message) => {
    // Check if message belongs to current user (safety check)
    if (!isMessageOwnedByCurrentUser(message)) {
      logUserIsolationViolation(
        'addMessage',
        message.id,
        getCurrentUserId(),
        message.user_id
      );
      return; // Don't add messages from other users
    }

    const existingMessage = get().messages.find((msg) => msg.id === message.id);
    if (existingMessage) {
      get().updateMessagePartial(message);
      return;
    }
    if (message.sender === "Machine") {
      set(() => ({ displayLoadingMessage: false }));
    }
    set(() => ({ messages: [...get().messages, message] }));
  },
  removeMessage: (message) => {
    set(() => ({
      messages: get().messages.filter((msg) => msg.id !== message.id),
    }));
  },
  updateMessage: (message) => {
    set(() => ({
      messages: get().messages.map((msg) =>
        msg.id === message.id ? message : msg,
      ),
    }));
  },
  updateMessagePartial: (message) => {
    // search for the message and update it
    // look for the message list backwards to find the message faster
    set((state) => {
      const updatedMessages = [...state.messages];
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].id === message.id) {
          updatedMessages[i] = { ...updatedMessages[i], ...message };
          break;
        }
      }
      return { messages: updatedMessages };
    });
  },
  updateMessageText: (id, chunk) => {
    set((state) => {
      const updatedMessages = [...state.messages];
      for (let i = state.messages.length - 1; i >= 0; i--) {
        if (state.messages[i].id === id) {
          updatedMessages[i] = {
            ...updatedMessages[i],
            text: updatedMessages[i].text + chunk,
          };
          break;
        }
      }
      return { messages: updatedMessages };
    });
  },
  clearMessages: () => {
    set(() => ({ messages: [] }));
  },
  removeMessages: (ids) => {
    return new Promise((resolve, reject) => {
      try {
        set((state) => {
          const updatedMessages = state.messages.filter(
            (msg) => !ids.includes(msg.id),
          );
          resolve(updatedMessages);
          return { messages: updatedMessages };
        });
      } catch (error) {
        reject(error);
      }
    });
  },
}));
