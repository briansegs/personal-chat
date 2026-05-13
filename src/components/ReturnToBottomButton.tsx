import { ArrowDownIcon } from "@phosphor-icons/react";

type ReturnToBottomButtonProps = {
  scrollToBottom: () => void;
};

export function ReturnToBottomButton({
  scrollToBottom,
}: ReturnToBottomButtonProps) {
  return (
    <button
      onClick={scrollToBottom}
      className="sticky cursor-pointer border hover:bg-slate-800 top-0 mx-auto border-black block bg-black text-white text-sm px-3 py-3 rounded-full shadow-md hover:opacity-90 backdrop-blur"
    >
      <ArrowDownIcon weight="fill" size={24} />
    </button>
  );
}
