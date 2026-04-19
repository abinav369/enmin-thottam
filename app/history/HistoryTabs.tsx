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
  const [historyModal, setHistoryModal] = useState<string[] | null>(null);

  const toTamilNumerals = (numStr: string) => {
    const map: Record<string, string> = {
      '0': '௦', '1': '௧', '2': '௨', '3': '௩', '4': '௪',
      '5': '௫', '6': '௬', '7': '௭', '8': '௮', '9': '௯',
    };
    return numStr.replace(/[0-9]/g, (d) => map[d]);
  };

  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const date = d.toISOString().slice(0, 10);
    const time = d.toTimeString().slice(0, 5);
    return `${date}, ${time}`;
  };

  const getRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;

    const diff = Date.now() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

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

  const formatCount = (n: number) =>
    language === 'ta' ? toTamilNumerals(n.toString()) : n.toString();

  const tabs = [
    { key: 'updated', label: language === 'ta' ? 'அண்மைப் புதுப்பிப்புகள்' : 'Recently updated' },
    { key: 'published', label: language === 'ta' ? 'பதிவேற்றிய நாள்' : 'Published on' },
  ] as const;

  const entries = tab === 'updated' ? updatedEntries : publishedEntries;

  return (
    <>
      {/* Tab bar */}
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

      {/* Entries */}
      <ul className="space-y-3 pl-0! ml-0!">
        {entries.map((entry) => {
          const displayDate = tab === 'updated'
            ? (entry.updateHistory?.[0] ?? '')
            : entry.publishedAt;
          const sortDate = tab === 'updated' ? entry.sortKey : entry.publishedSortKey;
          const relative = getRelativeTime(sortDate);
          const hasHistory = tab === 'updated' && entry.updateHistory && entry.updateHistory.length > 1;

          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="flex flex-col gap-1 group no-underline! border border-(--border) rounded-lg px-4 py-3 hover:border-[#00FFFF] transition-colors"
              >
                <span className="text-lg text-(--text-main)">
                  {entry.title}
                </span>
                <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-4">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`text-sm text-(--text-muted) ${hasHistory ? 'cursor-pointer underline decoration-dashed underline-offset-7 hover:text-(--text-main)' : ''}`}
                      onClick={hasHistory ? (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setHistoryModal(entry.updateHistory);
                      } : undefined}
                    >
                      {formatDisplayDate(displayDate)}
                    </span>
                    {hasHistory && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: 'var(--border)', color: 'var(--text-muted)' }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHistoryModal(entry.updateHistory);
                        }}
                      >
                        {formatCount(entry.updateHistory.length)}
                      </span>
                    )}
                  </span>
                  {relative && (
                    <span className="text-sm text-(--text-muted)">
                      {relative}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* History modal */}
      {historyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setHistoryModal(null)}
        >
          <div
            className="rounded-xl px-6 py-5 w-[86vw] md:w-auto md:min-w-80 md:max-w-lg shadow-xl"
            style={{ background: 'var(--bg-sidebar)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium" style={{ color: 'var(--text-muted)', fontSize: 'var(--content-size)' }}>
                {language === 'ta' ? 'புதுப்பிப்பு வரலாறு' : 'Update history'}
              </span>
              <button
                onClick={() => setHistoryModal(null)}
                className="cursor-pointer leading-none ml-6"
                style={{ color: 'var(--text-muted)', fontSize: 'var(--content-size)' }}
              >
                ✕
              </button>
            </div>
            <ul className="space-y-3">
              {historyModal.map((date, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3"
                  style={{ color: i === 0 ? 'var(--text-main)' : 'var(--text-muted)', fontSize: 'var(--content-size)' }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: i === 0 ? '#00FFFF' : 'var(--border)' }}
                  />
                  {formatDisplayDate(date)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}