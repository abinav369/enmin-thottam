import { Hourglass, CalendarDays, RefreshCw } from "lucide-react";

type BlogHeaderProps = {
  aumAmma: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;
  language: 'ta' | 'en';
};

export default function BlogHeader({
  aumAmma,
  title,
  publishedAt,
  updatedAt,
  readingTime,
  language,
}: BlogHeaderProps) {

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
  const isTamil = language === 'ta';

  const formatDateTime = (date: string) => {
  const d = new Date(date);

  const time = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);

  const day = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);

  return `${time}, ${day}`;
}; 

  const formatReadingTime = () => {
    if (!isTamil) return readingTime;

    const num = readingTime.match(/\d+/)?.[0] || '';
    const tamilNum = toTamilNumerals(num);

    return `${tamilNum} நிமிட படிப்பு`;
  };

  return ( 
    <header className="mb-8 border-b border-(--border) pb-4">
      {/* ஓம் அம்மா */}
      <p className="text-center text-base tracking-wide font-bold italic opacity-80 mt-0!">
        {aumAmma}
      </p>
      {/* Title */}
      <h1 className="text-3xl! md:text-4xl! lg:text-5xl! font-bold mt-10!">
        {title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center text-base text-(--text-muted)">
        
        <span className="flex items-center gap-1">
          <CalendarDays size={17} />
          {language === 'en' ? formatDateTime(publishedAt) : publishedAt}
        </span>
        

        <span className="mx-2">•</span>

        <span className="flex items-center gap-1">
          <Hourglass size={16} />
          {formatReadingTime()}
        </span>

        {updatedAt && (
        <>
          <span className="flex ml-auto items-center gap-1">
            <RefreshCw size={18} />
            {language === 'en' ? formatDateTime(updatedAt) : updatedAt}
          </span>
        </>
      )}

      </div>
    </header>
  );
}