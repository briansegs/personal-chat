import { MODELS, Model } from "@/app/types";

export function isModel(value: string): value is Model {
  return (MODELS as readonly string[]).includes(value);
}
