## Changes to `src/routes/index.tsx`

1. **Header simplification**
  - Remove the "Compounding · Worksheet" eyebrow label.
  - Remove the date on the right side.
  - Rename heading from "Alligation Alternate" to **"Alligation Calculator"**.
  - Keep the header divider line below.
2. **Keep the Alligation diagram section** exactly as it is (label + SVG).
3. **"Clear worksheet" → real button**
  - Replace the underlined text link with a proper button styled to match the worksheet aesthetic: bordered, padded, rounded, hover state. Label stays "Clear worksheet" (or "Clear" — will keep "Clear worksheet" unless you prefer shorter).
  - Keep it left-aligned in the footer row.
4. **Footer credit**
  - At the very bottom of the card (below the existing disclaimer), add a centered small line:  
   `Haris Mohamed K M`
  - Subtle styling (small, muted, serif italic) so it sits quietly.
5. **Untouched**
  - Inputs, calculation logic, Measure/result section, diagram, page background, fonts, and color palette all stay the same.

No other files change.