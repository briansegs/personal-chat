import { ChatStatus, Model } from "@/app/types";
import React, { Dispatch, RefObject, SetStateAction } from "react";
import { MessageSubmitButton } from "./MessageSubmitButton";
import { ModelSelect } from "./ModelSelect";
import { StatusMessage } from "./StatusMessage";
import { Textarea } from "./ui/textarea";

type InputContainerProps = {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: ChatStatus;
  triggerSendMessage: (e: React.KeyboardEvent) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  model: Model;
  setModel: (model: Model) => void;
  stopGenerating: () => void;
  error: string | null;
};

export function InputContainer({
  handleSubmit,
  textareaRef,
  input,
  setInput,
  status,
  triggerSendMessage,
  model,
  setModel,
  stopGenerating,
}: InputContainerProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 border p-2 relative bg-card shadow"
    >
      {status === "streaming" && <StatusMessage />}

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => triggerSendMessage(e)}
        placeholder="Ask something..."
        rows={1}
        disabled={status === "streaming"}
        className="placeholder:text-primary/70"
      />

      <div className="flex items-center justify-between">
        <ModelSelect model={model} setModel={setModel} />

        <MessageSubmitButton status={status} stopGenerating={stopGenerating} />
      </div>
    </form>
  );
}
