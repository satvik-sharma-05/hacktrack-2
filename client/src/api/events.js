import http from './http';

export const fetchLiveEvents = async (params = {}) => {
  const { data } = await http.get('/events/live', { params });
  return data.events || [];
};

export const fetchEventsDB = async (params = {}) => {
  const { data } = await http.get('/events', { params });
  return data;
};

export const bookmarkEvent = async (id) => {
  const { data } = await http.post(`/events/${id}/bookmark`);
  return data;
};

export const joinEvent = async (id) => {
  const { data } = await http.post(`/events/${id}/join`);
  return data;
};

export const getMyBookmarks = async () => {
  const { data } = await http.get('/events/me/bookmarks');
  return data.events || [];
};

export const submitCustomEvent = async (payload) => {
  const { data } = await http.post('/organizer/events', payload);
  return data.event;
};
