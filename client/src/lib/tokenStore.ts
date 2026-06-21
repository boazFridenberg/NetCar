
type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const tokenStore = {
  get(): string | null {
    return accessToken;
  },

  set(token: string | null): void {
    accessToken = token;
    listeners.forEach((fn) => fn(accessToken));
  },

  clear(): void {
    this.set(null);
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
