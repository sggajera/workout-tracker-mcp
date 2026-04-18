import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readText(filePath: string) {
  return fs.readFileSync(filePath, "utf-8");
}

export function getBuiltWidgetHtml() {
  const distDir = path.resolve(__dirname, "../../../widget-ui/dist");
  const indexHtmlPath = path.join(distDir, "index.html");

  let html = readText(indexHtmlPath);

  const cssMatches = [...html.matchAll(/<link[^>]*href="(.+?\.css)"[^>]*>/g)];
  const jsMatches = [
    ...html.matchAll(
      /<script[^>]*type="module"[^>]*src="(.+?\.js)"[^>]*><\/script>/g
    ),
  ];

  let inlineCss = "";
  let inlineJs = "";

  for (const match of cssMatches) {
    const assetPath = path.resolve(distDir, match[1]);
    inlineCss += `\n/* ${match[1]} */\n${readText(assetPath)}\n`;
  }

  for (const match of jsMatches) {
    const assetPath = path.resolve(distDir, match[1]);
    inlineJs += `\n// ${match[1]}\n${readText(assetPath)}\n`;
  }

  html = html.replace(/<link[^>]*href=".+?\.css"[^>]*>/g, "");
  html = html.replace(
    /<script[^>]*type="module"[^>]*src=".+?\.js"[^>]*><\/script>/g,
    ""
  );

  html = html.replace("</head>", `<style>${inlineCss}</style></head>`);
  html = html.replace(
    "</body>",
    `<script type="module">${inlineJs}</script></body>`
  );

  return html;
}