import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/db";

export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timestampStr = searchParams.get('t');
    
    if (!timestampStr) {
      return NextResponse.json({ error: "Missing timestamp parameter" }, { status: 400 });
    }
    
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
      return NextResponse.json({ error: "Invalid timestamp" }, { status: 400 });
    }
    
    const data = getSnapshot(timestamp);
    if (!data) {
      return NextResponse.json({ error: "Snapshot not found" }, { status: 404 });
    }
    
    return NextResponse.json({ flights: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch snapshot" }, { status: 500 });
  }
}
