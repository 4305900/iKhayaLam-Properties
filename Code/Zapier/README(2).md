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
