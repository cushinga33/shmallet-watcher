import { supabase } from "../config/supabaseClient";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Session expired. Please log in again.");
  }

  return session.access_token;
}

export async function fetchCards() {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/cards`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to fetch cards.");
  }

  return data;
}

export async function createCard(payload) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}/api/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to save card.");
  }

  return data.card;
}
