# Easy Livin Goa — Public Website

Next.js 14 public website for Easy Livin Goa real estate platform.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** (brand colours from logo)
- **TypeScript** (strict mode)
- **Lucide React** (icons)

## Brand Colours (from logo pixel analysis)
| Token | Hex | Usage |
|---|---|---|
| `navy` | `#1e2444` | Primary brand, headings |
| `navy-deep` | `#0f172a` | Hero, footer, dark sections |
| `gold` | `#b59762` | Accents, CTA buttons, checkmark |
| `gold-light` | `#d4b87a` | Hover states |
| `gold-pale` | `#f0e6cc` | Light accent backgrounds |

## Font Pairing
- **Cormorant Garamond** — Display/headings (luxury, editorial)
- **Inter** — Body text, UI labels (clean, legible)

## Pages
| Route | Page |
|---|---|
| `/` | Homepage |
| `/buy` | Properties for Sale |
| `/rent` | Properties for Rent |
| `/sell` | Sell / Lease |
| `/about` | About Us |
| `/contact` | Contact Us |
| `/faq` | FAQ |
| `/services` | Our Services |
| `/blog` | Blog & Insights |
| `/property/[id]` | Property Detail |

## Setup

\`\`\`bash
# Install dependencies
npm install

# Add logo
# Copy easylivin_logo.png to public/images/logo.png

# Run dev server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
\`\`\`

## Connecting to the Backend API

In production, update `src/lib/data.ts` to fetch from the API:

\`\`\`typescript
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties?status=PUBLISHED`)
const data = await res.json()
\`\`\`

Add to `.env.local`:
\`\`\`
NEXT_PUBLIC_API_URL=https://api.easylivingoa.com
\`\`\`

## Important
- **Spelling**: Urmilla Dias (double L) — verified from old site email `urmilla@easylivingoa.com`
- **Logo**: Place `easylivin_logo.png` at `public/images/logo.png`
- Phone: +91 9823 202737 / +91 88888 06964
- Address: A-T17, Campal Trade Centre, 3rd Floor, Opposite Kala Academy, Campal, Panjim Goa – 403001
# EasyLivin
