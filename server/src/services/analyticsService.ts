
interface ActivityEntry {
  at: string;
  type: 'search' | 'calculation' | 'signup' | 'login';
  detail: string;
}

const searchCounts = new Map<string, number>();
let calculationsMade = 0;
const activity: ActivityEntry[] = [];
const MAX_ACTIVITY = 100;

function pushActivity(type: ActivityEntry['type'], detail: string): void {
  activity.unshift({ at: new Date().toISOString(), type, detail });
  if (activity.length > MAX_ACTIVITY) activity.pop();
}

export const analytics = {
  recordSearch(term: string): void {
    const t = term.trim().toLowerCase();
    if (!t) return;
    searchCounts.set(t, (searchCounts.get(t) ?? 0) + 1);
    pushActivity('search', t);
  },

  recordCalculation(label: string): void {
    calculationsMade += 1;
    pushActivity('calculation', label);
  },

  recordSignup(email: string): void {
    pushActivity('signup', email);
  },

  recordLogin(email: string): void {
    pushActivity('login', email);
  },

  get calculations(): number {
    return calculationsMade;
  },

  topSearches(limit = 10): Array<{ term: string; count: number }> {
    return [...searchCounts.entries()]
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  recentActivity(limit = 20): ActivityEntry[] {
    return activity.slice(0, limit);
  },
};
