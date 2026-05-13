import { Button } from "./ui/button";

type ClearChatButtonProps = {
  clearChat: () => void;
};

export function ClearChatButton({ clearChat }: ClearChatButtonProps) {
  return (
    <Button type="button" onClick={clearChat} variant="destructive">
      Clear Chat
    </Button>
  );
}
