# UmamiGo — Asian Food Delivery App

A functional prototype of **UmamiGo**, a mobile food delivery app dedicated exclusively to Asian cuisine. Built for the **Final Project (Functional Prototyping)** of the curricular unit *Interactive Multimedia Applications (AMI)* at ISEL, 2025/2026.

**Author:** Ana Sofia De Assis (53537) · **Course:** MEIM · **Professor:** Diogo Cabral

🔗 **Live app:** https://sofzz14.github.io/umamigo/

> Best viewed on a mobile phone. The microphone (voice search) and vibration need the live HTTPS link above — they don't work from a local file.

---

## What it is

UmamiGo is a single-file Progressive Web App (PWA): all the HTML, CSS and JavaScript live in one `index.html`. It runs on both Android and iOS straight from the browser and can be installed to the home screen. It's the third stage of the project, after the paper prototype (Project 1) and the high-fidelity Figma design (Project 2).

## Main features

- **Seven screens** following the full order flow: Home Map → Voice Search → Restaurant Profile → Dish Customisation → Order Confirmed → Live Tracking → Arrival Alert
- **Touch input** everywhere: a draggable map, a swipe-up bottom sheet, a draggable spice slider, and a finger-driven cuisine carousel
- **Voice input** via the Web Speech API (with a graceful fallback when speech isn't supported)
- **Location / map**: restaurants shown as pins, plus an animated live-tracking route
- **Three kinds of feedback**: visual (animations, progress bar), audio (Web Audio API chimes), and haptic/vibration — with a cross-platform fallback so the cue is still felt on iOS
- **Built-in usability logging**: every tap and task time is recorded to `localStorage`, with a facilitator panel that shows descriptive statistics and exports CSV/JSON

## How to run

**Online (recommended):** just open the live link above on your phone.

**Locally:** download `index.html` and open it in a browser. Note that voice search and vibration require HTTPS, so they only work fully from the live GitHub Pages link, not from a local file.

## Usability testing

The app has a facilitator panel for running usability tests:

1. Open the app and enter a participant ID (e.g. `P1`) on the welcome screen.
2. Let the participant complete the five tasks. Every interaction is logged automatically.
3. Tap the **📊 button** (bottom-right) to see live statistics — completion rate, mean/median time and taps per task, and the mean rating.
4. Use **Download CSV / JSON** to export the raw interaction logs for the report.

## Tech stack

HTML · CSS · JavaScript (no build step) · Web Speech API · Geolocation · Vibration API · Web Audio API · `localStorage` · hosted on GitHub Pages.

## Project files

- `index.html` — the complete application structure
- `style.css` — the application styling
- `app.js` — the application functionality
- `README.md` — this file

## Notes

- iOS Safari blocks the Vibration API at the browser level, so on iPhone the haptic cue is reinforced with an on-screen flash, a short shake and an audio tick instead.
- The map and ride animation are stylised representations, not a real mapping service — this is a prototype for a university project.
