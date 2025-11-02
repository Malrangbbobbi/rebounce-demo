// app/layout.tsx
import "../styles/globals.css";
import { Noto_Sans_KR } from "next/font/google";

const noto = Noto_Sans_KR({ subsets: ["latin"], weight: ["400","500","700"] });

export const metadata = {
  title: "Re:Bounce",
  description: "AI 경제 자존감 코치",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${noto.className} min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-20%,rgba(120,120,120,0.12),transparent),linear-gradient(to_bottom,#0b0b0b,#000)] text-zinc-100`}
      >
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          {/* 헤더: 로고 중앙 & 크게 */}
          <header className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-14 w-14 rounded-3xl bg-white/95 flex items-center justify-center shadow-sm">
                <span className="text-black font-bold text-xl">R</span>
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Re:Bounce</h1>
                <p className="text-xs text-zinc-400">AI 경제 자존감 코치 · DB-less Demo</p>
              </div>
            </div>
          </header>

          {/* 본문: 세로형 + 더 넓은 폭 */}
          <main className="mt-8 flex flex-col gap-8 max-w-4xl mx-auto">
            {children}
          </main>

          <footer className="mt-14 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} Re:Bounce
          </footer>
        </div>
      </body>
    </html>
  );
}
