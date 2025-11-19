// src/services/invitationApi.js
import api from "./api";

export const sendInvitation = async (toUserId, message, projectContext) => {
  const res = await api.post("/invitations/send", {
    toUserId,
    message,
    projectContext
  });
  return res.data;
};

export const getReceivedInvitations = async () => {
  const res = await api.get("/invitations/received");
  return res.data;
};

export const getSentInvitations = async () => {
  const res = await api.get("/invitations/sent");
  return res.data;
};

export const acceptInvitation = async (invitationId) => {
  const res = await api.post(`/invitations/${invitationId}/accept`);
  return res.data;
};

export const rejectInvitation = async (invitationId) => {
  const res = await api.post(`/invitations/${invitationId}/reject`);
  return res.data;
};

export const cancelInvitation = async (invitationId) => {
  const res = await api.post(`/invitations/${invitationId}/cancel`);
  return res.data;
};