import { browserStorage, getJson, setJson } from "./storage";

const USER_KEY = "user";
const AUTH_KEY = "auth";

export const sessionStorage = {
  getUser() {
    return getJson(USER_KEY, null, browserStorage);
  },
  setUser(user) {
    setJson(USER_KEY, user, browserStorage);
  },
  getAuth() {
    return browserStorage.getItem(AUTH_KEY);
  },
  setAuth(value) {
    if (value) {
      browserStorage.setItem(AUTH_KEY, value);
    } else {
      browserStorage.removeItem(AUTH_KEY);
    }
  },
  clear() {
    browserStorage.removeItem(USER_KEY);
    browserStorage.removeItem(AUTH_KEY);
    browserStorage.removeItem("token");
  },
};
