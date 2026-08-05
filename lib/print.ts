/**
 * printElement — opens a clean A4 print window containing only the target element's HTML.
 * This avoids the sidebar/topbar/nav being included when calling window.print() on the full page.
 *
 * @param elementId - The id of the DOM element to print
 * @param title     - Window title shown in the browser print dialog
 */
export function printElement(elementId: string, title = "طباعة") {
  const el = document.getElementById(elementId);
  if (!el) {
    console.error(`[printElement] Element not found: #${elementId}`);
    return;
  }

  const html = el.innerHTML;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    alert("يرجى السماح بالنوافذ المنبثقة لإتمام الطباعة");
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    @page {
      size: A4 portrait;
      margin: 12mm 10mm;
    }

    body {
      direction: rtl;
      font-family: 'Cairo', Arial, sans-serif;
      font-size: 13px;
      line-height: 1.55;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* ── Layout ── */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 4px; }
    .gap-2 { gap: 8px; }
    .gap-3 { gap: 12px; }
    .gap-4 { gap: 16px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .space-y-2 > * + * { margin-top: 8px; }
    .space-y-4 > * + * { margin-top: 16px; }
    .space-y-5 > * + * { margin-top: 20px; }
    .space-y-6 > * + * { margin-top: 24px; }

    /* ── Spacing ── */
    .p-2\\.5  { padding: 10px; }
    .p-3  { padding: 12px; }
    .p-4  { padding: 16px; }
    .p-5  { padding: 20px; }
    .p-6  { padding: 24px; }
    .pt-1 { padding-top: 4px; }
    .pt-2 { padding-top: 8px; }
    .pb-3 { padding-bottom: 12px; }
    .pb-5 { padding-bottom: 20px; }
    .px-2 { padding-left: 8px; padding-right: 8px; }
    .px-3 { padding-left: 12px; padding-right: 12px; }
    .py-0\\.5 { padding-top: 2px; padding-bottom: 2px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .mt-0\\.5 { margin-top: 2px; }
    .mt-1 { margin-top: 4px; }
    .mb-1 { margin-bottom: 4px; }

    /* ── Sizing ── */
    .w-full { width: 100%; }
    .w-14 { width: 56px; }
    .h-14 { height: 56px; }
    .w-80 { width: 320px; }
    .sm\\:w-80 { width: 320px; }
    .min-w-\\[500px\\] { min-width: 500px; }
    .min-w-\\[400px\\] { min-width: 400px; }

    /* ── Typography ── */
    .text-xs    { font-size: 11px; }
    .text-sm    { font-size: 13px; }
    .text-base  { font-size: 15px; }
    .text-lg    { font-size: 18px; }
    .text-xl    { font-size: 20px; }
    .text-2xl   { font-size: 24px; }
    .font-mono  { font-family: monospace; }
    .font-semibold  { font-weight: 600; }
    .font-bold      { font-weight: 700; }
    .font-extrabold { font-weight: 800; }
    .font-black     { font-weight: 900; }
    .whitespace-nowrap { white-space: nowrap; }
    .whitespace-pre-line { white-space: pre-line; }

    /* ── Colors ── */
    .text-primary       { color: #1a3660; }
    .text-purple-600    { color: #7c3aed; }
    .text-rose-600      { color: #e11d48; }
    .text-amber-600     { color: #d97706; }
    .text-emerald-600   { color: #059669; }
    .text-blue-600      { color: #2563eb; }
    .text-muted-foreground { color: #64748b; }

    .bg-primary\\/5   { background-color: rgba(26,54,96,0.05); }
    .bg-primary\\/10  { background-color: rgba(26,54,96,0.1); }
    .bg-blue-500\\/10 { background-color: rgba(59,130,246,0.1); }
    .bg-emerald-500\\/10 { background-color: rgba(16,185,129,0.1); }
    .bg-muted\\/20    { background-color: rgba(241,245,249,0.5); }
    .bg-muted\\/30    { background-color: rgba(241,245,249,0.6); }
    .bg-muted\\/60    { background-color: rgba(241,245,249,0.9); }
    .bg-purple-500\\/10 { background-color: rgba(168,85,247,0.1); }

    /* ── Borders ── */
    .border        { border: 1px solid #e2e8f0; }
    .border-b      { border-bottom: 1px solid #e2e8f0; }
    .border-t      { border-top: 1px solid #e2e8f0; }
    .border-border { border-color: #e2e8f0; }
    .border-primary\\/20 { border-color: rgba(26,54,96,0.2); }
    .rounded       { border-radius: 4px; }
    .rounded-lg    { border-radius: 8px; }
    .rounded-xl    { border-radius: 12px; }
    .rounded-2xl   { border-radius: 16px; }
    .divide-y > * + * { border-top: 1px solid #e2e8f0; }
    .divide-border > * + * { border-top-color: #e2e8f0; }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
    }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    th, td { padding: 7px 10px; text-align: right; vertical-align: middle; }
    .text-right { text-align: right; }
    .text-left  { text-align: left; }

    /* ── Misc ── */
    .overflow-x-auto { overflow-x: auto; }
    .inline-block { display: inline-block; }
    .inline-flex  { display: inline-flex; align-items: center; }
    .block        { display: block; }
    .object-contain { object-fit: contain; }

    /* ── Hide screen-only elements ── */
    .print\\:hidden, [class*="print:hidden"] { display: none !important; }

    /* ── Hover classes: no-op in print ── */
    .hover\\:bg-muted\\/10:hover { background-color: transparent; }
  </style>
</head>
<body>
${html}
<script>
  window.onload = function() {
    setTimeout(function() { window.print(); window.close(); }, 400);
  };
<\/script>
</body>
</html>`);

  printWindow.document.close();
}
