# Homepage MarkNow-Inspired Redesign

**Date:** 2026-04-18

**Status:** Approved for planning

## Goal

Redesign the homepage UI of `c-daily-frontend` so it feels closer to MarkNow's visual language while preserving the current product capabilities. The homepage should prioritize today's overview, keep quick record actions easy to reach, and present recent records in a cleaner, more mature layout.

## Constraints

- Keep the existing homepage feature set:
  - weather
  - daily quote
  - menstruation reminder
  - pending todos
  - upcoming birthdays
  - upcoming holidays
  - module popup / quick record entry
  - recent records
- Do not redesign the rest of the application yet.
- Preserve current data flow and store usage unless a UI change requires a small adaptation.
- Keep the experience suitable for uni-app mobile layouts.

## Design Direction

Use MarkNow as a color and hierarchy reference, not as a feature or structure template.

The approved direction is:

- stronger green brand color
- white text on the top hero card
- clean white content cards below
- lighter, more mature, and more structured than the current homepage
- softer than a strict MarkNow clone so it still matches a life-recording product

This means the page should feel:

- clear before decorative
- fresh before cute
- branded before colorful

## Visual System

### Color Strategy

The homepage should use a restrained green-white palette:

- primary green: medium-deep, strong enough to support white text
- background: very light neutral green/gray
- cards: white
- primary text: dark gray-green
- secondary text: muted gray-green
- borders: subtle cool-green gray

Target color behavior:

- the hero area carries the brand color weight
- lower sections return to white to restore clarity
- green is used again for emphasis states, active buttons, badges, and status dots

Avoid:

- muddy dark green
- washed-out foggy gradients
- large soft color blooms across the whole page
- multiple unrelated accent colors competing for attention

### Shape and Surfaces

- large rounded corners throughout
- clean white cards with light borders or shallow shadows
- reduced visual noise compared with the current design
- consistent spacing rhythm between hero, cards, rows, and chips

### Typography

- hero title: large, bold, white
- section titles: dark, compact, clear
- supporting copy: smaller, muted, easy to scan
- numeric/date highlights should feel deliberate, not oversized decoration

## Homepage Information Architecture

The homepage should keep the current capability set, but reorganize it into five clearer zones.

### 1. Top Hero Card

Purpose:

- establish brand color
- immediately communicate "today"
- surface the most important at-a-glance information

Contents:

- product title / brand label
- short homepage title
- date block
- weather summary
- 1-3 summary pills such as pending todos count, birthday reminder count, or holiday count
- optional short supporting sentence or quote preview

Behavior:

- white text over green hero surface
- the hero should feel strong and stable, not translucent
- keep it visually compact enough that key white cards remain visible without excessive scrolling

### 2. Today Overview Card

Purpose:

- summarize today's context before task interaction

Contents:

- weather detail
- daily quote
- compact summary content pulled from reminder data

Behavior:

- split into clean sub-blocks inside a white card
- no large gradients inside this card
- information should read as concise tiles or compact grouped rows

### 3. Quick Record Card

Purpose:

- preserve the "open app and record immediately" workflow

Contents:

- the most common quick actions from the current homepage flow
- module popup trigger remains available

Behavior:

- present as a tidy grid
- default item style: white or very pale green
- active/emphasized item style: green-accented
- avoid rainbow icon treatment

### 4. Priority Reminder Card

Purpose:

- turn existing reminder content into a clearer task-focused module

Contents:

- pending todos
- birthdays
- holidays
- menstruation reminder when available

Behavior:

- show most important items first
- each row should have a clear visual hierarchy:
  - status dot or badge
  - title
  - short supporting text
  - optional time/urgency marker
- this section should feel actionable, not decorative

### 5. Recent Records Card

Purpose:

- keep the feeling of continuity and life activity

Contents:

- existing recent record list

Behavior:

- cleaner list rows than the current implementation
- more consistent icon treatment
- less visual competition with the reminder section
- time metadata should be present but subdued

## Component-Level Changes

### `pages/index/index.vue`

Responsibilities after redesign:

- own the overall homepage composition
- apply the new page background and hero-first structure
- coordinate the top navigation, theme switch affordance, module popup, and modal behaviors

Needed changes:

- convert the current sticky header / title presentation into a simpler, more integrated top area
- visually merge the current header language with the new hero card
- reduce the feeling of separate floating blocks stacked vertically

### `pages/index/components/TodayReminders.vue`

Responsibilities after redesign:

- shift from mixed reminder block styling to structured overview + priority reminders

Needed changes:

- break the current blended reminder layout into clearer subsections
- move away from heavily individualized reminder block backgrounds
- support a compact overview presentation suitable for the new white-card system

### `pages/index/components/RecentRecords.vue`

Responsibilities after redesign:

- render recent records as a cleaner, more product-like history list

Needed changes:

- normalize list row spacing, icon treatment, and text hierarchy
- make the section feel secondary to today's overview while still useful

### `pages/index/components/ModuleGroups.vue`

Responsibilities after redesign:

- continue powering quick entry and grouped module access

Needed changes:

- align quick module styling with the green-white homepage system
- reduce decorative variance between module cells
- preserve hidden/show module behaviors

### Global Styling Surfaces

Relevant files:

- `App.vue`
- `uni.scss`
- possibly `stores/theme.js` if the existing theme values need clearer homepage-specific colors

Needed changes:

- ensure the homepage can use a more refined green-white palette without breaking the rest of the app
- avoid forcing a full app redesign during this step

## Data Flow

The redesign should not change the functional data sources.

Existing flow remains:

- `recordStore` provides records and update actions
- `moduleVisibilityStore` controls module visibility state
- `themeStore` provides theme colors
- reminder/birthday utilities compute homepage reminder content

UI changes may reorganize how the data is displayed, but should not change:

- storage model
- reminder calculation source
- todo completion behavior
- popup or navigation behavior unless required by layout polish

## Interaction Design

- quick actions remain one-tap reachable
- module popup remains available from the homepage top area
- todo completion flow remains supported
- rows and cards should have clear pressed states
- green emphasis should be used intentionally for:
  - active buttons
  - selected states
  - key status dots
  - hero summary pills

Avoid adding motion-heavy or ornamental transitions. Interactions should feel polished and responsive, not playful.

## Error Handling

Error behavior stays functionally the same:

- reminder data load failures should continue to fail gracefully
- todo completion failures should continue to show feedback
- optional sections should collapse cleanly when they have no data

UI requirement:

- missing data must not leave awkward blank decorative shells
- empty states should still match the new green-white system

## Responsive Behavior

Primary target is mobile.

Requirements:

- hero card remains readable on narrow screens
- section padding scales without crowding
- quick action grid remains tappable
- list rows do not become cramped when text wraps

No tablet-specific layout is required in this phase, but the page should degrade gracefully on wider screens.

## Testing Requirements

The implementation plan must cover:

- homepage rendering with populated data
- homepage rendering with empty/partial data
- todo completion still functioning from homepage reminders
- module popup still opening and closing correctly
- navigation from quick actions and recent records still working
- visual regression checks for spacing and hierarchy on mobile layout

## Out of Scope

- redesigning non-homepage pages
- changing backend or storage structures
- rethinking the full multi-theme system for the entire app
- rewriting business logic unrelated to homepage display

## Success Criteria

The redesign is successful if:

- the homepage clearly feels more mature and productized than the current UI
- the top green hero with white text feels intentional and brand-like
- the lower white-card sections feel clean and clearly separated
- users can still access the same homepage functions without confusion
- the homepage reads "today first" while still supporting fast record entry
