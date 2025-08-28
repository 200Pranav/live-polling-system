import { nid } from './utils/id.js';

export class PollManager {
  constructor() {
    this.currentPoll = null;     // { id, question, options[], startedAt, deadline, voters:Set(socketId) }
    this.answers = new Map();    // pollId -> Map(socketId -> optionIndex)
    this.history = [];           // array of { poll, tally }
  }

  canStartNew(activeStudentIds = []) {
    if (!this.currentPoll) return true;
    // New poll allowed only if all active students have voted OR timer expired
    const { id, deadline, voters } = this.currentPoll;
    const expired = Date.now() >= deadline;
    const allVoted = activeStudentIds.every(sid => voters.has(sid));
    return expired || allVoted;
  }

  startPoll({ question, options, durationMs, activeStudentIds }) {
    if (!this.canStartNew(activeStudentIds)) {
      return { ok: false, reason: 'Previous poll still active' };
    }
    const id = nid('poll');
    const now = Date.now();
    const deadline = now + (durationMs || 60000);
    this.currentPoll = {
      id, question, options, startedAt: now, deadline,
      voters: new Set(),
      cohort: new Set(activeStudentIds) // snapshot of who was present at start
    };
    this.answers.set(id, new Map());
    return { ok: true, poll: this.currentPoll };
  }

  submitAnswer({ socketId, optionIndex }) {
    if (!this.currentPoll) return { ok: false, reason: 'No active poll' };
    const { id, deadline, voters } = this.currentPoll;
    if (Date.now() > deadline) return { ok: false, reason: 'Poll expired' };

    const map = this.answers.get(id);
    if (voters.has(socketId)) return { ok: false, reason: 'Already voted' };

    map.set(socketId, optionIndex);
    voters.add(socketId);
    return { ok: true, tally: this.tally() };
  }

  tally() {
    if (!this.currentPoll) return null;
    const { id, options, cohort, voters, deadline } = this.currentPoll;
    const counts = Array(options.length).fill(0);
    const map = this.answers.get(id) || new Map();
    for (const [, idx] of map.entries()) counts[idx]++;
    return {
      pollId: id,
      counts,
      totalVoted: voters.size,
      cohortSize: cohort.size,
      deadline
    };
  }

  endIfExpired() {
    if (!this.currentPoll) return null;
    const { deadline } = this.currentPoll;
    if (Date.now() >= deadline) return this.endPoll();
    return null;
  }

  endPoll() {
    if (!this.currentPoll) return null;
    const tally = this.tally();
    const ended = { poll: this.currentPoll, tally };
    this.history.push(ended);
    this.currentPoll = null;
    return ended;
  }

  getHistory() {
    return this.history.slice(-20);
  }
}