import type { Room } from "@/types";

export interface RoomFilters {
  attendees: number;
  equipment: string[];
}

export function matchesFilters(room: Room, filters: RoomFilters): boolean {
  const needed = Math.max(1, Math.floor(filters.attendees) || 1);
  return (
    room.capacity >= needed &&
    filters.equipment.every((item) => room.equipment.includes(item))
  );
}

export function filterRooms(rooms: Room[], filters: RoomFilters): Room[] {
  return rooms.filter((room) => matchesFilters(room, filters));
}

export function listEquipment(rooms: Room[]): string[] {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort((a, b) =>
    a.localeCompare(b),
  );
}
