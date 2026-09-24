export function centsToDollarsInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2);
}

export function dollarsInputToCents(value: FormDataEntryValue | null): number {
  const str = typeof value === "string" ? value.trim() : "";
  const n = parseFloat(str);
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
}

// The PDF renderer's built-in fonts don't include the ₱ glyph (it gets
// substituted with an unrelated symbol), so PDFs spell out the currency code
// instead of using the symbol.
export function formatCentsPdf(cents: number): string {
  return (cents / 100).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    currencyDisplay: "code",
  });
}
