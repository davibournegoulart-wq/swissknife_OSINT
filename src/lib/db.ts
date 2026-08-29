import fs from 'fs';
import path from 'path';

// Store history inside the project root under .data/history
const HISTORY_DIR = path.join(process.cwd(), '.data', 'history');

// Ensure directory exists
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

export function saveSnapshot(flights: any[]) {
  try {
    const now = new Date();
    // File format: YYYY-MM-DD.jsonl
    const dateStr = now.toISOString().split('T')[0];
    const timestamp = now.getTime();
    
    const filePath = path.join(HISTORY_DIR, `${dateStr}.jsonl`);
    
    const payload = JSON.stringify({
      t: timestamp,
      f: flights // flight data
    }) + '\n';
    
    fs.appendFileSync(filePath, payload, 'utf8');
    // console.log(`[DB] Saved flight snapshot at ${now.toISOString()}`);
  } catch (error) {
    console.error('[DB] Error saving snapshot:', error);
  }
}

export function getTimeline(): { date: string, timestamps: number[] }[] {
  try {
    if (!fs.existsSync(HISTORY_DIR)) return [];
    const files = fs.readdirSync(HISTORY_DIR).filter(f => f.endsWith('.jsonl')).sort();
    
    const timeline = [];
    
    for (const file of files) {
      const date = file.replace('.jsonl', '');
      const filePath = path.join(HISTORY_DIR, file);
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      
      const timestamps = [];
      for (const line of lines) {
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.t) timestamps.push(parsed.t);
        } catch (e) {
          // ignore malformed line
        }
      }
      
      if (timestamps.length > 0) {
        timeline.push({ date, timestamps });
      }
    }
    
    return timeline;
  } catch (error) {
    console.error('[DB] Error getting timeline:', error);
    return [];
  }
}

export function getSnapshot(targetTimestamp: number): any[] | null {
  try {
    if (!fs.existsSync(HISTORY_DIR)) return null;
    const files = fs.readdirSync(HISTORY_DIR).filter(f => f.endsWith('.jsonl')).sort();
    
    for (const file of files) {
      const filePath = path.join(HISTORY_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split('\n');
      
      for (const line of lines) {
        if (!line) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.t === targetTimestamp) {
            return parsed.f || [];
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return null;
  } catch (error) {
    console.error('[DB] Error getting snapshot:', error);
    return null;
  }
}
