# Viewing Date Normaliser

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It takes whatever a user typed as their preferred viewing date, such as `tomorrow`, `next friday` or `14th of October`, and converts it to a standard `YYYY-MM-DD` date. It also rejects dates that don't exist or are in the past.

## What it does

1. Reads the `viewing_date` attribute and cleans up the text.
2. Works out today's date in South Africa.
3. Tries to interpret the text as a **phrase** (`tomorrow`, `in 2 weeks`, `friday`, ...).
4. If that fails, tries to interpret it as a **typed date** (`2026-11-14`, `14/11/2026`, `14 Nov`, ...).
5. Checks that the result is a real date that is today or later.
6. Saves the outcome back to the flow's attributes.

## Attributes

| Attribute    | Direction | Description                                                      |
|--------------|-----------|------------------------------------------------------------------|
| `viewing_date` | In / Out | Raw user text on input. Replaced with `YYYY-MM-DD` if parsing succeeds. |
| `date_valid`   | Out      | `'true'` if a valid date was parsed, otherwise `'false'`.        |

**Important:** when parsing fails, `viewing_date` is left unchanged (still the user's original text). Always branch on `date_valid` rather than checking whether `viewing_date` has a value.

## How it works

### 1. Cleaning the input

The raw value is converted to a string, trimmed and lowercased, then:

- Unicode dashes (`‐ ‑ ‒ – — ―`) are replaced with a normal hyphen.
- Runs of whitespace are collapsed to a single space.
- Trailing `.`, `,`, `!` and `?` are removed.
- One leading filler word (`on`, `by`, `at`, `for`) is removed.
- A leading `the ` is removed.

So `"On the 14th of October."` becomes `14th of october`.

### 2. Working out "today"

South Africa is UTC+2 with no daylight saving, so the script adds a fixed 2 hours to the current UTC time and takes that calendar date as today. All date maths is done in UTC milliseconds, so the server's own time zone doesn't matter.

### 3. Phrase matching

| Input                          | Result                                                                 |
|--------------------------------|------------------------------------------------------------------------|
| `today`                        | Today                                                                  |
| `tomorrow`                     | Today + 1 day                                                          |
| `day after tomorrow`           | Today + 2 days                                                         |
| `next week`                    | Monday of next week (on a Sunday, that is tomorrow)                    |
| `end of week`, `end of the week` | The upcoming Friday (today, if today is Friday)                      |
| `weekend`, `this weekend`      | The upcoming Saturday (today, if today is Saturday)                    |
| `in N days`, `in N weeks`      | Today + N days or weeks (N up to 3 digits)                             |
| `friday`, `next friday`, `this friday` | The next occurrence of that weekday **after** today            |

Weekday names accept full and short forms (`monday`, `mon`, `tues`, `thurs`, and so on).

### 4. Typed dates

Used only if no phrase matched. Day comes before month in numeric formats.

| Pattern                        | Examples                                  |
|--------------------------------|-------------------------------------------|
| `YYYY-MM-DD` (also `/` or `.`) | `2026-11-14`, `2026/11/14`                |
| `DD-MM-YYYY` or `DD-MM-YY` (also `/` or `.`) | `14/11/2026`, `14-11-26`    |
| Day then month name            | `14 November 2026`, `14th of Nov`, `14 nov` |
| Month name then day            | `November 14, 2026`, `nov 14th`           |

Month names can be full or abbreviated (`sep` and `sept` both work). Two-digit years are treated as 20xx.

**No year given:** the current year is used. If that date has already passed, the next year is used instead, so `3 March` typed in November means next March.

### 5. Validation and output

- `isReal` rebuilds the date and compares the parts, which rejects impossible dates like `31 February`.
- Dates before today are rejected. Today itself is allowed.
- A valid result is written as `YYYY-MM-DD` and `date_valid` is set to `'true'`. Otherwise `date_valid` is `'false'`.

## Examples

Assuming today is **Sunday, 8 November 2026**:

| User types              | `viewing_date` becomes | `date_valid` |
|-------------------------|------------------------|--------------|
| `today`                 | `2026-11-08`           | `true`       |
| `tomorrow`              | `2026-11-09`           | `true`       |
| `next week`             | `2026-11-09`           | `true`       |
| `friday`                | `2026-11-13`           | `true`       |
| `sunday`                | `2026-11-15`           | `true`       |
| `in 2 weeks`            | `2026-11-22`           | `true`       |
| `14/11/2026`            | `2026-11-14`           | `true`       |
| `Nov 14`                | `2026-11-14`           | `true`       |
| `on the 3rd of March`   | `2027-03-03`           | `true`       |
| `1 Nov 2026`            | unchanged              | `false`      |
| `31 February 2027`      | unchanged              | `false`      |
| `10/14/2026`            | unchanged              | `false`      |

## Known limitations

- **`next <weekday>` is the same as `<weekday>`.** Both give the next occurrence after today, so `next friday` typed on a Monday is the coming Friday, not the Friday of the following week.
- **`this <weekday>` on that same day** returns a week later, since today is excluded.
- **Day-first only.** `10/14/2026` is read as day 10, month 14 and rejected. `03/04/2026` is read as 3 April.
- **Dates only, no times.** Input like `friday at 10am` or `tomorrow morning` won't match and is marked invalid.
- **Unsupported phrases.** `next month`, `in a week`, `a week from today` and similar are not recognised.
- **English only.** Month and weekday names are English.
- **29 February with no year** is rejected in a non-leap year rather than moved to the next leap year.
- **No upper limit.** Any future date is accepted, including years far ahead.
- **Only one filler word** is stripped from the start, apart from a following `the`.

## Customising

- **Add phrases:** add another `else if` branch in the phrase section that sets `target` using `fromTs(todayTs + n * DAY)`.
- **Add month or weekday spellings:** extend the `MONTHS` or `WEEKDAYS` lookup objects.
- **Change the time zone:** change the `2 * 60 * 60 * 1000` offset (needs care if the zone observes daylight saving).
- **Switch to month-first dates:** swap the `d` and `mo` assignments in the `DD/MM/YYYY` branch.
- **Limit how far ahead bookings can be:** add an upper-bound check next to the past-date check.
