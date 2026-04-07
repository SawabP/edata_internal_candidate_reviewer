# Design System Strategy: The Elevated Executive

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Curator"**

This design system rejects the "standard SaaS" aesthetic of boxes-inside-boxes. Instead, it treats HR data as an editorial experience. By utilizing **The Architectural Curator** philosophy, we move away from rigid, bordered grids and toward a layout defined by structural weight, tonal shifts, and intentional "breathing room." 

The goal is to transform complex HR metrics into a serene, high-end dashboard that feels authoritative yet approachable. We achieve this through **Asymmetric Balance**—placing heavy data visualizations against expansive white space—and **Depth through Tonality**, ensuring the interface feels like a physical workspace layered with fine materials rather than a flat digital screen.

---

## 2. Colors: The Tonal Landscape
Our palette moves beyond simple primary/secondary roles to create a sophisticated environment.

### The "No-Line" Rule
**Borders are prohibited for sectioning.** To define a new area, use a background shift. For example, a global navigation sidebar should use `surface-container-low`, while the main workspace sits on `surface`. This creates a natural, soft boundary that feels premium.

### Surface Hierarchy & Nesting
Depth is achieved through the "Stacking Principle." Treat the UI as layers of frosted glass:
- **Base Layer:** `surface` (#f7f9fb) – The canvas.
- **Section Layer:** `surface-container-low` (#f2f4f6) – For large layout divisions.
- **Component Layer:** `surface-container-lowest` (#ffffff) – For cards and interactive tiles. 
- **Active/Hover Layer:** `surface-container-high` (#e6e8ea) – To indicate focus or elevation.

### The "Glass & Gradient" Rule
To inject "soul" into the corporate environment:
- **CTAs:** Use a subtle linear gradient from `primary` (#2b3896) to `primary_container` (#4551af) at a 135-degree angle.
- **Floating Overlays:** Use `surface_container_lowest` with an 80% opacity and a `24px` backdrop blur. This allows the sophisticated slate and indigo tones to bleed through, softening the interface.

---

## 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance technical precision with executive presence.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision and modern "tech" feel. Use `display-lg` for high-level metrics (e.g., "98% Retention") to create a focal point.
*   **Body & Labels (Inter):** The workhorse. Its high x-height ensures readability in dense data tables. Use `label-md` for all metadata to maintain a clean, professional "small print" aesthetic.

**Hierarchy Note:** Always prioritize a significant scale jump. Do not use `headline-sm` near `title-lg`. If a section title is important, jump two levels up to create a clear visual anchor.

---

## 4. Elevation & Depth: Tonal Layering
Traditional "drop shadows" are often the mark of an amateur. This system uses **Ambient Light** and **Tonal Lift**.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` background. The contrast in hex values creates a perceived elevation of 1-2mm without a single shadow pixel.
- **Ambient Shadows:** For high-priority elements (e.g., an active Modal), use a shadow with a `32px` blur and `4%` opacity, using a tinted version of `on_surface` (#191c1e). It should look like a soft glow, not a dark smudge.
- **The "Ghost Border" Fallback:** If accessibility requires a border (e.g., in high-contrast modes), use `outline_variant` at **15% opacity**. It should be barely perceptible.

---

## 5. Components: Refined Interaction

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary_container`), `DEFAULT` (8px) corner radius. Use `label-md` in semi-bold for text.
- **Secondary:** Transparent background with a `Ghost Border`.
- **Tertiary:** No background or border. Use `on_primary_fixed_variant` for text color.

### Data Visualization (The Emerald Peak)
- **High Scores:** Use `tertiary_fixed_dim` (#4edea3) for positive metrics. It provides a vibrant, "emerald" punch against the deep indigo.
- **Empty States:** Instead of an icon, use a `surface_container_high` box with a subtle `primary` tint.

### Input Fields
- Avoid "box" inputs. Use a `surface-container-low` background with a bottom-only `outline` (#757684) that expands to a full `primary` ghost border only on focus.

### Cards & Lists
- **The Forbidden Divider:** Never use a horizontal line to separate list items. Use `8px` of vertical whitespace or alternating `surface` and `surface-container-low` backgrounds.
- **Progress Bars:** Use a thick `8px` track in `surface_container_highest` with a rounded `tertiary` fill for "Success" states.

---

## 6. Do's and Don'ts

### Do
- **Do** use `display-lg` for the "One Big Number" in every dashboard view.
- **Do** use `primary_fixed` (#dfe0ff) as a subtle background for highlighted rows in a table.
- **Do** allow content to overflow slightly in "peek" carousels to break the rigid grid.

### Don't
- **Don't** use 100% black (#000000) for text. Use `on_surface` (#191c1e) to maintain a soft, sophisticated contrast.
- **Don't** use a shadow and a border on the same element. Pick one structural cue and commit to it.
- **Don't** use sharp 0px corners. Every element must have at least a `sm` (4px) radius, with `DEFAULT` (8px) being the standard for data containers.