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


# Sale Search Extractor

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). When a user describes a property they want to **buy**, such as "4 bedroom house in Durbanville around R2.5m", an earlier step (typically named entity recognition, or NER) may have filled in attributes like `Location` and `Price`. This script gathers those values, cleans them, fills gaps from the raw message where it can, and saves tidy search criteria for the property search.

It has the same structure as the rental search extractor, but it saves a sale `price` instead of `max_rent` and keeps only prices that look like sale prices.

## What it does

1. Reads each search criterion from the entity attributes, trying alternative attribute names.
2. If no location was found, looks for a known area name in the user's message.
3. Cleans the bedroom and bathroom values down to digits.
4. Reads the price, understanding formats such as `R1.5m`, `1 500 000` and `950k`.
5. If no usable price was found, looks for one in the message text.
6. Saves everything to the attributes used by the search.

## Attributes

### Inputs

For each row, the first non-empty attribute in the list is used.

| Criterion      | Attributes tried, in order              |
|----------------|-----------------------------------------|
| Location       | `Location`, `location`                  |
| Property type  | `Property_Type`, `property_type`        |
| Bedrooms       | `Bedrooms`, `bedrooms`                  |
| Bathrooms      | `Bathrooms`, `bathrooms`                |
| Price          | `Price`, `price`                        |
| User's message | `lastReceivedTextMessage`, `user_message`, `message` (used only for the fallbacks) |

### Outputs

| Attribute       | Content                                                                    |
|-----------------|----------------------------------------------------------------------------|
| `location`      | Area name (empty if none found).                                           |
| `property_type` | Property type exactly as received (empty if none).                         |
| `bedrooms`      | Digits only (empty if none).                                               |
| `bathrooms`     | Digits only (empty if none).                                               |
| `price`         | Whole number of rand as a string, only if it is R100 000 or more, otherwise empty. |

All five are always set, using an empty string when nothing was found. There is no validity flag, so the flow should check each attribute for an empty value to decide what to ask next.

## How it works

### Helper functions

| Function            | Purpose                                                                                      |
|---------------------|----------------------------------------------------------------------------------------------|
| `read(name)`        | Safely reads an attribute, returning a trimmed string, or `""` if it is missing or an error occurs. |
| `firstOf(names)`    | Returns the first non-empty value from a list of attribute names.                            |
| `digits(text)`      | Removes everything except the digits 0-9.                                                    |
| `parsePrices(text)` | Finds every number in some text and returns them as a list of numbers (see below).           |

### Price parsing

`parsePrices` lowercases the text and removes thousand separators (a space or comma between a digit and exactly three more digits). It then finds each number, with an optional decimal part and an optional suffix:

| Text             | Result    |
|------------------|-----------|
| `R1.5m`, `1.5 million` | 1500000 |
| `1 500 000`, `1,500,000` | 1500000 |
| `950k`           | 950000    |
| `$2000000`       | 2000000   |

Only the suffixes `k`, `m` and `million` are understood.

### Location

If `Location` or `location` is empty, the message is lowercased and checked against a hard-coded list of 20 areas:

> Bellville, Sea Point, Durbanville, Brackenfell, Century City, Cape Town, Parow, Goodwood, Table View, Stellenbosch, Somerset West, Milnerton, Blouberg, Hout Bay, Kommetjie, Cape Town CBD, Waterfront, Paarl, Constantia, Noordhoek

The **first area in the list** that appears anywhere in the message is used, saved with its list spelling. The result (possibly empty) is saved to `location`.

### Property type, bedrooms, bathrooms

- `property_type` is saved as received.
- `bedrooms` and `bathrooms` are passed through `digits()`, so `4 bedrooms` becomes `4`.

### Price

1. `SALE_MIN` is R100 000. Anything below it is not treated as a sale price.
2. The price is the **largest** number found in `Price` (or `price`), or 0 if there is none.
3. If that is below `SALE_MIN`, the **largest number in the message** is used instead.
4. If the final number is at least `SALE_MIN`, it is rounded and saved to `price` as text. Otherwise `price` is set to an empty string.

