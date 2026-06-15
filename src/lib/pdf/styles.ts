import { StyleSheet } from "@react-pdf/renderer";

/** Brand palette for PDF documents. */
export const PDF = {
  navy: "#071827",
  card: "#102437",
  accent: "#ff7a00",
  steel: "#6b7c8d",
  line: "#d4dae0",
  text: "#1a2733",
  white: "#ffffff",
};

export const styles = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 56,
    paddingHorizontal: 0,
    fontSize: 10,
    color: PDF.text,
    fontFamily: "Helvetica",
  },
  /* Header band */
  header: {
    backgroundColor: PDF.navy,
    color: PDF.white,
    paddingHorizontal: 36,
    paddingVertical: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandRow: { flexDirection: "row", alignItems: "center" },
  logoBox: {
    width: 34, height: 34, borderRadius: 6, backgroundColor: PDF.accent,
    color: PDF.navy, alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  logoText: { fontSize: 16, fontFamily: "Helvetica-Bold", color: PDF.navy },
  brandName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: PDF.white, letterSpacing: 1 },
  brandSub: { fontSize: 7, color: PDF.accent, letterSpacing: 2, marginTop: 2 },
  docType: { fontSize: 20, fontFamily: "Helvetica-Bold", color: PDF.white, textAlign: "right" },
  docMeta: { fontSize: 8, color: "#aab6c2", textAlign: "right", marginTop: 2 },

  body: { paddingHorizontal: 36, paddingTop: 24 },

  /* Two-column meta block */
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  metaCol: { width: "48%" },
  metaLabel: { fontSize: 7, color: PDF.steel, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 },
  metaValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 1 },
  metaText: { fontSize: 9, color: PDF.text, marginBottom: 1 },

  /* Section title */
  sectionTitle: {
    fontSize: 9, fontFamily: "Helvetica-Bold", color: PDF.navy,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
    borderBottomWidth: 2, borderBottomColor: PDF.accent, paddingBottom: 4,
  },

  /* Table */
  table: { marginBottom: 18 },
  tHead: { flexDirection: "row", backgroundColor: PDF.navy, color: PDF.white, paddingVertical: 7, paddingHorizontal: 8 },
  tHeadCell: { fontSize: 8, fontFamily: "Helvetica-Bold", color: PDF.white, textTransform: "uppercase", letterSpacing: 0.5 },
  tRow: { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: PDF.line },
  tRowAlt: { backgroundColor: "#f4f7fa" },
  tCell: { fontSize: 9, color: PDF.text },

  /* Totals */
  totals: { marginLeft: "auto", width: "45%", marginTop: 4 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 9, color: PDF.steel },
  totalValue: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  grandRow: {
    flexDirection: "row", justifyContent: "space-between", marginTop: 6, paddingVertical: 8,
    paddingHorizontal: 10, backgroundColor: PDF.accent, borderRadius: 4,
  },
  grandLabel: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PDF.navy },
  grandValue: { fontSize: 11, fontFamily: "Helvetica-Bold", color: PDF.navy },

  badge: {
    alignSelf: "flex-start", fontSize: 8, fontFamily: "Helvetica-Bold",
    color: PDF.navy, backgroundColor: PDF.accent, paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10,
  },

  note: { fontSize: 8, color: PDF.steel, marginTop: 4, lineHeight: 1.4 },

  /* Footer */
  footer: {
    position: "absolute", bottom: 24, left: 36, right: 36,
    flexDirection: "row", justifyContent: "space-between",
    borderTopWidth: 1, borderTopColor: PDF.line, paddingTop: 8,
  },
  footerText: { fontSize: 7, color: PDF.steel },

  /* Checklist / signature */
  checkItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: PDF.line },
  signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  signBox: { width: "45%", borderTopWidth: 1, borderTopColor: PDF.text, paddingTop: 6 },
});
