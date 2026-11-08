# Resend Counter

A two-line JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). Each time it runs, it adds 1 to a counter attribute called `resend_count`. It is typically used to track how many times a message or question has been repeated, so the flow can stop after a set number of attempts.

## What it does

1. Reads `resend_count` and converts it to a number. If it is missing or not a valid number, it is treated as `0`.
2. Saves the value back increased by 1.

## Attributes

| Attribute      | Direction | Description                                          |
|----------------|-----------|------------------------------------------------------|
| `resend_count` | In / Out  | How many times this step has run. Starts at 0 when unset. |

## How it works

```javascript
var count = Number(attributeApi.get('resend_count')) || 0;
attributeApi.set('resend_count', count + 1);
```

`Number(...)` converts whatever is stored, which may be text such as `"2"`, into a number. The `|| 0` fallback replaces `NaN` (for example from an unset or non-numeric value) with `0`. The new value is then written back as `count + 1`.

## Examples

| `resend_count` before | `resend_count` after |
|-----------------------|----------------------|
| not set               | `1`                  |
| `0`                   | `1`                  |
| `1` or `"1"`          | `2`                  |
| `4`                   | `5`                  |
| `abc` (not a number)  | `1`                  |
| `2.5`                 | `3.5`                |
| `-1`                  | `0`                  |

## Typical use

Place the step wherever the flow resends a message or re-asks a question. A condition after it then checks the count, for example:

- `resend_count` below the limit: loop back and ask again.
- `resend_count` at or above the limit: stop retrying and hand over to an agent or end the flow.

## Known limitations

- **No upper limit.** The script only counts. The flow must check the value and decide when to stop.
- **No reset.** The count carries on for the whole conversation. Reset it elsewhere (for example set `resend_count` to `0`) when moving to a new question or after a success.
- **Invalid values restart the count.** A non-numeric value silently becomes `0`, so the result is `1`.
- **Whole numbers are not enforced.** A decimal value is incremented as a decimal.
- **Storage type depends on the platform.** The script saves a number, but the platform may store it as text, which is why the value is converted with `Number(...)` on every read.

## Customising

- **Count a different attribute:** change `'resend_count'` in both places.
- **Reset the counter:** use `attributeApi.set('resend_count', 0)` in a separate step.
- **Add a limit flag:** after incrementing, set a second attribute, for example `attributeApi.set('resend_limit_reached', count + 1 >= 3 ? 'yes' : 'no')`.
