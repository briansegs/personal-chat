import { Model } from "@/app/types";

const validModels: Model[] = ["phi3", "llama3.1", "qwen2.5-coder"];

export function isModel(value: string): value is Model {
  return validModels.includes(value as Model);
}
