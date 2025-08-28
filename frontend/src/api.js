import { socket } from './socket';

export const hello = (name, role) => socket.emit('hello', { name, role });
export const startPoll = (payload) => socket.emit('teacher:startPoll', payload);
export const sendAnswer = (optionIndex) => socket.emit('student:answer', { optionIndex });
export const kick = (socketId) => socket.emit('teacher:kick', { socketId });
export const sendChat = (text) => socket.emit('chat:send', text);