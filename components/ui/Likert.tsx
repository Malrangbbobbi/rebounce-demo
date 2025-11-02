// components/ui/Likert.tsx
export default function Likert({
  value,
  onChange,
  labels = ["1", "2", "3", "4", "5"],
}: {
  value: number; // 1..5
  onChange: (v: number) => void;
  labels?: string[];
}) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((v) => {
        const active = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`h-9 w-9 rounded-lg text-sm font-medium border transition ${
              active
                ? "bg-white text-black border-white"
                : "bg-transparent text-zinc-200 border-zinc-700 hover:border-zinc-500"
            }`}
            aria-pressed={active}
          >
            {labels[v - 1] ?? String(v)}
          </button>
        );
      })}
    </div>
  );
}
