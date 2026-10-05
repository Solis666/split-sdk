import { describe, expect, it } from "vitest";

import { searchByMemo } from "../src/search.js";
import type { Invoice } from "../types.js";

/** Build a minimal Invoice fixture for searchByMemo tests. */
function makeInvoice(id: string, memo?: string | null): Invoice {
  return {
    id,
    creator: "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
    recipients: [],
    token: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    deadline: 1_800_000_000,
    funded: 0n,
    status: "Pending",
    payments: [],
    memo,
  };
}

describe("searchByMemo", () => {
  it("returns invoices whose memo contains the query substring", () => {
    const invoices = [
      makeInvoice("1", "split:INV-001"),
      makeInvoice("2", "rent-july"),
      makeInvoice("3", "other"),
    ];

    const result = searchByMemo(invoices, "INV");

    expect(result.map((invoice) => invoice.id)).toEqual(["1"]);
  });

  it("is case-insensitive by default", () => {
    const invoices = [
      makeInvoice("1", "Split:INV-001"),
      makeInvoice("2", "SPLIT-x"),
    ];

    const result = searchByMemo(invoices, "split");

    expect(result.map((invoice) => invoice.id)).toEqual(["1", "2"]);
  });

  it("respects caseSensitive: true", () => {
    const invoices = [
      makeInvoice("1", "Split:A"),
      makeInvoice("2", "split:B"),
    ];

    const result = searchByMemo(invoices, "Split", {
      caseSensitive: true,
    });

    expect(result.map((invoice) => invoice.id)).toEqual(["1"]);
  });

  it("returns all invoices for an empty query", () => {
    const invoices = [
      makeInvoice("1", "alpha"),
      makeInvoice("2", "beta"),
    ];

    const result = searchByMemo(invoices, "");

    expect(result).toBe(invoices);
  });

  it("skips invoices with null or undefined memo", () => {
    const invoices = [
      makeInvoice("1", null),
      makeInvoice("2"),
      makeInvoice("3", "abc"),
    ];

    const result = searchByMemo(invoices, "abc");

    expect(result.map((invoice) => invoice.id)).toEqual(["3"]);
  });

  it("returns an empty array when there is no match", () => {
    const invoices = [
      makeInvoice("1", "foo"),
      makeInvoice("2", "bar"),
    ];

    expect(searchByMemo(invoices, "zzz")).toEqual([]);
  });

  it("matches substrings rather than full tokens", () => {
    const invoices = [makeInvoice("1", "INVOICE-123")];

    expect(searchByMemo(invoices, "VOI").map((invoice) => invoice.id))
      .toEqual(["1"]);
  });

  it("handles an empty invoices array", () => {
    expect(searchByMemo([], "x")).toEqual([]);
    expect(searchByMemo([], "")).toEqual([]);
  });

  it("does not mutate the input array", () => {
    const invoices = [
      makeInvoice("1", "split:INV-001"),
      makeInvoice("2", "rent-july"),
      makeInvoice("3", "other"),
    ];
    const snapshot = invoices.map((invoice) => ({ ...invoice }));

    searchByMemo(invoices, "INV");

    expect(invoices).toEqual(snapshot);
  });
});
