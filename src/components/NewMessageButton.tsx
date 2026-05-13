type NewMessageButtonProps = {
  scrollToBottom: () => void;
};

export function NewMessageButton({ scrollToBottom }: NewMessageButtonProps) {
  return (
    <button
      onClick={scrollToBottom}
      className="sticky cursor-pointer hover:bg-slate-800 top-2 mx-auto block bg-black text-white text-sm px-4 py-2 rounded-full shadow-md hover:opacity-90 backdrop-blur"
    >
      New messages ↓
    </button>
  );
}
