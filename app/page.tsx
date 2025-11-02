// app/page.tsx
"use client";
import { useMemo, useState } from "react";
import { motion, type Variants, easeOut } from "framer-motion";
import {
  computeS_v2,
  computeL_v2,
  computeESE_v2,
  computeBPartsFromRaw,
  computeB_v2_fromParts,
  likertToRatio,
  type BRaw,
} from "@/lib/ese";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import Likert from "@/components/ui/Likert";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";

// 애니메이션 설정
const list: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOut } },
};

type QuizQ = { id: string; question: string; choices: string[]; answer_index?: number };

export default function Demo() {
  // ===== S (Likert 1~5, 쉬운 문항) =====
  const [S1, setS1] = useState(3);
  const [S2, setS2] = useState(3);
  const [S3, setS3] = useState(3);
  const [S4, setS4] = useState(3);

  // ===== B (토글: 직접 입력 ↔ Likert) =====
  const [useManualB1, setUseManualB1] = useState(true);
  const [useManualB2, setUseManualB2] = useState(true);
  const [useManualB3, setUseManualB3] = useState(true);

  const [B1Likert, setB1Likert] = useState(3);
  const [B2Likert, setB2Likert] = useState(3);
  const [B3Likert, setB3Likert] = useState(3);

  const [raw, setRaw] = useState<BRaw>({
    saveActual: 300000, saveGoal: 500000,
    spendActual: 350000, spendBudget: 400000,
    investWeeks: 2, habitDays: 4,
  });

  // ===== L (퀴즈 없으면 1~5 Likert, 있으면 퀴즈 점수 우선) =====
  const [LLikert, setLLikert] = useState(3);
  const [LQuizRatio, setLQuizRatio] = useState<number | null>(null); // 0~1

  // ===== 공통 =====
  const [week, setWeek] = useState(1);
  const [coach, setCoach] = useState("");

  const [quiz, setQuiz] = useState<QuizQ[]>([]);
  const [ans, setAns] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; feedback: string } | null>(null);

  // ===== 계산 =====
  const S = useMemo(() => computeS_v2({ S1, S2, S3, S4 }), [S1, S2, S3, S4]);

  const partsFromRaw = useMemo(() => computeBPartsFromRaw(raw), [raw]);
  const B1Part = useManualB1 ? partsFromRaw.B1 : likertToRatio(B1Likert);
  const B2Part = useManualB2 ? partsFromRaw.B2 : likertToRatio(B2Likert);
  const B3Part = useManualB3 ? partsFromRaw.B3 : likertToRatio(B3Likert);
  const B4Part = partsFromRaw.B4;

  const B = useMemo(
    () => computeB_v2_fromParts({ B1: B1Part, B2: B2Part, B3: B3Part, B4: B4Part }),
    [B1Part, B2Part, B3Part, B4Part]
  );

  const LRatio = LQuizRatio != null ? LQuizRatio : likertToRatio(LLikert);
  const L = useMemo(() => computeL_v2(LRatio), [LRatio]);

  const ESE = useMemo(() => computeESE_v2(S, B, L), [S, B, L]);

  // ===== 히스토리(차트) =====
  const [history, setHistory] = useState<{ week: number; S: number; B: number; L: number; ESE: number }[]>([]);
  const pushHistory = () => {
    setHistory(prev => {
      const next = prev.filter(x => x.week !== week).concat([{ week, S, B, L, ESE }]);
      return next.sort((a,b)=>a.week-b.week);
    });
  };

  // ===== 액션 =====
  async function genCoach() {
    const r = await fetch("/api/feedback", {
      method: "POST", body: JSON.stringify({ week, s: S, b: B, l: L, ese: ESE })
    });
    const j = await r.json();
    setCoach(j.text || "");
  }

  async function startQuiz() {
    const r = await fetch("/api/quiz/start", { method: "POST" });
    const j = await r.json();
    setQuiz(j.questions || []);
    setAns(Array((j.questions || []).length).fill(-1));
    setQuizResult(null);
  }

  async function gradeQuiz() {
    const r = await fetch("/api/quiz/grade", {
      method: "POST", body: JSON.stringify({ questions: quiz, answers: ans })
    });
    const j = await r.json();
    setQuizResult(j);
    if (typeof j.score === "number") setLQuizRatio(j.score / 100); // 0~1
  }

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="flex flex-col gap-8">
      {/* S */}
      <motion.div variants={item}>
        <Card
          title="🧠 S. Self-Belief (자기효능감) — 1~5 클릭"
          footer={<small className="text-zinc-400">S = ((S1+S2+S3+S4)/4) × 20</small>}
        >
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">S1 소비통제 자신감</div>
              <p className="text-xs opacity-70 mb-2">“요즘은 꼭 필요한 데에만 돈을 쓰려고 노력하고 있다.”</p>
              <Likert value={S1} onChange={setS1} />
            </div>
            <div>
              <div className="text-sm font-medium">S2 저축의 의미 인식</div>
              <p className="text-xs opacity-70 mb-2">“저축을 하면 마음이 든든하고, 미래가 조금 더 편해질 것 같다.”</p>
              <Likert value={S2} onChange={setS2} />
            </div>
            <div>
              <div className="text-sm font-medium">S3 투자 불안 조절력</div>
              <p className="text-xs opacity-70 mb-2">“돈을 굴리거나 재테크를 할 때, 불안해도 ‘잘 해볼 수 있다’는 마음이 든다.”</p>
              <Likert value={S3} onChange={setS3} />
            </div>
            <div>
              <div className="text-sm font-medium">S4 경제적 목표의식</div>
              <p className="text-xs opacity-70 mb-2">“앞으로 돈을 어떻게 쓸지, 대략적인 계획이나 목표가 있다.”</p>
              <Likert value={S4} onChange={setS4} />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* B */}
      <motion.div variants={item}>
        <Card
          title="💪 B. Behavior (행동 성취율)"
          footer={<small className="text-zinc-400">B = (B1×0.4 + B2×0.3 + B3×0.2 + B4×0.1) × 100</small>}
        >
          <div className="space-y-5">
            {/* B1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">B1 저축 실천율</div>
                  <p className="text-xs opacity-70">“이번 달 목표한 만큼 저축했다.”</p>
                </div>
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={useManualB1} onChange={()=>setUseManualB1(v=>!v)} />
                  직접 입력
                </label>
              </div>
              {useManualB1 ? (
                <Field label="실제 저축 / 목표 저축">
                  <input type="number" className="input w-32" value={raw.saveActual}
                    onChange={(e)=>setRaw({...raw, saveActual:Number(e.target.value)||0})}/>
                  <span className="opacity-60">/</span>
                  <input type="number" className="input w-32" value={raw.saveGoal}
                    onChange={(e)=>setRaw({...raw, saveGoal:Number(e.target.value)||0})}/>
                  <span className="w-12 text-right tabular-nums">
                    {Math.round((computeBPartsFromRaw(raw).B1)*100)}%
                  </span>
                </Field>
              ) : (
                <Likert value={B1Likert} onChange={setB1Likert} />
              )}
            </div>

            {/* B2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">B2 소비 목표 달성률</div>
                  <p className="text-xs opacity-70">“이번 달엔 계획했던 예산 안에서 잘 썼다.”</p>
                </div>
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={useManualB2} onChange={()=>setUseManualB2(v=>!v)} />
                  직접 입력
                </label>
              </div>
              {useManualB2 ? (
                <Field label="목표 지출 / 실제 지출">
                  <input type="number" className="input w-32" value={raw.spendBudget}
                    onChange={(e)=>setRaw({...raw, spendBudget:Number(e.target.value)||0})}/>
                  <span className="opacity-60">/</span>
                  <input type="number" className="input w-32" value={raw.spendActual}
                    onChange={(e)=>setRaw({...raw, spendActual:Number(e.target.value)||0})}/>
                  <span className="w-12 text-right tabular-nums">
                    {Math.round((computeBPartsFromRaw(raw).B2)*100)}%
                  </span>
                </Field>
              ) : (
                <Likert value={B2Likert} onChange={setB2Likert} />
              )}
            </div>

            {/* B3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">B3 투자 지속성</div>
                  <p className="text-xs opacity-70">“최근 몇 달 동안 꾸준히 같은 방식으로 돈을 관리하거나 투자하고 있다.”</p>
                </div>
                <label className="text-xs flex items-center gap-2">
                  <input type="checkbox" checked={useManualB3} onChange={()=>setUseManualB3(v=>!v)} />
                  주수 입력
                </label>
              </div>
              {useManualB3 ? (
                <Field label="지난 4주 중 유지 주수 (0~4)">
                  <input type="number" min={0} max={4} className="input w-24" value={raw.investWeeks}
                    onChange={(e)=>setRaw({...raw, investWeeks:Number(e.target.value)||0})}/>
                  <span className="w-12 text-right tabular-nums">
                    {Math.round((computeBPartsFromRaw(raw).B3)*100)}%
                  </span>
                </Field>
              ) : (
                <Likert value={B3Likert} onChange={setB3Likert} />
              )}
            </div>

            {/* B4 */}
            <Field label="B4 습관 유지일수 — 기록/확인 일수 (0~7)">
              <input type="number" min={0} max={7} className="input w-24" value={raw.habitDays}
                onChange={(e)=>setRaw({...raw, habitDays:Number(e.target.value)||0})}/>
              <span className="w-12 text-right tabular-nums">
                {Math.round((computeBPartsFromRaw(raw).B4)*100)}%
              </span>
            </Field>
          </div>
        </Card>
      </motion.div>

      {/* L */}
      <motion.div variants={item}>
        <Card
          title="📚 L. 금융 이해도"
          footer={<small className="text-zinc-400">퀴즈 점수가 있으면 우선 적용, 없으면 1~5 자기평가 사용</small>}
        >
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium">L1 금융이해도 (1~5 자기평가)</div>
              <p className="text-xs opacity-70 mb-2">“돈을 굴리거나 은행상품을 고를 때, 기본적인 내용을 이해할 수 있다.”</p>
              <Likert value={LLikert} onChange={setLLikert} />
            </div>

            <div className="flex gap-2">
              <Button onClick={startQuiz}>월간 퀴즈 생성 (5문항)</Button>
              {quiz.length>0 && (
                <Button onClick={gradeQuiz} className="bg-zinc-900 text-white">
                  채점 & 오답 피드백
                </Button>
              )}
            </div>

            {quiz.length>0 && (
              <div className="space-y-4 rounded-xl border border-zinc-800 p-4 bg-white/5">
                {quiz.map((q, qi) => (
                  <div key={q.id}>
                    <p className="font-medium">Q{qi+1}. {q.question}</p>
                    <div className="mt-2 grid gap-2">
                      {q.choices.map((ch, ci) => (
                        <label key={ci} className="flex items-center gap-2">
                          <input
                            type="radio" name={`q${qi}`} checked={ans[qi]===ci}
                            onChange={()=> setAns(prev=>{ const n=[...prev]; n[qi]=ci; return n; })}
                          />
                          <span>{String.fromCharCode(65+ci)}. {ch}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {quizResult && (
              <div className="rounded-xl border border-zinc-800 p-4 space-y-2 bg-white/5">
                <p><b>퀴즈 점수:</b> {quizResult.score}</p>
                <p className="whitespace-pre-wrap text-sm leading-6">{quizResult.feedback}</p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* ESE & 코칭 */}
      <motion.div variants={item}>
        <Card
          title="📈 ESE 결과 & 코칭"
          footer={<small className="text-zinc-400">ESE = 0.5·S + 0.3·B + 0.2·L</small>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="stat">S <b>{S}</b></div>
              <div className="stat">B <b>{B}</b></div>
              <div className="stat">L <b>{L}</b></div>
              <div className="stat">ESE <b>{ESE}</b></div>
            </div>

            <Field label="주차">
              <input
                type="number" min={1} value={week}
                onChange={(e)=>setWeek(Number(e.target.value))}
                className="input w-24"
              />
            </Field>

            <div className="flex gap-2">
              <Button onClick={pushHistory}>기록 저장 (그래프 반영)</Button>
              <Button onClick={genCoach} className="bg-white text-black">AI 피드백 생성</Button>
            </div>

            {coach && (
              <div className="rounded-xl border border-zinc-800 p-4 text-sm leading-6 bg-white/5 whitespace-pre-wrap">
                {coach}
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Chart */}
      <motion.div variants={item}>
        <Card title="📊 주차별 ESE / S / B / L 추이">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <CartesianGrid strokeOpacity={0.15} />
                <XAxis dataKey="week" />
                <YAxis domain={[0,100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ESE" strokeWidth={2} />
                <Line type="monotone" dataKey="S" />
                <Line type="monotone" dataKey="B" />
                <Line type="monotone" dataKey="L" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
