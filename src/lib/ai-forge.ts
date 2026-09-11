import { createServerFn } from "@tanstack/react-start";

const SYSTEM = `You help an adult start a stalled task. You use Temporal Motivation Theory and Tiny Habits.

Rules:
- Never shame, scold, or call the person lazy.
- Never give sexual, medical, or clinical advice.
- Output JSON only: {"firstAction": string, "reward": string, "note": string}
- firstAction is a physical 2-minute-or-less next move (e.g. "open the doc and write one ugly sentence").
- reward is a tiny treat they get the moment those two minutes end.
- note is one calm sentence naming why this slice raises expectancy or cuts delay.
- Keep each field under 120 characters.`;

export const sliceTask = createServerFn({ method: "POST" })
  .validator((input: { task: string; aversion: string }) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "Coach is unavailable right now." };

    const task = data.task.trim().slice(0, 280);
    const aversion = data.aversion.trim().slice(0, 40);
    if (!task) return { ok: false as const, error: "Name the task first." };

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 220,
        temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Task: ${task}\nAversion tag: ${aversion || "unspecified"}`,
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false as const, error: "Coach could not answer. Write your own 2-minute slice." };

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = body.choices?.[0]?.message?.content ?? "";
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart < 0 || jsonEnd <= jsonStart) {
      return { ok: false as const, error: "Could not parse a slice. Write your own." };
    }
    try {
      const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
        firstAction?: string;
        reward?: string;
        note?: string;
      };
      return {
        ok: true as const,
        firstAction: String(parsed.firstAction ?? "").slice(0, 160),
        reward: String(parsed.reward ?? "").slice(0, 160),
        note: String(parsed.note ?? "").slice(0, 200),
      };
    } catch {
      return { ok: false as const, error: "Could not parse a slice. Write your own." };
    }
  });
