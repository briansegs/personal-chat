import { ArrowDownIcon } from "@phosphor-icons/react";
import { Button } from "./ui/button";

type ReturnToBottomButtonProps = {
  scrollToBottom: () => void;
};

export function ReturnToBottomButton({
  scrollToBottom,
}: ReturnToBottomButtonProps) {
  return (
    <Button
      type="button"
      aria-label="Scroll to latest messages"
      onClick={scrollToBottom}
      className="sticky top-0 left-1/2 -translate-x-1/2"
      size="icon"
    >
      <ArrowDownIcon weight="fill" size={24} />
    </Button>
  );
}
