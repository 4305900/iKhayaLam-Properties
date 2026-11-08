# Viewing Time Validator

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It takes the time a user typed for a property viewing, such as `3pm`, `15h30` or `at 9am`, converts it to 24-hour `HH:MM`, and then checks it against the viewing date, opening hours and the current time. On success it saves a one-hour viewing slot in several formats ready for booking or calendar steps.

It is designed to run **after** the viewing date step, because it reads the already-cleaned `viewing_date`.

## What it does

1. Cleans the typed time and interprets it in one of several formats.
2. Converts it to 24-hour `HH:MM`.
3. Checks that the viewing fits within opening hours (08:00 to 17:00).
4. Checks that the viewing is in the future, using South African time.
5. Saves the start and end of a one-hour slot, plus a validity flag and an error code.

## Attributes

### Inputs

| Attribute      | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| `viewing_time` | The raw time as typed by the user.                                          |
| `viewing_date` | The viewing date in `YYYY-MM-DD` format, normally set by the date step.     |

### Outputs

| Attribute            | Set when | Example                     | Description                          |
|----------------------|----------|-----------------------------|--------------------------------------|
| `viewing_time`       | Success  | `15:30`                     | The cleaned start time (`HH:MM`).    |
| `viewing_start`      | Success  | `2026-11-14 15:30:00`       | Start date and time.                 |
| `viewing_end`        | Success  | `2026-11-14 16:30:00`       | End date and time (start + 60 min).  |
| `viewing_start_iso`  | Success  | `2026-11-14T15:30:00+02:00` | Start in ISO 8601 with SA offset.    |
| `viewing_end_iso`    | Success  | `2026-11-14T16:30:00+02:00` | End in ISO 8601 with SA offset.      |
| `viewing_start_time` | Success  | `15:30`                     | Start time only.                     |
| `viewing_end_time`   | Success  | `16:30`                     | End time only.                       |
| `time_valid`         | Always   | `true` or `false`           | Whether everything above succeeded.  |
| `time_error`         | Always   | `''`, `format`, `hours`, `past`, `date` | Why it failed (empty on success). |

### Error codes

| `time_error` | Meaning                                                                  |
|--------------|--------------------------------------------------------------------------|
| `format`     | The time was not understood or was ambiguous.                            |
| `hours`      | The slot falls outside 08:00-17:00 (see opening hours below).            |
| `past`       | The time was understood but has already passed.                          |
| `date`       | `viewing_date` is missing or not in `YYYY-MM-DD` format.                 |

## How it works

### 1. Cleaning the text

The value is converted to a string, trimmed and lowercased, then:

- Unicode dashes become a normal hyphen.
- `a.m.` and `p.m.` (with or without spaces and dots) become `am` and `pm`.
- Runs of whitespace become one space.
- Trailing `.`, `,`, `!` and `?` are removed.
- One leading filler word is removed: `at`, `around`, `about`, `by`, `from` or `@`.

So `At 3 p.m.` becomes `3 pm`.

### 2. Understanding the time

| Format                        | Examples                      | Notes                                       |
|-------------------------------|-------------------------------|---------------------------------------------|
| Words                         | `noon`, `midday`, `midnight`  | `noon` and `midday` are 12:00, `midnight` is 00:00. |
| Hour and minutes with `:` or `.` | `10:30`, `3.30pm`, `3:30 pm`, `09:00` | A two-digit hour without am/pm is read as 24-hour. A one-digit hour **needs** am/pm. |
| Hour with `h`                 | `15h30`, `15h`, `9h`          | Always read as 24-hour.                     |
| Hour with am or pm            | `3pm`, `3 pm`, `11am`         | Hour must be 1 to 12.                       |
| Four digits                   | `1530`, `0900`                | Read as 24-hour.                            |
| Two digits                    | `15`, `09`                    | Hour only, read as 24-hour.                 |

### 3. Converting to 24-hour

- With **am/pm**: the hour must be 1-12. `12am` becomes `00`, `12pm` stays `12`, other `pm` hours get 12 added.
- Without am/pm: only formats that are clearly 24-hour are accepted, with the hour from 0 to 23.
- Minutes must be 0 to 59.

Anything that doesn't pass gives `time_error = 'format'`.

### 4. Opening hours

Constants at the top of the checks:

