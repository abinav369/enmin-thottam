type QuoteBoxProps = {
  children: React.ReactNode
  author?: string
}

export default function QuoteBox({ children, author }: QuoteBoxProps) {
  return (
    <div className="my-6 border-l-4 border-blue-500 bg-[rgba(110,118,129,0.1)] p-4 rounded-md">
      <p className="italic leading-relaxed">{children}</p>
      {author && (
        <p className="mt-3 text-sm text-gray-400 text-right">
          — {author}
        </p>
      )}
    </div>
  )
}