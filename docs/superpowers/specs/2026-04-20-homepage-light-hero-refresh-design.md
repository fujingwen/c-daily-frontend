# Homepage Light Hero Refresh

**Date:** 2026-04-20

**Status:** Approved for planning

## Goal

Refresh the homepage top hero of `c-daily-frontend` so it feels lighter, cleaner, and more breathable while preserving the existing homepage capabilities and quick-entry workflow.

This is a focused refinement of the already redesigned homepage, not a full second redesign of the whole app.

## Problem Statement

The current homepage hero is functionally complete, but it still feels visually heavy because too many high-priority elements compete in the first screen:

- deep green background with strong visual weight
- oversized headline
- three large stat blocks
- two prominent icon buttons
- two large CTA blocks inside the same hero

Even though the information is useful, the first impression feels dense instead of fresh.

## Constraints

- Keep the existing homepage feature set:
  - date
  - weather summary
  - pending todo count
  - upcoming birthday count
  - total record count
  - calendar entry
  - quick add entry
  - module popup flow
  - today overview and reminder content below
- Do not remove functional access to calendar or quick add.
- Do not change reminder data sources or record logic.
- Keep the design suitable for uni-app mobile layouts.
- Limit implementation scope to the homepage shell and related visual tokens unless a small relocation is necessary.

## Approved Direction

The homepage hero should move from a "strong branded dashboard card" to a "light breathing summary card."

The approved direction is:

- white or near-white hero surface
- very soft green atmosphere instead of deep green fill
- smaller, calmer headline
- date and weather as supporting information rather than hero content
- stats kept, but converted from heavy blocks into lightweight pills
- keep the two top-right actions, but reduce their visual priority
- remove large CTA blocks from the hero itself

This means the homepage should feel:

- fresh before bold
- calm before packed
- airy before promotional

## Visual System

### Color Strategy

Use a light neutral card with restrained green accents:

- hero background: near-white green tint such as `#f8fbf8`
- hero border: subtle green-gray such as `#dde9e0`
- decorative glow: soft green haze with very low opacity
- primary text: dark gray-green
- secondary text: muted gray-green
- accent green: reserved for tiny emphasis such as active icon button, pills, and pressed states

Avoid:

- full deep-green hero fills
- high-contrast white-on-dark as the dominant homepage mood
- multiple stacked highlighted surfaces inside the same hero

### Surface And Shape

- keep rounded corners, but rely on spacing instead of bulk
- use a thin border and shallow shadow
- keep the hero feeling lifted, not dense
- reduce the number of nested "card inside card" shapes in the hero

### Typography

- eyebrow/brand pill: small and quiet
- title: still important, but clearly smaller than the current version
- subtitle/supporting line: compact and muted
- stat numbers: readable, but not rendered as dashboard tiles

## Homepage Hero Information Architecture

The hero should contain only four layers.

### 1. Top Meta Row

Contents:

- `Coffee Daily` brand pill
- date text
- two compact action buttons on the right:
  - calendar
  - quick add

Behavior:

- brand and date should not compete with the title
- buttons should feel functional, not promotional

### 2. Title Row

Contents:

- one calmer sentence:
  - `把今天过成一页有节奏的记录`

Behavior:

- maximum two lines on narrow screens
- smaller than the current hero title
- no large subtitle block competing with it

### 3. Supporting Info Row

Contents:

- date + weather merged into one lightweight line
- example:
  - `04月20日 · 20°C · 晴`

Behavior:

- visually secondary
- acts as context, not decoration

### 4. Stat Pill Row

Contents:

- pending todos
- upcoming birthdays
- total records

Behavior:

- render as lightweight pills
- allow wrapping on narrow screens
- no large stat cards

## What Must Be Removed From The Hero

The following should no longer appear inside the hero:

- the large `查看全部模块` CTA block
- the large `快速新增记录` CTA block

These actions can still exist elsewhere on the homepage, but keeping them inside the hero is the main reason the top area feels too crowded.

## Interaction Design

- calendar button remains directly accessible from the hero
- quick add button remains directly accessible from the hero
- module popup still exists, but should be triggered from a lighter placement rather than a large hero CTA row
- stat pills are informational first; they do not need to behave like large tap targets unless already wired

## Component-Level Changes

### `pages/index/index.vue`

Responsibilities after refresh:

- simplify the hero composition
- remove the large CTA row from the hero
- merge date and weather into lighter supporting text
- keep the popup and modal logic intact

Needed changes:

- replace dark hero surface with a light hero surface
- reduce title scale
- restyle stat area into pill-based summaries
- downsize and soften hero action buttons

### `src/styles/app-theme.scss`

Responsibilities after refresh:

- provide homepage-safe light hero styling tokens
- ensure this lighter hero can coexist with the rest of the app-wide green-white system

Needed changes:

- add or refine light-hero utility styles
- keep strong green reserved for specific accents rather than full-surface emphasis

### `pages/index/components/TodayReminders.vue`

No structural redesign is required in this pass, but the component should visually feel like the content area that follows the lighter hero.

Needed changes:

- only make small follow-up spacing or contrast adjustments if the refreshed hero exposes imbalance below

## Data Flow

The refresh must not change functional data sources.

Existing flow remains:

- `recordStore` provides records and counts
- birthday utilities provide upcoming birthday data
- reminder service provides weather, quote, holiday, and todo summaries
- module popup logic remains unchanged

Only presentation and placement should change.

## Responsive Behavior

Primary target is mobile.

Requirements:

- the title should not visually dominate the full first screen
- stat pills may wrap to two lines when needed
- top-right action buttons remain easy to tap
- the hero should still feel open and balanced on narrow screens

## Testing Requirements

Implementation plan must verify:

- homepage still renders date, weather, and stat counts
- calendar entry still works
- quick add entry still works
- module popup remains reachable
- the hero no longer contains the two large CTA blocks
- homepage still builds through `npm run build:h5`

## Out Of Scope

- redesigning all secondary pages again
- changing reminder logic
- changing module popup behavior beyond placement/styling
- changing backend data or storage format

## Success Criteria

The refresh is successful if:

- the first screen feels noticeably lighter than the current screenshot
- the hero keeps the same useful information with less visual pressure
- the title no longer dominates the entire hero
- stats read as subtle summaries rather than dashboard blocks
- the homepage still supports quick access to calendar and quick add
