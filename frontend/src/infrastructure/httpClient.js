export async function httpRequest(url, options = {}) {
  return fetch(url, options);
}

export async function readErrorBody(res) {
  try {
    if (res && typeof res.text === "function") {
      const text = await res.text();
      return text || null;
    }
  } catch (_) {
    return null;
  }
  return null;
}

export async function parseJson(res) {
  return res.json();
}

export async function parseBody(res) {
  const contentType = res?.headers?.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  if (res && typeof res.text === "function") {
    return res.text();
  }
  return null;
}
