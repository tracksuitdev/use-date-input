import { ChangeEventHandler, KeyboardEventHandler, useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import IMask from "imask";
import { useIMask } from "use-imask";

type MaskedDateOptions = IMask.MaskedDateOptions;

type UseDateInputProps = {
  value?: Date;
  dateFormat: string;
  onComplete?: (value?: Date) => void;
  maskBlocks: MaskedDateOptions["blocks"];
};

function parseIncomplete(value: string, dateFormat: string) {
  return parse(value, dateFormat.slice(0, value.length), new Date());
}

function createMaskOptions(blocks: MaskedDateOptions["blocks"], pattern: string): MaskedDateOptions {
  return {
    mask: Date,
    blocks,
    pattern,
    format: value => format(value, pattern),
    parse: value => parseIncomplete(value, pattern),
  };
}

export function useDateInput({ value, dateFormat, onComplete, maskBlocks }: UseDateInputProps) {
  const [inputValue, setInputValue] = useState(value ? format(value, dateFormat) : "");
  const options = useMemo(() => createMaskOptions(maskBlocks, dateFormat), [maskBlocks, dateFormat]);
  const { ref, maskRef } = useIMask<MaskedDateOptions>(options, {
    onComplete: (_, mask) => onComplete?.(mask?.typedValue),
  });

  useEffect(() => {
    if (value) {
      const stringValue = format(value, dateFormat);
      setInputValue(stringValue);
      if (maskRef?.current) {
        maskRef.current.value = stringValue;
      }
    }
  }, [value, dateFormat, maskRef]);

  const onKeyPress: KeyboardEventHandler = event => {
    if (event.key === "Enter") {
      const date = parseIncomplete(inputValue, dateFormat);
      if (date.toString() === "Invalid Date") {
        setInputValue(format(date, dateFormat));
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const resetValueOnChange: ChangeEventHandler<HTMLInputElement> = event => {
    if (!event.target.value) {
      onComplete?.();
    }
  };

  return { ref, inputValue, setInputValue, onKeyPress, resetValueOnChange };
}
