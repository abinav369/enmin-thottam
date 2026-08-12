export default function Center({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose flex justify-center gap-4 my-4">
      {children}
    </div>
  );
}