import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { questions, answers } = await req.json();
  const total = questions.length || 0;

  let correct = 0;
  const wrong: Array<{
    q: string;
    choices: string[];
    user: number;
    correct: number;
  }> = [];

  questions.forEach((q: any, i: number) => {
    if (answers[i] === q.answer_index) correct++;
    else wrong.push({ q: q.question, choices: q.choices, user: answers[i], correct: q.answer_index });
  });

  const score = Math.round((correct / Math.max(1, total)) * 100);

  // 오답 분석 피드백 (시니어 친화적, 3문단 이내)
  const explainPrompt = `다음 오답 목록을 바탕으로 핵심 개념을 쉽게 설명하고, 왜 정답이 맞는지 알려주세요. 한국어, 3문단 이내, 시니어 친화적 톤.
오답 목록(JSON): ${JSON.stringify(wrong)}`;

  const c = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "너는 금융교육 코치다. 친절하고 간결하게 설명한다." },
      { role: "user", content: explainPrompt },
    ],
    temperature: 0.5,
    max_tokens: 400,
  });

  const feedback = c.choices[0]?.message?.content || "훌륭합니다. 다음 회차에서 더 도전해요.";
  return NextResponse.json({ score, feedback });
}