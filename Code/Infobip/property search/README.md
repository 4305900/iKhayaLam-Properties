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

# Criteria Check
 
A short JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It looks at the rental search attributes collected so far and sets two simple `yes`/`no` flags: whether the user has given **any** search criteria, and whether they have given a **location**. The flow can use these flags to decide what to ask next.
 
It is designed to run after the rental search extractor, which fills in `location`, `property_type`, `bedrooms` and `max_rent`.
 
## What it does
 
1. Checks whether any of `location`, `property_type`, `bedrooms` or `max_rent` has a value.
2. Sets `has_criteria` to `'yes'` or `'no'` accordingly.
3. Checks whether `location` specifically has a value.
4. Sets `has_location` to `'yes'` or `'no'` accordingly.
## Attributes
 
### Inputs
 
| Attribute       | Used for                       |
|-----------------|--------------------------------|
| `location`      | `has_criteria` and `has_location` |
| `property_type` | `has_criteria`                 |
| `bedrooms`      | `has_criteria`                 |
| `max_rent`      | `has_criteria`                 |
 
### Outputs
 
| Attribute      | Value          | Meaning                                              |
|----------------|----------------|------------------------------------------------------|
| `has_criteria` | `yes` or `no`  | At least one of the four search attributes has a value. |
| `has_location` | `yes` or `no`  | `location` has a value (ignoring surrounding spaces). |
 
## How it works
 
### `has_criteria`
 
Each of the four attribute names is read. A missing value is treated as an empty string, and the value is converted to text. `.some(...)` returns true as soon as one of them is not empty. The result is saved as `'yes'` or `'no'`.
 
### `has_location`
 
`location` is read, converted to text and trimmed. If anything is left, `has_location` is `'yes'`, otherwise `'no'`.
 
## Examples
 
| `location` | `property_type` | `bedrooms` | `max_rent` | `has_criteria` | `has_location` |
|------------|-----------------|------------|------------|----------------|----------------|
| `Sea Point` | `apartment`    | `2`        | `15000`    | `yes`          | `yes`          |
| empty      | empty           | `2`        | empty      | `yes`          | `no`           |
| `Bellville`| empty           | empty      | empty      | `yes`          | `yes`          |
| empty      | empty           | empty      | empty      | `no`           | `no`           |
 
## Typical use
 
A condition after this step can branch on the flags:
 
- `has_criteria` is `no`: ask the user what they are looking for.
- `has_criteria` is `yes` and `has_location` is `no`: ask which area they want.
- `has_location` is `yes`: go ahead and search, or ask about any other missing details.
## Known limitations
 
- **Bathrooms are not counted.** If the only thing the user gave is a bathroom count, `has_criteria` is `'no'`.
- **Spaces are handled inconsistently.** `has_criteria` does not trim values but `has_location` does, so a `location` made only of spaces gives `has_criteria` `'yes'` and `has_location` `'no'`. The rental search extractor trims its values, so this rarely happens in practice.
- **Only checks that a value exists.** It does not check that the value is sensible, for example a `max_rent` of `0` still counts as criteria.
- **A numeric `0` counts as empty.** If the platform returns a real number `0` rather than the text `"0"`, it is treated as missing.
- **No error handling.** Unlike the helper functions in the extractor, `attributeApi.get` is called without a `try/catch`, so an error from the platform would fail the step.
- **Always overwrites.** Both flags are recalculated and set every time the step runs.
## Customising
 
- **Count more attributes:** add names such as `'bathrooms'` to the list.
- **Trim consistently:** add `.trim()` to the check in the `some` call.
- **Add more flags:** copy the `has_location` line for other attributes, for example `has_budget` for `max_rent`.
- **Require a minimum:** replace `some` with a count of non-empty values to require, for example, at least two criteria.

# Listing Type Detector

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It works out whether a user is looking to **rent** or to **buy** by reading their message for keywords, and, if there are none, by looking at the price they mention. The result is saved as `listing_type`.

## What it does

1. Reads the user's latest message and any price captured earlier (for example by NER).
2. Turns price text such as `R15 000`, `15k` or `2.5m` into a number.
3. Looks for rent or buy keywords in the message.
4. If no keyword is found, decides from the size of the price.
5. Saves `rent`, `buy` or an empty string as `listing_type`.

## Attributes

### Inputs

| Attribute                                              | Description                                                   |
|--------------------------------------------------------|---------------------------------------------------------------|
| `Price`, `price`                                       | Price captured earlier (first non-empty is used).             |
| `lastReceivedTextMessage`, `user_message`, `message`   | The user's message (first non-empty is used).                 |

### Output

| Attribute      | Value                         | Meaning                                       |
|----------------|-------------------------------|-----------------------------------------------|
| `listing_type` | `rent`, `buy`, or empty       | The detected type. Empty means it couldn't tell. |

## How it works

### Helper: `read(name)`

Reads an attribute safely and returns a trimmed string, or an empty string if the value is missing or an error occurs.

### Helper: `parsePrices(text)`

Finds every number in a piece of text and returns them as a list of numbers.

