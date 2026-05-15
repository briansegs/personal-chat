import { ChatStatus } from "@/app/types";

type StatusMessageProps = {
  status: ChatStatus;
  error: string | null;
};

export function StatusMessage({ error, status }: StatusMessageProps) {
  return (
    <div className="px-3 border shadow absolute -top-8 left-1/2 -translate-x-1/2 text-primary bg-background">
      {status === "error" && <span>{error ?? "Something went wrong."}</span>}
      {status === "streaming" && (
        <div className="flex items-baseline gap-1">
          <span>Generating response</span>
          <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce" />
          <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.15s]" />
          <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.3s]" />
        </div>
      )}
    </div>
  );
}
