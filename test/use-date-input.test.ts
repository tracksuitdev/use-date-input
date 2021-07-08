import { renderHook, act } from "@testing-library/react-hooks";
import { ChangeEvent, KeyboardEvent } from "react";
import { useDateInput, UseDateInputProps } from "../src/use-date-input";

describe("useDateInput tests", () => {
  const useTestingTarget = (props?: Partial<UseDateInputProps>) => useDateInput({ dateFormat: "yyyy-MM-dd", ...props });
  test("input value changes when value prop changes", () => {
    let value = new Date("2000-01-01");
    const { rerender, result } = renderHook(() => useTestingTarget({ value }));

    expect(result.current.inputValue).toEqual("2000-01-01");

    value = new Date("2001-01-01");
    rerender();

    expect(result.current.inputValue).toEqual("2001-01-01");
  });

  test("input value changes when dateFormat changes", () => {
    let dateFormat = "dd.MM.yyyy.";
    const { rerender, result } = renderHook(() => useTestingTarget({ dateFormat, value: new Date("2000-01-01") }));

    expect(result.current.inputValue).toEqual("01.01.2000.");

    dateFormat = "yyyy-MM-dd";
    rerender();

    expect(result.current.inputValue).toEqual("2000-01-01");
  });

  test("parse partial date on enter", () => {
    const { result } = renderHook(() => useTestingTarget());
    act(() => {
      result.current.setInputValue("2000");
    });

    act(() => {
      result.current.onKeyPress(({
        key: "Enter",
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
      } as unknown) as KeyboardEvent<HTMLInputElement>);
    });

    expect(result.current.inputValue).toEqual("2000-01-01");
  });

  test("resetValueOnChange calls onComplete without value", () => {
    const onComplete = jest.fn();
    const { result } = renderHook(() => useTestingTarget({ onComplete }));

    act(() => {
      result.current.resetValueOnDelete(({ target: { value: "" } } as unknown) as ChangeEvent<HTMLInputElement>);
    });

    expect(onComplete).toHaveBeenCalled();
  });
});
