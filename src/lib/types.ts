export const CATEGORY_COLORS = [
  { id: "pine", value: "#234e3e", label: "Pine" },
  { id: "brass", value: "#8a5a12", label: "Brass" },
  { id: "navy", value: "#2c4c7c", label: "Navy" },
  { id: "wine", value: "#7a3148", label: "Wine" },
  { id: "moss", value: "#3f5c3a", label: "Moss" },
  { id: "saddle", value: "#6b4a2b", label: "Saddle" },
  { id: "plum", value: "#4a4458", label: "Plum" },
  { id: "teal", value: "#1f4f55", label: "Teal" },
] as const;

export type CategoryColor = (typeof CATEGORY_COLORS)[number]["value"];

export function isCategoryColor(value: string): value is CategoryColor {
  return CATEGORY_COLORS.some((color) => color.value === value);
}

export class StoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreError";
  }
}

export type TicketCategory = {
  id: string;
  name: string;
  description: string;
  color: CategoryColor;
  capacity: number | null;
};

export type EventRecord = {
  id: string;
  ownerKeyHash: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  createdAt: string;
  categories: TicketCategory[];
};

export type Ticket = {
  id: string;
  eventId: string;
  categoryId: string;
  guestName: string;
  guestEmail: string;
  code: string;
  createdAt: string;
  checkedInAt: string | null;
};

export type PublicCategory = TicketCategory & {
  taken: number;
};

export type PublicEvent = {
  id: string;
  title: string;
  description: string;
  venue: string;
  startsAt: string;
  whenLabel: string;
  monthLabel: string;
  dayLabel: string;
  past: boolean;
  categories: PublicCategory[];
  registeredCount: number;
  checkedInCount: number;
};

export type ManageTicket = {
  id: string;
  guestName: string;
  guestEmail: string;
  code: string;
  categoryId: string;
  checkedInAt: string | null;
  checkedInLabel: string | null;
};

export type TicketPass = {
  code: string;
  guestName: string;
  guestEmail: string;
  categoryName: string;
  categoryColor: CategoryColor;
  checkedInAt: string | null;
  checkedInLabel: string | null;
  event: {
    id: string;
    title: string;
    venue: string;
    whenLabel: string;
    monthLabel: string;
    dayLabel: string;
  };
};

export type CheckInResult = {
  eventId: string;
  code: string;
  guestName: string;
  categoryName: string;
  checkedInLabel: string;
  already: boolean;
};

export type ActionState = { error: string } | null;

export type CheckInState = {
  error?: string;
  already?: boolean;
  guestName?: string;
  categoryName?: string;
  whenLabel?: string;
  code?: string;
} | null;
