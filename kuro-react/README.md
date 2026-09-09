# KURO — Interactive Katana Experience

A cinematic, scroll-driven React experience inspired by Japanese swordcraft, silence, balance, and movement. This project is a React/Vite conversion of the supplied `katana.html` single-file experience, while preserving its original visual direction and interactive behavior.

## Overview

KURO presents the story of a hand-forged blade through immersive chapters. The page combines typography, layered transitions, interactive cards, a Three.js katana scene, and GSAP-powered scroll choreography to create an editorial-style digital experience.

## Highlights

- **React + Vite** application structure

- **Three.js** interactive 3D katana scene

- **GSAP + ScrollTrigger** scroll-based animations

- Cinematic loading sequence and hero door transition

- Custom cursor and hover interactions

- Interactive navigation between story chapters

- Horizontal anatomy card movement driven by scroll

- Light spectrum sequence: ember, moon, and dawn

- Interactive blade collection cards with pointer tilt

- 360° inspection mode with drag rotation and zoom

- Responsive layouts for desktop and mobile screens

- Original embedded visual assets preserved from the source HTML

## Requirements

- Node.js 18 or newer

- npm 9 or newer

- A modern browser with WebGL support

- Internet connection for Google Fonts, GSAP, ScrollTrigger, and Three.js CDN resources

## Installation

Clone or extract the project, then install the dependencies:

```bash
npm install
```

## Development

Start the local Vite development server:

```bash
npm run dev
```

Vite will display a local URL, usually:

```
http://localhost:5173
```

Open that URL in a modern browser to view the experience.

## Production Build

Create an optimized production build:

```bash
npm run build
```

The generated production files will be placed inside the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Creates the optimized production build |
| `npm run preview` | Serves the production build locally |

## Project Structure

```
kuro-react/
├── index.html                 # HTML entry point and font setup
├── package.json               # Project metadata and scripts
├── package-lock.json          # Locked dependency versions
├── README.md                 # Project documentation
└── src/
    ├── main.jsx              # React entry point and runtime mounting
    ├── katana.html           # Converted experience markup
    ├── katana.css            # Original visual system and responsive styles
    └── katana-runtime.js     # Three.js and GSAP interaction runtime
```

## Architecture Notes

The original experience was delivered as a single HTML file containing markup, styles, embedded images, and JavaScript. During conversion, the implementation was organized into a Vite-powered React shell:

- `main.jsx` mounts the experience through React.

- `katana.html` contains the original page markup as a reusable source asset.

- `katana.css` contains the complete visual system, layout rules, typography, responsive behavior, and animations.

- `katana-runtime.js` contains the Three.js scene, GSAP timelines, ScrollTrigger scenes, pointer interactions, and inspection mode.

This structure keeps the original visual fidelity while making the project easier to run, maintain, and extend.

## External Runtime Resources

The 3D and animation layers load these resources at runtime:

- [GSAP](https://greensock.com/gsap/)

- [GSAP ScrollTrigger](https://greensock.com/scrolltrigger/)

- [Three.js](https://threejs.org/)

- [Google Fonts](https://fonts.google.com/)

If the project is deployed without internet access, these resources should be downloaded and served locally, then the URLs in `src/main.jsx`, `src/katana-runtime.js`, and `index.html` should be updated accordingly.

## Deployment

The project can be deployed to any static hosting provider that supports Vite output, including Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any standard web server.

Build the project first:

```bash
npm run build
```

Then deploy the contents of the `dist/` directory.

## Performance Notes

The project includes a real-time WebGL scene and multiple scroll animations. For the best experience:

- Use a modern Chromium, Firefox, or Safari browser.

- Keep hardware acceleration enabled.

- Test on mobile devices before production launch.

- Consider reducing particle count and pixel ratio for low-powered devices.

- Respect the user's reduced-motion preference when adding new animations.

## Troubleshooting

### The 3D scene is not visible

Confirm that the browser supports WebGL and that hardware acceleration is enabled. Also check the browser console for blocked CDN resources or WebGL errors.

### Fonts are not loading

The project uses Google Fonts. Verify that the deployment environment allows requests to `fonts.googleapis.com` and `fonts.gstatic.com`.

### Animations do not start

The GSAP and ScrollTrigger files are loaded from jsDelivr. Check the network tab for failed CDN requests and confirm that the deployment has internet access.

### The page feels slow on mobile

The 3D renderer and scroll animations are intentionally rich. For a mobile optimization pass, reduce the renderer pixel ratio, lower the particle count, and simplify non-essential animation timelines.

## Credits

The KURO experience is an original interactive visual concept focused on light, motion, hand-forged steel, and Japanese-inspired editorial design.

## License

This project is provided for personal and project use. Review and define a formal license before distributing it publicly or using it commercially.