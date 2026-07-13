# Car Rental of Rwanda 🚙

A complete, fast, mobile-friendly car rental website for Rwanda. Visitors (including foreigners) browse the fleet by type, book straight to your **WhatsApp (+250 783 930 289)** and pay via **MTN Mobile Money (+250 783 930 289)**. You control everything from a built-in **Admin Panel**.

## What's inside

| File / folder | What it is |
|---|---|
| `index.html` | The main website (fleet, booking, payment, FAQ, SEO) |
| `admin.html` | Your owner Admin Panel (password protected) |
| `js/cars-data.js` | The fleet data — cars, prices, descriptions, settings |
| `js/main.js` | Website logic (filters, booking → WhatsApp, MoMo helpers) |
| `js/admin.js` | Admin Panel logic |
| `css/` | All styling |
| `images/` | Car photos (categorised fleet) |
| `sitemap.xml`, `robots.txt` | SEO files for Google |

## How bookings work

1. A customer picks a car and dates in the booking form.
2. The site calculates the total and the 30% deposit automatically.
3. Clicking **"Send Booking to WhatsApp"** opens WhatsApp with the full booking (name, car, dates, pickup place, price) pre-written and sent **straight to +250 783 930 289**.
4. You confirm and the customer pays the deposit by MoMo: dial code `*182*1*1*0783930289*AMOUNT#` for locals, or remittance apps (WorldRemit, Remitly, Sendwave, TapTap Send) for foreigners.

## Your Admin Panel (full control)

Open `admin.html` (there's an "Owner login" link in the website footer).

- **Default password: `rwanda2026`** — change it immediately in Settings.
- **Manage Cars:** add, edit, delete, reorder cars; upload photos; set prices, seats, transmission, fuel, type/category, description, features; mark cars as booked/available.
- **Settings:** change WhatsApp number, MoMo number & dial code, deposit %, USD→RWF rate, business name, email, address, and admin password.
- **Publish:** changes save instantly in your browser (perfect for previewing). To publish for **all visitors**, click **"Download data file"** and replace `js/cars-data.js` on your hosting. New photos should also be uploaded to the `images/` folder.
- **Backup / Restore:** download a full JSON backup any time, restore it later.

## Putting it online (free options)

This is a pure static site — no server or database needed. Any of these work:

1. **GitHub Pages (free):** repo Settings → Pages → deploy from `main` branch. Your site goes live at `https://<username>.github.io/<repo>/`.
2. **Netlify / Vercel / Cloudflare Pages (free):** connect this repo and it deploys automatically on every change.
3. **Custom domain:** buy e.g. `carrentalofrwanda.com` (or a `.rw` domain via RICTA registrars) and point it at your hosting. Then update the domain in `index.html` (canonical/OG tags), `sitemap.xml` and `robots.txt`.

## Winning on Google (already built in, plus next steps)

Built in: SEO meta tags, Open Graph, `AutoRental` structured data (helps you show up with rich details on Google), sitemap, robots.txt, fast image loading, mobile-first design.

To outrank competitors do these next:

1. Create a **Google Business Profile** ("Car Rental of Rwanda", Kigali) — most competitors win on Maps, this puts you beside them immediately.
2. Submit `sitemap.xml` in **Google Search Console**.
3. Ask every happy customer for a **Google review** (send them the link on WhatsApp after the rental).
4. Post your cars in Rwanda travel Facebook groups and on Instagram, linking to the site.
5. Keep prices on the site current — travellers compare, and transparent prices convert better than "contact for price" competitors.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```
