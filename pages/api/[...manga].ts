import { NextApiRequest, NextApiResponse } from "next";
import { MangaService } from "../../lib/manga-service";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { manga } = req.query;

    const path = Array.isArray(manga) ? manga[0] : manga;

    const page = parseInt(req.query.page as string) || 1;
    const type = (req.query.type as string) || "all";
    const lang = (req.query.lang as string) || "en";
    const infoId = req.query.id as string;

    let result: any;

    switch (path) {
      case "home":
        result = await MangaService.getHome();
        break;

      case "banners":
        const ids = JSON.parse(req.query.ids as string);
        if (!Array.isArray(ids)) throw new Error("Invalid IDs format");
        result = await MangaService.getBannerImages(ids);
        break;

      case "recent":
        if (!["all", "manga", "manwah", "manhua"].includes(type)) {
          throw new Error(
            "Invalid type. Supported types: all, manga, manwah, manhua"
          );
        }
        result = await MangaService.getRecent({ page, type });
        break;

      case "trending":
        result = await MangaService.getTrending({ page });
        break;

      case "info":
        if (!infoId) throw new Error("Manga ID is required");
        result = await MangaService.getMangaInfo(infoId);
        break;

      case "chapters":
        if (!infoId) throw new Error("Manga ID is required");
        result = await MangaService.getChapters(infoId, lang);
        break;

      case "volumes":
        if (!infoId) throw new Error("Manga ID is required");
        result = await MangaService.getVolumes(infoId, lang);
        break;

      case "chapters-with-ids":
        if (!infoId) throw new Error("Manga ID is required");
        result = await MangaService.getChaptersWithIds(infoId, lang);
        break;

      case "read":
        if (!infoId) throw new Error("Manga ID is required");
        result = await MangaService.getPages(infoId);
        break;

      default:
        throw new Error("Invalid endpoint");
    }

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
}
