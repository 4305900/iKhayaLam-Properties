# Website Listing Intake

Two small JavaScript snippets for chatbot flow script steps that use an `attributeApi` object (for example Infobip Answers). When a user arrives from a property listing on the website, the website passes along the listing's ID and whether it is for rent or for sale. These scripts check that information and copy it into the attributes the rest of the booking flow uses.

| Script | Reads                  | Writes                                              |
|--------|------------------------|-----------------------------------------------------|
| 1. Listing type | `website_listing_type` | `listing_type`                              |
| 2. Listing ID   | `website_listing_id`   | `selected_property_id`, `property_id`, `valid_selection` |

The two scripts are independent, so they can run in either order. Script 2 follows naturally after the website entry step, which is what sets `website_listing_id` from a `BOOK_VIEWING:<id>` message.

---

## Script 1: Listing type

```javascript
const type = (
    attributeApi.get('website_listing_type') || ''
).toString().trim().toLowerCase();

if (type === 'rent' || type === 'buy') {
    attributeApi.set('listing_type', type);
}
```

### What it does

Reads the listing type from the website, tidies it, and saves it as `listing_type` only if it is exactly `rent` or `buy`.

### Attributes

| Attribute              | Direction | Description                                         |
|------------------------|-----------|-----------------------------------------------------|
| `website_listing_type` | In        | The raw listing type passed from the website.       |
| `listing_type`         | Out       | `rent` or `buy`. Set only when the input is valid.  |

### How it works

1. The value is converted to a string (empty if missing), trimmed and lowercased, so `Rent`, ` BUY ` and `rent` all work.
2. If the result is exactly `rent` or `buy`, it is saved to `listing_type` in lowercase.
3. Otherwise nothing happens.

### Examples

| `website_listing_type` | `listing_type`         |
|------------------------|------------------------|
| `rent`                 | `rent`                 |
| `Buy`                  | `buy`                  |
| `  RENT  `             | `rent`                 |
| `sale`                 | not set                |
| `to rent`              | not set                |
| empty or missing       | not set                |

---

## Script 2: Listing ID

```javascript
const raw = (
    attributeApi.get('website_listing_id') || ''
).toString().trim();

if (/^[1-9][0-9]*$/.test(raw)) {
    attributeApi.set('selected_property_id', raw);
    attributeApi.set('property_id', raw);
    attributeApi.set('valid_selection', 'yes');
} else {
    attributeApi.set('valid_selection', 'no');
}
```

### What it does

Checks that the listing ID from the website is a positive whole number. If it is, the ID is copied into the attributes the booking flow uses and `valid_selection` is set to `'yes'`. If not, only `valid_selection` is set, to `'no'`.

### Attributes

| Attribute              | Direction | Description                                                      |
|------------------------|-----------|------------------------------------------------------------------|
| `website_listing_id`   | In        | The raw listing ID passed from the website.                      |
| `selected_property_id` | Out       | The validated ID, used by the chatbot as the selected listing.   |
| `property_id`          | Out       | The same ID, kept so the existing booking flow keeps working.    |
| `valid_selection`      | Out       | `'yes'` if the ID is valid in format, otherwise `'no'`.          |

### How it works

1. The value is converted to a string (empty if missing) and trimmed.
2. It is tested against `^[1-9][0-9]*$`: digits only, starting with 1-9 (no leading zero, so `0` is rejected), with the whole value matching.
3. On a match, the ID is saved to both `selected_property_id` and `property_id`, and `valid_selection` is `'yes'`.
4. Otherwise `valid_selection` is `'no'`.

The ID is kept as a string, so large numbers are not altered.

### Examples

| `website_listing_id` | `selected_property_id` / `property_id` | `valid_selection` |
|----------------------|----------------------------------------|-------------------|
| `1042`               | `1042`                                 | `yes`             |
| `  85  `             | `85`                                   | `yes`             |
| `0`                  | not set                                | `no`              |
| `007`                | not set                                | `no`              |
| `12a`                | not set                                | `no`              |
| `-5`                 | not set                                | `no`              |
| `10.5`               | not set                                | `no`              |
| empty or missing     | not set                                | `no`              |

---

## Typical use

1. The website opens the chat with a listing ID (and type).
2. The flow runs both scripts.
3. A condition checks `valid_selection`:
   - `yes`: continue with the chosen property (and use `listing_type` if it is set).
   - `no`: ask the user which property they mean.

## Known limitations

- **Script 1 gives no feedback.** There is no validity flag, so an unrecognised type simply leaves `listing_type` untouched. Check whether `listing_type` is set, or ask the user, when it matters.
- **Only `rent` and `buy` are accepted.** Other wording from the website, such as `sale`, `for sale` or `rental`, is ignored.
- **Old values are not cleared on failure.** If a later run fails, `listing_type`, `selected_property_id` and `property_id` keep any earlier values. Use `valid_selection` to tell whether the current ID is good.
- **The ID is only format-checked.** `valid_selection` means valid in format. It does not confirm that the listing exists or is still available.
- **No upper limit** on the ID length.
- **Two destination attributes.** `property_id` and `selected_property_id` always hold the same value, so keep them in sync if you change one script.

## Customising

- **Accept more types:** extend the condition in Script 1, or map other words onto `rent` or `buy` before saving.
- **Flag a bad type:** add an `else` branch that sets a flag such as `listing_type_valid` to `'no'`.
- **Clear stale values on failure:** in the `else` branch of Script 2, set `selected_property_id` and `property_id` to `''`.
- **Allow non-numeric IDs:** widen the pattern, for example to `^[A-Za-z0-9-]+$`.
- **Check the listing exists:** follow Script 2 with an API or lookup step that confirms the ID.
