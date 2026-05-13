type MessageSubmitButtonProps = {
  loading: boolean;
  stopGenerating: () => void;
};

export function MessageSubmitButton({
  loading,
  stopGenerating,
}: MessageSubmitButtonProps) {
  return (
    <button
      type={loading ? "button" : "submit"}
      onClick={loading ? stopGenerating : undefined}
      className="bg-black text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-black"
    >
      {loading ? "Stop" : "Send"}
    </button>
  );
}
