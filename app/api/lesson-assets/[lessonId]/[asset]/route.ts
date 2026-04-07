import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";

const LESSON_FOLDER_MAP: Record<string, string> = {
  F1_L1: "F1_L1",
  F1_L2: "F1_L2",
  F1_L3: "F1_L3",
  F1_L4: "F1_L4",
  F1_L5: "F1_L5",
  F1_L6: "F1_L6",
};

type AssetKind = "video" | "poster" | "captions";

function isAssetKind(value: string): value is AssetKind {
  return value === "video" || value === "poster" || value === "captions";
}

function lessonAssetPath(lessonId: string, asset: AssetKind): string | null {
  const folder = LESSON_FOLDER_MAP[lessonId];
  if (!folder) return null;
  switch (asset) {
    case "video":
      return path.resolve(process.cwd(), "public", "lesson_assets", "F1", folder, "videos", "final.mp4");
    case "poster":
      return path.resolve(process.cwd(), "public", "lesson_assets", "F1", folder, "videos", "thumbnail.png");
    case "captions":
      return path.resolve(process.cwd(), "public", "lesson_assets", "F1", folder, "videos", "captions.vtt");
    default:
      return null;
  }
}

function asWebStream(stream: ReturnType<typeof createReadStream>): ReadableStream {
  return Readable.toWeb(stream) as ReadableStream;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ lessonId: string; asset: string }> },
): Promise<Response> {
  const { lessonId, asset } = await context.params;
  if (!isAssetKind(asset)) {
    return new Response("Unknown asset type.", { status: 404 });
  }

  const filePath = lessonAssetPath(lessonId, asset);
  if (!filePath) {
    return new Response("Unknown lesson asset.", { status: 404 });
  }

  try {
    if (asset === "captions") {
      const vtt = await readFile(filePath, "utf-8");
      return new Response(vtt, {
        headers: {
          "Content-Type": "text/vtt; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    if (asset === "poster") {
      const image = await readFile(filePath);
      return new Response(image, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const fileStat = await stat(filePath);
    const rangeHeader = request.headers.get("range");

    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/u.exec(rangeHeader);
      if (!match) {
        return new Response("Invalid range request.", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const start = match[1] ? Number.parseInt(match[1], 10) : 0;
      const requestedEnd = match[2] ? Number.parseInt(match[2], 10) : fileStat.size - 1;
      const end = Math.min(requestedEnd, fileStat.size - 1);

      if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || start > end) {
        return new Response("Invalid range request.", {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }

      const stream = createReadStream(filePath, { start, end });
      return new Response(asWebStream(stream), {
        status: 206,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(end - start + 1),
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    const stream = createReadStream(filePath);
    return new Response(asWebStream(stream), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(fileStat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
  catch {
    return new Response("Lesson asset not found.", { status: 404 });
  }
}
