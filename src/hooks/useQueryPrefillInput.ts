import { useEffect, useState } from "react";

type Options = {
  initialQ: string;
};

export function useQueryPrefillInput({ initialQ }: Options) {
  const [input, setInput] = useState(initialQ);

  useEffect(() => {
    const normalized = initialQ.trim();
    if (!normalized) return;
    setInput(normalized);
  }, [initialQ]);

  return {
    input,
    setInput,
    trimmed: input.trim(),
  };
}
