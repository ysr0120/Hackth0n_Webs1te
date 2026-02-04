// Common helpers shared across puzzle pages.
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    username: params.get("username") || "",
    token: params.get("token") || ""
  };
}

async function authorizePage({ username, token, authApi, supabaseKey, puzzleCode }) {
  if (!username || !token) return false;
  try {
    const res = await fetch(authApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        username,
        token,
        puzzle_code: puzzleCode
      })
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

function generateToken(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let t = "";
  for (let i = 0; i < length; i++) {
    t += chars[Math.floor(Math.random() * chars.length)];
  }
  return t;
}