When a range is captured, such as `R1m - R2m`, the larger number (the upper budget) is used.

## Examples

| Situation | Result |
|-----------|--------|
| NER gives `Location` = `Durbanville`, `Property_Type` = `house`, `Bedrooms` = `4`, `Bathrooms` = `2`, `Price` = `R2.5m` | `location` `Durbanville`, `property_type` `house`, `bedrooms` `4`, `bathrooms` `2`, `price` `2500000` |
| No NER values; message `Looking to buy in Parow, budget 1 500 000` | `location` `Parow`, `price` `1500000`, the rest empty |
| No NER values; message `house for 950k in Paarl` | `location` `Paarl`, `price` `950000` |
| `Price` = `R1m - R2m` | `price` = `2000000` |
| `Price` = `R15 000` and no larger number in the message | `price` empty (below `SALE_MIN`) |
| No NER values; message `2 mil budget` | `price` empty (`mil` is not understood) |
| No NER values; message `call me on 0821234567` | `price` = `821234567` (see limitations) |
| No NER values; message `hello` | All five attributes empty |

## Known limitations

- **Prices under R100 000 are discarded.** The script is aimed at sales, so a rental-sized amount or a small budget gives an empty `price`. Because `price` is also one of the names it reads, a lowercase `price` attribute holding a smaller value is overwritten with an empty string.
- **The message fallback trusts the largest number.** Any number of 100 000 or more can be taken as the price, including phone numbers and long reference numbers.
- **Only `k`, `m` and `million` are understood.** `2 mil`, `2 mill` and `15 thousand` are read as 2 and 15, so they end up discarded.
- **A standalone `m` means million.** `5 m from the beach` is read as 5 000 000.
- **Separator joining can merge unrelated numbers.** A space or comma followed by exactly three digits is removed, so `3 100` in other text becomes 3100.
- **Digit stripping merges numbers in bedrooms and bathrooms.** `2-3 bedrooms` gives `23`, and number words such as `two` or `studio` give an empty value.
- **`Cape Town CBD` is never returned.** `Cape Town` comes earlier in the list and is contained in it, so the CBD entry is never reached.
- **Area matching depends on list order and substrings.** If a message names several areas, the one earliest in the list wins. There are no word boundaries, and spelling variants such as `Seapoint` are not recognised.
- **Only 20 areas are known.** Other suburbs are missed unless NER supplies `Location`. A NER location is saved exactly as received.
- **No validation or flag.** Nothing checks bedroom counts, property types or sensible price ranges.
- **Existing values are overwritten.** All five attributes are set on every run, though reading its own lowercase output names means earlier values survive when the new input has nothing.
- **Duplicate name.** The `Price` list repeats `"price"` twice. This is harmless, and the repeat can be removed or replaced with another attribute name.

## Differences from the rental search extractor

| Area                 | Rental extractor                          | Sale extractor                               |
|----------------------|-------------------------------------------|----------------------------------------------|
| Price output         | `max_rent`                                | `price`                                      |
| Minimum accepted     | Any value (message fallback needs 100 or more) | R100 000 or more only                   |
| Price parsing        | Digits only, `k` handled in the fallback only | Shared parser: `k`, `m`, `million`, separators, decimals |
| Message fallback runs when | `max_rent` is empty                 | The price from `Price` is below R100 000     |

## Customising

- **Change the sale threshold:** edit `SALE_MIN`.
- **Add `mil` and `thousand`:** extend the suffix list in the regex and add matching multipliers.
- **Ignore phone numbers and IDs:** skip numbers with more than 10 digits or a leading zero before taking the largest.
- **Add areas:** add names to the `locations` list, and put `Cape Town CBD` before `Cape Town` (or choose the longest match).
- **Match whole words:** use a word-boundary test instead of `includes`.
- **Add a validity flag:** set an attribute such as `criteria_complete` when all the values you need are present.

