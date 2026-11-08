# Website Entry Detector

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It checks whether a conversation was started from a website "book a viewing" link by looking for a specific message format, `BOOK_VIEWING:<listing id>`, and records the listing ID so the bot can skip straight to booking that property.

## What it does

1. Reads the user's latest text message.
2. Checks whether it exactly matches `BOOK_VIEWING:` followed by a listing ID.
3. If it matches, saves the listing ID and flags the conversation as a website entry.
4. If it doesn't, flags the conversation as not coming from the website.

## Attributes

| Attribute                  | Direction | Description                                              |
|----------------------------|-----------|----------------------------------------------------------|
| `lastReceivedTextMessage`  | In        | The most recent text message received from the user.     |
| `website_entry`            | Out       | `'yes'` if the message matched, otherwise `'no'`.        |
| `website_listing_id`       | Out       | The listing ID as a string. Set only when the message matched. |

## How it works

### 1. Reading the message

The attribute value is converted to a string (an empty string if the attribute is missing) and trimmed, so leading and trailing spaces are ignored.

### 2. Matching

The message is tested against this case-insensitive pattern:

```
^BOOK_VIEWING:([1-9][0-9]*)$
```

| Part              | Meaning                                                         |
|-------------------|-----------------------------------------------------------------|
| `^` and `$`       | The **whole** message must match, with nothing before or after. |
| `BOOK_VIEWING:`   | The fixed prefix, in any letter case.                           |
| `[1-9][0-9]*`     | A positive whole number with no leading zero. This is captured as the listing ID. |

### 3. Saving the result

- **Match:** `website_listing_id` is set to the captured digits (kept as a string) and `website_entry` is set to `'yes'`.
- **No match:** only `website_entry` is set, to `'no'`.

## Examples

| User message                  | `website_entry` | `website_listing_id`    |
|-------------------------------|-----------------|-------------------------|
| `BOOK_VIEWING:1042`           | `yes`           | `1042`                  |
| `book_viewing:7`              | `yes`           | `7`                     |
| `  BOOK_VIEWING:85  `         | `yes`           | `85`                    |
| `BOOK_VIEWING:0`              | `no`            | not set                 |
| `BOOK_VIEWING:007`            | `no`            | not set                 |
| `BOOK_VIEWING: 1042`          | `no`            | not set                 |
| `BOOK_VIEWING:1042 please`    | `no`            | not set                 |
| `Hi, I'd like to book a viewing` | `no`         | not set                 |

## Typical use

A "Book a viewing" button on a listing page opens a chat with the message `BOOK_VIEWING:<id>` pre-filled. The flow then branches on `website_entry`:

- `yes`: skip the property question and use `website_listing_id`.
- `no`: ask the user which property they are interested in.

## Known limitations

- **Run it on the first message only.** If it runs on every incoming message, any later reply such as `Thabo` sets `website_entry` back to `'no'`, wiping out the flag.
- **A stale listing ID is not cleared.** On a non-match, `website_listing_id` keeps any value it had before. Rely on `website_entry` to know whether the ID is current.
- **Strict format.** Spaces around the colon, extra text, or a leading zero in the ID all cause a non-match.
- **The ID is not checked against real listings.** Any positive number passes, including IDs that don't exist.
- **No length limit** on the ID. It is stored as a string, so very large numbers are not altered.
- **Single-line messages only.** A message containing line breaks inside it won't match.

## Customising

- **Change the prefix:** edit `BOOK_VIEWING` in the pattern, and update the website link to match.
- **Allow IDs with letters or dashes:** widen `[1-9][0-9]*`, for example to `[A-Za-z0-9-]+`.
- **Allow trailing text:** remove the final `$`, though this also makes the check looser.
- **Clear the old ID on a non-match:** add `attributeApi.set('website_listing_id', '')` to the `else` branch.
