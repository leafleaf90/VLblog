# Agent prompt UI mockups in posts

This document explains the **illustrated agent-composer** component used in blog posts to show example prompts (Cursor Composer, Claude, Google Gemini, and similar UIs) without screenshots.

**AI reply blocks** (Gemini sparkle + actions / rule; Cursor status + panel) are documented separately: `[agent-reply-mockups.md](agent-reply-mockups.md)`.

## Why this exists

- **Readable text**: Real text stays selectable and accessible; raster images do not.
- **Consistent branding**: Variants (`cursor`, `claude`, `gemini`) tune chrome, toolbar layout, and labels while sharing one escape/sizing pipeline.
- **Jekyll-native**: Liquid include + global CSS; no JavaScript and no MDX/React dependency.
- **Authoring options**: Inline params, multiline `capture`, or `_data/agent_prompts.yml` for reusable snippets.

## What was implemented


| Piece                                    | Role                                                                                                                                                                                                   |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `_includes/components/agent_prompt.html` | Renders the mock: prompt area, blinking caret, decorative toolbar (marked `aria-hidden`), optional disclaimer line, optional caption. Body text is HTML-escaped; newlines use `white-space: pre-wrap`. |
| `assets/styles.css`                      | Scoped `.agent-prompt` rules and `--ap-*` variables; `.agent-prompt--claude` and `.agent-prompt--gemini` skins (Gemini uses a larger radius, different toolbar, paper-plane send).                     |
| `_data/agent_prompts.yml`                | Optional catalog of named examples; posts reference them by `id`.                                                                                                                                      |


### Accessibility

- Prompt copy is **not** inside `aria-hidden`; screen readers read the paragraph like normal content.
- The fake toolbar (Cursor/Claude: plus, model, mic, up-arrow send; Gemini: plus, Tools, speed label, paper plane) is `**aria-hidden="true"`** so it is not announced as interactive controls.

### Google Docs–sourced posts

Liquid (`{% include %}`) runs when Jekyll builds **Markdown/HTML in the repo**. Content that never passes through Jekyll (e.g. raw HTML pasted only in a hosted Doc) will not expand includes. For Doc-first workflows, paste the **generated HTML** from a local build, or maintain those posts as files in `_posts/` / `_drafts/` where Liquid is allowed.

## Usage

### 1. Reference a catalog entry

In `_data/agent_prompts.yml`:

```yaml
my_example:
  variant: cursor
  footer_label: Composer 2
  text: |-
    First line
    Second line
```

In a post:

```liquid
{% include components/agent_prompt.html id="my_example" %}
```

Optional overrides: `variant`, `footer_label`, `text`, `disclaimer`, `hide_disclaimer`, `caption` on the include still apply on top of the data row when set (`disclaimer` may also be set on the YAML row; `hide_disclaimer` is read from the include only).

### 2. Inline short text

```liquid
{% include components/agent_prompt.html text="Refactor this module for clarity." %}
```

### 3. Multiline prompt (`capture`)

```liquid
{% capture agent_msg %}
Line one
Line two
{% endcapture %}
{% include components/agent_prompt.html text=agent_msg caption="Example from the article." %}
```

### 4. Claude-style variant

```liquid
{% include components/agent_prompt.html variant="claude" footer_label="Sonnet" text="Summarize the risks in this design." %}
```

### 5. Google Gemini–style variant

Gemini uses a **different toolbar** (thin plus, “Tools” with sliders icon, right-aligned speed label such as **Fast** + chevron, white **paper plane** send), a **larger corner radius**, charcoal `#1e1f20` chrome, and by default a **centered disclaimer** under the box: `Gemini is AI and can make mistakes.`

```liquid
{% include components/agent_prompt.html variant="gemini" text="Test the…" %}
```

Catalog example: `id="gemini_placeholder"`.

Custom disclaimer text:

```liquid
{% include components/agent_prompt.html variant="gemini" disclaimer="Custom footnote under the box." text="Your prompt." %}
```

To omit the default Gemini disclaimer (rare):

```liquid
{% include components/agent_prompt.html variant="gemini" hide_disclaimer="true" text="Prompt only." %}
```

Any variant may set `disclaimer` (in YAML or on the include) to show a centered line under the chrome; only `gemini` supplies that default when `disclaimer` is left empty.

Default footer labels if omitted: **Composer 2** for `cursor`, **Claude** for `claude`, **Fast** for `gemini`.

## Changing the look

- Edit `**assets/styles.css`** under the `Agent / LLM composer UI mockups` section.
- Prefer `**--ap-*` variables** on `.agent-prompt` / `.agent-prompt--claude` / `.agent-prompt--gemini` before adding one-off rules.

## Adding a new catalog entry

1. Open `_data/agent_prompts.yml`.
2. Add a new top-level key (slug) with `variant`, `footer_label`, and `text` (YAML `|-` for multiline). For Gemini, optionally add `disclaimer` or rely on the built-in default; pass `hide_disclaimer="true"` on the include if you need to suppress that default.
3. Use `{% include components/agent_prompt.html id="your_slug" %}` in the post.

No server restart is needed for `_data` during `jekyll serve` in many setups, but `_config.yml` changes still require a restart.

## Build note

This repo’s custom generators may require credentials or network. To validate only core Jekyll + this feature: `bundle exec jekyll build --safe`.