# Criteria Check (Sale)

A short JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). It looks at the property search attributes collected so far and sets two simple `yes`/`no` flags: whether the user has given **any** search criteria, and whether they have given a **location**. The flow can use these flags to decide what to ask next.

This is the buy-side version of the rental criteria check. The only difference is that it checks `price` instead of `max_rent`. It is designed to run after the sale search extractor, which fills in `location`, `property_type`, `bedrooms` and `price`.

## What it does

1. Checks whether any of `location`, `property_type`, `bedrooms` or `price` has a value.
2. Sets `has_criteria` to `'yes'` or `'no'` accordingly.
3. Checks whether `location` specifically has a value.
4. Sets `has_location` to `'yes'` or `'no'` accordingly.

## Attributes

### Inputs

| Attribute       | Used for                          |
|-----------------|-----------------------------------|
| `location`      | `has_criteria` and `has_location` |
| `property_type` | `has_criteria`                    |
| `bedrooms`      | `has_criteria`                    |
| `price`         | `has_criteria`                    |

### Outputs

| Attribute      | Value         | Meaning                                                 |
|----------------|---------------|---------------------------------------------------------|
| `has_criteria` | `yes` or `no` | At least one of the four search attributes has a value. |
| `has_location` | `yes` or `no` | `location` has a value (ignoring surrounding spaces).   |

## How it works

### `has_criteria`

Each of the four attribute names is read. A missing value is treated as an empty string, and the value is converted to text. `.some(...)` returns true as soon as one of them is not empty. The result is saved as `'yes'` or `'no'`.

### `has_location`

`location` is read, converted to text and trimmed. If anything is left, `has_location` is `'yes'`, otherwise `'no'`.

## Examples

| `location`  | `property_type` | `bedrooms` | `price`   | `has_criteria` | `has_location` |
|-------------|-----------------|------------|-----------|----------------|----------------|
| `Durbanville` | `house`       | `4`        | `2500000` | `yes`          | `yes`          |
| empty       | empty           | `3`        | empty     | `yes`          | `no`           |
| `Paarl`     | empty           | empty      | empty     | `yes`          | `yes`          |
| empty       | empty           | empty      | empty     | `no`           | `no`           |

## Typical use

A condition after this step can branch on the flags:

- `has_criteria` is `no`: ask the user what they are looking for.
- `has_criteria` is `yes` and `has_location` is `no`: ask which area they want.
- `has_location` is `yes`: go ahead and search, or ask about any other missing details.

## Known limitations

- **Bathrooms are not counted.** If the only thing the user gave is a bathroom count, `has_criteria` is `'no'`.
- **Only sale-sized prices count.** The sale search extractor saves `price` only when it is R100 000 or more, so a smaller budget leaves `price` empty and does not count as criteria.
- **Spaces are handled inconsistently.** `has_criteria` does not trim values but `has_location` does, so a `location` made only of spaces gives `has_criteria` `'yes'` and `has_location` `'no'`. The extractor trims its values, so this rarely happens in practice.
- **Only checks that a value exists.** It does not check that the value is sensible.
- **A numeric `0` counts as empty.** If the platform returns a real number `0` rather than the text `"0"`, it is treated as missing.
- **No error handling.** `attributeApi.get` is called without a `try/catch`, so an error from the platform would fail the step.
- **Always overwrites.** Both flags are recalculated and set every time the step runs.
- **Use the right version.** Running this version in a rental flow ignores `max_rent`, and running the rental version in a sale flow ignores `price`.

## Customising

- **Count more attributes:** add names such as `'bathrooms'` to the list.
- **Trim consistently:** add `.trim()` to the check in the `some` call.
- **Add more flags:** copy the `has_location` line for other attributes, for example `has_budget` for `price`.
- **Require a minimum:** replace `some` with a count of non-empty values to require, for example, at least two criteria.
- **Combine rent and sale:** include both `'max_rent'` and `'price'` in the list if one flow handles both.

