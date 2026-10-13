# Result — Tutorial "Add client-side search" (01a136ac-bc82-70f7-9a8f-aaef6fddb2c3)

## Plan

1. Re-confirm the site half on `main`: vendor `search.pug` has the 2.3.0 markup,
   `search_title`/`search_placeholder`/`search_label` in en/de/es,
   `^2.3.0` in `package.json`, and `npm run build -- --check` is clean.
2. Throwaway site (`nera new`, plugin-search 2.3.0): check which of
   `excerpt`/`description` the scaffold's pages carry, the real layout name,
   the include path, the plugin-order short name, the publish/skip/`--force`
   behaviour and where the index lands.
3. Edit the three tutorials (`pages/`, `pages/de/`, `pages/es/`), edits not a
   rewrite, keeping 5 `## ` sections each:
   - step 2: the general refresh rule (`npx nera-search` skips an existing
     vendor folder / script; `--force` only for unedited copies, otherwise
     merge by hand), replacing the July-migration paragraph at the end of step 5;
   - step 3: the plugin's default fields (`title`, `excerpt`, `content`,
     `href`) plus one sentence on `fields` replacing the list and adding
     `description` etc.; a short `data-search-ignore` paragraph naming
     plugin-code-blocks;
   - step 4: the view snippet, the Markdown page with its own `# Search`,
     `show_title: false`, one sentence for the no-heading case, the kept plugin
     order, the three translation keys with a short `config/app.yaml` example;
   - closing sentence: accurate about this site (template heading, translated
     in three languages, `group_by_lang: true`);
   - English stamp `plugin-search: 2.3.0`, `verified_on: 2026-10-13`.
4. Prove every snippet in the throwaway site (the brief's five checks), run the
   repo's Done-when commands from a clean `npm ci`, review `git diff main...HEAD`,
   fix anything found in separate commits, then fill in this file.