1. The text is lowercased and **thousand separators are removed**: a space or comma between a digit and exactly three more digits is dropped, so `12 500` and `1,250,000` become `12500` and `1250000`.
2. Every number is found, with an optional decimal part and an optional suffix: `k`, `m`, `million`, `mil`, `thousand` or `thou`.
3. Suffix handling:

| Suffix            | Effect                    | Example            |
|-------------------|---------------------------|--------------------|
| `k`               | multiplied by 1 000       | `15k` gives 15000  |
| `m` or `million`  | multiplied by 1 000 000   | `2.5m` gives 2500000 |
| `mil`, `thousand`, `thou` | **no multiplier** (see limitations) | `2 mil` gives 2 |

### Choosing the price

- The price is the **largest** number found in `Price` (or `price`), or 0 if there is none.
- If that is below `RENT_MIN` (1 000), the largest number found in the **message** is used instead.

### Constants

| Constant   | Value    | Meaning                                                       |
|------------|----------|---------------------------------------------------------------|
| `SALE_MIN` | 100 000  | A price at or above this is treated as a sale price.          |
| `RENT_MIN` | 1 000    | A price from here up to just under `SALE_MIN` is treated as monthly rent. |

### Deciding the type

The first rule that matches wins:

| Order | Rule                                                                 | Result |
|-------|----------------------------------------------------------------------|--------|
| 1     | Message contains `rent`, `renting`, `to let`, `per month`, `pm`, `p/m` or `monthly` (whole words) | `rent` |
| 2     | Message contains `buy`, `buying`, `purchase`, `for sale` or `bond` (whole words) | `buy`  |
| 3     | Price is 100 000 or more                                             | `buy`  |
| 4     | Price is 1 000 or more                                               | `rent` |
| 5     | None of the above                                                    | empty  |

The result is **always** saved to `listing_type`, even when it is empty.

## Examples

| Message (no earlier price)             | `listing_type` | Why                                          |
|----------------------------------------|----------------|----------------------------------------------|
| `Looking to rent in Sea Point`         | `rent`         | Keyword `rent`.                              |
| `I want to buy a 3 bedroom house`      | `buy`          | Keyword `buy`.                               |
| `Flat for 15k per month`               | `rent`         | Keyword `per month`.                         |
| `2 bedroom flat under R15 000`         | `rent`         | No keyword, price 15 000 is in the rent range. |
| `House for R2.5m`                      | `buy`          | No keyword, price 2 500 000 is a sale price. |
| `Something around 1.2 million`         | `buy`          | No keyword, price 1 200 000.                 |
| `Hi there`                             | empty          | No keyword and no price.                     |
| `2 mil budget`                         | empty          | `mil` isn't multiplied, so the price is 2.   |
| `Can I view at 3 pm?`                  | `rent`         | `pm` is read as "per month".                 |
| `BOOK_VIEWING:1042`                    | `rent`         | The listing ID 1042 is read as a rent price. |
| `Call me on 0821234567`                | `buy`          | The phone number is read as a sale price.    |

## Known limitations

- **It always overwrites `listing_type`.** If a value was set earlier, for example from the website listing type, this script replaces it, and replaces it with an empty string when it finds nothing. Run it before other steps that set `listing_type`, or only save when something was detected.
- **`mil`, `thousand` and `thou` are recognised but not multiplied.** `2 mil` gives 2 and `15 thousand` gives 15, so the price is far too small.
- **A standalone `m` means million.** `80 m from the beach` is read as 80 000 000 and gives `buy`.
- **Keywords can mislead and beat the price.** `pm` matches `3 pm` (but not `3pm`), `monthly` matches `monthly bond repayment`, and rent keywords are checked before buy keywords. Words such as `rental` or `rentals` are not matched because whole words are required.
- **The largest number in the message wins.** Phone numbers, years, postcodes and listing IDs can be taken as prices.
- **Separator joining can merge unrelated numbers.** A space or comma followed by exactly three digits is removed, so `3 100` in other text becomes 3100.
- **Fixed rand thresholds.** Rent of R100 000 or more is treated as a sale, a sale price under R100 000 can't be detected, and amounts under R1 000 are ignored.
- **Decimal commas and dots.** `12.500` (European style) is read as 12.5.
- **No confidence information.** An empty result simply means it couldn't tell.
- **Single message only.** Only the first non-empty message attribute is read.

## Customising

- **Don't clear an existing value:** wrap the last line in `if (listingType) { ... }`, or only set when `listing_type` is currently empty.
- **Fix the missing multipliers:** add `mil` and `thousand`/`thou` cases next to the `k` and `m` checks.
- **Add keywords:** for example `rental`, `rentals`, `lease`, `for rent`, `house for sale`.
- **Change thresholds:** edit `SALE_MIN` and `RENT_MIN`.
- **Ignore phone numbers and IDs:** skip numbers with more than 8 digits or a leading zero before taking the largest.
- **Require a currency marker:** only count numbers preceded by `R`, or followed by `k`, `m` or `million`.


