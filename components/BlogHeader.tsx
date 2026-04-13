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

    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, 
    }).format(d);
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
      <p className="text-center text-base tracking-wide font-bold italic opacity-80 mt-3! md:mt-0! lg:mt-0!">
        {aumAmma}
      </p>
      {/* Title */}
      <h1 className="blog-title font-bold mt-10!">
        {title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-col gap-1.5 md:flex-row md:flex-wrap md:items-center text-sm md:text-base text-(--text-muted)">

        <span className="flex items-center gap-1">
          <CalendarDays size={14} className="md:hidden" />
          <CalendarDays size={17} className="hidden md:inline" />
          {language === 'en' ? formatDateTime(publishedAt) : publishedAt}
        </span>

        <span className="hidden md:inline mx-2">•</span>

        <span className="flex items-center gap-1">
          <Hourglass size={13} className="md:hidden" />
          <Hourglass size={16} className="hidden md:inline" />
          {formatReadingTime()}
        </span>

        {updatedAt && (
          <>
            <span className="flex items-center gap-1 md:ml-auto">
              <RefreshCw size={15} className="md:hidden" />
              <RefreshCw size={18} className="hidden md:inline" />
              {language === 'en' ? formatDateTime(updatedAt) : updatedAt}
            </span>
          </>
        )}
      </div>
    </header>
  );
}