// This script splits a large sitemap.xml into smaller, more manageable sitemap files
// and creates a sitemap-index.xml file that points to them.
// This is necessary for large sites to avoid crawler timeouts (like from Googlebot).

import fs from "fs/promises";
import path from "path";
import { xml2js, js2xml } from "xml-js";

// --- CONFIGURATION ---
const PUBLIC_DIR = "public"; // The directory where your site is built
const SOURCE_SITEMAP = path.join(PUBLIC_DIR, "sitemap.xml");
const SITEMAP_INDEX_PATH = path.join(PUBLIC_DIR, "sitemap-index.xml");
const CHUNK_SIZE = 500; // Number of URLs per sitemap file. 500 is a safe number.
// ---------------------

async function splitSitemap() {
    console.log("Starting sitemap splitting process...");

    try {
        // 1. Read and parse the large sitemap.xml
        const originalSitemapXml = await fs.readFile(SOURCE_SITEMAP, "utf-8");
        const sitemapJs = xml2js(originalSitemapXml, { compact: true });

        const urls = sitemapJs.urlset.url;
        if (!urls || !Array.isArray(urls)) {
            console.log("No URLs found or sitemap format is incorrect. Exiting.");
            return;
        }
        console.log(`Found ${urls.length} total URLs to process.`);

        // 2. Split the URLs into chunks
        const urlChunks = [];
        for (let i = 0; i < urls.length; i += CHUNK_SIZE) {
            urlChunks.push(urls.slice(i, i + CHUNK_SIZE));
        }
        console.log(`Splitting into ${urlChunks.length} sitemap files of size ~${CHUNK_SIZE}.`);

        const sitemapIndexEntries = [];

        // 3. Create a new sitemap file for each chunk
        for (let i = 0; i < urlChunks.length; i++) {
            const chunk = urlChunks[i];
            const sitemapChunkPath = path.join(PUBLIC_DIR, `sitemap-${i}.xml`);

            const sitemapChunkJs = {
                _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
                urlset: {
                    _attributes: {
                        xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
                    },
                    url: chunk,
                },
            };

            const sitemapChunkXml = js2xml(sitemapChunkJs, { compact: true, spaces: 4 });
            await fs.writeFile(sitemapChunkPath, sitemapChunkXml);
            console.log(`Created ${sitemapChunkPath}`);

            // Add entry for the sitemap index
            // Ensure your domain is correct here
            const fullUrl = `https://ravenpedia.xyz/sitemap-${i}.xml`;
            sitemapIndexEntries.push({
                loc: { _text: fullUrl },
                lastmod: { _text: new Date().toISOString().split('T')[0] }, // Use YYYY-MM-DD format for lastmod
            });
        }

        // 4. Create the sitemap-index.xml
        const sitemapIndexJs = {
            _declaration: { _attributes: { version: "1.0", encoding: "utf-8" } },
            sitemapindex: {
                _attributes: {
                    xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
                },
                // --- CORRECTED STRUCTURE ---
                // This ensures the <sitemap> tags are direct children of <sitemapindex>
                sitemap: sitemapIndexEntries,
            },
        };

        const sitemapIndexXml = js2xml(sitemapIndexJs, { compact: true, spaces: 4 });
        await fs.writeFile(SITEMAP_INDEX_PATH, sitemapIndexXml);
        console.log(`Successfully created sitemap-index.xml`);

        // 5. Delete the original large sitemap.xml
        await fs.unlink(SOURCE_SITEMAP);
        console.log(`Deleted original ${SOURCE_SITEMAP}`);

        console.log("Sitemap splitting process finished successfully!");

    } catch (error) {
        console.error("Error splitting sitemap:", error);
        process.exit(1); // Exit with an error code to fail the GitHub Action
    }
}

splitSitemap();

