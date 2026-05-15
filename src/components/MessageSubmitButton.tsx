import { ChatStatus } from "@/app/types";
import { Button } from "./ui/button";

type MessageSubmitButtonProps = {
  status: ChatStatus;
  stopGenerating: () => void;
};

export function MessageSubmitButton({
  status,
  stopGenerating,
}: MessageSubmitButtonProps) {
  return (
    <Button
      type={status === "streaming" ? "button" : "submit"}
      onClick={status === "streaming" ? stopGenerating : undefined}
    >
      {status === "streaming" ? "Stop" : "Send"}
    </Button>
  );
}
