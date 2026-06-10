import { apiRequest } from "./apiClient";

export async function fetchProfileIncome() {
  const data = await apiRequest("/api/profile", { method: "GET" });
  return data.income;
}

export async function saveProfileIncome(income) {
  const data = await apiRequest("/api/profile/income", {
    method: "PUT",
    body: JSON.stringify({ income }),
  });

  return data.income;
}

export async function calculateProfileIncome() {
  const data = await apiRequest("/api/profile/income/calculate", {
    method: "POST",
  });

  return data.income;
}
