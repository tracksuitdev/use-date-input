import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
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
  const options = { weekStartsOn };
  const start = startOfWeek(currentDate, options);
  const end = subDays(addWeeks(start, WEEKS_IN_CALENDAR_MONTH), 1);
  return eachDayOfInterval({ start, end }).map(date => ({ date, inMonth: isSameMonth(date, currentDate) }));
}

export function useCalendar({ value, startDate, minDate, maxDate, weekStartsOn = 0 }: UseCalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState<Date>(
    startOfMonth(startOfDay(value ?? startDate ?? minDate ?? maxDate ?? new Date()))
  );

  const serializedValue = useMemo(() => value?.toDateString(), [value]);

  const isSelected = useCallback((date: Date) => date.toDateString() === currentDate.toDateString(), [currentDate]);

  useEffect(() => {
    if (serializedValue) {
      setCurrentDate(startOfMonth(startOfDay(new Date(serializedValue))));
    }
  }, [serializedValue]);

  const days = useMemo(() => getCalendarDays(currentDate, weekStartsOn), [currentDate, weekStartsOn]);

  const months = useMemo(() => eachMonthOfInterval({ start: startOfYear(currentDate), end: endOfYear(currentDate) }), [
    currentDate,
  ]);

  const years = useMemo(() => {
    if (maxDate && minDate) {
      return eachYearOfInterval({ start: minDate, end: maxDate });
    }
    return undefined;
  }, [maxDate, minDate]);

  const nextYear = useCallback(() => {
    setCurrentDate(currentDate => addYears(currentDate, 1));
  }, []);

  const previousYear = useCallback(() => {
    setCurrentDate(currentDate => subYears(currentDate, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setCurrentDate(currentDate => addMonths(currentDate, 1));
  }, []);

  const previousMonth = useCallback(() => {
    setCurrentDate(currentDate => subMonths(currentDate, 1));
  }, []);

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
  return { ...useCalendar(props), ...useDropdown(props) };
}
