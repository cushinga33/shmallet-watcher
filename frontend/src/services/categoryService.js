import { apiRequest } from "./apiClient";
import { getCachedCollection, invalidateCachedCollection } from "./resourceCache";

const ACTIVE_RESOURCE_KEY = "categories";
const ALL_RESOURCE_KEY = "categories:all";

function getResourceKey(includeArchived) {
  return includeArchived ? ALL_RESOURCE_KEY : ACTIVE_RESOURCE_KEY;
}

async function invalidateCategoryCaches() {
  await Promise.all([
    invalidateCachedCollection(ACTIVE_RESOURCE_KEY),
    invalidateCachedCollection(ALL_RESOURCE_KEY),
  ]);
}

export async function fetchCategories(options) {
  const includeArchived = Boolean(options?.includeArchived);
  const { includeArchived: _includeArchived, ...cacheOptions } = options || {};

  return getCachedCollection(
    getResourceKey(includeArchived),
    () => apiRequest(`/api/categories${includeArchived ? "?include_archived=true" : ""}`, { method: "GET" }),
    cacheOptions,
  );
}

export async function createCategory(payload) {
  const data = await apiRequest("/api/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  await invalidateCategoryCaches();
  return data.category;
}

export async function updateCategory(payload) {
  const data = await apiRequest(`/api/categories/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  await invalidateCategoryCaches();

  return data.category;
}

export async function deleteCategory(categoryId) {
  const data = await apiRequest(`/api/categories/${categoryId}`, {
    method: "DELETE",
  });

  await invalidateCategoryCaches();

  return data.category;
}

export async function archiveCategory(categoryId) {
  const data = await apiRequest(`/api/categories/${categoryId}/archive`, {
    method: "PUT",
  });

  await invalidateCategoryCaches();

  return data.category;
}

export async function unarchiveCategory(categoryId) {
  const data = await apiRequest(`/api/categories/${categoryId}/unarchive`, {
    method: "PUT",
  });

  await invalidateCategoryCaches();

  return data.category;
}