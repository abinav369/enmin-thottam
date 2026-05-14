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
      console.log('Language mismatch detected, refreshing...');
      // Don't set cookie here - it's already set by LanguageContext
      router.refresh();
    }
  }, [clientLanguage, serverLanguage, router]);

  const currentYear = new Date().getFullYear().toString();
  const year = serverLanguage === 'ta' ? toTamilNumerals(currentYear) : currentYear;  
  const email = 'your@email.com';

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
      <footer className="mt-16 pt-4 border-t border-(--border) flex flex-col-reverse md:flex-row items-center justify-between gap-2 text-sm not-prose"
        style={{ color: 'var(--text-muted)' }}
      >
        <span>
          © {year}, {serverLanguage === 'ta' ? 'உரிமைகள் ஒதுக்கப்பட்டுள்ளன' : 'All rights are reserved'}
        </span>
        <a
          href={`mailto:${email}`}
          className="hover:underline transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-main)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          {email}
        </a>
      </footer>
    </article>
  );
}