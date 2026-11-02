# App Store listing

Text for App Store Connect, field by field. Copy each block as it is: the App Store shows plain
text, so the `•` bullets and capitalised headings in the description are deliberate.

The listing is English only. The menus are translated into 12 languages, but every puzzle uses
English words, so a translated listing would need to say so.

## App Information

| Field              | Value                                           |
| ------------------ | ----------------------------------------------- |
| Name               | Crosswordly                                     |
| Primary language   | English (U.S.)                                  |
| Bundle ID          | `ca.crosswordly.app`                            |
| SKU                | `crosswordly-ios`                               |
| Primary category   | Games, with the subcategories Word and Puzzle   |
| Secondary category | None (Education also fits, for the definitions) |
| Content rights     | See "Content rights" below                      |
| Age rating         | 4+ (answer None or No to every question)        |
| Price              | Free, in every country                          |

### Subtitle (30 characters max)

```text
Fit the Words, Fill the Grid
```

Alternative: `Crossword-Style Word Puzzles`

## Version 1.0

### Promotional text (170 characters max, can be changed without review)

```text
87 hand-built word puzzles. Find the words that fit together where the letters meet, and learn what each one means. No ads, no account, fully offline.
```

### Description (4,000 characters max)

```text
Every word has its place. Crosswordly turns the crossword inside out: instead of clues, you get the words, and your job is to work out where they go.

Each puzzle gives you a bank of 16 five-letter words, but only a few of them fit together. Place a word in a row or column and it stays only if its letters match every word it crosses. Find the words that fit, place them where the letters meet, and the grid clicks into place.

HOW TO PLAY
• Tap a word, then tap a row or column to place it. Or press and hold a word to drag it.
• Where two words cross, they share a letter.
• A word that clashes bounces back and shows which letters don't match.
• Fill every slot to solve the puzzle.

WHAT'S INSIDE
• 87 hand-built puzzles, from 2-word warm-ups to tricky 8-word grids
• A quick tutorial that teaches the rules in a minute
• Puzzles in all kinds of shapes, on grids up to 11 squares wide
• The definition of every word you place, so each solve teaches you something
• Statistics for each puzzle size

SHARE THE CHALLENGE
Solved a puzzle? Crosswordly turns your grid into a classic crossword, with definitions as the clues, and sends it to a friend as a link. They can solve it in any web browser, no app needed. You can also save a picture of your finished grid.

PLAY YOUR WAY
• Fully offline: play on a plane, on the subway, anywhere
• No ads, no in-app purchases, no account
• No data collected; your progress stays on your device
• Made for iPhone and iPad; on iPad it works in any orientation, in Split View and in Stage Manager
• Haptic feedback as words snap into place
• Screen reader labels and full keyboard controls
• Menus in 12 languages: English, Spanish, French, German, Portuguese, Russian, Chinese, Japanese, Korean, Hindi, Arabic and Hebrew

All puzzles use English words.
```

### Keywords (100 characters max, commas, no spaces)

```text
crossword,criss,cross,puzzle,brain,logic,vocabulary,offline,teaser,deduction,mini,word,casual
```

The name and subtitle are indexed already, so their words (fit, words, fill, grid) are left out.
"crossword" stays in because search may not find it inside "Crosswordly". Don't add other games'
names: guideline 2.3.7 rejects listings that use them.

### URLs and copyright

| Field              | Value                                                |
| ------------------ | ---------------------------------------------------- |
| Support URL        | `https://github.com/evgenyvinnik/crosswordly/issues` |
| Marketing URL      | `https://crosswordly.ca`                             |
| Privacy policy URL | `https://crosswordly.ca/privacy.html`                |
| Copyright          | `2026 Evgeny Vinnik`                                 |

### Screenshots

| Display     | Folder                                       |
| ----------- | -------------------------------------------- |
| 6.9" iPhone | `resources/app-store/screenshots/iphone-6.9` |
| 13" iPad    | `resources/app-store/screenshots/ipad-13`    |

Upload them in file-name order; the App Store scales them down for smaller devices.

### App Review Information

Sign-in required: **No**. Fill in your name, phone number and email.

Notes (4,000 characters max):

```text
Crosswordly is a single-player word puzzle game. No account or sign-in is needed, and it is fully playable offline: all puzzles, fonts and assets are bundled in the app, and progress is stored only on the device.

How to play: tap a word in the word bank, then tap a highlighted row or column on the grid to place it, or press and hold a word to drag it. Crossing words must share the same letter. The first level is a guided tutorial; to solve it, place START in the across slot and GAMER in the down slot.

Native features: haptic feedback when words are selected, placed or rejected; the iOS share sheet for sharing a puzzle link or saving an image of the solved grid; and layouts made for iPhone and iPad, including every iPad orientation, Split View and Stage Manager.

The app collects no data and has no ads, in-app purchases or analytics.
```

## App Privacy

Choose **"No, we do not collect data from this app"**, which gives the **Data Not Collected**
label. Analytics are switched off in the app, the fonts are bundled, and the game makes no network
requests while you play.

## Content rights

App Store Connect asks whether the app contains, shows or accesses third-party content. The
puzzle words and their definitions in `src/words/words.ts` are the only candidate, and the repo
doesn't record where the definitions came from.

- If you wrote them, or adapted them yourself: answer **No**.
- If they came from a dictionary such as WordNet: answer **Yes**, then confirm you have the
  rights. WordNet's licence allows this as long as its copyright notice is included, for example
  on the About screen.
