export class ChatManager {
  constructor() {
    this.messages = []; // ephemeral only
  }
  add(msg) {
    this.messages.push({ ...msg, ts: Date.now() });
    if (this.messages.length > 200) this.messages.shift();
  }
  recent() {
    return this.messages.slice(-50);
  }
}
