// components/ui/Card.tsx
export default function Card({
  title,
  children,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-white/5 backdrop-blur-sm shadow-md">
      <div className="px-5 pt-4 pb-3 border-b border-zinc-800">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="p-5 space-y-4">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-zinc-800">{footer}</div>
      )}
    </section>
  );
}
