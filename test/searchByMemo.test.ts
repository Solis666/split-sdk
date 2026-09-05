/**
 * searchByMemo — test suite (issue #614)
 * ======================================
 * Archivo NUEVO: src/__tests__/search.test.ts  (vitest, conforme al repo:
 * los tests de módulos src viven en src/__tests__/*.test.ts).
 *
 * Cubre la matriz P1–P10 de TEST_PLAN_CANDIDATO_614.md.
 * Ejecutar con:  npx vitest run src/__tests__/search.test.ts
 */
import { describe, expect, it } from "vitest";

import { searchByMemo } from "../src/search.js";
import type { Invoice } from "../types.js";

/** Mínimo de campos obligatorios de Invoice para construir un fixture válido. */
function makeInvoice(id: string, memo?: string): Invoice {
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
  it("P1: returns invoices whose memo contains the query substring", () => {
    const invoices = [
      makeInvoice("1", "split:INV-001"),
      makeInvoice("2", "rent-july"),
      makeInvoice("3", "other"),
    ];
    const result = searchByMemo(invoices, "INV");
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("P2: is case-insensitive by default", () => {
    const invoices = [
      makeInvoice("1", "Split:INV-001"),
      makeInvoice("2", "SPLIT-x"),
    ];
    const result = searchByMemo(invoices, "split");
    expect(result.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("P3: respects caseSensitive: true", () => {
    const invoices = [
      makeInvoice("1", "Split:A"),
      makeInvoice("2", "split:B"),
    ];
    const result = searchByMemo(invoices, "Split", { caseSensitive: true });
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("P4: returns all invoices unchanged for an empty query", () => {
    const invoices = [
      makeInvoice("1", "alpha"),
      makeInvoice("2", "beta"),
    ];
    const result = searchByMemo(invoices, "");
    expect(result).toBe(invoices); // mismo array, sin cambios
    expect(result.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("P5: skips invoices with null/undefined memo without error", () => {
    const invoices = [
      makeInvoice("1", null),
      makeInvoice("2", undefined),
      makeInvoice("3", "abc"),
    ];
    const result = searchByMemo(invoices, "abc");
    expect(result.map((i) => i.id)).toEqual(["3"]);
  });

  it("P6: returns [] when there is no match", () => {
    const invoices = [
      makeInvoice("1", "foo"),
      makeInvoice("2", "bar"),
    ];
    expect(searchByMemo(invoices, "zzz")).toEqual([]);
  });

  it("P7: matches substrings, not full tokens", () => {
    const invoices = [makeInvoice("1", "INVOICE-123")];
    const result = searchByMemo(invoices, "VOI");
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("P8: handles an empty invoices array", () => {
    expect(searchByMemo([], "x")).toEqual([]);
    expect(searchByMemo([], "")).toEqual([]);
  });

  it("P9: does not mutate the input array", () => {
    const invoices = [
      makeInvoice("1", "split:INV-001"),
      makeInvoice("2", "rent-july"),
      makeInvoice("3", "other"),
    ];
    const snapshot = invoices.map((i) => ({ ...i }));
    searchByMemo(invoices, "INV");
    expect(invoices).toEqual(snapshot);
    expect(invoices).toHaveLength(3);
  });

  it("P10: empty query on empty invoices returns [] (edge)", () => {
    expect(searchByMemo([], "")).toEqual([]);
  });
});
