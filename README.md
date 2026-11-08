# Marquee

Event board for listing a night, handing out tickets, checking guests in, and sorting those tickets into labels.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- **List an event** creates the public page and a private owner link.
- **Guests** register on the event page and receive a ticket code.
- **Check in** from the ticket, or enter the code on the event check-in page.
- **Labels** such as General or VIP are set by the owner, who can move tickets between them from the door list.

Event data is stored locally in `data/store.json`.
