import { sessionStorage } from "../../infrastructure/sessionStorage";

const emptySessionStore = {
  getUser() {
    return null;
  },
  setUser() {},
  getAuth() {
    return null;
  },
};

export function getCurrentUser(store = sessionStorage) {
  return (store || emptySessionStore).getUser();
}

export function setCurrentUser(user, store = sessionStorage) {
  (store || emptySessionStore).setUser(user);
}

export function isAuthenticated(store = sessionStorage) {
  return Boolean((store || emptySessionStore).getAuth());
}
