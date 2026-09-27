/**
 * @license
 * Système Intégré DDL-PN — République du Congo (MCAPNIT)
 * Utilitaire Universel d'Impression Haute Fidélité (A4 Officiel Républicain)
 * Garantit une impression sans interférence de la barre latérale ni de coupure CSS.
 */

export function printElement(element: HTMLElement | null, title: string = 'Document Officiel DDL-PN') {
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated hidden iframe for clean printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.title = title;
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Copy all style sheets and inline styles from the current document
  let stylesHtml = '';
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    stylesHtml += node.outerHTML;
  });

  // Write content to iframe document
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${stylesHtml}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background-color: #ffffff !important;
            color: #161c27 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Source Serif 4', 'EB Garamond', Georgia, serif;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          ${element.innerHTML}
        </div>
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    try {
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Erreur iframe print:', e);
      window.print();
    } finally {
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }
  }, 400);
}
