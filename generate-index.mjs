import { readdirSync, statSync, writeFileSync } from 'fs';

const assetsDir = 'dist/client/assets';
const files = readdirSync(assetsDir);

const cssFile = files.find(f => f.endsWith('.css'));
const jsFiles = files.filter(f => f.startsWith('index-') && f.endsWith('.js'));
const entryJs = jsFiles.sort((a, b) => statSync(`${assetsDir}/${b}`).size - statSync(`${assetsDir}/${a}`).size)[0];

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pipeline Insights — Sales Methodology Hub</title>
    <meta name="description" content="Discover how much revenue your sales team is leaving on the table." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/assets/${cssFile}" />
    <script type="module" src="/assets/${entryJs}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;

writeFileSync('dist/client/index.html', html);
console.log(`✓ Generated index.html → ${cssFile} + ${entryJs}`);
