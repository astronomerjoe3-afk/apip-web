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
      return `/lesson_assets/F1/${folder}/videos/final.mp4`;
    case "poster":
      return `/lesson_assets/F1/${folder}/videos/thumbnail.png`;
    case "captions":
      return `/lesson_assets/F1/${folder}/videos/captions.vtt`;
    default:
      return null;
  }
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
  return Response.redirect(new URL(filePath, request.url), 307);
}
