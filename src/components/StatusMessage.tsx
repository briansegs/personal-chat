export function StatusMessage() {
  return (
    <div className="px-3 items-baseline flex gap-1 border rounded-lg absolute -top-8 left-1/2 -translate-x-1/2 text-slate-400 border-slate-300">
      <span>Generating response</span>
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce" />
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.15s]" />
      <span className="h-1 w-1 rounded-full bg-slate-300 animate-bounce [animation-delay:0.3s]" />
    </div>
  );
}
