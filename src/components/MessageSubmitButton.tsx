import { Button } from "./ui/button";

type MessageSubmitButtonProps = {
  loading: boolean;
  stopGenerating: () => void;
};

export function MessageSubmitButton({
  loading,
  stopGenerating,
}: MessageSubmitButtonProps) {
  return (
    <Button
      type={loading ? "button" : "submit"}
      onClick={loading ? stopGenerating : undefined}
    >
      {loading ? "Stop" : "Send"}
    </Button>
  );
}
