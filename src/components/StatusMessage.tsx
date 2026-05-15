import { ChatStatus } from "@/app/types";

type StatusMessageProps = {
  status: ChatStatus;
  error: string | null;
};

export function StatusMessage({ error, status }: StatusMessageProps) {
  return (
    <div className="px-3 items-baseline flex gap-1 border shadow absolute -top-8 left-1/2 -translate-x-1/2 text-primary bg-background">
      {status === "streaming" && <span>Generating response</span>}
      {status === "error" && <span>{error}</span>}
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce" />
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.15s]" />
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.3s]" />
    </div>
  );
}
