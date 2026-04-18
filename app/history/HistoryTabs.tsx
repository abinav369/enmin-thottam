"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContentMeta } from "@/lib/getContent";

type Props = {
  updatedEntries: ContentMeta[];
  publishedEntries: ContentMeta[];
  language: 'ta' | 'en';
};

export default function HistoryTabs({ updatedEntries, publishedEntries, language }: Props) {
  const [tab, setTab] = useState<'updated' | 'published'>('updated');

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr; // Tamil string, return as-is
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(d).replace(',', ','); // gives "11/02/2026, 00:33"
  };
  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null; // return null if unparseable

    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

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

    if (language === 'ta') {
      if (seconds < 60) return `${toTamilNumerals(seconds.toString())} விநாடிகள் முன்பு`;
      if (minutes < 60) return `${toTamilNumerals(minutes.toString())} நிமிடங்கள் முன்பு`;
      if (hours < 24) return `${toTamilNumerals(hours.toString())} மணி நேரம் முன்பு`;
      if (days < 7) return `${toTamilNumerals(days.toString())} நாட்கள் முன்பு`;
      if (weeks < 4) return `${toTamilNumerals(weeks.toString())} வாரங்கள் முன்பு`;
      if (months < 12) return `${toTamilNumerals(months.toString())} மாதங்கள் முன்பு`;
      return `${toTamilNumerals(years.toString())} ஆண்டுகள் முன்பு`;
    }

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    if (weeks < 4) return `${weeks} weeks ago`;
    if (months < 12) return `${months} months ago`;
    return `${years} years ago`;
  };

  const tabs = [
    { key: 'updated', label: language === 'ta' ? 'அண்மைப் புதுப்பிப்புகள்' : 'Recently updated' },
    { key: 'published', label: language === 'ta' ? 'பதிவேற்றிய நாள்' : 'Published on' },
  ] as const;

  const entries = tab === 'updated' ? updatedEntries : publishedEntries;

  return (
    <>
      <div className="flex gap-4 border-b border-(--border) mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`pb-2 text-base md:text-lg font-medium transition-colors cursor-pointer ${
              tab === t.key
                ? 'border-b-2 border-[#C4A484] text-[#C4A484]'
                : 'text-(--text-muted) hover:text-(--text-main)'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3 pl-0! ml-0!">
        {entries.map((entry) => {
          const displayDate = tab === 'updated' ? entry.updatedAt : entry.publishedAt;
          const sortDate = tab === 'updated' ? entry.sortKey : entry.publishedSortKey;
          const relative = getRelativeTime(sortDate);

          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="flex flex-col gap-1 group no-underline! border border-(--border) rounded-lg px-4 py-3 hover:border-[#00FFFF] transition-colors"
              >
                {/* Line 1: title */}
                <span className="text-lg text-(--text-main)">
                  {entry.title}
                </span>
                {/* Line 2: date left, relative right */}
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <span className="text-sm text-(--text-muted)">
                    {formatDisplayDate(displayDate)}
                  </span>
                  {relative && (
                    <span className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-4">
                      {relative}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}