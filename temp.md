Converting Markdown to PDF in TypeScript is a classic challenge, usually solved by a "two-step" process: transforming Markdown into HTML and then printing that HTML to a PDF using a headless browser.

To handle specific pagination—like forcing a new page for every `### Heading`—you don't actually need complex PDF logic. You just need **CSS**.

---

## 🛠️ The Tech Stack

The most reliable combo for this is:

* **Unified / Remark:** To parse the Markdown.
* **Puppeteer:** A headless Chrome instance to "print" the PDF.
* **CSS Break Properties:** To control the pagination.

### 1. The Transformation Logic

First, you'll convert your Markdown to an HTML string. During this process, you can use a plugin or a simple regex to ensure your headers are identifiable by CSS.

### 2. Controlling Pagination with CSS

To force a new page before every `###` (H3) tag, you apply the `break-before` property in your global styles:

```css
h3 {
  break-before: page;
}

```

This tells the PDF engine: "Whenever you see an H3, stop the current page and start a fresh one."

---

## 💻 Implementation Example

Here is a streamlined script to get this done:

```typescript
import { chromium } from 'playwright'; // Or use 'puppeteer'
import { marked } from 'marked';
import fs from 'fs';

async function generatePdf(mdFilePath: string, outputPath: string) {
  // 1. Read and Convert Markdown to HTML
  const markdown = fs.readFileSync(mdFilePath, 'utf-8');
  const contentHtml = marked.parse(markdown);

  // 2. Define the "Print" Styles
  const style = `
    <style>
      body { font-family: sans-serif; line-height: 1.6; padding: 40px; }
      h3 { break-before: page; margin-top: 0; } /* The Magic Line */
      pre { background: #f4f4f4; padding: 10px; }
    </style>
  `;

  const fullHtml = `<html><head>${style}</head><body>${contentHtml}</body></html>`;

  // 3. Use a Headless Browser to Generate PDF
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(fullHtml);
  
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' }
  });

  await browser.close();
}

generatePdf('chapter.md', 'book.pdf');

```

---

## 📝 Key Pagination Tips

| Requirement | CSS Property |
| --- | --- |
| **Force start on new page** | `break-before: page;` |
| **Prevent splitting a block** | `break-inside: avoid;` (Great for code blocks or images) |
| **Force end of page** | `break-after: page;` |

### Why this works:

Headless Chrome (via Puppeteer or Playwright) uses the **Blink rendering engine**. It treats the `page.pdf()` command exactly like a user hitting `Ctrl + P` in a browser. By injecting the `break-before: page` rule into your H3 tags, the browser's print-layout engine handles all the heavy lifting of calculating offsets and margins for you.

Would you like me to show you how to add a **Table of Contents** with clickable page links as well?