| Constant          | Value | Meaning                                       |
|-------------------|-------|-----------------------------------------------|
| `OPEN_MIN`        | 08:00 | Earliest start time.                          |
| `CLOSE_MIN`       | 17:00 | The viewing must **finish** by this time.     |
| `DURATION_MINUTES`| 60    | Length of a viewing.                          |

Because a viewing lasts an hour, valid start times run from **08:00 to 16:00** inclusive.

### 5. Date and future check

- `viewing_date` must match `YYYY-MM-DD`, otherwise `time_error = 'date'`.
- The current time in South Africa is taken as now plus 2 hours (UTC+2, no daylight saving).
- The slot start must be **later than** now, otherwise `time_error = 'past'`.

### 6. Saving

On success, the seven slot attributes are set and `time_valid` is `'true'` with an empty `time_error`. On failure, only `time_valid` (`'false'`) and `time_error` are set.

## Examples

Assuming `viewing_date` is a future date such as `2026-11-14`:

| User types          | Result                                    |
|---------------------|-------------------------------------------|
| `10:30`             | Valid, 10:30 to 11:30                     |
| `3pm`               | Valid, 15:00 to 16:00                     |
| `at 9am`            | Valid, 09:00 to 10:00                     |
| `3.30 p.m.`         | Valid, 15:30 to 16:30                     |
| `15h30`             | Valid, 15:30 to 16:30                     |
| `1530`              | Valid, 15:30 to 16:30                     |
| `noon`              | Valid, 12:00 to 13:00                     |
| `16:00`             | Valid, 16:00 to 17:00                     |
| `16:30`             | `hours` (would finish after 17:00)        |
| `7am`               | `hours` (before 08:00)                    |
| `midnight`          | `hours`                                   |
| `9:00`              | `format` (one-digit hour without am/pm is ambiguous) |
| `3`                 | `format`                                  |
| `13:00 pm`          | `format` (13 is not a 12-hour value)      |
| `25:00` or `10:75`  | `format`                                  |
| `half past 3`       | `format`                                  |

A full successful run for `3pm` on `2026-11-14` sets:

```
viewing_time       = 15:00
viewing_start      = 2026-11-14 15:00:00
viewing_end        = 2026-11-14 16:00:00
viewing_start_iso  = 2026-11-14T15:00:00+02:00
viewing_end_iso    = 2026-11-14T16:00:00+02:00
viewing_start_time = 15:00
viewing_end_time   = 16:00
time_valid         = true
time_error         = (empty)
```

## Known limitations

- **Failures don't clear old values.** On failure, `viewing_time` keeps the user's raw text, and any `viewing_start`, `viewing_end` and related attributes from an earlier successful run are left in place. Always check `time_valid` before using them.
- **Ambiguous times are rejected.** `9:00` or `3` without am/pm give `format`, so the bot should ask the user to add am or pm or use 24-hour time.
- **Date is only format-checked.** `2026-02-31` matches the pattern and silently rolls over to 3 March. This relies on the date step having validated the date.
- **Fixed hours and slot length.** Opening hours and the 60-minute duration are hard-coded and the same for every day. There are no weekday or public holiday rules.
- **No minimum notice.** A time just a minute ahead of now counts as valid.
- **Error order.** The hours check runs before the past check, so a time that is both outside hours and in the past reports `hours`.
- **Fixed time zone.** South African time is assumed (UTC+2 with no daylight saving).
- **Limited phrasing.** Ranges (`10am-11am`), phrases (`half past 3`, `3 o'clock`) and vague times (`morning`) are not recognised, and only one leading filler word is removed (`at about 3pm` fails).
- **Duplicated lines.** The last two statements (`time_valid` and `time_error`) appear twice at the end of the script. This is harmless and the repeats can be deleted.

## Customising

- **Change slot length:** edit `DURATION_MINUTES`.
- **Change opening hours:** edit `OPEN_MIN` and `CLOSE_MIN` (minutes after midnight).
- **Require minimum notice:** add a buffer to `nowSA`, for example `+ 60 * 60 * 1000` for one hour.
- **Add formats or words:** add another `else if` branch in the parsing section that sets `h`, `min`, and either `ap` or `is24`.
- **Clear stale values on failure:** in the failure case, set the slot attributes to `''`.
- **Add weekday rules:** check the day of the week of `viewing_date` before accepting the slot.
