import { apiRequest } from "./apiClient";
import { getCachedCollection, invalidateCachedCollection } from "./resourceCache";

const ACTIVE_RESOURCE_KEY = "cards";
const ALL_RESOURCE_KEY = "cards:all";

function sortCards(cards) {
  return [...cards].sort((left, right) => left.name.localeCompare(right.name));
}

function getResourceKey(includeArchived) {
  return includeArchived ? ALL_RESOURCE_KEY : ACTIVE_RESOURCE_KEY;
}

async function invalidateCardCaches() {
  await Promise.all([
    invalidateCachedCollection(ACTIVE_RESOURCE_KEY),
    invalidateCachedCollection(ALL_RESOURCE_KEY),
  ]);
}

export async function fetchCards(options) {
  const includeArchived = Boolean(options?.includeArchived);
  const { includeArchived: _includeArchived, ...cacheOptions } = options || {};

  return getCachedCollection(
    getResourceKey(includeArchived),
    () => apiRequest(`/api/cards${includeArchived ? "?include_archived=true" : ""}`, { method: "GET" }),
    cacheOptions,
  );
}

export async function createCard(payload) {
  const data = await apiRequest("/api/cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  await invalidateCardCaches();
  return data.card;
}

export async function updateCard(payload) {
  const data = await apiRequest(`/api/cards/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  await invalidateCardCaches();
  return data.card;
}

export async function deleteCard(cardId) {
  const data = await apiRequest(`/api/cards/${cardId}`, {
    method: "DELETE",
  });

  await invalidateCardCaches();
  return data.card;
}

export async function archiveCard(cardId) {
  const data = await apiRequest(`/api/cards/${cardId}/archive`, {
    method: "PUT",
  });

  await invalidateCardCaches();
  return data.card;
}

export async function unarchiveCard(cardId) {
  const data = await apiRequest(`/api/cards/${cardId}/unarchive`, {
    method: "PUT",
  });

  await invalidateCardCaches();
  return data.card;
}
