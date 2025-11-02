// components/ui/Button.tsx
export default function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`h-10 rounded-xl px-4 text-sm font-medium bg-white text-black hover:bg-zinc-100 active:scale-[.99] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
