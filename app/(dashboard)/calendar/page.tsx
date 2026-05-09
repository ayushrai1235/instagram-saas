import type { Metadata } from "next";

import CalendarClient from "./CalendarClient";

export const metadata: Metadata = {
  title: "Calendar",
  description: "View and reschedule your social content calendar",
};

export default function CalendarPage() {
  return <CalendarClient />;
}
