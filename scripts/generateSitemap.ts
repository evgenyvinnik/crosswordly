import { LEVEL_DEFINITIONS } from '../src/components/levels/levelConfigs';
import { SUPPORTED_LANGUAGES } from '../src/i18n/languages';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SITE_URL = 'https://crosswordly.ca';

function generateSitemap() {
  const urls: string[] = [];

  // Add homepage with all language variants
  urls.push(`  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`);

  SUPPORTED_LANGUAGES.forEach((lang) => {
    urls.push(`  <url>
    <loc>${SITE_URL}/#/${lang}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  // Add level pages
  LEVEL_DEFINITIONS.forEach((level) => {
    // Default language
    urls.push(`  <url>
    <loc>${SITE_URL}/#/level/${level.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);

    // Each language variant
    SUPPORTED_LANGUAGES.forEach((lang) => {
      urls.push(`  <url>
    <loc>${SITE_URL}/#/${lang}/level/${level.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return sitemap;
}

// Generate and save sitemap
const sitemap = generateSitemap();
const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');
console.log(`✅ Sitemap generated successfully at ${outputPath}`);
console.log(
  `📊 Total URLs: ${LEVEL_DEFINITIONS.length * (SUPPORTED_LANGUAGES.length + 1) + SUPPORTED_LANGUAGES.length + 1}`,
);
