"use client";

import { useLanguage } from "./LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import BlogHeader  from "@/components/BlogHeader"

type ContentWrapperProps = {
  result: { 
    content: React.ReactElement;
    frontmatter: any;
    readingTime: string;
  };
  language: 'ta' | 'en';
};

const toTamilNumerals = (numStr: string) => {
  const map: Record<string, string> = {
    '0': '௦',
    '1': '௧',
    '2': '௨',
    '3': '௩',
    '4': '௪',
    '5': '௫',
    '6': '௬',
    '7': '௭',
    '8': '௮',
    '9': '௯',
  };
  return numStr.replace(/[0-9]/g, (d) => map[d]);
};

export function ContentWrapper({ result, language: serverLanguage }: ContentWrapperProps) {
  const { language: clientLanguage } = useLanguage();
  const router = useRouter();

  // When client language changes, refresh the page to get new content
  useEffect(() => {
    
    if (clientLanguage !== serverLanguage) {
      router.refresh();
    }
  }, [clientLanguage, serverLanguage, router]);

  const footer = {
    email: { ta: 'மின்னஞ்சல்', en: 'Email', url: 'mailto:anbu.enmin.thottam@gmail.com' },
    github: { ta: 'கிட்ஹப்', en: 'GitHub', url: 'https://github.com/abinav369/enmin-thottam' },
    youtube: { ta: 'வலையொளி', en: 'YouTube', url: 'https://www.youtube.com/@anbu_eerili' },
    instagram: { ta: 'படவரி', en: 'Instagram', url: 'https://instagram.com/anbu._.03' },
  };

  const links = Object.values(footer);
  const year = new Date().getFullYear().toString();
  const displayYear = serverLanguage === 'ta' ? toTamilNumerals(year) : year;
  const rights = serverLanguage === 'ta' ? 'உரிமைகள் ஒதுக்கப்பட்டுள்ளன' : 'All rights reserved';

  return (
    <article className="flex flex-col min-h-screen prose prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-gray-100 prose-code:text-gray-300 max-w-none">
      <div className="flex-1">
        <BlogHeader
          aumAmma={result.frontmatter.aumAmma}
          title={result.frontmatter.title}
          publishedAt={result.frontmatter.publishedAt}
          updateHistory={result.frontmatter.updateHistory}
          readingTime={result.readingTime}
          language={serverLanguage}
       />
        {result.content}
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-4 border-t border-(--border) not-prose" style={{ color: 'var(--text-muted)' }}>

        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between text-sm mb-3">
          <div className="opacity-80">© {displayYear} {rights}</div>
          <div className="flex items-center gap-2">
            {links.map((link, i) => (
              <span key={i} className="flex items-center gap-2">
                <a
                  href={link.url}
                  target={link.url.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {link[serverLanguage]}
                </a>
                {i < links.length - 1 && <span className="opacity-40">•</span>}
              </span>
            ))}
          </div>
        </div>
          
        {/* Mobile */}
        <div className="flex flex-col items-center gap-2 text-sm mb-3 md:hidden">
          {serverLanguage === 'en' ? (
            // English: grid layout
            <>
              <div className="flex items-center gap-2">
                <a href={links[0].url}
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[0][serverLanguage]}</a>
                <span className="opacity-40">•</span>
                <a href={links[1].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[1][serverLanguage]}</a>
              </div>
              <div className="flex items-center gap-2">
                <a href={links[2].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[2][serverLanguage]}</a>
                <span className="opacity-40">•</span>
                <a href={links[3].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[3][serverLanguage]}</a>
              </div>
            </>
          ) : (
            // Tamil: grid layout with centered bullets
            <>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <a href={links[3].url}
                  className="transition-colors hover:underline text-right"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[3][serverLanguage]}</a>
                <span className="opacity-40 text-center">•</span>
                <a href={links[1].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline text-left"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[1][serverLanguage]}</a>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <a href={links[2].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline text-right"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[2][serverLanguage]}</a>
                <span className="opacity-40 text-center">•</span>
                <a href={links[0].url} target="_blank" rel="noopener noreferrer"
                  className="transition-colors hover:underline text-left"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                >{links[0][serverLanguage]}</a>
              </div>
            </>
          )}
        </div>
        <div className="text-sm mb-3 opacity-80 md:hidden text-center">© {displayYear} {rights}</div>
        
      </footer>
    </article>
  );
}