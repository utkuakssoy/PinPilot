import { CheckCircle2, CircleAlert } from "lucide-react";
import { AiCredentialsForm } from "@/components/AiCredentialsForm";
import { getAiStatus } from "@/services/ai";

export function SettingsPanel() {
  const aiStatus = getAiStatus();
  const rows = [
    { label: "Gemini API", configured: aiStatus.geminiConfigured },
    { label: "ChatGPT / OpenAI API", configured: aiStatus.openaiConfigured }
  ];

  return (
    <section className="max-w-3xl rounded-lg border border-neutral-900 bg-[#050505] p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-100">AI settings</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Etsy icin API gerekmez; magaza linkini ana ekranda giriyorsun. AI icin Gemini veya ChatGPT API yeterli.
      </p>
      <div className="mt-4 divide-y divide-neutral-900">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-neutral-300">{row.label}</span>
            <span className={row.configured ? "inline-flex items-center gap-2 text-sm font-medium text-emerald-400" : "inline-flex items-center gap-2 text-sm font-medium text-amber-400"}>
              {row.configured ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
              {row.configured ? "Hazir" : "Eklenmedi"}
            </span>
          </div>
        ))}
      </div>
      <AiCredentialsForm />
    </section>
  );
}
