import { Button } from "./ui/button";

type ClearChatButtonProps = {
  handleClearChat: () => void;
};

export function ClearChatButton({ handleClearChat }: ClearChatButtonProps) {
  return (
    <Button type="button" onClick={handleClearChat} variant="destructive">
      Clear Chat
    </Button>
  );
}
