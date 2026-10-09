---
layout: pages/docs.pug
title: Referencia de la CLI
slug: cli
lang: es
description: La CLI de nera — crea, compila, previsualiza, actualiza, valida y revisa un sitio.
pagination_order: 7
---

# Referencia de la CLI

## La CLI `nera` (`@nera-static/nera`)

Un solo comando crea, compila, previsualiza, actualiza y valida un sitio. Crea
uno nuevo con:

```bash
npx @nera-static/nera new <project-name>
```

Un sitio creado depende de `@nera-static/nera`, así que ejecuta estos desde
dentro de él (el andamiaje también los enlaza a un script npm, p. ej.
`npm run dev`):

| Comando | Qué hace |
| --- | --- |
| `nera build` | Compila `pages/` → `public/`; con `--check`, revisa también el resultado |
| `nera dev` | Compila + vista previa con recarga en vivo en `:3000` |
| `nera serve` | Sirve `public/` sin recompilar |
| `nera update` | Actualiza los paquetes Nera del sitio (`npm update`) |
| `nera validate` | Comprueba layouts, includes y YAML antes de publicar |
| `nera check` | Revisa el `public/` compilado en busca de problemas de accesibilidad, privacidad y aviso legal |

### Revisar el sitio compilado

`nera validate` lee tus fuentes. `nera check` lee lo que produjo la
compilación — la página que recibe el visitante, con su layout, navegación,
pie, scripts, hojas de estilo y fuentes — y busca los problemas que un parser
puede encontrar ahí:

```bash
nera build --check   # compila y luego revisa — el único comando para CI
nera check           # revisa un public/ existente sin recompilar
```

Ejecuta primero `nera build`; sin `public/`, `nera check` se detiene con «run
`nera build` first». Un problema en una plantilla se informa una sola vez, con
el número de páginas en que aparece.

Cada hallazgo es un **aviso** por defecto, así que el comando termina con `0`.
Termina con `1` solo cuando salta una regla que elevaste a `error` — así lo
conviertes en una barrera de CI.

**Son indicaciones, no asesoramiento jurídico.** Una ejecución limpia no
demuestra el cumplimiento: las pruebas automáticas encuentran solo una parte de
los problemas de accesibilidad (alrededor de un tercio de los fallos WCAG). No
se comprueban el contraste de color, el foco visible ni si una ley se aplica a
tu sitio. Cada informe termina con ese recordatorio.

| regla | por defecto | base |
| --- | --- | --- |
| `a11y-html-lang` | aviso | WCAG 3.1.1 |
| `a11y-title` | aviso | WCAG 2.4.2 |
| `a11y-h1` | aviso | WCAG 1.3.1 |
| `a11y-heading-skip` | aviso | WCAG 1.3.1 |
| `a11y-img-alt` | aviso | WCAG 1.1.1 |
| `a11y-form-label` | aviso | WCAG 1.3.1, 4.1.2 |
| `a11y-link-name` | aviso | WCAG 2.4.4, 4.1.2 |
| `a11y-main` | aviso | WCAG 1.3.1 |
| `a11y-skip-link` | aviso | WCAG 2.4.1 |
| `a11y-nav-name` | aviso | WCAG 1.3.1 |
| `a11y-duplicate-id` | aviso | WCAG 4.1.2 |
| `a11y-viewport-zoom` | aviso | WCAG 1.4.4 |
| `a11y-link-lang` | desactivada (opt-in) | WCAG 3.1.2 |
| `a11y-target-blank` | desactivada (opt-in) | WCAG 3.2.5 (AAA) |
| `a11y-reduced-motion` | desactivada (opt-in) | WCAG 2.3.3 (AAA) |
| `privacy-third-party` | aviso | Art. 6 DSGVO |
| `privacy-insecure` | aviso | Art. 32 DSGVO |
| `privacy-storage` | desactivada (opt-in) | § 25 TDDDG |
| `legal-imprint-link` | aviso | § 5 DDG |
| `legal-privacy-link` | aviso | Art. 13 DSGVO |
| `legal-outdated-law` | aviso | DDG, TDDDG, MStV |

Configura las comprobaciones en `config/validate.yaml` (opcional — sin él se
aplican los valores por defecto de arriba):

```yaml
rules:
  a11y-img-alt: error         # elevar: la revisión falla
  a11y-target-blank: warning  # activar una regla opt-in
  a11y-skip-link: off         # desactivar
legal:
  imprint:                    # por idioma, la página a la que enlaza cada página
    de: /de/impressum.html
    es: /es/aviso-legal.html
  privacy:
    de: /de/datenschutz.html
    es: /es/privacidad.html
privacy:
  allowed_hosts:              # hosts de terceros que ya has tenido en cuenta
    - cdn.example.org
```

Para silenciar una regla en una sola página, añádela al frontmatter de la
página: `validate_ignore: [a11y-h1]`.

Para silenciar una regla en archivos o carpetas enteros, enuméralos bajo
`ignore`. También funciona con `nera validate` — por ejemplo para
`layout-missing` en fragmentos de contenido que otra página incluye, o en
borradores, que no tienen `layout` a propósito:

```yaml
ignore:
  layout-missing:
    - pages/*/references      # una carpeta abarca todo lo que contiene
    - pages/de/blog/drafts    # * representa un nombre de carpeta
```

Las rutas son relativas a la raíz del sitio. Requiere `@nera-static/validate`
1.3.0, que `npm update` trae a un sitio existente.

**Tu propio host.** Para distinguir tus recursos de los de terceros,
`privacy-third-party` lee `origin` de `config/app.yaml`, o si no `app_origin`
de `config/canonical-links.yaml` (con y sin `www.`). Si no hay ninguno, solo
las URL relativas cuentan como tuyas.

**Enlaces al aviso legal y a la privacidad solo en alemán e inglés.** Sin
configuración `legal`, los enlaces se reconocen por su texto — *Impressum*,
*Imprint*, *Legal notice*, *Datenschutz*, *Privacy*, *Data protection* — y solo
en páginas en alemán e inglés. Para un sitio en español, indica las páginas en
`legal.imprint.es` y `legal.privacy.es`.

Las descripciones completas de las reglas están en el
[README de `@nera-static/validate`](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

### Migrar un sitio antiguo (clonado)

Los sitios creados antes de la CLI eran clones de git que incluían el motor bajo
`src/`. Dentro de un sitio así, ejecuta `nera update --migrate` — añade la
dependencia `@nera-static/nera`, reescribe los scripts, elimina el motor `src/`
incluido e instala, dejando intactos tus `pages/`, `config/` y `theme/`.

## Comandos de publicación de plugins

Cada plugin que incluye plantillas expone un bin para copiar su Pug a
`views/vendor/`, p. ej.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