# Results Check

A short JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). After a property search has run, the results are stored in an attribute called `search_results`. This script works out roughly how many results there are and sets a simple `yes`/`no` flag, `has_results`, so the flow can show listings or tell the user nothing matched.

## What it does

1. Reads the `search_results` attribute.
2. Counts the results, handling both real arrays and text (including JSON text).
3. Sets `has_results` to `'yes'` if the count is above zero, otherwise `'no'`.

## Attributes

| Attribute        | Direction | Description                                                      |
|------------------|-----------|------------------------------------------------------------------|
| `search_results` | In        | The search results, as an array or as text (for example a JSON string). |
| `has_results`    | Out       | `'yes'` if at least one result was counted, otherwise `'no'`.    |

The count itself is not saved, only the flag.

## How it works

The counting rules are applied in order:

| Value of `search_results`                       | How it is counted                                                |
|-------------------------------------------------|------------------------------------------------------------------|
| A real array                                    | The number of items in the array.                                |
| Missing (`undefined` or `null`)                 | 0                                                                |
| Anything else, converted to text and trimmed:   |                                                                  |
| - empty text or exactly `[]`                    | 0                                                                |
| - valid JSON that is an array                   | The number of items in the array.                                |
| - valid JSON that is not an array               | 1                                                                |
| - text that is not valid JSON                   | 1                                                                |

If anything throws an error while reading or counting, the count is 0. Finally, `has_results` is `'yes'` when the count is greater than 0.

## Examples

| `search_results`                         | Count | `has_results` |
|------------------------------------------|-------|---------------|
| Array with 3 listings                    | 3     | `yes`         |
| Empty array                              | 0     | `no`          |
| `[{"id":1},{"id":2}]` (text)             | 2     | `yes`         |
| `[]` (text)                              | 0     | `no`          |
| `[ ]` (text with a space)                | 0     | `no`          |
| empty text or not set                    | 0     | `no`          |
| `{"id":7,"name":"Sea Point flat"}` (text) | 1    | `yes`         |
| `Listing 1042`                           | 1     | `yes`         |
| `No results found`                       | 1     | `yes`         |
| `{"results":[]}` (text)                  | 1     | `yes`         |
| `null` (text)                            | 1     | `yes`         |

The last four rows show behaviours to watch for (see limitations).

## Typical use

A condition after this step branches on `has_results`:

- `yes`: show the listings.
- `no`: tell the user nothing matched and offer to change the criteria.

## Known limitations

- **Any other text counts as one result.** A message such as `No results found` or an error text from the search service is non-empty and not valid JSON, so it gives `has_results` = `'yes'`.
- **Wrapped responses count as one.** A JSON object such as `{"results":[]}` or `{"count":0}` is not an array, so it counts as 1 even when it contains no listings. The script only counts a response that is a bare array.
- **Other JSON values count as one.** The text `null`, `0`, `false`, `{}` or `""` all parse successfully and are not arrays, so each gives `'yes'`.
- **The count is only approximate for non-arrays.** Anything that isn't an array is counted as exactly 1.
- **No count is saved.** If the flow needs to say "I found 5 properties", the count has to be stored separately.
- **Errors look like "no results".** If reading the attribute fails, the count falls back to 0 and `has_results` is `'no'`, so a technical problem can look the same as an empty search.
- **Always overwrites.** `has_results` is set on every run.

## Customising

- **Save the count:** add `attributeApi.set('results_count', String(count));` before the last line.
- **Handle wrapped responses:** after parsing, look inside the object, for example `parsed.results` or `parsed.items`, and count that array.
- **Treat non-JSON text as no results:** set `count = 0` in the inner `catch` instead of `1`.
- **Ignore empty JSON values:** treat `null`, `0`, `false` and `{}` as zero results.
- **Separate errors from empty searches:** set a second flag, such as `results_error`, in the outer `catch`.
