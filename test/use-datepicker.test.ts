import { renderHook } from "@testing-library/react-hooks";
import { useCalendar } from "../src";
import { format } from "date-fns";

describe("useDatepicker tests", () => {
  test("currentDate changes when value changes", () => {
    let value = new Date("2000-01-01");
    const { result, rerender } = renderHook(() => useCalendar({ value }));

    expect(format(result.current.currentDate, "yyyy-MN-dd")).toEqual("2000-01-01");
    value = new Date("2001-01-01");
    rerender();

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("2001-01-01");
  });
});
