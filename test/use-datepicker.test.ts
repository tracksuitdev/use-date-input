import { renderHook, act } from "@testing-library/react-hooks";
import { useCalendar } from "../src";
import { format } from "date-fns";

const expectedDays =
  "Sun Jun 27 2021false Mon Jun 28 2021false Tue Jun 29 2021false Wed Jun 30 2021false Thu Jul 01 2021true Fri Jul 02 2021true Sat Jul 03 2021true Sun Jul 04 2021true Mon Jul 05 2021true Tue Jul 06 2021true Wed Jul 07 2021true Thu Jul 08 2021true Fri Jul 09 2021true Sat Jul 10 2021true Sun Jul 11 2021true Mon Jul 12 2021true Tue Jul 13 2021true Wed Jul 14 2021true Thu Jul 15 2021true Fri Jul 16 2021true Sat Jul 17 2021true Sun Jul 18 2021true Mon Jul 19 2021true Tue Jul 20 2021true Wed Jul 21 2021true Thu Jul 22 2021true Fri Jul 23 2021true Sat Jul 24 2021true Sun Jul 25 2021true Mon Jul 26 2021true Tue Jul 27 2021true Wed Jul 28 2021true Thu Jul 29 2021true Fri Jul 30 2021true Sat Jul 31 2021true Sun Aug 01 2021false Mon Aug 02 2021false Tue Aug 03 2021false Wed Aug 04 2021false Thu Aug 05 2021false Fri Aug 06 2021false Sat Aug 07 2021false";

describe("useCalendar tests", () => {
  test("currentDate changes when value changes", () => {
    let value = new Date("2000-01-01");
    const { result, rerender } = renderHook(() => useCalendar({ value }));

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("2000-01-01");
    value = new Date("2001-01-01");
    rerender();

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("2001-01-01");
  });

  test("days", () => {
    const value = new Date("2021-07-07");
    const { result } = renderHook(() => useCalendar({ value }));

    expect(result.current.days.map(d => d.date.toDateString() + d.inMonth).join(" ")).toEqual(expectedDays);
  });

  test("days array always contains 42 elements", () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.days).toHaveLength(42);

    act(() => {
      result.current.setCurrentDate(new Date("2000-01-01"));
    });

    expect(result.current.days).toHaveLength(42);
  });

  test("months", () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.months.map(d => format(d, "MM"))).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12",
    ]);
  });

  test("years", () => {
    const { result } = renderHook(() =>
      useCalendar({ minDate: new Date("2000-01-01"), maxDate: new Date("2002-01-01") })
    );

    expect(result.current.years?.map(d => format(d, "yyyy"))).toEqual(["2000", "2001", "2002"]);
  });

  test("years are undefined when maxDate or minDate is undefined", () => {
    const { result } = renderHook(() => useCalendar());

    expect(result.current.years).toBeUndefined();
  });

  test("next month", () => {
    const value = new Date("2000-01-01");
    const { result } = renderHook(() => useCalendar({ value }));

    act(() => {
      result.current.nextMonth();
    });

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("2000-02-01");
  });

  test("previous month", () => {
    const value = new Date("2000-01-01");
    const { result } = renderHook(() => useCalendar({ value }));

    act(() => {
      result.current.previousMonth();
    });

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("1999-12-01");
  });

  test("next year", () => {
    const value = new Date("2000-01-01");
    const { result } = renderHook(() => useCalendar({ value }));

    act(() => {
      result.current.nextYear();
    });

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("2001-01-01");
  });

  test("previous year", () => {
    const value = new Date("2000-01-01");
    const { result } = renderHook(() => useCalendar({ value }));

    act(() => {
      result.current.previousYear();
    });

    expect(format(result.current.currentDate, "yyyy-MM-dd")).toEqual("1999-01-01");
  });
});
