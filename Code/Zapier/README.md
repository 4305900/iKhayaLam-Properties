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

# Request Key Generator

A JavaScript snippet for a **Code by Zapier** step. It validates the details of a property viewing request and produces a stable, unique **request key** (an idempotency key). Later steps can use that key to detect and skip duplicate requests, for example when a form is submitted twice or a Zap retries.

## What it does

1. Reads and trims the input fields.
2. Validates them, throwing an error that lists every problem found.
3. Builds a fingerprint string from the submission ID, or from the booking details if there is no submission ID.
4. Hashes the fingerprint with SHA-256 and returns the first 32 hex characters, prefixed with `IK-`.

The same input always produces the same key, so the key can be stored and checked later to spot repeats.

## Input

All values are treated as strings. Missing values default to an empty string.

| Field                  | Required | Rule                              | Example        |
|------------------------|----------|-----------------------------------|----------------|
| `client_email`         | Yes      | Must not be empty                 | `thabo@example.com` |
| `selected_property_id` | Yes      | Digits only                       | `1042`         |
| `viewing_date`         | Yes      | `YYYY-MM-DD`                      | `2026-11-14`   |
| `viewing_time`         | Yes      | `HH:MM`, 24-hour, `00:00`-`23:59` | `10:30`        |
| `submission_id`        | No       | Any string; used for the key if present | `sub_8841` |

## Output

```json
{ "request_key": "IK-3f9a1c0e5b7d2a8c4e6f1b9d0a3c5e7f" }
```

| Field         | Description                                                    |
|---------------|----------------------------------------------------------------|
| `request_key` | `IK-` followed by the first 32 hex characters of a SHA-256 hash |

## How it works

### Validation

Each check adds a message to an `errors` array. If the array is not empty, a single `Error` is thrown with all messages joined by `; `, so you see every problem at once rather than one at a time:

```
selected_property_id must be numeric; viewing_time must be HH:MM (24-hour)
```

Throwing makes the Zapier step fail, which stops the Zap before an invalid request is processed.

### Choosing the fingerprint

- If `submission_id` is present, it is the fingerprint.
- Otherwise the fingerprint is `email|propertyId|date|time`.

### Hashing

The fingerprint is encoded as UTF-8 bytes and hashed with `crypto.subtle.digest("SHA-256", ...)`. The bytes are converted to a hex string, truncated to 32 characters (128 bits), and prefixed with `IK-`.

## Using it in Zapier

1. Add a **Code by Zapier** action and choose **Run JavaScript**.
2. Under **Input Data**, map these keys: `client_email`, `selected_property_id`, `viewing_date`, `viewing_time` and, if available, `submission_id`.
3. Paste the script into the code box.
4. Use `request_key` in later steps, for example as a lookup key in a spreadsheet or database to check whether the request has already been handled.

## Known limitations

- **Two key sources.** The same booking can produce different keys depending on whether `submission_id` was present. Use one source consistently.
- **Email is not normalised.** `Thabo@Example.com` and `thabo@example.com` give different keys in the fallback path. Lowercasing the email before hashing avoids this.
- **Email is barely validated.** Only a non-empty check is applied.
- **Impossible dates pass.** `2026-02-31` matches the `YYYY-MM-DD` pattern. A round-trip check with `Date` can catch these.
- **Runtime dependency.** `crypto.subtle` needs a Node version where the global `crypto` is available. Otherwise use `require("crypto")` and `createHash("sha256")`.
- **Strict time format.** `10:30:00` or `10:30 AM` will fail validation.

## Customising

- **Change the prefix:** edit the `IK-` string in the final template literal.
- **Change the key length:** adjust the `slice(0, 32)` value (32 hex characters is 128 bits).
- **Add fields to the fingerprint:** append them to the template string, keeping the `|` separator.
- **Loosen or tighten validation:** edit the regexes in the validation block.
