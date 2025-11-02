// app/api/feedback/route.ts
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { week, s, b, l, ese } = await req.json();

    const prompt = `다음 데이터를 바탕으로 시니어 친화적 주간 피드백을 3문단(칭찬/요약/다음 목표), 300~500자로 작성하세요.
- 주차: ${week}
- S/B/L/ESE: ${s}/${b}/${l}/${ese}
- 톤: 격려 60%, 구체 제안 40%
- 문체: 따뜻하고 존중하는 어투`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "당신은 시니어 친화적 금융 코치입니다." },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content || "좋은 한 주였습니다!";
    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
