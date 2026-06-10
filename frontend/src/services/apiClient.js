import { supabase } from "../config/supabaseClient";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export async function getSession() {
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        throw new Error("Session expired. Please log in again.");
    }

    return session;
}

export async function getAccessToken() {
    const session = await getSession();
    return session.access_token;
}

export async function getCurrentUserId() {
    const session = await getSession();
    return session.user.id;
}

export async function apiRequest(path, options = {}) {
    const accessToken = await getAccessToken();
    const headers = new Headers(options.headers || {});

    if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(data?.error || "Request failed.");
        error.status = response.status;
        error.code = data?.code;
        error.details = data;
        throw error;
    }

    return data;
}