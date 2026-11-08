# Rental Search Extractor

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). When a user describes the rental they want, such as "2 bedroom flat in Sea Point under R15 000", an earlier step (typically named entity recognition, or NER) may have filled in attributes like `Location` and `Price`. This script gathers those values, cleans them, fills gaps from the raw message where it can, and saves tidy search criteria for the rental search.

## What it does

1. Reads each search criterion from the entity attributes, trying alternative attribute names.
2. If no location was found, looks for a known area name in the user's message.
3. Cleans the bedroom, bathroom and rent values down to digits.
4. If no rent was found, looks for a price in the message text.
5. Saves everything to the attributes used by the search.

## Attributes

### Inputs

For each row, the first non-empty attribute in the list is used.

| Criterion      | Attributes tried, in order              |
|----------------|-----------------------------------------|
| Location       | `Location`, `location`                  |
| Property type  | `Property_Type`, `property_type`        |
| Bedrooms       | `Bedrooms`, `bedrooms`                  |
| Bathrooms      | `Bathrooms`, `bathrooms`                |
| Maximum rent   | `Price`, `max_rent`, `price`            |
| User's message | `lastReceivedTextMessage`, `user_message`, `message` (used only for the fallbacks) |

### Outputs

| Attribute       | Content                                                                 |
|-----------------|-------------------------------------------------------------------------|
| `location`      | Area name (empty if none found).                                        |
| `property_type` | Property type exactly as received (empty if none).                      |
| `bedrooms`      | Digits only (empty if none).                                            |
| `bathrooms`     | Digits only (empty if none).                                            |
| `max_rent`      | Whole number of rand as a string (empty if none).                       |

All five are always set, using an empty string when nothing was found. There is no validity flag, so the flow should check each attribute for an empty value to decide what to ask next.

Because the script also reads the lowercase output names as fallbacks (`location`, `bedrooms`, and so on), running it again keeps earlier values when the new input contains nothing.

## How it works

### Helper functions

| Function        | Purpose                                                                                      |
|-----------------|----------------------------------------------------------------------------------------------|
| `read(name)`    | Safely reads an attribute, returning a trimmed string, or `""` if it is missing or an error occurs. |
| `firstOf(names)`| Returns the first non-empty value from a list of attribute names.                            |
| `digits(text)`  | Removes everything except the digits 0-9.                                                    |

### 1. Location

If `Location` or `location` is empty, the message is lowercased and checked against a hard-coded list of 20 areas:

> Bellville, Sea Point, Durbanville, Brackenfell, Century City, Cape Town, Parow, Goodwood, Table View, Stellenbosch, Somerset West, Milnerton, Blouberg, Hout Bay, Kommetjie, Cape Town CBD, Waterfront, Paarl, Constantia, Noordhoek

The **first area in the list** that appears anywhere in the message is used, saved with its list spelling. The result (possibly empty) is saved to `location`.

### 2. Property type, bedrooms, bathrooms

- `property_type` is saved as received.
- `bedrooms` and `bathrooms` are passed through `digits()`, so `2 bedrooms` becomes `2`.

### 3. Maximum rent

`max_rent` comes from `Price` (or an existing `max_rent` / `price`), with everything except digits removed, so `R15 000` becomes `15000`.

### 4. Price fallback

If `max_rent` is still empty, the script scans the message for numbers:

- Numbers may use spaces or commas as thousand separators (`12 500`, `12,500`) and may end in `k` (`15k` means 15 000).
- An optional `$` is allowed in front.
- The **largest** number found is chosen.
- It is saved only if it is **100 or more**, so small numbers like bedroom counts are ignored.

## Examples

| Situation | Result |
|-----------|--------|
| NER gives `Location` = `Sea Point`, `Property_Type` = `apartment`, `Bedrooms` = `2 bedrooms`, `Bathrooms` = `1`, `Price` = `R15 000` | `location` `Sea Point`, `property_type` `apartment`, `bedrooms` `2`, `bathrooms` `1`, `max_rent` `15000` |
| No NER values; message `Looking for a flat in Bellville under R12 500` | `location` `Bellville`, `max_rent` `12500`, the rest empty |
| No NER values; message `2 bedroom place in Paarl for 15k` | `location` `Paarl`, `max_rent` `15000` (the `2` is ignored as it is under 100) |
| No NER values; message `hello` | All five attributes empty |
| `Bedrooms` = `2-3` | `bedrooms` = `23` (see limitations) |
| `Price` = `15k` | `max_rent` = `15` (see limitations) |
| No NER values; message `call me on 0821234567` | `max_rent` = `821234567` (see limitations) |

## Known limitations

- **Digit stripping can merge numbers.** Ranges and decimals are joined: `2-3 bedrooms` gives `23`, and `R12 500.00` gives `1250000`.
- **A `k` suffix is lost when `Price` is set.** `Price` = `15k` becomes `15`. The `k` handling only applies in the message fallback, which runs only when `max_rent` is empty.
- **The fallback trusts the largest number.** Phone numbers, years, postcodes and listing IDs (for example `2026` or `BOOK_VIEWING:1042`) can be mistaken for rent.
- **`Cape Town CBD` is never returned.** `Cape Town` comes earlier in the list and is contained in it, so a message about Cape Town CBD gives `Cape Town`.
- **Area matching depends on list order.** If a message names several areas, the one earliest in the list wins, not the one mentioned first. Matching is by substring, with no word boundaries, and spelling variants such as `Seapoint` are not recognised.
- **Only 20 areas are known.** Other suburbs are missed unless NER supplies `Location`.
- **A NER location is not normalised.** It is saved exactly as received.
- **Number words are ignored.** `two bedrooms` and `studio` give an empty `bedrooms`.
- **No validation.** Nothing checks that bedrooms or bathrooms are reasonable, that rent is within a sensible range, or that the property type is one you support.
- **Rent wording.** The output is named `max_rent` and no currency is checked, so a buying budget would be stored the same way.
- **Existing values are overwritten.** All five attributes are set on every run.

## Customising

- **Add areas:** add names to the `locations` list. To fix the `Cape Town CBD` problem, put it before `Cape Town` or choose the longest matching name.
- **Match whole words:** use a word-boundary test instead of `includes`.
- **Keep the `k` multiplier:** run the same parsing used in the price fallback on `Price` as well, instead of `digits()`.
- **Handle ranges:** read the first number only, for example with `/\d+/`, or store a minimum and maximum.
- **Add sanity limits:** accept `max_rent` only within a realistic range, such as R1 000 to R100 000.
- **Avoid phone numbers and IDs:** ignore numbers longer than 6 digits or starting with `0`.
- **Add a validity flag:** set an attribute such as `criteria_complete` when all required values are present.
