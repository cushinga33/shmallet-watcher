import { apiRequest } from "./apiClient";
import {
  getCachedCollection,
  invalidateCachedCollection,
  updateCachedCollection,
} from "./resourceCache";

const RESOURCE_KEY = "transactions";

export async function fetchTransactions(options) {
  return getCachedCollection(
    RESOURCE_KEY,
    () => apiRequest("/api/transactions", { method: "GET" }),
    options,
  );
}

export async function createTransaction(payload) {
  const data = await apiRequest("/api/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  await invalidateCachedCollection(RESOURCE_KEY);
  return data.transaction;
}

export async function updateTransaction(payload) {
  const data = await apiRequest(`/api/transactions/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

  await updateCachedCollection(RESOURCE_KEY, (transactions) =>
    transactions.map((transaction) =>
      transaction.id === data.transaction.id ? data.transaction : transaction,
    ),
  );

  return data.transaction;
}

export async function deleteTransaction(transactionId) {
  const data = await apiRequest(`/api/transactions/${transactionId}`, {
    method: "DELETE",
  });

  await updateCachedCollection(RESOURCE_KEY, (transactions) =>
    transactions.filter((transaction) => transaction.id !== transactionId),
  );

  return data.transaction;
}

export async function prependTransactionToCache(transaction) {
  await updateCachedCollection(RESOURCE_KEY, (transactions) => [transaction, ...transactions]);
}



/**
 * Sends a raw CSV file to the backend to parse headers and lines.
 * Uses a raw FormData payload since it's a file stream.
 * @param {File} file - The raw CSV file from input
 */
export async function uploadAndParseCSV(file) {
  const formData = new FormData();
  formData.append('csvFile', file);

  return await apiRequest("/api/files/upload", {
    method: "POST",
    body: formData, 
  });
}

/**
 * Inserts an array of prepared transactions in a single batch insert.
 * Clears out the local cache so the new list flows into your UI seamlessly.
 * @param {Array} transactionsList - Array of mapped transaction payloads
 */
export async function createBulkTransactions(transactionsList) {
  const data = await apiRequest("/api/transactions/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ transactions: transactionsList }),
  });

  await invalidateCachedCollection(RESOURCE_KEY);
  return data;
}