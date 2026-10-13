# Result — Tutorial "Open external links in a new tab" (01a136ac-c149-728e-9d2b-becb95bfe363)

## Plan

1. Baseline on the branch: `npm ci`, then `npm run lint && npm test && npm run validate
   && npm run build -- --check` — note any warning (rule 6: fix it). `npm view` plugin-
   link-attributes, core, nera; read the plugin's README/CHANGELOG and core's CHANGELOG
   4.13.0 → current under `node_modules/`.
2. Throwaway site (`npx @nera-static/nera new site` + plugin): run `npx nera-link-attributes`
   three times (create / skip / `--force`), then the four checks — no config → build passes,
   no `target`; with config → external link gets `target`/`rel`, internal not; layout link
   untouched and the tutorial's Pug line renders as shown; this repo's GitHub links in
   `public/` carry the attributes (content and layout).
3. Edit the tutorial, en then de and es:
   - step 1: reword "No template to publish" so it does not contradict the config command;
   - step 2: lead with `npx nera-link-attributes` (writes the defaults shown, skips an
     existing file, `--force` replaces it), keep the YAML, one sentence: no `attributes` →
     pages unchanged; half-sentence that existing attributes on a link are kept;
   - step 3 / closing claim: fix only what the checks prove wrong;
   - drop the Node blockquote. Keep 3 `## ` sections each.
4. English stamp: `plugin-link-attributes: 2.1.1`, `core: <npm current>`, `verified_on` today.
5. Checks again from a clean `npm ci`, a parity/stamp script, review `git diff main...HEAD`,
   then fill in this file and push.
