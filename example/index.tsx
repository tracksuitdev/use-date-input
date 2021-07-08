import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { useState } from "react";
import { useCalendar, useDateInput, useDatepicker } from "../src";
import IMask from "imask";
import { format } from "date-fns";

// define maskBlocks as constant or memoize in component
const maskBlocks = {
  dd: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 31,
    maxLength: 2,
  },
  MM: {
    mask: IMask.MaskedRange,
    from: 1,
    to: 12,
    maxLength: 2,
  },
  yyyy: {
    mask: IMask.MaskedRange,
    from: 1900,
    to: 9999,
  },
};

const DateInput = () => {
  const [value, setValue] = useState<Date>();
  const { ref, inputValue, resetValueOnDelete } = useDateInput({
    value,
    dateFormat: "dd-MM-yyyy",
    maskBlocks,
    onComplete: setValue,
  });

  return <input ref={ref} value={inputValue} onChange={resetValueOnDelete} />;
};

const Calendar = () => {
  const [value, setValue] = useState<Date>();
  const { previousYear, nextYear, focusedDate, previousMonth, nextMonth, days, isSelected } = useCalendar({ value });

  return (
    <div style={{ width: "420px" }}>
      <div style={{ width: "100%" }}>
        <button onClick={previousYear}>{"<"}</button>
        {format(focusedDate, "yyyy")}
        <button onClick={nextYear}>{">"}</button>
      </div>
      <div style={{ width: "100%" }}>
        <button onClick={previousMonth}>{"<"}</button>
        {format(focusedDate, "MMMM")}
        <button onClick={nextMonth}>{">"}</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {days.map(({ date, inMonth }) => (
          <button
            disabled={!inMonth}
            style={{ width: "60px", backgroundColor: isSelected(date) ? "aliceblue" : "initial" }}
            key={date.toDateString()}
            onClick={() => setValue(date)}>
            {format(date, "d")}
          </button>
        ))}
      </div>
    </div>
  );
};

const DateInputWithDatepicker = () => {
  const [value, setValue] = useState<Date>();
  const { ref, inputValue, resetValueOnDelete } = useDateInput({
    value,
    dateFormat: "dd-MM-yyyy",
    maskBlocks,
    onComplete: setValue,
  });
  const {
    isOpen,
    open,
    days,
    previousYear,
    nextYear,
    previousMonth,
    nextMonth,
    focusedDate,
    dropdownRef,
    isSelected,
  } = useDatepicker<HTMLDivElement>({
    value,
  });

  return (
    <div ref={dropdownRef}>
      <input ref={ref} value={inputValue} onChange={resetValueOnDelete} onFocus={open} />
      {isOpen && (
        <div style={{ width: "420px" }}>
          <div style={{ width: "100%" }}>
            <button onClick={previousYear}>{"<"}</button>
            {format(focusedDate, "yyyy")}
            <button onClick={nextYear}>{">"}</button>
          </div>
          <div style={{ width: "100%" }}>
            <button onClick={previousMonth}>{"<"}</button>
            {format(focusedDate, "MMMM")}
            <button onClick={nextMonth}>{">"}</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {days.map(({ date, inMonth }) => (
              <button
                disabled={!inMonth}
                style={{ width: "60px", backgroundColor: isSelected(date) ? "aliceblue" : "initial" }}
                key={date.toDateString()}
                onClick={() => setValue(date)}>
                {format(date, "d")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  return (
    <div>
      <div style={{ marginBottom: "50px" }}>
        <label>Date input</label>
        <DateInput />
      </div>
      <div style={{ marginBottom: "50px" }}>
        <label>Calendar</label>
        <Calendar />
      </div>
      <div>
        <label>Date picker</label>
        <DateInputWithDatepicker />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
