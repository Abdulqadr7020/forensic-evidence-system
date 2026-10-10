---
wave: 1
depends_on: []
files_modified:
  - "src/index.css"
  - "src/App.tsx"
  - "src/components/ui/Button.tsx"
  - "src/components/ui/Badge.tsx"
autonomous: false
---

# Phase 3: Micro-interactions & Motion - Core Animations

## Goal
Implement micro-interactions (animations, hover states, transitions) using \`motion\`.

## 1. Setup Framer Motion & CSS Variables
<task>
  <read_first>
    - src/index.css
  </read_first>
  <action>
    Add base motion configuration if needed in \`src/index.css\`.
    Install \`framer-motion\` if not already in package.json (run \`npm install framer-motion\`).
  </action>
  <acceptance_criteria>
    - \`framer-motion\` is present in \`package.json\`
  </acceptance_criteria>
  <verify>
    <automated>cat package.json | grep framer-motion</automated>
    <fails_when>non-zero exit</fails_when>
  </verify>
</task>

## 2. Interactive Component Hover States
<task>
  <read_first>
    - src/components/ui/Button.tsx
    - src/components/ui/Badge.tsx
  </read_first>
  <action>
    Modify \`Button.tsx\` and \`Badge.tsx\` to use \`motion.button\` and \`motion.div\`.
    Add hover animations: Moderate scale (\`whileHover={{ scale: 1.02 }}\`) and tap scale (\`whileTap={{ scale: 0.98 }}\`).
    Ensure they include a slight inner glow via CSS classes or motion styles.
  </action>
  <acceptance_criteria>
    - \`Button.tsx\` exports a \`motion.button\` component
    - \`Badge.tsx\` exports a \`motion.div\` component
  </acceptance_criteria>
  <verify>
    <automated>grep "motion.button" src/components/ui/Button.tsx</automated>
    <fails_when>non-zero exit</fails_when>
  </verify>
</task>

## 3. View Transitions
<task>
  <read_first>
    - src/App.tsx
  </read_first>
  <action>
    Wrap the main route views in \`App.tsx\` with \`AnimatePresence\` and \`motion.div\` to support page transitions.
    Implement "Slide up + Fade" transition:
    \`initial={{ opacity: 0, y: 20 }}\`
    \`animate={{ opacity: 1, y: 0 }}\`
    \`exit={{ opacity: 0, y: -20 }}\`
  </action>
  <acceptance_criteria>
    - \`App.tsx\` contains \`AnimatePresence\`
  </acceptance_criteria>
  <verify>
    <automated>grep "AnimatePresence" src/App.tsx</automated>
    <fails_when>non-zero exit</fails_when>
  </verify>
</task>

## 4. Staggered Animations
<task>
  <read_first>
    - src/App.tsx
  </read_first>
  <action>
    Create a reusable staggering container or apply fast stagger to the grid of cards in \`App.tsx\`.
    Use \`transition={{ staggerChildren: 0.05 }}\` on the parent, and \`motion.div\` for children with fade-up variants.
  </action>
  <acceptance_criteria>
    - \`App.tsx\` contains staggering variants for the grid/list
  </acceptance_criteria>
  <verify>
    <automated>grep "staggerChildren" src/App.tsx</automated>
    <fails_when>non-zero exit</fails_when>
  </verify>
</task>

<must_haves>
  <truths>
    - Page/view transitions are smooth and animated using slide up + fade.
    - Hover states on buttons provide immediate, smooth visual feedback (scale: 1.02).
    - Grid items load with a fast stagger effect.
  </truths>
  <artifacts>
    - src/components/ui/Button.tsx
    - src/components/ui/Badge.tsx
    - src/App.tsx
  </artifacts>
</must_haves>

## Artifacts this phase produces
- Modified \`Button\` component
- Modified \`Badge\` component
- Modified \`App\` routing with \`AnimatePresence\`
