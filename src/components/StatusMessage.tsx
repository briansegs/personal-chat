export function StatusMessage() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="px-3 font-light border flex gap-1 items-baseline shadow absolute -top-8 left-1/2 -translate-x-1/2 text-primary bg-card"
    >
      <span>Generating response</span>
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-slate-300 animate-bounce"
      />
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.15s]"
      />
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.3s]"
      />
    </div>
  );
}
