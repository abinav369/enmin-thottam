type ThamizhVerseProps = {
  children: React.ReactNode
}

export default function ThamizhVerse({ children }: ThamizhVerseProps) {
  return (
    <div className="my-8 text-center">
      <div className="text-xl font-semibold leading-loose tracking-wide">
        {children}
      </div>
      <div className="mt-4 h-px bg-gray-600 w-24 mx-auto opacity-40" />
    </div>
  )
}
