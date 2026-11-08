"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addCategoryRecord,
  checkInByCode,
  createEventRecord,
  deleteCategoryRecord,
  registerGuestRecord,
  relabelTicketRecord,
  updateCategoryRecord,
} from "@/lib/store";
import { StoreError, type ActionState, type CheckInState } from "@/lib/types";

function revalidateEvent(eventId: string, codes: string[] = []) {
  revalidatePath("/");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/manage`);
  revalidatePath(`/events/${eventId}/check-in`);
  for (const code of codes) {
    revalidatePath(`/tickets/${code}`);
  }
}

function refreshEvent(eventId: string, codes: string[] = []) {
  revalidateEvent(eventId, codes);
  refresh();
}

function asError(error: unknown): ActionState {
  if (error instanceof StoreError) return { error: error.message };
  throw error;
}

export async function createEvent(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const names = formData.getAll("categoryName");
  let created: { id: string; ownerKey: string };

  try {
    created = await createEventRecord({
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      venue: String(formData.get("venue") ?? ""),
      startsAt: String(formData.get("startsAt") ?? ""),
      categories: names.map((name, index) => ({
        name: String(name),
        description: String(formData.getAll("categoryDescription")[index] ?? ""),
        capacity: String(formData.getAll("categoryCapacity")[index] ?? ""),
        color: String(formData.getAll("categoryColor")[index] ?? ""),
      })),
    });
  } catch (error) {
    return asError(error);
  }

  revalidatePath("/");
  redirect(`/events/${created.id}/manage?key=${encodeURIComponent(created.ownerKey)}`);
}

export async function registerGuest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let registered: { code: string; eventId: string };

  try {
    registered = await registerGuestRecord({
      eventId: String(formData.get("eventId") ?? ""),
      categoryId: String(formData.get("categoryId") ?? ""),
      guestName: String(formData.get("guestName") ?? ""),
      guestEmail: String(formData.get("guestEmail") ?? ""),
    });
  } catch (error) {
    return asError(error);
  }

  revalidateEvent(registered.eventId, [registered.code]);
  redirect(`/tickets/${registered.code}`);
}

export async function checkInTicket(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const result = await checkInByCode(String(formData.get("code") ?? ""));
    refreshEvent(result.eventId, [result.code]);
    return null;
  } catch (error) {
    return asError(error);
  }
}

export async function checkInAtEvent(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  try {
    const rawCode = String(formData.get("code") ?? "").trim();
    if (!rawCode) return { error: "Enter your ticket code." };

    const result = await checkInByCode(rawCode, String(formData.get("eventId") ?? ""));
    refreshEvent(result.eventId, [result.code]);
    return {
      already: result.already,
      guestName: result.guestName,
      categoryName: result.categoryName,
      whenLabel: result.checkedInLabel,
      code: result.code,
    };
  } catch (error) {
    if (error instanceof StoreError) return { error: error.message };
    throw error;
  }
}

export async function addCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await addCategoryRecord(eventId, String(formData.get("ownerKey") ?? ""), {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      capacity: String(formData.get("capacity") ?? ""),
      color: String(formData.get("color") ?? ""),
    });
  } catch (error) {
    return asError(error);
  }

  refreshEvent(eventId);
  return null;
}

export async function updateCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await updateCategoryRecord(
      eventId,
      String(formData.get("ownerKey") ?? ""),
      String(formData.get("categoryId") ?? ""),
      {
        name: String(formData.get("name") ?? ""),
        description: String(formData.get("description") ?? ""),
        capacity: String(formData.get("capacity") ?? ""),
        color: String(formData.get("color") ?? ""),
      },
    );
  } catch (error) {
    return asError(error);
  }

  refreshEvent(eventId);
  return null;
}

export async function deleteCategory(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const eventId = String(formData.get("eventId") ?? "");
  try {
    await deleteCategoryRecord(
      eventId,
      String(formData.get("ownerKey") ?? ""),
      String(formData.get("categoryId") ?? ""),
    );
  } catch (error) {
    return asError(error);
  }

  refreshEvent(eventId);
  return null;
}

export async function relabelTicket(input: {
  eventId: string;
  ownerKey: string;
  ticketId: string;
  categoryId: string;
}) {
  try {
    const code = await relabelTicketRecord(input);
    refreshEvent(input.eventId, [code]);
    return null;
  } catch (error) {
    return asError(error);
  }
}
