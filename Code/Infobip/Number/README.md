# Cell Number Validator

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It takes a phone number typed by a user in any common South African format, checks that it looks like a South African mobile number, and saves it in international format (`+27XXXXXXXXX`).

## What it does

1. Reads the `client_number` attribute and cleans the dashes and `(0)`.
2. Rejects anything containing characters that don't belong in a phone number.
3. Reduces the number to digits and converts it to the `27...` international form.
4. Checks that it has the shape of a South African mobile number.
5. Saves the result and a validity flag.

## Attributes

| Attribute       | Direction | Description                                                              |
|-----------------|-----------|--------------------------------------------------------------------------|
| `client_number` | In / Out  | Raw number on input. Replaced with `+27XXXXXXXXX` if validation succeeds. |
| `cell_valid`    | Out       | `'true'` if a valid number was found, otherwise `'false'`.               |

**Important:** when validation fails, `client_number` is left unchanged (still the user's original text). Branch on `cell_valid` to re-ask the question rather than reading `client_number` directly.

## How it works

### 1. Pre-cleaning

The value is converted to a string, trimmed, and then:

- Unicode dashes (`‐ ‑ ‒ – — ―`) are replaced with a normal hyphen.
- Every `(0)` is removed, so `+27 (0)82 123 4567` becomes `+27 82 123 4567`.

### 2. Character check

The text must match `^\+?[\d\s\-().]+$`, which means:

- An optional `+`, **only at the very start**.
- Then one or more digits, spaces, hyphens, dots or round brackets.

Letters, other symbols, or a `+` anywhere else cause an immediate failure.

### 3. Converting to `27...` form

All non-digits are removed, then the first matching rule applies:

| Digits start with / look like | Action                       | Example                          |
|-------------------------------|------------------------------|----------------------------------|
| `0027`                        | Drop the leading `00`        | `0027821234567` → `27821234567`  |
| `0`                           | Replace the `0` with `27`    | `0821234567` → `27821234567`     |
| Exactly 9 digits              | Add `27` in front            | `821234567` → `27821234567`      |
| Anything else                 | Left as is                   | `27821234567` stays the same     |

### 4. Mobile number check

The digits must match `^27[678]\d{8}$`: the country code `27`, then a `6`, `7` or `8`, then 8 more digits (11 digits in total). A valid number is saved with a `+` in front.

### 5. Saving

- **Valid:** `client_number` becomes `+27XXXXXXXXX` and `cell_valid` is `'true'`.
- **Invalid:** only `cell_valid` is set, to `'false'`.

## Examples

| User types                    | `client_number` becomes | `cell_valid` |
|-------------------------------|-------------------------|--------------|
| `082 123 4567`                | `+27821234567`          | `true`       |
| `0821234567`                  | `+27821234567`          | `true`       |
| `(082) 123-4567`              | `+27821234567`          | `true`       |
| `+27 82 123 4567`             | `+27821234567`          | `true`       |
| `+27 (0)82 123 4567`          | `+27821234567`          | `true`       |
| `0027821234567`               | `+27821234567`          | `true`       |
| `27821234567`                 | `+27821234567`          | `true`       |
| `821234567`                   | `+27821234567`          | `true`       |
| `082 123 456` (too short)     | unchanged               | `false`      |
| `+27 082 123 4567`            | unchanged               | `false`      |
| `021 123 4567` (landline)     | unchanged               | `false`      |
| `+44 7911 123456`             | unchanged               | `false`      |
| `call me on 0821234567`       | unchanged               | `false`      |

## Known limitations

- **Format check only.** A number that passes may still not exist or be on WhatsApp.
- **Some non-mobile numbers pass.** The check accepts any number starting `06`, `07` or `08`, so service ranges such as toll-free `0800` numbers are treated as valid cell numbers.
- **South African numbers only.** Foreign numbers are rejected, and a foreign number that happens to start with `0` is treated as a South African one.
- **A stray extra `0` fails.** `+27 082 123 4567` (a `0` after the country code, without brackets) gives 12 digits and is rejected. Only the exact text `(0)` is removed.
- **A leading `+` on a local number is ignored.** `+0821234567` is accepted and converted, because the `+` is dropped with the other non-digits.
- **Failures keep the raw text.** Unlike the name scripts, a failed number is not cleared, so `client_number` may hold unusable text.
- **Extensions and notes are rejected.** Anything with letters, such as `0821234567 ext 2` or `WhatsApp 082...`, fails.
- **No second number.** If the user types two numbers in one message, the digits are merged and the result fails.

## Customising

- **Allow landlines:** widen the final check, for example to `^27[1-8]\d{8}$`.
- **Block service ranges:** add a check that rejects prefixes such as `2780` and `2786`.
- **Strip a stray zero after `27`:** add a rule that turns `270...` into `27...` before the final check.
- **Support other countries:** replace the `27` handling with a country-code lookup or a phone number library.
- **Clear bad input:** in the `else` branch, also set `client_number` to `''`.
