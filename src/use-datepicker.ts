import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  addYears,
  differenceInCalendarWeeks,
  eachDayOfInterval,
  eachYearOfInterval,
  endOfMonth,
  endOfWeek,
  endOfYear,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { useDropdown, UseDropdownProps } from "@tracksuitdev/use-dropdown";

export type UseCalendarProps = {
  value?: Date;
  startDate?: Date;
  minDate?: Date;
  maxDate?: Date;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export type UseDatepickerDay = {
  date: Date;
  inMonth: boolean;
};

const WEEKS_IN_CALENDAR_MONTH = 6;

function getCalendarDays(currentDate: Date, weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6): UseDatepickerDay[] {
  const start = startOfWeek(currentDate, { weekStartsOn });
  let end = endOfWeek(endOfMonth(currentDate), { weekStartsOn });
  const weeks = differenceInCalendarWeeks(end, start, { weekStartsOn });
  end = addWeeks(end, WEEKS_IN_CALENDAR_MONTH - weeks);
  return eachDayOfInterval({ start, end }).map(date => ({ date, inMonth: isSameMonth(date, currentDate) }));
}

export function useCalendar({ value, startDate, minDate, maxDate, weekStartsOn = 0 }: UseCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(
    startOfMonth(startOfDay(value ?? startDate ?? minDate ?? maxDate ?? new Date()))
  );

  useEffect(() => {
    if (value) {
      setCurrentDate(startOfMonth(startOfDay(value)));
    }
  }, [value]);

  const days = useMemo(() => getCalendarDays(currentDate, weekStartsOn), [currentDate, weekStartsOn]);

  const months = useMemo(() => eachDayOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) }), [
    currentDate,
  ]);

  const years = useMemo(() => {
    if (maxDate && minDate) {
      return eachYearOfInterval({ start: minDate, end: maxDate });
    }
    return undefined;
  }, [maxDate, minDate]);

  const isSelected = (date: Date) => date.toDateString() === currentDate.toDateString();

  const nextYear = useCallback(() => {
    setCurrentDate(addYears(currentDate, 1));
  }, [currentDate]);

  const previousYear = useCallback(() => {
    setCurrentDate(subYears(currentDate, 1));
  }, [currentDate]);

  const nextMonth = useCallback(() => {
    setCurrentDate(addMonths(currentDate, 1));
  }, [currentDate]);

  const previousMonth = useCallback(() => {
    setCurrentDate(subMonths(currentDate, 1));
  }, [currentDate]);

  return {
    currentDate,
    setCurrentDate,
    days,
    months,
    years,
    isSelected,
    nextYear,
    previousYear,
    nextMonth,
    previousMonth,
  };
}

type UseDatepickerProps = UseCalendarProps & UseDropdownProps;

export function useDatepicker(props: UseDatepickerProps) {
  const calendar = useCalendar(props);
  const dropdown = useDropdown(props);
  return { ...calendar, ...dropdown };
}
