import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import { PollManager } from './pollManager.js';
import { StudentRegistry } from './studentRegistry.js';
import { ChatManager } from './chatManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || '*' }
});

const port = process.env.PORT || 5000;
const poll = new PollManager();
const users = new StudentRegistry();
const chat = new ChatManager();

// Health check
app.get('/api', (_, res) => res.json({ ok: true, message: 'Polling backend up' }));

// ========== Socket.io logic ==========
io.on('connection', (socket) => {
  // role handshake
  socket.on('hello', ({ name, role }) => {
    users.add(socket.id, { name, role });
    socket.data.role = role;
    socket.data.name = name;
    io.emit('presence:update', { students: users.listStudents() });
  });

  // Teacher: start poll
  socket.on('teacher:startPoll', ({ question, options, durationMs }) => {
    if (socket.data.role !== 'teacher') return;
    const activeStudents = users.listStudents().map(s => s.socketId);
    const { ok, poll: p, reason } = poll.startPoll({ question, options, durationMs, activeStudentIds: activeStudents });
    if (!ok) {
      socket.emit('error:poll', reason);
      return;
    }
    io.emit('poll:started', p);

    const tick = setInterval(() => {
      const ended = poll.endIfExpired();
      if (ended) {
        clearInterval(tick);
        io.emit('poll:ended', ended);
      } else {
        io.emit('poll:tally', poll.tally());
      }
    }, 1000);
  });

  // Student: submit answer
  socket.on('student:answer', ({ optionIndex }) => {
    if (socket.data.role !== 'student') return;
    const r = poll.submitAnswer({ socketId: socket.id, optionIndex });
    if (!r?.ok) {
      socket.emit('error:answer', r?.reason || 'Submit failed');
      return;
    }
    io.emit('poll:tally', r.tally);
    const t = poll.tally();
    if (t && t.totalVoted >= t.cohortSize) {
      const ended = poll.endPoll();
      io.emit('poll:ended', ended);
    }
  });

  // Teacher: kick student
  socket.on('teacher:kick', ({ socketId }) => {
    if (socket.data.role !== 'teacher') return;
    io.to(socketId).emit('system:kicked');
    io.sockets.sockets.get(socketId)?.disconnect(true);
  });

  // Chat
  socket.on('chat:send', (msg) => {
    const payload = { from: socket.data.name || 'anon', text: msg };
    chat.add(payload);
    io.emit('chat:new', payload);
  });

  socket.on('disconnect', () => {
    users.remove(socket.id);
    io.emit('presence:update', { students: users.listStudents() });
  });
});

// ========== Serve React frontend ==========
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all route for React frontend (Express 5 safe)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});
