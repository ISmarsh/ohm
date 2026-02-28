# Ω Ohm

**A personal kanban for ADHD brains — manage the current.**

Ohm uses an electrical metaphor to map ADHD energy cycles into a visual workflow:

| Column | Metaphor | Purpose |
|--------|----------|---------|
| **Spark** ⚡ | The initial flash | Raw idea capture, zero friction |
| **Charge** 🔋 | Building energy | Shaped with a clear next step |
| **Live** 🔴 | Hot/active circuit | Currently working (WIP limited) |
| **Grounded** 🟣 | Safely discharged | Paused with "where I left off" context |
| **Powered** ✅ | Circuit complete | Done |

## Philosophy

- **Capture fast** — Spark column accepts just a title. Think later.
- **Always know what's next** — Every card has a "Next Step" field.
- **Don't abandon, ground** — Moving to Grounded prompts you to leave context for future you.
- **Match energy to tasks** — Energy tags (Quick Win / Medium / Deep Focus) let you filter by current state.
- **Limit WIP** — Soft limit on Live column prevents overcommitting during hyperfocus bursts.

## Tech Stack

- React 19 + TypeScript
- Tailwind CSS
- dnd-kit (drag and drop)
- Vite
- localStorage (MVP persistence)
- GitHub Pages (deployment)

## Getting Started

```bash
npm install
npm run dev
```

## Roadmap

- [ ] Google Drive sync (cross-device persistence)
- [ ] Energy-based filtering
- [ ] Quick wins view (low-energy day mode)
- [ ] Card archive (Powered cards older than 30 days)
- [ ] Discord webhook notifications
- [ ] Bluesky integration for accountability
- [ ] PWA support (installable on mobile)
- [ ] Keyboard shortcuts
- [ ] Analytics (completion rates, time-in-column)

## Deploy

```bash
npm run build
npm run deploy   # pushes to gh-pages branch
```

Update `vite.config.ts` base path to match your repo name.

## License

MIT
