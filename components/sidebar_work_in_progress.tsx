"use client";

import { Globe, Moon, Sun, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/getContent";
import { useLanguage } from "./LanguageContext";

type SidebarProps = {
  data: {
    category: string;
    displayName?: { ta: string; en: string };
    items: ContentItem[];
  }[];
  initialLanguage?: 'ta' | 'en';
  children?: React.ReactNode;
};

function RenderItems({ 
  items, 
  basePath, 
  pathname,
  openFolders,
  toggleFolder,
  initialLanguage,
  mounted,
  onNavigate,
  theme,
}: { 
  items: ContentItem[]; 
  basePath: string; 
  pathname: string;
  openFolders: Set<string>;
  toggleFolder: (path: string) => void;
  initialLanguage: 'ta' | 'en';
  mounted: boolean;
  onNavigate: (href: string) => void;
  theme: string;
}) {
  const activeColor = theme === 'dark' ? '#00FFFF' : '#b91c1c';
  const hoverColor = theme === 'dark' ? '#00CCCC' : '#dc2626';

  return (
    <ul className="ml-4 mt-1 space-y-1 relative">
      <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'var(--border)', marginLeft: '-0.5rem' }}></div>

      {items.map((item) => {
        if (item.type === 'file') {
          const href = `${basePath}/${item.path}`;
          const decodedPathname = decodeURIComponent(pathname);
          const isActive = decodedPathname === href;

          return (
            <li key={item.path} className="relative">
              <div className="absolute left-0 top-1/2 w-2 h-px" style={{ background: 'var(--border)', marginLeft: '-0.5rem' }}></div>
              <Link
                href={href}
                onClick={(e) => { e.preventDefault(); onNavigate(href); }}
                className="block pl-3 transition-colors"
                style={{ color: isActive ? activeColor : 'var(--text-muted)' }}
                onMouseEnter={e => { if (!isActive) (e.target as HTMLElement).style.color = hoverColor; }}
                onMouseLeave={e => { if (!isActive) (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                <span suppressHydrationWarning>
                  {item.displayName?.[initialLanguage] || item.name}
                </span>
              </Link>
            </li>
          );
        } else {
          const folderFullPath = `${basePath}/${item.path}`;
          const isOpen = openFolders.has(folderFullPath);

          return (
            <li key={item.path} className="mb-2 relative">
              <div className="absolute left-0 top-3 w-2 h-px" style={{ background: 'var(--border)', marginLeft: '-0.5rem' }}></div>
              <details open={isOpen}>
                <summary 
                  className="cursor-pointer font-medium pl-3 transition-colors"
                  style={{ color: 'var(--text-main)' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = hoverColor; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'var(--text-main)'; }}
                  onClick={(e) => { e.preventDefault(); toggleFolder(folderFullPath); }}
                >
                  <span suppressHydrationWarning>
                    {item.displayName?.[initialLanguage] || item.name}
                  </span>
                </summary>
                <RenderItems 
                  items={item.children} 
                  basePath={folderFullPath} 
                  pathname={pathname}
                  openFolders={openFolders}
                  toggleFolder={toggleFolder}
                  initialLanguage={initialLanguage}
                  mounted={mounted}
                  onNavigate={onNavigate}
                  theme={theme}
                />
              </details>
            </li>
          );
        }
      })}
    </ul>
  );
}

export default function Sidebar({ data, initialLanguage = 'ta', children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, theme, setTheme, t } = useLanguage();
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeColor = theme === 'dark' ? '#00FFFF' : '#b91c1c';
  const hoverColor = theme === 'dark' ? '#00CCCC' : '#dc2626';

  useEffect(() => { setMounted(true); }, []);

  const activeCategory = useMemo(() => {
    const parts = pathname.split('/').filter(p => p.length > 0);
    return parts.length > 0 ? decodeURIComponent(parts[0]) : '';
  }, [pathname]);

  const [openFolders, setOpenFolders] = useState<Set<string>>(() => {
    const parts = pathname.split('/').filter(p => p.length > 0);
    const folders = new Set<string>();
    let current = "";
    for (let i = 0; i < parts.length - 1; i++) {
      current += `/${decodeURIComponent(parts[i])}`;
      folders.add(current);
    }
    return folders;
  });
  
  const [openCategories, setOpenCategories] = useState<Set<string>>(() => {
    const parts = pathname.split('/').filter(p => p.length > 0);
    const category = parts.length > 0 ? decodeURIComponent(parts[0]) : '';
    return category ? new Set([category]) : new Set();
  });

  useEffect(() => {
    if (activeCategory && activeCategory !== 'intro' && activeCategory !== 'history') {
      setOpenCategories((prev) => {
        const newSet = new Set(prev);
        newSet.add(activeCategory);
        return newSet;
      });
    }
  }, [activeCategory]);

  const prevPathnameRef = useRef(pathname);
  
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      const parts = decodeURIComponent(pathname).split('/').filter(Boolean);
      setOpenFolders((prev) => {
        const newSet = new Set(prev);
        let current = "";
        for (let i = 0; i < parts.length - 1; i++) {
          current += `/${parts[i]}`;
          if (!prev.has(current)) newSet.add(current);
        }
        return newSet.size !== prev.size ? newSet : prev;
      });
    }
  }, [pathname]);

  const allFolderPaths = useMemo(() => {
    const paths = new Set<string>();
    const gatherPaths = (items: ContentItem[], basePath: string) => {
      items.forEach((item) => {
        if (item.type === 'folder') {
          const folderPath = `${basePath}/${item.path}`;
          paths.add(folderPath);
          gatherPaths(item.children, folderPath);
        }
      });
    };
    data.forEach((cat) => {
      if (cat.category !== "intro" && cat.category !== "history") {
        gatherPaths(cat.items, `/${cat.category}`);
      }
    });
    return paths;
  }, [data]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (deltaX > 60 && !open) setOpen(true);
      if (deltaX < -60 && open) setOpen(false);
    };
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [open]);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) newSet.delete(path);
      else newSet.add(path);
      return newSet;
    });
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) newSet.delete(category);
      else newSet.add(category);
      return newSet;
    });
  };

  const collapseAll = () => {
    setOpenFolders(new Set());
    setOpenCategories(new Set());
  };

  const expandAll = () => {
    setOpenFolders(new Set(allFolderPaths)); 
    const allCats = new Set<string>();
    data.forEach(cat => {
      if (cat.category !== "intro" && cat.category !== "history") allCats.add(cat.category);
    });
    setOpenCategories(allCats);
  };

  const handleLanguageChange = () => {
    const newLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(newLang);
    document.cookie = `language=${newLang}; path=/; max-age=31536000`;
    startTransition(() => { router.refresh(); });
  };

  const handleNavigation = (href: string) => {
    if (decodeURIComponent(pathname) === href) return;
    startTransition(() => { router.push(href); });
  };

  const allExpanded = openFolders.size === allFolderPaths.size && 
    openCategories.size === data.filter(c => c.category !== "intro" && c.category !== "history").length;

  // Nav link color helper
  const navLinkColor = (isActive: boolean) => isActive ? '#C4A484' : 'var(--text-main)';

  return (
    <div className="flex min-h-screen relative transition-colors" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>

      {/* SIDEBAR */}
      <aside
        className={`transition-all duration-300 ease-in-out fixed top-0 left-0 h-full overflow-y-auto z-40
          ${open ? "w-72 md:w-80 p-3 md:p-4" : "w-0 p-0 overflow-hidden"}
        `}
        style={{ 
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Close button */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer absolute top-1/2 right-0 -translate-y-1/2 z-50 px-1.5 py-8 rounded-l-xl hover:px-2.5 transition-all duration-300"
            style={{ 
              background: theme === 'dark' ? '#1f2937' : '#e5e7eb',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              borderRight: 'none',
            }}
            title={mounted ? t('closeSidebar') : 'Close sidebar'}
            aria-label={mounted ? t('closeSidebar') : 'Close sidebar'}
          >
            ⟨
          </button>
        )}

        {open && (
          <>
            <div className="mb-6 space-y-4">
              {/* Title */}
              <Link
                href="/"
                onClick={(e) => { e.preventDefault(); handleNavigation("/"); }}
                className="block text-3xl md:text-5xl font-bold text-center cursor-pointer"
                style={{ color: '#C4A484' }}
              >
                {language === 'ta' ? 'அன்பு' : 'Anbu'}
              </Link>
              
              {/* Language + Theme buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleLanguageChange}
                  disabled={isPending}
                  className="cursor-pointer text-sm px-3 py-2 bg-[#00cccc] hover:bg-[#00ffff] disabled:bg-[#00c0c0] disabled:cursor-not-allowed rounded-md transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Globe className="w-4 h-4" style={{ color: '#000000' }} />
                  <span style={{ color: '#000000' }}>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
                </button>
                
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="cursor-pointer text-sm px-3 py-2 rounded-md  hover:bg-gray-500 transition-colors font-medium flex items-center justify-center gap-2"
                  style={{
                    background: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#ffffff' : '#1f2937',
                  }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>

              {/* Divider */}
              <div className="h-px w-full" style={{ background: 'var(--border)' }} />

              {/* Contents heading + expand/collapse */}
              <div className="flex items-end justify-between">
                <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-bold)' }}>
                  {language === 'ta' ? 'பொருளடக்கம்' : 'Contents'}
                </h2>
                <button
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="cursor-pointer text-sm px-2 py-2 hover:underline underline-offset-7 transition-colors flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${allExpanded ? 'rotate-90' : ''}`} />
                  <span>
                    {allExpanded
                      ? (language === 'ta' ? 'மூடு' : 'Collapse')
                      : (language === 'ta' ? 'விரி' : 'Expand')
                    }
                  </span>
                </button>
              </div>
            </div>
            
            {/* Nav links */}
            <ul>
              <li className="mb-4">
                <Link
                  href="/"
                  onClick={(e) => { e.preventDefault(); handleNavigation("/"); }}
                  className="block text-base md:text-lg font-medium transition-colors"
                  style={{ color: navLinkColor(pathname === "/") }}
                  onMouseEnter={e => { if (pathname !== "/") (e.currentTarget as HTMLElement).style.color = hoverColor; }}
                  onMouseLeave={e => { if (pathname !== "/") (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
                >
                  {initialLanguage === 'ta' ? 'அறிமுகம்' : 'Introduction'}
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/history"
                  onClick={(e) => { e.preventDefault(); handleNavigation("/history"); }}
                  className="block text-base md:text-lg font-medium transition-colors"
                  style={{ color: navLinkColor(pathname === "/history") }}
                  onMouseEnter={e => { if (pathname !== "/history") (e.currentTarget as HTMLElement).style.color = hoverColor; }}
                  onMouseLeave={e => { if (pathname !== "/history") (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
                >
                  {initialLanguage === 'ta' ? 'காலச்சுவடு' : 'Updates'}
                </Link>
              </li>

              {data.map((cat) => {
                const categoryDisplayName = cat.displayName?.[initialLanguage] || cat.category;
                const isCategoryOpen = openCategories.has(cat.category);
                
                return (
                  <li key={cat.category} className="mb-2">
                    <details open={isCategoryOpen}>
                      <summary 
                        className="cursor-pointer font-semibold transition-colors"
                        style={{ color: 'var(--text-main)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = hoverColor; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-main)'; }}
                        onClick={(e) => { e.preventDefault(); toggleCategory(cat.category); }}
                      >
                        <span>{categoryDisplayName}</span>
                      </summary>
                      <RenderItems 
                        items={cat.items} 
                        basePath={`/${cat.category}`}
                        pathname={pathname}
                        openFolders={openFolders}
                        toggleFolder={toggleFolder}
                        initialLanguage={initialLanguage}
                        mounted={mounted}
                        onNavigate={handleNavigation}
                        theme={theme}
                      />
                    </details>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>

      {/* Mobile overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Open Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer fixed top-1/2 left-0 -translate-y-1/2 z-50 px-1.5 py-8 md:px-2 md:py-10 rounded-r-xl hover:px-3 transition-all duration-300"
          style={{
            background: theme === 'dark' ? '#1f2937' : '#e5e7eb',
            color: 'var(--text-main)',
            border: '1px solid var(--border)',
            borderLeft: 'none',
          }}
          title={mounted ? t('openSidebar') : 'Open sidebar'}
          aria-label={mounted ? t('openSidebar') : 'Open sidebar'}
          suppressHydrationWarning
        >
          ⟩
        </button>
      )}

      {/* MAIN CONTENT */}
      <main
        className="fixed top-0 right-0 bottom-0 overflow-y-auto"
        style={{ 
          background: 'var(--bg-main)',
          left: open ? 'var(--sidebar-width)' : '0px',
          transition: 'left 300ms ease-in-out'
        }}
      >
        {isPending && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {language === 'ta' ? 'இறங்குகிறது...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}
        
        <div 
          className={`w-full max-w-7xl mx-auto md:p-10 px-7 transition-all duration-300
            ${isPending ? "opacity-30 pointer-events-none" : "opacity-100"}
          `}
        >
          {children}
        </div>
      </main>
    </div>
  );
}