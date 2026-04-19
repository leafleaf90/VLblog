# AI reply UI mockups in posts

This document describes **`agent_reply`**, the companion to [`agent-prompt-mockups.md`](agent-prompt-mockups.md): illustrated **AI assistant replies** in **Gemini**- and **Cursor**-style layouts, without screenshots.

## Why this exists

- **Same goals as prompt mockups**: selectable text, theme-consistent chrome, no JavaScript, Jekyll Liquid + shared CSS.
- **Gemini-style** UIs:
  1. **Opening reply**: blue **sparkle** at the top-left, multi-paragraph body, **thin rule** at the bottom (by default).
  2. **Rich reply / “Pro-Tip”**: optional **bold title**, body with **Markdown** (`**bold**`, `` `inline code` `` pill styling), optional **decorative action row** (like / dislike / regenerate / copy / more), optional bottom rule.
- **Cursor-style** replies: dark panel (`#1e1e1e`), optional **status line** above the body (e.g. `Worked for 49s` in muted gray), body text `#d4d4d4`, **bold** at same hue, inline **code** pills (`#26354a` / `#9cdcfe`). No sparkle; bottom rule **off** by default (enable with `show_rule` if you want one).
- **Markdown body** is rendered with `markdownify` so authoring matches normal post conventions. Use **only trusted author content** in `body` (same caution as any `markdownify` field).

## What was implemented

| Piece | Role |
|--------|------|
| `_includes/components/agent_reply.html` | Builds the reply surface: optional `status`, optional sparkle (Gemini only), optional escaped `title`, Markdown `body`, optional `aria-hidden` action icons, optional rule. |
| `assets/styles.css` | `.agent-reply--gemini` and `.agent-reply--cursor` set `--ar-*` tokens (background, text, code pill, rule, radius). |
| `_data/agent_replies.yml` | Catalog: `gemini_reply_*`, `cursor_reply_sample`, etc. |

### Accessibility

- **Main content** (status, title + rendered Markdown) is real text, not hidden from assistive tech.
- **Sparkle** and **action icon row** use `aria-hidden="true"` because they are decorative and not interactive.
- **Bottom rule** is decorative (`aria-hidden`).

## Usage

### 1. Catalog `id`

```liquid
{% include components/agent_reply.html id="gemini_reply_opening" %}
```

```liquid
{% include components/agent_reply.html id="gemini_reply_pro_tip" %}
```

```liquid
{% include components/agent_reply.html id="cursor_reply_sample" %}
```

### 2. Inline `body` (Markdown)

```liquid
{% capture reply %}
First paragraph.

Try **Nuxt 4** with `tailwind.config.js` for tokens.
{% endcapture %}
{% include components/agent_reply.html body=reply %}
```

### 3. Flags (override catalog or standalone)

| Param | Meaning |
|--------|---------|
| `variant` | `gemini` (default) or `cursor`. |
| `status` | Plain meta line above the body (HTML-escaped), e.g. `Worked for 49s` — common for Cursor. |
| `title` | Plain text; shown bold above the body (HTML-escaped). |
| `show_sparkle` | `true` / `false` — for **Gemini** only (sparkle is never shown for `cursor`). Default **true** for Gemini unless turned off. |
| `show_actions` | `true` / `false` — default **false**; set `true` for the icon strip. |
| `show_rule` | `true` / `false` — default **true** for Gemini, **false** for Cursor. |
| `caption` | Optional `figcaption` under the component. |

Example without sparkle, with title and actions:

```liquid
{% capture tip %}
Ask the model to respect your `nuxt.config` **layers** order.
{% endcapture %}
{% include components/agent_reply.html title="Pro-Tip:" body=tip show_sparkle="false" show_actions="true" show_rule="false" %}
```

Cursor-style inline example:

```liquid
{% capture cr %}
Ship the UI mock in `assets/styles.css` and keep **Google Docs → posts** on **plain HTML** if the export never hits Jekyll.
{% endcapture %}
{% include components/agent_reply.html variant="cursor" status="Worked for 49s" body=cr %}
```

## Data file shape (`_data/agent_replies.yml`)

Each key can define:

- `variant` — `gemini` or `cursor` (more skins later).
- `status` — optional string (Cursor-style meta line).
- `title` — optional string.
- `body` — Markdown string (multiline `|`).
- `show_sparkle`, `show_actions`, `show_rule` — booleans as in the agent prompt catalog.

Include parameters override the same keys when both `id` and inline args are used.

## Changing the look

Edit the **`AI reply blocks`** section in `assets/styles.css`. Prefer extending **`--ar-*`** variables on `.agent-reply--gemini` or `.agent-reply--cursor` before adding unrelated selectors.

## Build note

Same as prompt mockups: `bundle exec jekyll build --safe` when you want to skip custom plugins that need network or credentials.
