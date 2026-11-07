# Booking Description Parser

A JavaScript snippet for a **Code by Zapier** step. It reads the free-text description of a booking (for example, a calendar event) and pulls out the key details of a property viewing as clean, separate fields that later Zap steps can use.

## What it does

Given a description like this:

```
Booking Reference: IK-MS-1042
Client Name: Thabo Mokoena
Client Email: thabo@example.com
Property: 12 Beach Road, Sea Point
Viewing Date: 14 November 2026
Viewing Time: 10:30
```

it returns:

```json
{
  "booking_reference": "IK-MS-1042",
  "client_first_name": "Thabo",
  "client_email": "thabo@example.com",
  "property_name": "12 Beach Road, Sea Point",
  "viewing_date": "14 November 2026",
  "viewing_time": "10:30"
}
```

## Input

| Field         | Type   | Description                                      |
|---------------|--------|--------------------------------------------------|
| `description` | string | The raw booking text, mapped in the Zapier step. |

If `description` is missing, it defaults to an empty string and every output field comes back empty.

## Output

| Field               | Source                                                                 |
|---------------------|------------------------------------------------------------------------|
| `booking_reference` | `Booking Reference`, `Booking Ref` or `Ref` label, else first `IK-MS…` token |
| `client_first_name` | First word of the `Client Name`, `Client` or `Name` label              |
| `client_email`      | `Client Email` or `Email` label, else first email address in the text  |
| `property_name`     | `Property` label                                                       |
| `viewing_date`      | `Viewing Date` or `Date` label                                         |
| `viewing_time`      | `Viewing Time` or `Time` label                                         |

Any field that cannot be found is returned as an empty string (`''`), so downstream steps never receive `undefined`.

## How it works

### `getValue(labels)`

The core helper. It takes a list of label names to try, in priority order, and returns the value of the first one found.

1. Each label is **escaped** so special regex characters are treated literally.
2. A case-insensitive, multi-line regex is built: `^\s*Label\s*:\s*(.*)$`.
3. The `^` anchor means the label must start a line, and the required `:` straight after the label means `Property:` will not match `Property Name:`.
4. The captured text is trimmed. If it is empty, the next label is tried.
5. If no label matches, it returns `''`.

### Per-field logic

- **Booking reference:** tries the labels first. If none match, it falls back to the first token in the text that starts with `IK-MS`.
- **Client first name:** reads the client name, then splits on whitespace and keeps the first word.
- **Client email:** tries the labels first. If none match, it falls back to the first email address found anywhere in the text.
- **Property name:** uses only the exact `Property` label.
- **Viewing date and time:** use the `Viewing Date` / `Date` and `Viewing Time` / `Time` labels.

## Using it in Zapier

1. Add a **Code by Zapier** action and choose **Run JavaScript**.
2. Under **Input Data**, add a key named `description` and map it to the booking or event description from your trigger.
3. Paste the script into the code box.
4. Use the returned fields (`booking_reference`, `client_first_name`, and so on) in later steps such as confirmation emails or CRM updates.

## Known limitations

- **Empty values can pull in the next line.** `\s*` matches line breaks in JavaScript, so a label with no value (for example `Property:` followed by a newline) can capture the next line instead. Using `[ \t]*` in place of `\s*` in the regex fixes this.
- **Email fallback may pick the wrong address.** If there is no `Client Email` label, the first email in the text is used, which could belong to an agent or organiser.
- **Titles in names.** `Dr. Thabo Mokoena` gives `Dr.` as the first name.
- **HTML in descriptions.** Descriptions from some calendar sources contain tags such as `<br>`, which stop the line-start matching from working. Strip tags before parsing if this applies.
- **Generic labels.** `Name`, `Date`, `Time` and `Ref` are accepted as fallbacks, so a line like `Time: TBC` will be returned as the viewing time.
- **Reference prefix.** The `IK-MS` fallback is specific to this booking format and will need changing for other reference styles.

## Customising

- **Add or rename labels:** edit the array passed to `getValue`, for example `getValue(['Viewing Date', 'Date', 'Appointment Date'])`.
- **Add a new field:** call `getValue` with its labels and add the result to the returned object.
- **Change the reference format:** update the `\bIK-MS[\w-]*` pattern.
