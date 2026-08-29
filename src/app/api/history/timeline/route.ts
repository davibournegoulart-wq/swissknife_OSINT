import { NextResponse } from "next/server";
import { getTimeline } from "@/lib/db";

export const revalidate = 0; // Disable cache

export async function GET() {
  try {
    const timeline = getTimeline();
    return NextResponse.json({ timeline });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}
