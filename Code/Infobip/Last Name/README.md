# Surname Cleaner

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). When a bot asks "What's your surname?", users often reply with a phrase such as `My surname is van der Merwe.`. This script strips the lead-in phrase, checks that what remains looks like a surname, and saves it with a validity flag. It is the surname counterpart of the first name cleaner, but it allows multi-word surnames.

## What it does

1. Reads the `client_lname` attribute.
2. Removes a leading phrase such as "my surname is" or "I'm".
3. Tidies punctuation, apostrophes, dashes and spaces.
4. Checks that the result contains only letters, apostrophes, hyphens and single spaces between words, with at most 5 words.
5. Saves the result and a validity flag.

## Attributes

| Attribute      | Direction | Description                                                           |
|----------------|-----------|-----------------------------------------------------------------------|
| `client_lname` | In / Out  | Raw user reply on input. Overwritten with the cleaned surname on output. |
| `lname_valid`  | Out       | `'true'` if a valid surname was extracted, otherwise `'false'`.       |

**Important:** when the reply fails validation, `client_lname` is set to an empty string, so the original reply is cleared. Branch on `lname_valid` to re-ask the question.

## How it works

### 1. Removing the lead-in phrase

The raw value is trimmed, then one phrase is removed from the start (case-insensitive, and it must be followed by a space). The phrases are:

| Group                | Examples matched                                                        |
|----------------------|-------------------------------------------------------------------------|
| "my ... name" forms  | `my surname is`, `my last name is`, `my family name's`, `my lastname`   |
| "... name" forms     | `surname is`, `last name is`, `family name`                             |
| General lead-ins     | `it's`, `its`, `i am`, `i'm`, `im`, `this is`                           |

`sur`, `last` and `family` can be followed by `name` with or without a space, so `surname`, `sur name` and `last name` all work.

Trailing `.`, `,`, `!` and `?` are then removed and the text is trimmed again.

### 2. Normalising

- Curly apostrophes (`’` and `‘`) become straight apostrophes (`'`).
- Unicode dashes (`‐ ‑ ‒ – — ―`) become a normal hyphen (`-`).
- Runs of whitespace become a single space.

### 3. Validating

Each word must be made of letters (including accented Latin letters such as `é` and `ö`), with an apostrophe or hyphen allowed only **between** letters. Words are separated by single spaces. The whole value must have **5 words or fewer**.

| Accepted                          | Rejected                                        |
|-----------------------------------|-------------------------------------------------|
| `Dlamini`                         | `Dlamini123` (digits)                           |
| `van der Merwe`, `Le Roux`        | `Dlamini!` or `@dlamini` (symbols)              |
| `O'Connor`, `D'Angelo`            | `-Dlamini`, `Dlamini-`, `'Dlamini` (edge hyphen or apostrophe) |
| `Smith-Jones`                     | `Smith--Jones`, `O''Connor` (doubled)           |
|                                   | A reply of 6 or more words                      |
|                                   | An empty reply                                  |

### 4. Saving

If valid, the cleaned text is saved to `client_lname` and `lname_valid` is `'true'`. Otherwise `client_lname` becomes `''` and `lname_valid` is `'false'`.

## Examples

| User types                       | `client_lname` becomes | `lname_valid` |
|----------------------------------|------------------------|---------------|
| `Dlamini`                        | `Dlamini`              | `true`        |
| `My surname is Dlamini.`         | `Dlamini`              | `true`        |
| `last name is van der Merwe`     | `van der Merwe`        | `true`        |
| `Smith-Jones`                    | `Smith-Jones`          | `true`        |
| `Mokoena  Jr.`                   | `Mokoena Jr`           | `true`        |
| `dlamini`                        | `dlamini`              | `true`        |
| `Dlamini123`                     | empty                  | `false`       |
| `last name: Dlamini`             | empty                  | `false`       |
| `I would like to book a viewing please` | empty           | `false`       |

## Known limitations

- **No capitalisation.** Unlike the first name script, case is left as typed, so `dlamini` stays `dlamini` and `VAN DER MERWE` stays in capitals. Capitalise later in the flow if needed.
- **Curly apostrophes in lead-ins.** Apostrophes are normalised after the lead-in is stripped, so `I’m Dlamini` (as typed by many phone keyboards) is not stripped and is saved as `I'm Dlamini`. Moving the apostrophe normalisation to the top of the script fixes it.
- **Greetings and plain "my name is" are not stripped.** `Hi Dlamini` and `My name is Dlamini` both pass as a multi-word surname and are saved as typed.
- **Short sentences can pass.** Validation checks the shape of the text, not whether it is a real surname, so a reply of up to 5 plain words (such as `Thanks` or `I want to book`) is accepted.
- **Labels with colons are rejected.** `Surname: Dlamini` fails because the colon is not an allowed character.
- **Lead-in words can eat real surnames.** A surname written as `Im Thurn` would lose the `Im`.
- **Latin letters only.** Characters outside the allowed ranges (for example `Ł`, or non-Latin scripts) fail validation.
- **Interior full stops fail.** `Mc. Donald` is rejected, though a trailing one (`Jr.`) is removed first.
- **No length limit per word.**
- **Non-text values.** The script expects a string (or empty). A numeric attribute value would cause an error on `.trim()`.

## Customising

- **Allow more or fewer words:** change the `> 5` limit in the final check.
- **Add lead-in phrases:** extend the alternation in the first `.replace`.
- **Strip greetings:** add a greeting removal step like the first name script, with a word boundary (`\b`) so surnames starting with `Hi` or `Hey` are not damaged.
- **Capitalise words:** lowercase the text and capitalise each word, keeping particles such as `van` and `de` lowercase if you prefer.
- **Allow more characters:** widen the `letters` range or use a Unicode pattern such as `\p{L}` with the `u` flag.
