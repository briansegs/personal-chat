import { Model } from "@/app/types";
import React, { Dispatch, RefObject, SetStateAction } from "react";
import { MessageSubmitButton } from "./MessageSubmitButton";
import { ModelSelect } from "./ModelSelect";
import { StatusMessage } from "./StatusMessage";
import { Textarea } from "./ui/textarea";

type InputContainerProps = {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  loading: boolean;
  triggerSendMessage: (e: React.KeyboardEvent) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  model: Model;
  setModel: (model: Model) => void;
  stopGenerating: () => void;
};

export function InputContainer({
  handleSubmit,
  textareaRef,
  input,
  setInput,
  loading,
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
      {loading && <StatusMessage />}

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => triggerSendMessage(e)}
        placeholder="Ask something..."
        rows={1}
        disabled={loading}
      />

      <div className="flex items-center justify-between">
        <ModelSelect model={model} setModel={setModel} />

        <MessageSubmitButton
          loading={loading}
          stopGenerating={stopGenerating}
        />
      </div>
    </form>
  );
}
