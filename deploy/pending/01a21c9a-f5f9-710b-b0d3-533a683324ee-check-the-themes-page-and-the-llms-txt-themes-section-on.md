# Check the themes page and the llms.txt Themes section on nera.js.org

- **Issue:** `01a21c9a-f5f9-710b-b0d3-533a683324ee`
- **Kind:** check
- **Since:** -

1. Wait for the deploy workflow to finish green (it runs `npm run build:demos` and `npm run check:demos` after the site build).
2. Open https://nera.js.org/themes/index.html and https://nera.js.org/de/themes/index.html: five cards with screenshots; the four Demo links open `/themes/blog/plain/`, `/stack/`, `/ansitz/`, `/umwege/`; theme-business has no Demo link.
3. Check the header shows "Themes" between Plugins and Tutorials, and the home hero has a third button "Browse themes".
4. Run `curl -s https://nera.js.org/llms.txt | grep -A6 '^## Themes'`: five lines, four with `Demo:`.

Not covered: the Spanish pages stay hidden from the language switch (pending review), so `/es/themes/` is reachable only by URL.
