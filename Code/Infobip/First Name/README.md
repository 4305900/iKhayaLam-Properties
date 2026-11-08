# First Name Cleaner

A JavaScript snippet for a chatbot flow script step that uses an `attributeApi` object (for example Infobip Answers). When a bot asks "What's your first name?", users often reply with a whole sentence such as `Hi, my name is thabo!`. This script strips the greeting and intro phrase, picks out the name, checks that it looks like a real name, and saves it in a tidy format.

## What it does

1. Reads the `client_fname` attribute.
2. Removes a leading greeting and a leading "my name is"-style phrase.
3. Takes the first word, as long as the reply is 3 words or fewer.
4. Checks that the word contains only letters, apostrophes and hyphens in sensible positions.
5. Capitalises the first letter.
6. Saves the result and a validity flag.

## Attributes

| Attribute      | Direction | Description                                                           |
|----------------|-----------|-----------------------------------------------------------------------|
| `client_fname` | In / Out  | Raw user reply on input. Overwritten with the cleaned name on output. |
| `fname_valid`  | Out       | `'true'` if a valid name was extracted, otherwise `'false'`.          |

**Important:** when no valid name is found, `client_fname` is set to an empty string, so the original reply is cleared. Branch on `fname_valid` to re-ask the question.

## How it works

### 1. Cleaning the reply

The raw value is trimmed, then these steps run in order, all case-insensitive:

1. **Greeting removed** from the start: `hi`, `hello` or `hey`, plus any following commas, exclamation marks or spaces.
2. **Intro phrase removed** from the start (must be followed by a space): `my name is`, `my name's`, `my name`, `i am`, `i'm`, `im`, `it's`, `its`, `this is`, `call me`, `name is`.
3. **Trailing punctuation removed**: any run of `.`, `,`, `!` or `?` at the end.
4. The result is trimmed again.

So `Hi, my name is thabo!` becomes `thabo`.

### 2. Picking the name

The cleaned text is split on whitespace.

- **1 to 3 words:** the first word is used as the name.
- **0 words, or 4 or more:** no name. A long reply is assumed to be a sentence rather than a name.

This means `Thabo Mokoena` gives `Thabo`, and `Thabo please` also gives `Thabo`.

### 3. Validating the name

Curly apostrophes (`’` and `‘`) are first converted to straight ones (`'`). The word must then match this pattern:

- Made of letters only, including accented Latin letters (À-Ö, Ø-ö, ø-ÿ), so `Zoë` and `José` are fine.
- An apostrophe or hyphen is allowed **only between letters**.

| Accepted               | Rejected                                   |
|------------------------|--------------------------------------------|
| `Thabo`, `Zoë`         | `Thabo123` (digits)                        |
| `O'Brien`, `D'Angelo`  | `Thabo!` or `@thabo` (symbols)             |
| `Anne-Marie`           | `-Thabo`, `Thabo-`, `'Thabo` (edge hyphen or apostrophe) |
|                        | `Anne--Marie`, `O''Brien` (doubled)        |

A failed check sets the name to an empty string.

### 4. Formatting and saving

The first letter is capitalised and the rest is left as typed. The script then sets `client_fname` to the name (or `''`) and `fname_valid` to `'true'` or `'false'`.

## Examples

| User types                              | `client_fname` becomes | `fname_valid` |
|-----------------------------------------|------------------------|---------------|
| `Thabo`                                 | `Thabo`                | `true`        |
| `thabo`                                 | `Thabo`                | `true`        |
| `Hi, my name is thabo!`                 | `Thabo`                | `true`        |
| `I'm Sipho Dlamini`                     | `Sipho`                | `true`        |
| `call me Zee`                           | `Zee`                  | `true`        |
| `anne-marie`                            | `Anne-marie`           | `true`        |
| `o'brien`                               | `O'brien`              | `true`        |
| `THABO`                                 | `THABO`                | `true`        |
| `Thabo123`                              | empty                  | `false`       |
| `Hello`                                 | empty                  | `false`       |
| `My name is Thabo and I want to view`   | empty                  | `false`       |

## Known limitations

- **Names starting with Hi, Hey or Hello are damaged.** The greeting pattern has no word boundary, so `Hilda` becomes `Lda`, `Hiram` becomes `Ram` and `Heyward` becomes `Ward`. Adding `\b` after the group fixes it: `/^(hi|hello|hey)\b[,!\s]*/i`.
- **Curly apostrophes in intro phrases.** Curly apostrophes are normalised only after the intro phrases are stripped, so `I’m Thabo` (as typed by many phone keyboards) is not stripped and gives `I'm`. Normalising before the replacements would fix this.
- **Only the first word is kept.** Names with a space, such as `Mary Jane`, are shortened to `Mary`.
- **Any short reply passes.** The check is about the shape of the word, not whether it is a real name, so `yes` or `no thanks` give `Yes` and `No`.
- **Only the start of the reply is cleaned.** Greetings after an intro, and forms like `Name: Thabo`, are not handled.
- **Case is only partly fixed.** Only the first letter is changed, so `anne-marie` becomes `Anne-marie` and `THABO` stays `THABO`.
- **Latin letters only.** Characters outside the listed ranges (for example `Ł`, or non-Latin scripts) fail validation.
- **No length limit** on the name.
- **Non-text values.** The script expects a string (or empty). A numeric attribute value would cause an error on `.trim()`.

## Customising

- **Add greetings or intro phrases:** extend the alternation lists in the two `.replace` calls.
- **Allow longer replies:** change the `words.length <= 3` limit.
- **Keep double-barrelled names:** join the first two words instead of using only `words[0]`.
- **Fix capitalisation fully:** lowercase the name first, then capitalise the first letter and any letter after a hyphen or apostrophe.
- **Allow more scripts or characters:** widen the `letters` range or switch to a Unicode property pattern such as `\p{L}` with the `u` flag.
