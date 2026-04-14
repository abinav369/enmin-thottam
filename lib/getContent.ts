import fs from 'fs';
import path from 'path';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import readingTime from "reading-time";
import ThamizhVerse from "@/components/mdx/ThamizhVerse";
import Quote from "@/components/mdx/QuoteBox";

const contentsDir = path.join(process.cwd(), "contents");

export type FileItem = {
    name: string;
    displayName?: { ta: string; en: string }; // For translations
    path: string;
    type: 'file';
};

export type FolderItem = {
    name: string;
    displayName?: { ta: string; en: string }; // For translations
    path: string;
    type: 'folder';
    children: (FileItem | FolderItem)[];
};

export type ContentItem = FileItem | FolderItem;

type Translations = {
    [key: string]: {
        ta: string;
        en: string;
    };
};

// Safe decode for URL-encoded names
function safeDecode(name: string) {
    try {
        return decodeURIComponent(name);
    } catch {
        return name;
    }
}

// Load translations from _translations.json if it exists
function loadTranslations(dirPath: string): Translations | null {
    const translationsPath = path.join(dirPath, '_translations.json');
    if (fs.existsSync(translationsPath)) {
        try {
            const content = fs.readFileSync(translationsPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            console.error(`Error loading translations from ${translationsPath}:`, error);
            return null;
        }
    }
    return null;
}

function readDirectoryRecursive(dirPath: string): ContentItem[] {
    const items = fs.readdirSync(dirPath);
    const result: ContentItem[] = [];
    const processedFiles = new Set<string>(); // Track base filenames we've already added
    
    // Load translations for this directory
    const translations = loadTranslations(dirPath);

    for (const item of items) {
        // Skip the translations file itself
        if (item === '_translations.json') continue;
        
        const decodedItem = safeDecode(item);
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            const children = readDirectoryRecursive(fullPath);
            const displayName = translations?.[decodedItem];
            
            result.push({
                name: decodedItem,
                displayName,
                path: decodedItem,
                type: 'folder',
                children
            });
        } else if (item.endsWith('.mdx')) {
            // Remove language suffix and extension to get base name
            // e.g., "file.ta.mdx" -> "file", "file.en.mdx" -> "file", "file.mdx" -> "file"
            const withoutExt = decodedItem.replace(/\.mdx$/, '');
            const baseName = withoutExt.replace(/\.(ta|en)$/, '');
            
            // Skip if we've already processed this base file
            if (processedFiles.has(baseName)) continue;
            processedFiles.add(baseName);
            
            const displayName = translations?.[baseName];
            
            result.push({
                name: baseName,
                displayName,
                path: baseName,
                type: 'file'
            });
        }
    }

    return result.sort((a, b) => {
        // Files come before folders
        if (a.type !== b.type) {
            return a.type === 'file' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
}

export function getCategoriesAndfiles() {
    let categories = fs.readdirSync(contentsDir)
        .filter((item) => {
            // Filter out translation files and only keep directories
            if (item === '_translations.json') return false;
            const fullPath = path.join(contentsDir, item);
            return fs.statSync(fullPath).isDirectory();
        });

    categories = categories.sort((a, b) => {
        if (a === "intro") return -1;
        if (b === "intro") return 1;
        if (a === "history") return -1;
        if (b === "history") return 1;
        return a.localeCompare(b);
    });

    return categories.map((category) => {
        const decodedCategory = safeDecode(category);
        const categoryPath = path.join(contentsDir, category);
        
        // Load category-level translations
        const categoryTranslations = loadTranslations(contentsDir);
        const categoryDisplayName = categoryTranslations?.[decodedCategory];

        // Handle special top-level pages (intro and history)
        if (category === "intro" || category === "history") {
            const files = fs.readdirSync(categoryPath)
                .filter((f) => f.endsWith(".mdx"))
                .map((f) => {
                    const decoded = safeDecode(f);
                    return {
                        name: decoded.replace(/\.mdx$/, ''),
                        path: decoded.replace(/\.mdx$/, ''),
                        type: 'file' as const
                    };
                });

            return { 
                category: decodedCategory,
                displayName: categoryDisplayName,
                items: files
            };
        }

        const items = readDirectoryRecursive(categoryPath); 

        return { 
            category: decodedCategory,
            displayName: categoryDisplayName,
            items 
        };
    });
}

// Helper to find .mdx with language support
function findFileWithExtension(
    basePath: string,
    language: 'ta' | 'en'
): string | null {
    // Priority 1: Try language-specific file first
    const langMdxPath = `${basePath}.${language}.mdx`;
    
    if (fs.existsSync(langMdxPath)) {
        return langMdxPath;
    }
    
    // Priority 2: Fall back to default file (no language suffix)
    const mdxPath = basePath + '.mdx';
    
    if (fs.existsSync(mdxPath)) {
        return mdxPath;
    }
    
    return null;
}

export async function getFileContent(
    pathSegments: string[],
    language: 'ta' | 'en' = 'ta'
) {
    const decodedSegments = pathSegments.map(safeDecode);
    
    // Special handling for top-level pages (intro and history)
    // When pathSegments is ['history'], look for contents/history/history.mdx
    if (decodedSegments.length === 1 && (decodedSegments[0] === 'intro' || decodedSegments[0] === 'history')) {
        const category = decodedSegments[0];
        decodedSegments.push(category); // Look for intro/intro.mdx or history/history.mdx
    }
    
    const basePath = path.join(contentsDir, ...decodedSegments);
    const filePath = findFileWithExtension(basePath, language);
    
    if (!filePath) {
        throw new Error(
            `File not found: ${basePath}.${language}.mdx or ${basePath}.mdx`
        );
    }
    
    const fileContent = fs.readFileSync(filePath, "utf-8");

    const stats = readingTime(fileContent);

    const { content, frontmatter } = await compileMDX({
        source: fileContent,
        components: {
            ThamizhVerse,
            Quote
        },
        options: {
            parseFrontmatter: true,
            mdxOptions: {
                remarkPlugins: [remarkGfm],
            }
        },
    });
    
    return { 
        content,
        frontmatter,
        readingTime: stats.text
    };
}

// *************************************
// **  Getting contents for history   **

export type ContentMeta = {
  title: string;
  updatedAt: string;
  publishedAt: string;       // display value
  sortKey: string;           // .en.mdx updatedAt for sorting
  publishedSortKey: string;  // .en.mdx publishedAt for sorting
  href: string;
};

export async function getAllContentMeta(language: 'ta' | 'en' = 'ta'): Promise<ContentMeta[]> {
  const results: ContentMeta[] = [];

    function extractFrontmatter(filePath: string): Record<string, string> {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const match = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!match) return {};
      const fm: Record<string, string> = {};
      for (const line of match[1].split('\n')) {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) continue;
        const key = line.slice(0, colonIdx).trim();
        const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key) fm[key] = value;
      }
      return fm;
    }

  function walkItems(items: ContentItem[], basePath: string) {
    for (const item of items) {
      if (item.type === 'folder') {
        walkItems(item.children, `${basePath}/${item.path}`);
      } else {
        const absBase = path.join(contentsDir, ...basePath.split('/').filter(Boolean), item.path);

        // Always use .en.mdx for sorting
        const enPath = `${absBase}.en.mdx`;
        if (!fs.existsSync(enPath)) continue;

        const enFm = extractFrontmatter(enPath);
        if (!enFm.title || !enFm.updatedAt) continue;

        // For display, use language-specific file if it exists, else fall back to .en.mdx
        const langPath = language === 'en' ? enPath : `${absBase}.${language}.mdx`;
        const displayFm = fs.existsSync(langPath)
          ? extractFrontmatter(langPath)
          : enFm;

        results.push({
          title: displayFm.title || enFm.title,
          updatedAt: displayFm.updatedAt || enFm.updatedAt,
          publishedAt: displayFm.publishedAt || enFm.publishedAt,
          sortKey: enFm.updatedAt,
          publishedSortKey: enFm.publishedAt,
          href: `${basePath}/${item.path}`,
        });
      }
    }
  }

  const categories = getCategoriesAndfiles();
  for (const cat of categories) {
    if (cat.category === 'intro' || cat.category === 'history') continue;
    walkItems(cat.items, `/${cat.category}`);
  }

  // Sort is always by .en.mdx updatedAt — but we don't have it separately anymore.
  // Re-read en updatedAt for sort key:
  return results.sort((a, b) =>
    new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime()
  );
}


// end of getting details for history **
// *************************************