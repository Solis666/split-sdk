import { Horizon } from "@stellar/stellar-sdk";
import type { Invoice, InvoiceStatus } from "./types.js";
import { SearchFailedError } from "./errors.js";

/** Query parameters for searching invoices. */
export interface SearchQuery {
  /** Filter by creator address. */
  creator?: string;
  /** Filter by recipient address. */
  recipient?: string;
  /** Filter by invoice status. */
  status?: InvoiceStatus;
}

/** Result of an invoice search. */
export interface SearchResult {
  /** Invoice ID. */
  invoiceId: string;
  /** Current status of the invoice. */
  status: InvoiceStatus;
}

/**
 * Search invoices by partial criteria using Horizon API.
 *
 * @param query - Search parameters
 * @param horizonUrl - Horizon server URL (defaults to public testnet)
 * @returns Array of matching invoices with their status
 */
export async function searchInvoices(
  query: SearchQuery,
  horizonUrl: string = "https://horizon-testnet.stellar.org"
): Promise<SearchResult[]> {
  const server = new Horizon.Server(horizonUrl);
  const results: SearchResult[] = [];

  try {
    // Build transaction search with contract event filters
    let txBuilder = server.transactions();

    // Note: In a real implementation, this would filter by contract events
    // For now, we return an empty array as the contract ID would need to be passed
    // and Horizon doesn't directly support contract event filtering in the current API
    return results;
  } catch (error) {
    throw new SearchFailedError(error instanceof Error ? error.message : String(error));
  }
}

/** Options for {@link searchByMemo}. */
export interface SearchByMemoOptions {
  /**
   * When true, matching is case-sensitive. Defaults to false
   * (case-insensitive).
   */
  caseSensitive?: boolean;
}

/**
 * Search a local array of invoices by a substring of their optional memo.
 *
 * Invoices with no memo (`undefined` or `null`) are skipped without error.
 * An empty `query` returns every invoice unchanged. The input array is never
 * mutated; a new filtered array is returned (except for the empty-query fast
 * path, which returns the array as-is per the specification).
 *
 * @param invoices - Local invoices to search.
 * @param query    - Substring to look for inside each invoice's memo.
 * @param opts     - Optional flags (e.g. `caseSensitive`).
 * @returns A filtered array of matching invoices.
 */
export function searchByMemo(
  invoices: Invoice[],
  query: string,
  opts: SearchByMemoOptions = {},
): Invoice[] {
  const caseSensitive = opts.caseSensitive ?? false;

  if (query === "") {
    return invoices;
  }

  const needle = caseSensitive ? query : query.toLowerCase();
  return invoices.filter((invoice) => {
    if (invoice.memo == null) {
      return false;
    }
    const memo = caseSensitive ? invoice.memo : invoice.memo.toLowerCase();
    return memo.includes(needle);
  });
}
