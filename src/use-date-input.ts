import {
  ChangeEventHandler,
  Dispatch,
  KeyboardEventHandler,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { format, parse } from "date-fns";
import IMask from "imask";
import { useIMask } from "use-imask";

type MaskedDateOptions = IMask.MaskedDateOptions;

export type UseDateInputProps = {
  /**
   * Date value of input
   */
  value?: Date;
  /**
   * date-fns date format, see {@link https://date-fns.org/v2.22.1/docs/format}
   */
  dateFormat: string;
  /**
   * This will execute when input satisfies given format (mask), usually this function should be used to update date
   * value
   */
  onComplete?: (value?: Date) => void;
  /**
   * Blocks defining each date part, see {@link https://imask.js.org/guide.html#masked-date} for more info
   */
  maskBlocks?: MaskedDateOptions["blocks"];
};

export type UseDateInput = {
  /**
   * Input element ref
   */
  ref: RefObject<HTMLInputElement>;
  /**
   * Value of input element
   */
  inputValue: string;
  /**
   * Sets inputValue, note that you don't need to set input value on input element change, this is done internally by
   * using IMask's accept event
   */
  setInputValue: Dispatch<SetStateAction<string>>;
  /**
   * Apply to input element if you wish to autocomplete date when user presses enter key. Parsing is done using dateFns
   * parse with dateFormat truncated to the length of current inputValue and using current date as reference.
   *
   * For example if today is 07/08/2021 and input value is 2, on enter press, input value will become 02/08/2021
   */
  onKeyPress: KeyboardEventHandler;
  /**
   * Will call onComplete with undefined value if e.target.value is falsy. Use it to reset value when user deletes the
   * input.
   */
  resetValueOnDelete: ChangeEventHandler<HTMLInputElement>;
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

/**
 * Hook that manages state of masked date input.
 *
 * Uses IMask for input masking and date-fns for date formatting and parsing.
 */
export function useDateInput({ value, dateFormat, onComplete, maskBlocks }: UseDateInputProps): UseDateInput {
  const [inputValue, setInputValue] = useState(value ? format(value, dateFormat) : "");
  const options = useMemo(() => createMaskOptions(maskBlocks, dateFormat), [maskBlocks, dateFormat]);
  const [ref, maskRef] = useIMask<MaskedDateOptions>(options, {
    onComplete: (_, mask) => onComplete?.(mask?.typedValue),
    onAccept: (e, mask) => (e ? setInputValue(e.target.value) : setInputValue(mask?.value ?? "")),
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
      if (date.toString() !== "Invalid Date") {
        setInputValue(format(date, dateFormat));
      }
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const resetValueOnDelete: ChangeEventHandler<HTMLInputElement> = event => {
    if (!event.target.value) {
      onComplete?.();
    }
  };

  return { ref, inputValue, setInputValue, onKeyPress, resetValueOnDelete };
}
