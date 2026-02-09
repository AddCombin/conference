// inline.js
// 用法: node inline.js input.html output.html

import fs from "fs";
import path from "path";

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error("Usage: node inline.js <input.html> <output.html>");
  process.exit(1);
}

let html = fs.readFileSync(inputFile, "utf8");

// 内联 CSS
html = html.replace(/<link href="(.*?)" rel="stylesheet".*?>/g, (_, href) => {
  const cssPath = path.join(path.dirname(inputFile), href);
  if (!fs.existsSync(cssPath)) return "";
  const css = fs.readFileSync(cssPath, "utf8");
  return `<style>${css}</style>`;
});

// 内联图片
html = html.replace(/<img src="(.*?)"(.*?)\/?>/g, (_, imgPath, attrs) => {
  const fullPath = path.join(path.dirname(inputFile), imgPath);
  if (!fs.existsSync(fullPath)) return `<img${attrs}/>`;
  const ext = path.extname(fullPath).slice(1);
  const data = fs.readFileSync(fullPath).toString("base64");
  return `<img src="data:image/${ext};base64,${data}"${attrs}/>`;
});

// 写入输出文件
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, html, "utf8");

console.log(`Processed ${inputFile} → ${outputFile}`);
