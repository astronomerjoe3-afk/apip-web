import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

export const runtime = "nodejs";

type AssetKind = "video" | "poster" | "captions";

function isAssetKind(value: string): value is AssetKind {
  return value === "video" || value === "poster" || value === "captions";
}

function isLessonId(value: string): boolean {
  return /^[A-Z0-9]+_L[0-9A-Z]+$/u.test(value);
}

function lessonAssetPath(lessonId: string, asset: AssetKind): string | null {
  if (!isLessonId(lessonId)) return null;
  const moduleId = lessonId.split("_", 1)[0];
  switch (asset) {
    case "video":
      return path.resolve(process.cwd(), "public", "lesson_assets", moduleId, lessonId, "videos", "final.mp4");
    case "poster":
      return path.resolve(process.cwd(), "public", "lesson_assets", moduleId, lessonId, "videos", "thumbnail.png");
    case "captions":
      return path.resolve(process.cwd(), "public", "lesson_assets", moduleId, lessonId, "videos", "captions.vtt");
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

    const fullStream = createReadStream(filePath);
    return new Response(asWebStream(fullStream), {
      headers: {
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
        "Content-Disposition": "inline",
      },
    });
  }
  catch {
    return new Response("Lesson asset not found.", { status: 404 });
  }
}
