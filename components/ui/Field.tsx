// components/ui/Field.tsx
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-1/2 text-sm text-zinc-300">{label}</span>
      <div className="flex-1 flex items-center gap-2">{children}</div>
    </label>
  );
}
