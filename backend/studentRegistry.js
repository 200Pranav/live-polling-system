// Tracks connected users and their roles; allows teacher to see "active students"

export class StudentRegistry {
  constructor() {
    this.clients = new Map(); // socketId -> { name, role: 'teacher'|'student' }
  }

  add(socketId, payload) {
    this.clients.set(socketId, payload);
  }

  remove(socketId) {
    this.clients.delete(socketId);
  }

  listStudents() {
    return [...this.clients.entries()]
      .filter(([, v]) => v.role === 'student')
      .map(([socketId, v]) => ({ socketId, ...v }));
  }

  listTeachers() {
    return [...this.clients.entries()]
      .filter(([, v]) => v.role === 'teacher')
      .map(([socketId, v]) => ({ socketId, ...v }));
  }

  get(socketId) {
    return this.clients.get(socketId);
  }
}
