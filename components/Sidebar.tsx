"use client";

import { Globe, Moon, Sun } from "lucide-react";
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
  onNavigate
}: { 
  items: ContentItem[]; 
  basePath: string; 
  pathname: string;
  openFolders: Set<string>;
  toggleFolder: (path: string) => void;
  initialLanguage: 'ta' | 'en';
  mounted: boolean;
  onNavigate: (href: string) => void;
}) {
  return (
    <ul className="ml-4 mt-1 space-y-1 relative">
      {/* TREE VERTICAL LINE */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-700" style={{ marginLeft: '-0.5rem' }}></div>

      {items.map((item) => {
        if (item.type === 'file') {
          const href = `${basePath}/${item.path}`;
          const decodedPathname = decodeURIComponent(pathname);
          const isActive = decodedPathname === href;

          return (
            <li key={item.path} className="relative">
              {/* TREE HORIZONTAL LINE FOR FILES */}
              <div className="absolute left-0 top-1/2 w-2 h-px bg-gray-500" style={{ marginLeft: '-0.5rem' }}></div>

              <Link
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(href);
                }}
                className={`block pl-3 ${
                  isActive
                    ? "text-[#00FFFF] font-semibold"
                    : "text-[#9CA3AF] hover:text-[#00CCCC]"
                }`}
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
              {/* TREE HORIZONTAL LINE FOR FOLDERS */}
              <div className="absolute left-0 top-3 w-2 h-px bg-gray-500" style={{ marginLeft: '-0.5rem' }}></div>

              <details open={isOpen}>
                <summary 
                  className="cursor-pointer font-medium text-gray-300 hover:text-[#00CCCC] pl-3"
                  onClick={(e) => {
                    e.preventDefault(); 
                    toggleFolder(folderFullPath);
                  }}
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

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCategory = useMemo(() => {
    const parts = pathname.split('/').filter(p => p.length > 0);
    const category = parts.length > 0 ? decodeURIComponent(parts[0]) : '';
    return category;
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
      
      const parts = decodeURIComponent(pathname)
        .split('/')
        .filter(Boolean);

      setOpenFolders((prev) => {
        const newSet = new Set(prev);
        let current = "";
        
        for (let i = 0; i < parts.length - 1; i++) {
          current += `/${parts[i]}`;
          if (!prev.has(current)) {
            newSet.add(current);
          }
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

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
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
      if (cat.category !== "intro" && cat.category !== "history") {
        allCats.add(cat.category);
      }
    });
    setOpenCategories(allCats);
  };

  const handleLanguageChange = () => {
    const newLang = language === 'ta' ? 'en' : 'ta';
    setLanguage(newLang);
    document.cookie = `language=${newLang}; path=/; max-age=31536000`;
    
    startTransition(() => {
      router.refresh();
    });
  };

  // Wrapper for navigation to show loading state
  const handleNavigation = (href: string) => {
    if (decodeURIComponent(pathname) === href) return;
    
    startTransition(() => {
      router.push(href);
    });
  };

  const allExpanded = openFolders.size === allFolderPaths.size && 
                      openCategories.size === data.filter(c => c.category !== "intro" && c.category !== "history").length;

  return (
    <div className="flex min-h-screen relative transition-colors" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
      {/* SIDEBAR */}
      <aside
        className={`transition-all duration-300 ease-in-out fixed top-0 left-0 h-full border-r border-gray-800 overflow-y-auto z-40
          ${open ? "w-80 p-4" : "w-0 p-0 overflow-hidden"}
        `}
        style={{ 
          background: '#121212', 
          borderRight: '1px solid #27272a'
        }}
      >
        {/* Close button */}
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="cursor-pointer absolute top-1/2 right-0 -translate-y-1/2 z-50 p-2 bg-gray-800 text-white rounded-l-md hover:bg-gray-700 transition-colors"
            title={mounted ? t('closeSidebar') : 'Close sidebar'}
            aria-label={mounted ? t('closeSidebar') : 'Close sidebar'}
          >
            ⟨
          </button>
        )}

        {open && (
          <>
            <div className="mb-6 space-y-4">
              <h1 className="text-5xl font-bold text-center" style={{ color: '#C4A484' }}>
                {language === 'ta' ? 'அன்பு' : 'Anbu'}
              </h1>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleLanguageChange}
                  disabled={isPending}
                  className="cursor-pointer text-sm px-3 py-2 bg-[#00ffff] hover:bg-[#00cccc] disabled:bg-[#00c0c0] disabled:cursor-not-allowed text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <span className = "" style={{ color: '#000000' }}>🌐</span>
                  <span className = "" style={{ color: '#000000' }}>{language === 'ta' ? 'English' : 'தமிழ்'}</span>
                </button>
                
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="cursor-pointer text-sm px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}

                </button>
              </div>

              <div className="my-4 h-px w-full bg-linear-to-r from-transparent via-gray-500 to-transparent" />

              <div className="flex items-end justify-between">
                <h2 className="text-2xl font-semibold" style={{ color: "#00FFFF" }}>
                  {language === 'ta' ? 'பொருளடக்கம்' : 'Contents'}
                </h2>

                <button
                  onClick={allExpanded ? collapseAll : expandAll}
                  className="cursor-pointer text-sm px-2 py-2 text-gray-300 hover:text-white underline-offset-7 hover:underline transition-colors"
                >
                  <span>
                    {allExpanded 
                      ? (language === 'ta' ? '▼ மூடு' : '▼ Collapse')
                      : (language === 'ta' ? '▶ விரி' : '▶ Expand')
                    }
                  </span>
                </button>
              </div>
            </div>
            
            <ul>
              {data.map((cat) => {
                const isIntro = cat.category === "intro";
                const isHistory = cat.category === "history";
                const categoryDisplayName = cat.displayName?.[initialLanguage] || cat.category;

                if (isIntro) {
                  const isActive = pathname === "/";
                  
                  return (
                    <li key="intro" className="mb-4">
                      <Link
                        href="/"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation("/");
                        }}
                        className={`block text-lg ${
                          isActive 
                            ? "text-[#C4A484] font-semibold" 
                            : "text-gray-300 hover:text-[#C4A488]"
                        }`}
                      >
                        <span>
                          {initialLanguage === 'ta' ? 'அறிமுகம்' : 'Introduction'}
                        </span>
                      </Link>
                    </li>
                  );
                }

                if (isHistory) {
                  const isActive = pathname === "/history";
                  
                  return (
                    <li key="history" className="mb-4">
                      <Link
                        href="/history"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation("/history");
                        }}
                        className={`block text-lg ${
                          isActive 
                            ? "text-[#C4A484] font-semibold" 
                            : "text-gray-300 hover:text-[#C4A488]"
                        }`}
                      >
                        <span suppressHydrationWarning>
                          {initialLanguage === 'ta' ? 'வரலாறு' : 'History'}
                        </span>
                      </Link>
                    </li>
                  );
                }

                const isCategoryOpen = openCategories.has(cat.category);
                
                return (
                  <li key={cat.category} className="mb-2">
                    <details open={isCategoryOpen}>
                      <summary 
                        className="cursor-pointer font-semibold text-gray-300 hover:text-[#00CCCC]"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleCategory(cat.category);
                        }}
                      >
                        <span>
                          {categoryDisplayName}
                        </span>
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
                      />
                    </details>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </aside>

      {/* Open Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="cursor-pointer fixed top-1/2 left-0 -translate-y-1/2 z-50 p-2 bg-gray-800 text-white rounded-r-md hover:bg-gray-700 transition-all duration-300"
          title={mounted ? t('openSidebar') : 'Open sidebar'}
          aria-label={mounted ? t('openSidebar') : 'Open sidebar'}
          suppressHydrationWarning
        >
          ⟩
        </button>
      )}

      {/* PARENT BOX - Fixed position, unaffected by sidebar */}
      <main
        className="fixed top-0 right-0 bottom-0 overflow-y-auto"
        style={{ 
          background: 'var(--bg-main)',
          left: open ? '320px' : '0px',
          transition: 'left 300ms ease-in-out'
        }}
      >
        {/* LOADER */}
        {isPending && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
              <p className="text-sm text-gray-400">
                {language === 'ta' ? 'இறங்குகிறது...' : 'Loading...'}
              </p>
            </div>
          </div>
        )}
        
        {/* CONTENT - Centered within parent box */}
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