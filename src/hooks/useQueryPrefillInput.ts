import { useEffect, useState } from "react";

type Options = {
  initialQ: string;
};

export function useQueryPrefillInput({ initialQ }: Options) {
  const [input, setInput] = useState(initialQ);

  useEffect(() => {
    const normalized = initialQ.trim();
    if (!normalized) return;
    if (normalized !== input.trim()) {
      setInput(normalized);
    }
  }, [initialQ, input]);

  return {
    input,
    setInput,
    trimmed: input.trim(),
  };
}
