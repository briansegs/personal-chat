import { Model } from "@/app/types";
import { isModel } from "@/util/isModel";
import { Dispatch, SetStateAction } from "react";

type ModelSelectProps = {
  model: Model;
  setModel: Dispatch<SetStateAction<Model>>;
};

const modelOptions = [
  {
    value: "phi3",
    name: "phi3 | basic / fast",
  },
  {
    value: "llama3.1",
    name: "llama3.1 | smarter / slower",
  },
  {
    value: "qwen2.5-coder",
    name: "qwen2.5-coder | coding",
  },
];

export function ModelSelect({ setModel, model }: ModelSelectProps) {
  return (
    <select
      name="model"
      id="model-select"
      value={model}
      className="cursor-pointer"
      onChange={(e) => {
        const value = e.target.value;

        if (isModel(value)) {
          setModel(value);
        }
      }}
    >
      {modelOptions.map(({ value, name }) => (
        <option key={value} value={value}>
          {name}
        </option>
      ))}
    </select>
  );
}
