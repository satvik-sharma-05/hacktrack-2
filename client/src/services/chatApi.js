// services/chatApi.js
import api from "./api";

export const getChats = async () => {
  const res = await api.get("/chats");
  return res.data;
};

export const getChatMessages = async (chatId, page = 1) => {
  const res = await api.get(`/chats/${chatId}/messages?page=${page}`);
  return res.data;
};

export const sendMessage = async (chatId, content) => {
  const res = await api.post(`/chats/${chatId}/messages`, { content });
  return res.data;
};

export const getChatWithUser = async (userId) => {
  const res = await api.get(`/chats/user/${userId}`);
  return res.data;
};