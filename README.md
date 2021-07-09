# use-date-input

React hooks for building date input and datepicker components.

* [useDateInput](#usedateinput)
* [useCalendar](#usecalendar)
* [useDatepicker](#usedatepicker)

## useDateInput

▸ **useDateInput**(`props`: [`UseDateInputProps`](#props)): [`UseDateInput`](#returnvalue)

Hook that manages state of masked date input.

Uses IMask for input masking and date-fns for date formatting and parsing.

### Props
**UseDateInputProps**

| Name | Type | Description |
| :------ | :------ | :------ |
| `dateFormat` | `string` | date-fns date format, see [https://date-fns.org/v2.22.1/docs/format](https://date-fns.org/v2.22.1/docs/format) |
| `maskBlocks?` | `MaskedDateOptions`[``"blocks"``] | Blocks defining each date part, see [https://imask.js.org/guide.html#masked-date](https://imask.js.org/guide.html#masked-date) for more info |
| `onComplete?` | (`value?`: `Date`) => `void` | This will execute when input satisfies given format (mask), usually this function should be used to update date value|
| `value?` | `Date` | Date value of input |

### Return value
**UseDateInput**

| Name | Type | Description |
| :------ | :------ | :------ |
| `inputValue` | `string` | Value of input element |
| `onKeyPress` | `KeyboardEventHandler` | Apply to input element if you wish to autocomplete date when user presses enter key. Parsing is done using dateFns parse with dateFormat truncated to the length of current inputValue and using current date as reference.  For example if today is 07/08/2021 and input value is 2, on enter press, input value will become 02/08/2021 |
| `ref` | `RefObject`<`HTMLInputElement`\> | Input element ref |
| `resetValueOnDelete` | `ChangeEventHandler`<`HTMLInputElement`\> | Will call onComplete with undefined value if e.target.value is falsy. Use it to reset value when user deletes the input. |
| `setInputValue` | `Dispatch`<`SetStateAction`<`string`\>\> | Sets inputValue, note that you don't need to set input value on input element change, this is done internally by using IMask's accept event |


### Usage
```typescript jsx
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
```

## useCalendar

▸ **useCalendar**(`props`: [`UseCalendarProps`](#props-1)): [`UseCalendar`](#returnvalue-1)

Manages calendar state.

You can use this hook to render calendar view. Focused date state is used as reference to return calendar days.

Uses date-fns for date manipulation.

### Props
**UseCalendarProps**

| Name | Type | Description |
| :------ | :------ | :------ |
| `maxDate?` | `Date` | Only dates before this date will be marked valid  For best performance memoize this date, this will prevent recalculation of calendar days on each render. |
| `minDate?` | `Date` | Only dates after this date will be marked valid.  For best performance memoize this date, this will prevent recalculation of calendar days on each render. |
| `startDate?` | `Date` | If provided calendar will start at the month of provided date |
| `validate?` | (`date`: `Date`) => `boolean` | Validation function, dates that fail this test will be marked invalid. For best performance memoize this function, this will prevent recalculation of calendar days on each render. |
| `value?` | `Date` | Datepicker value |
| `weekStartsOn?` | ``0`` ``1``  ``2``  ``3``  ``4`` ``5`` ``6`` | Day that a week starts on. 0 - sunday, 1 - monday ..., default is 0 |

### Return value
**UseCalendar**

| Name | Type | Description |
| :------ | :------ | :------ |
| `days` | [`UseDatepickerDay`](#usedatepickerday)[] | Returns all dates that can be seen in calendar view along with flags for each date that indicate if it is in the same month as focused date and if it is valid (available for selection).  Use this function to render month view of calendar. |
| `focusedDate` | `Date` | First day of month that represents current calendar view |
| `isSelected` | (`date`: `Date`) => `boolean` | Compares given date with value. |
| `months` | `Date`[] | Dates representing each month in the same year as focusedDate.  You can use this function render month selection for calendar view. |
| `nextMonth` | () => `void` | Adds one month to focusedDate. Use it to move calendar view to next month. |
| `nextYear` | () => `void` | Adds one year to focusedDate. Use it to move calendar view to next year. |
| `previousMonth` | () => `void` | Subtracts one month from focusedDate. Use it to move calendar view to previous month. |
| `previousYear` | () => `void` | Adds one month to focusedDate. Use it to move calendar view to next month. |
| `setFocusedDate` | `Dispatch`<`SetStateAction`<`Date`\>\> | Changes focusedDate, make sure to only pass first day of the month dates.  By changing focusedDate you are actually changing the reference point of calendar which means, once focused date is changed, days and months functions will use new focusedDate value as reference point. |
| `years?` | `Date`[] | Dates representing eachYear from minDate to maxDate. Returns undefined if minDate or maxDate is not defined |

#### UseDatePickerDay

| Name | Type | Description |
| :------ | :------ | :------ |
| `date` | `Date` | Represents calendar day |
| `inMonth` | `boolean` | Indicates if this date is in currently viewed calendar month |
| `isValid` | `boolean` | If true this date can be selected according to provided min and max date and validate function |


### Usage

```typescript jsx
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
```

## useDatepicker

▸ **useDatepicker**<`T`>([`props`](#props-2): [`UseCalendarProps`](#props-1) & [`UseDropdownProps`](https://github.com/tracksuitdev/use-dropdown#props)): [`UseCalendar`](#props-1) & [`UseDropdown`<`T`>](https://github.com/tracksuitdev/use-dropdown#return-value)

Combines useCalendar and useDropdown hooks into one.

### Props
| Name | Type | Description |
| :------ | :------ | :------ |
| `additionalRefs?` | `RefObject`<`HTMLElement`\>[] | These refs will be used when determining what constitutes a click outside of dropdown. |
| `disabled?` | `boolean` | If true, open and close will do nothing |
| `onClose?` | () => `void` |  Executed when close is called |
| `onOpen?` | () => `void` | Executed when open is called |
| `maxDate?` | `Date` | Only dates before this date will be marked valid  For best performance memoize this date, this will prevent recalculation of calendar days on each render. |
| `minDate?` | `Date` | Only dates after this date will be marked valid.  For best performance memoize this date, this will prevent recalculation of calendar days on each render. |
| `startDate?` | `Date` | If provided calendar will start at the month of provided date |
| `validate?` | (`date`: `Date`) => `boolean` | Validation function, dates that fail this test will be marked invalid. For best performance memoize this function, this will prevent recalculation of calendar days on each render. |
| `value?` | `Date` | Datepicker value |
| `weekStartsOn?` | ``0`` ``1``  ``2``  ``3``  ``4`` ``5`` ``6`` | Day that a week starts on. 0 - sunday, 1 - monday ..., default is 0 |

### Return value
| Name | Type | Description |
| :------ | :------ | :------ |
| `dropdownRef` | `RefObject`<`T`\> | Ref for dropdown element |
| `isOpen` | `boolean` | Dropdown state |
| `open` | () => `void` | Sets isOpen to true |
| `close` | () => `void` | Sets isOpen to false |
| `days` | [`UseDatepickerDay`](#usedatepickerday)[] | Returns all dates that can be seen in calendar view along with flags for each date that indicate if it is in the same month as focused date and if it is valid (available for selection).  Use this function to render month view of calendar. |
| `focusedDate` | `Date` | First day of month that represents current calendar view |
| `isSelected` | (`date`: `Date`) => `boolean` | Compares given date with value. |
| `months` | `Date`[] | Dates representing each month in the same year as focusedDate.  You can use this function render month selection for calendar view. |
| `nextMonth` | () => `void` | Adds one month to focusedDate. Use it to move calendar view to next month. |
| `nextYear` | () => `void` | Adds one year to focusedDate. Use it to move calendar view to next year. |
| `previousMonth` | () => `void` | Subtracts one month from focusedDate. Use it to move calendar view to previous month. |
| `previousYear` | () => `void` | Adds one month to focusedDate. Use it to move calendar view to next month. |
| `setFocusedDate` | `Dispatch`<`SetStateAction`<`Date`\>\> | Changes focusedDate, make sure to only pass first day of the month dates.  By changing focusedDate you are actually changing the reference point of calendar which means, once focused date is changed, days and months functions will use new focusedDate value as reference point. |
| `years?` | `Date`[] | Dates representing eachYear from minDate to maxDate. Returns undefined if minDate or maxDate is not defined |

### Usage
```typescript jsx
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
```

