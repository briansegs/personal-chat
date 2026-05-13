import { Model } from "@/app/types";
import React, { Dispatch, RefObject, SetStateAction } from "react";
import { MessageSubmitButton } from "./MessageSubmitButton";
import { ModelSelect } from "./ModelSelect";

type InputContainerProps = {
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  loading: boolean;
  triggerSendMessage: (e: React.KeyboardEvent) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  model: Model;
  setModel: Dispatch<SetStateAction<Model>>;
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
      className="flex flex-col gap-2 border rounded-lg p-2 relative"
    >
      {loading && (
        <div className="px-3 border rounded-lg absolute -top-8 left-1/2 -translate-x-1/2 text-slate-400 border-slate-300">
          Generating response...
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => triggerSendMessage(e)}
        className="w-full border p-4 rounded-lg resize-none"
        rows={1}
        placeholder="Ask something..."
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
