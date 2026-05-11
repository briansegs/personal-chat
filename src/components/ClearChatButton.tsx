type ClearChatButtonProps = {
  clearChat: () => void;
};

export function ClearChatButton({ clearChat }: ClearChatButtonProps) {
  return (
    <button
      onClick={() => clearChat}
      className="py-2 px-4 mx-auto mb-2 rounded-lg w-fit text-sm text-red-500 cursor-pointer hover:bg-slate-100"
    >
      Clear Chat
    </button>
  );
}
