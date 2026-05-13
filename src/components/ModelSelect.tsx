import { Model } from "@/app/types";
import { isModel } from "@/util/isModel";
import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type ModelSelectProps = {
  model: Model;
  setModel: Dispatch<SetStateAction<Model>>;
};

const generalOptions = [
  {
    value: "phi3",
    name: "phi3 | basic / fast",
  },
  {
    value: "llama3.1",
    name: "llama3.1 | smarter / slower",
  },
] as const;

const codingOptions = [
  {
    value: "qwen2.5-coder",
    name: "qwen2.5-coder | coding",
  },
] as const;

export function ModelSelect({ setModel, model }: ModelSelectProps) {
  return (
    <Select
      value={model}
      onValueChange={(value) => {
        if (isModel(value)) {
          setModel(value);
        }
      }}
    >
      <SelectTrigger className="pl-2 pr-4">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectGroup>
          <SelectLabel>General chat</SelectLabel>
          {generalOptions.map(({ value, name }) => (
            <SelectItem key={value} value={value}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>

        <SelectSeparator />

        <SelectGroup>
          <SelectLabel>Coding</SelectLabel>
          {codingOptions.map(({ value, name }) => (
            <SelectItem key={value} value={value}>
              {name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
