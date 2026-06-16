import * as XLSX from "xlsx";

/** Download an array of plain objects as an .xlsx file (client-side only). */
export function exportToExcel(rows: Record<string, unknown>[], filename: string, sheetName = "Data") {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/** Parse the first sheet of an uploaded Excel/CSV file into row objects. */
export async function parseExcelFile(file: File): Promise<Record<string, unknown>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
}

/** Normalise a header (e.g. "Company Name" → "company_name"). */
export function normaliseKey(k: string) {
  return k.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
