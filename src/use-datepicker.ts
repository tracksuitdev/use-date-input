import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import {
  addMonths,
  addWeeks,
  addYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfYear,
  isAfter,
  isBefore,
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
  /**
   * Datepicker value
   */
  value?: Date;
  /**
   * If provided calendar will start at the month of provided date
   */
  startDate?: Date;
  /**
   * Only dates after this date will be marked valid.
   *
   * For best performance memoize this date, this will prevent recalculation of calendar days on each render.
   */
  minDate?: Date;
  /**
   * Only dates before this date will be marked valid
   *
   * For best performance memoize this date, this will prevent recalculation of calendar days on each render.
   */
  maxDate?: Date;
  /**
   * Day that a week starts on. 0 - sunday, 1 - monday ...
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Validation function, dates that fail this test will be marked invalid
   *
   * For best performance memoize this function, this will prevent recalculation of calendar days on each render.
   */
  validate?: (date: Date) => boolean;
};

export type UseDatepickerDay = {
  /**
   * Represents calendar day
   */
  date: Date;
  /**
   * Indicates if this date is in currently viewed calendar month
   */
  inMonth: boolean;
  /**
   * If true this date can be selected according to provided min and max date and validate function
   */
  isValid: boolean;
};

const WEEKS_IN_CALENDAR_MONTH = 6;

type GetCalendarDayProps = {
  focusedDate: Date;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  minDate?: Date;
  maxDate?: Date;
  validate?: (date: Date) => boolean;
};

function getCalendarDays({
  focusedDate,
  weekStartsOn,
  minDate,
  maxDate,
  validate,
}: GetCalendarDayProps): UseDatepickerDay[] {
  const start = startOfWeek(focusedDate, { weekStartsOn });
  const end = subDays(addWeeks(start, WEEKS_IN_CALENDAR_MONTH), 1);
  return eachDayOfInterval({ start, end }).map(date => ({
    date,
    inMonth: isSameMonth(date, focusedDate),
    isValid:
      (minDate ? isAfter(date, minDate) : true) &&
      (maxDate ? isBefore(date, maxDate) : true) &&
      (validate ? validate(date) : true),
  }));
}

export type UseCalendar = {
  /**
   * First day of month that represents current calendar view
   */
  focusedDate: Date;
  /**
   * Changes focusedDate, make sure to only pass first day of the month dates.
   *
   * By changing focusedDate you are actually changing the reference point of calendar which means, once focused date is
   * changed, days and months functions will use new focusedDate value as reference point.
   */
  setFocusedDate: Dispatch<SetStateAction<Date>>;
  /**
   * Returns all dates that can be seen in calendar view along with flags for each date that indicate if it is in
   * the same month as focused date and if it is valid (available for selection).
   *
   * Use this function to render month view of calendar.
   */
  days: UseDatepickerDay[];
  /**
   * Returns dates representing each month in the same year as focusedDate.
   *
   * You can use this function render month selection for calendar view.
   */
  months: Date[];
  /**
   * Returns dates representing eachYear from minDate to maxDate. Returns undefined if minDate or maxDate is not defined
   */
  years?: Date[];
  /**
   * Compares given date with value.
   */
  isSelected: (date: Date) => boolean;
  /**
   * Adds one year to focusedDate. Use it to move calendar view to next year.
   */
  nextYear: () => void;
  /**
   * Subtracts one year from focusedDate. Use it to move calendar view to previous year.
   */
  previousYear: () => void;
  /**
   * Adds one month to focusedDate. Use it to move calendar view to next month.
   */
  nextMonth: () => void;
  /**
   * Subtracts one month from focusedDate. Use it to move calendar view to previous month.
   */
  previousMonth: () => void;
};

/**
 * Manages calendar state.
 *
 * You can use this hook to render calendar view. Focused date state is used as reference to return calendar days.
 *
 * Uses date-fns for date manipulation.
 */
export function useCalendar({
  value,
  startDate,
  minDate,
  maxDate,
  weekStartsOn = 0,
  validate,
}: UseCalendarProps = {}): UseCalendar {
  const [focusedDate, setFocusedDate] = useState<Date>(
    startOfMonth(startOfDay(value ?? startDate ?? minDate ?? maxDate ?? new Date()))
  );

  const serializedValue = useMemo(() => value?.toDateString(), [value]);

  const isSelected = useCallback((date: Date) => date.toDateString() === serializedValue, [serializedValue]);

  useEffect(() => {
    if (serializedValue) {
      setFocusedDate(startOfMonth(startOfDay(new Date(serializedValue))));
    }
  }, [serializedValue]);

  const days = useMemo(() => getCalendarDays({ focusedDate, weekStartsOn, minDate, maxDate, validate }), [
    focusedDate,
    weekStartsOn,
    minDate,
    maxDate,
    validate,
  ]);

  const months = useMemo(() => eachMonthOfInterval({ start: startOfYear(focusedDate), end: endOfYear(focusedDate) }), [
    focusedDate,
  ]);

  const years = useMemo(() => {
    if (maxDate && minDate) {
      return eachYearOfInterval({ start: minDate, end: maxDate });
    }
    return undefined;
  }, [maxDate, minDate]);

  const nextYear = useCallback(() => {
    setFocusedDate(currentDate => addYears(currentDate, 1));
  }, []);

  const previousYear = useCallback(() => {
    setFocusedDate(currentDate => subYears(currentDate, 1));
  }, []);

  const nextMonth = useCallback(() => {
    setFocusedDate(currentDate => addMonths(currentDate, 1));
  }, []);

  const previousMonth = useCallback(() => {
    setFocusedDate(currentDate => subMonths(currentDate, 1));
  }, []);

  return {
    focusedDate,
    setFocusedDate,
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

/**
 * Combines useCalendar and useDropdown hooks into one.
 */
export function useDatepicker<T extends HTMLElement>(props: UseDatepickerProps) {
  return { ...useCalendar(props), ...useDropdown<T>(props) };
}
