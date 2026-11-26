import type { Room } from "@/types";

export const CURRENT_TIME = 540;

export const ROOMS: Room[] = [
  {
    id: "eng-201",
    name: "Engineering Lab 201",
    building: "Block A · Engineering",
    capacity: 40,
    equipment: ["Workstations", "3D printer", "Projector"],
    blocked: false,
    bookings: [
      { title: "Circuits Lab", start: 9 * 60, end: 10 * 60 },
      { title: "Robotics Workshop", start: 11 * 60, end: 12 * 60 + 30 },
      { title: "Office Hours", start: 14 * 60, end: 15 * 60 },
      { title: "Build Session", start: 16 * 60 + 30, end: 18 * 60 },
    ],
  },
  {
    id: "lib-110",
    name: "Library Study Room 110",
    building: "Block C · Library",
    capacity: 6,
    equipment: ["Whiteboard", "Wall display"],
    blocked: false,
    bookings: [{ title: "Study Group", start: 10 * 60, end: 11 * 60 }],
  },
  {
    id: "lh-3",
    name: "Lecture Hall 3",
    building: "Block B · Humanities",
    capacity: 120,
    equipment: ["Projector", "Microphone", "Lectern"],
    blocked: false,
    bookings: [{ title: "Guest Lecture", start: 13 * 60, end: 14 * 60 + 30 }],
  },
  {
    id: "sem-4b",
    name: "Seminar Room 4B",
    building: "Block B · Humanities",
    capacity: 12,
    equipment: ["Whiteboard", "Video conferencing"],
    blocked: false,
    bookings: [
      { title: "Thesis Defense", start: 9 * 60 + 30, end: 10 * 60 + 30 },
      { title: "Postgrad Seminar", start: 12 * 60, end: 13 * 60 },
      { title: "Reading Group", start: 15 * 60, end: 16 * 60 },
    ],
  },
  {
    id: "mus-2",
    name: "Music Practice Room 2",
    building: "Block D · Arts",
    capacity: 4,
    equipment: ["Upright piano"],
    blocked: true,
    blockReason: "Closed for maintenance: piano tuning and HVAC repair until 17:00.",
    bookings: [],
  },
];
