# Scroll Expansion Hero — React + Vite + Tailwind

A scroll-driven media expansion hero component built with React, Tailwind CSS, and Framer Motion. Converted from the original Next.js version.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open the URL Vite prints (usually http://localhost:5173).

## Project Structure

```
src/
├── components/
│   └── ui/
│       ├── hero.jsx     # The ScrollExpandMedia component
│       └── demo.jsx     # Demo + variant exports
├── App.jsx              # Renders <Demo />
├── main.jsx             # React entry
└── index.css            # Tailwind directives
```

## Usage

```jsx
import ScrollExpandMedia from '@/components/ui/hero';

<ScrollExpandMedia
  mediaType="video"           // 'video' | 'image'
  mediaSrc="..."              // video URL, image URL, or YouTube link
  posterSrc="..."             // optional video poster
  bgImageSrc="..."            // background image
  title="Your Title Here"
  date="Subtitle / date"
  scrollToExpand="Scroll to Expand"
  textBlend                   // optional, applies mix-blend-difference
>
  <YourContent />
</ScrollExpandMedia>
```

## Variant Exports

`demo.jsx` also exports ready-made variants you can drop in:

- `VideoExpansion`
- `ImageExpansion`
- `VideoExpansionTextBlend`
- `ImageExpansionTextBlend`

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
