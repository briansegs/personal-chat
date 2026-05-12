type MessageSubmitButtonProps = {
  loading: boolean;
};

export function MessageSubmitButton({ loading }: MessageSubmitButtonProps) {
  return (
    <button
      type="submit"
      className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black"
      disabled={loading}
    >
      {loading ? "Thinking..." : "Send"}
    </button>
  );
}
