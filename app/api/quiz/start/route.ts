import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST() {
  const system = `너는 금융교육 퀴즈 출제자다. 5문항, 보기 4개(정답 1개). 주제: 기초 금융 상식(예금자보호, 복리, 분산투자, 물가/실질수익, 위험/수익 등). 한국어. JSON만 반환.`;
  const user = `다음 스키마로만 반환:
{
  "questions": [
    {"id":"string","question":"string","choices":["A","B","C","D"],"answer_index":0}
  ]
}`;

  const c = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.4,
    max_tokens: 700,
  });

  const raw = c?.choices?.[0]?.message?.content || '{"questions":[]}';
  const data = JSON.parse(raw);
  // 정답 인덱스는 프론트에 표시하지 않지만, 채점용으로 그대로 내려보냄(데모 단계)
  return NextResponse.json(data);
}