import { getAllContentMeta } from "@/lib/getContent";
import { cookies } from "next/headers";
import HistoryTabs from "./HistoryTabs";

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const language = (cookieStore.get('language')?.value as 'ta' | 'en') || 'ta';

  const entries = await getAllContentMeta(language);
  const aumAmma = 'ஓம் அம்மா';

  const updatedEntries = [...entries].sort(
    (a, b) => new Date(b.sortKey).getTime() - new Date(a.sortKey).getTime()
  );

  const publishedEntries = [...entries].sort(
    (a, b) => new Date(b.publishedSortKey).getTime() - new Date(a.publishedSortKey).getTime()
  );

  return (
    <article className="prose prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-gray-100 prose-code:text-gray-300 max-w-none">
      <p className="text-center text-base text-emerald-400 tracking-wide font-bold italic opacity-80 mt-3! md:mt-0! lg:mt-0! mb-10!">
        {aumAmma}
      </p>
      <HistoryTabs
        updatedEntries={updatedEntries}
        publishedEntries={publishedEntries}
        language={language}
      />
    </article>
  );
}