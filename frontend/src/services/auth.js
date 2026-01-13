export const encodeBasicAuth = (email, password) => {
  const value = `${email}:${password}`;
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

export const getAuthHeaders = () => {
  const auth = localStorage.getItem("auth");
  return auth ? { Authorization: `Bearer ${auth}` } : {};
};
