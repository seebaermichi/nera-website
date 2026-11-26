# Check the first deploy with the theme demos

- **Issue:** `01a20dd9-51aa-7153-a4da-1a47318e938a`
- **Kind:** check
- **Since:** -

1. After the push, watch the "Deploy to GitHub Pages" run: `gh run watch -R seebaermichi/nera-website $(gh run list -R seebaermichi/nera-website -w deploy.yml -L 1 --json databaseId -q '.[0].databaseId')`.
   The first run has a cold image cache and encodes the Ansitz and Umwege photographs: expect several minutes for "Build the theme demos". Note the duration of that step and of the whole run (the issue's acceptance criterion asks for the deploy time).
2. Run it a second time (`gh workflow run deploy.yml -R seebaermichi/nera-website`) and confirm the log shows the cache restored (`Cache restored from key: theme-demos-<versions>`) and a shorter "Build the theme demos" step.
3. Open https://nera.js.org/themes/blog/plain/, `/stack/`, `/ansitz/`, `/umwege/`: each home renders with its pictures and fonts, the footer shows "A demo of the <Theme> theme for Nera." and its Imprint/Privacy open nera.js.org's legal notice and privacy pages.
4. The Umwege search overflow at 390 px is fixed only once `@nera-static/theme-umwege` 1.1.1 is tagged and published; the deploy after that release picks it up (the demos install the latest starter and theme).

Not covered: whether search engines honour the `noindex` — check Search Console only if demo pages ever show up in results.
