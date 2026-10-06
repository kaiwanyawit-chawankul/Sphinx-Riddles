# Google Play listing copy (Sphinx Riddles)

Use these exact values in Play Console **and** when regenerating the PWABuilder / TWA package. Do not paste the app name into the short or full description.

## App name (title, max 30)

Sphinx Riddles

## Short description (max 80, must differ from title)

One developer riddle at a time. Show the answer, like it, then get the next.

## Full description

Sphinx Riddles shows one programming riddle at a time in a dark, minimal screen.

How to play:
- Read the riddle.
- Tap Show Answer to reveal the solution.
- Tap Next Riddle to load another puzzle.
- Tap Like if you enjoyed it. Likes only increase. There is no unlike and no account.

Riddles use a Sphinx-like tone about real software work: bugs, deploys, tools, technical debt, and team habits.

There is no login, chat, feed, or social network. The app is a single riddle screen. If new riddles cannot be loaded, it shows “Sphinx is sleeping.”

## After you deploy the website

1. Ship `public/manifest.json` to https://sphinx-riddles.vercel.app/ so PWABuilder reads the new `name`, `short_name`, and `description`.
2. Rebuild the Android package in PWABuilder. Confirm App name is **Sphinx Riddles** and App description is the **short description** above, not `${APPLICATION_NAME}` and not a copy of the title.
3. In Play Console → Store presence → Main store listing, paste the three fields above. Add screenshots of the actual riddle screen (not PWABuilder placeholders).
4. Upload the new AAB and resubmit.

These two rejections were caused by the listing using the app name as the description, which does not describe Show Answer, Next Riddle, or Like.
