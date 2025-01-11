import axios from "axios";
import { BasicAcceptedElems, CheerioAPI, load } from "cheerio";
import { decode } from "he";

export class MangaService {
  private static readonly BASE_URL = "https://mangafire.to";
  private static readonly DEFAULT_HEADERS = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    Pragma: "no-cache",
    "Cache-Control": "no-cache",
    Cookie:
      "__pf=1; usertype=guest; cf_clearance=oDALgu21pb._3XLgX9oUgB.Un_psCMCcn1qcdFxJWvY-1736596025-1.2.1.1-5pU1RWJ6Pdebm4r3bb1DudZ0HX0fukmPwvEQ8ZJa8JA5XUhqOw0oIBRycpFy_tzH6E1soqufEE2Er1cDUSX5JkqtbdGYN9k4WFj0Q0qxknlVnJugY5wETvjvsKeg_o_Rc4sc7xqQlcoLkKn5oPyotSbVyR9W3915amN6oRklTrJlqU11zJxApfAYOzxKskvCDJNRGIypZ.FeRKPT0h01xGJJVKBhnM9kJ7nIYv1R9eDOeYIlK9xayZXsfyI3Q1TMKG3AKGJxiZ6WN1TVhAPc7e7ek77qxHX8gGfn8Q4B7zsYYsPjUs.eG0Uw_dWAlTa.c2wI4U.YV4xqAE6iSC1T2xYOpwz4tw9Ewoyqr.jmL3E",
  };

  private static async makeRequest(url: string, additionalHeaders = {}) {
    try {
      const { data } = await axios.get(url, {
        headers: {
          ...this.DEFAULT_HEADERS,
          ...additionalHeaders,
          Referer: this.BASE_URL + "/",
        },
        timeout: 10000,
      });
      return data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static handleError(error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Content not found");
      }
      throw new Error(error.message || "Network error occurred");
    }
    throw error;
  }

  static async getHome() {
    try {
      const response = await this.makeRequest(`${this.BASE_URL}/home`);
      const $ = load(response);

      const carouselIds: string[] = [];
      const carouselData = $(".swiper-inner")
        .map((_, element) => {
          const chapval = $(element).find(".below p").text().trim().split("-");
          const id = $(element).find(".unit").attr("href")?.split("/").pop();
          carouselIds.push(id ?? "");
          return {
            status: $(element).find(".above span").text(),
            title: $(element).find(".unit").text(),
            id: id,
            image: $(element).find("img").attr("src"),
            description: $(element).find("span").text(),
            chapters: chapval?.[0].trim().split(" ").pop(),
            volumes: chapval?.[1].trim().split(" ").pop(),
            tags: $(element)
              .find(".below a")
              .map((_, tag) => $(tag).text())
              .get(),
          };
        })
        .get();

      return {
        carouselIds,
        carouselData,
        newReleaseData: this.parseBasicCards(
          $,
          ".swiper.completed .swiper-slide"
        ),
        mostViewData: {
          day: this.parseBasicCards(
            $,
            '.tab-content[data-name="day"] .swiper-slide'
          ),
          week: this.parseBasicCards(
            $,
            '.tab-content[data-name="week"] .swiper-slide'
          ),
          month: this.parseBasicCards(
            $,
            '.tab-content[data-name="month"] .swiper-slide'
          ),
        },
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getBannerImages(ids: string[]) {
    try {
      const responses = await Promise.all(
        ids.map((id) => this.makeRequest(`${this.BASE_URL}/manga/${id}`))
      );

      return responses.map((html) => {
        const $ = load(html);
        return $(".detail-bg img").attr("src") || "";
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getRecent({ page = 1, type = "all" }) {
    if (!["all", "manga", "manwah", "manhua"].includes(type)) {
      throw new Error(
        "Invalid type. Supported types: all, manga, manwah, manhua"
      );
    }

    try {
      const response = await this.makeRequest(
        `${this.BASE_URL}/ajax/home/widget/updated-${type}?page=${page}`,
        {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        }
      );
      const $ = load(response.result);
      return this.parseCards($, ".unit");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getTrending({ page = 1 }) {
    try {
      const response = await this.makeRequest(
        `${this.BASE_URL}/filter?keyword=&sort=trending&page=${page}`
      );
      const $ = load(response);
      return this.parseCards($, ".unit");
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getMangaInfo(id: string) {
    try {
      const response = await this.makeRequest(`${this.BASE_URL}/manga/${id}`);
      const $ = load(response);

      return {
        id,
        banner: $(".detail-bg img").attr("src"),
        image: $(".poster img").attr("src"),
        status: $(".info p").text(),
        title: $(".info h1").text(),
        altTitles: $(".content .info h6")
          .text()
          .split(";")
          .map((t) => t.trim()),
        type: $(".min-info a").text(),
        rating: $(".min-info span b").text().split(" ")[0],
        views: $(".min-info span:has(i)").text().split(" ")[1],
        description: $("#synopsis").text().trim().replace(/\\/g, ""),
        author: $('a[itemprop="author"]').text(),
        published: $(".sidebar .meta div:nth-child(2)")
          .text()
          .split(":")[1]
          ?.trim(),
        genres: $(".sidebar .meta div:nth-child(3)")
          .text()
          .split(":")[1]
          ?.trim()
          .split(/,\s+/),
        mangazines: $(".sidebar .meta div:nth-child(4) a").text(),
        relation: $(".m-related .tab-content")
          .map((_, rel) => ({
            type: $(rel).attr("data-name"),
            mangas: $(rel)
              .find("a")
              .map((_, item) => ({
                id: $(item).attr("href")?.split("/").pop(),
                title: $(item).text(),
              }))
              .get(),
          }))
          .get(),
        suggested: $(".side-manga .unit")
          .map((_, item) => ({
            id: $(item).attr("href")?.split("/").pop(),
            title: $(item).find("img").attr("src"),
            image: $(item).find("h6").text(),
            chapters: $(item).find("span:nth-child(1)").text(),
            volumes: $(item).find("span:nth-child(2)").text(),
          }))
          .get(),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getChapters(id: string, lang: string = "en") {
    try {
      const actualId = id.split(".").pop();
      const response = await this.makeRequest(
        `${this.BASE_URL}/ajax/manga/${actualId}/chapter/${lang.toLowerCase()}`,
        {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        }
      );
      const $ = load(response.result);

      return $(".item")
        .map((_, item) => {
          const a = $(item).find("a");
          const chapval = a.attr("title")?.split("-");
          return {
            id: a.attr("href")?.split(`${actualId}`).pop(),
            lang: lang.toUpperCase(),
            number: $(item).attr("data-number"),
            title: decode($(item).find("span:nth-child(1)").text())
              .split(":")
              .pop()
              ?.trim(),
            posted: $(item).find("span:nth-child(2)").text(),
            volume: chapval?.[0].trim(),
            chapter: chapval?.[1].trim(),
          };
        })
        .get();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getVolumes(id: string, lang: string = "en") {
    try {
      const actualId = id.split(".").pop();
      const response = await this.makeRequest(
        `${this.BASE_URL}/ajax/manga/${actualId}/volume/${lang.toLowerCase()}`,
        {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        }
      );
      const $ = load(response.result);

      return $(".unit")
        .map((_, item) => {
          let image = $(item).find("img").attr("src");
          if (!image?.startsWith("http")) {
            image = `${this.BASE_URL}/${image}`;
          }
          return {
            id: $(item).find("a").attr("href"),
            image,
          };
        })
        .get();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getChaptersWithIds(id: string, lang: string = "en") {
    try {
      const actualId = id.split(".").pop();
      const response = await this.makeRequest(
        `${this.BASE_URL}/ajax/read/${actualId}/chapter/${lang.toLowerCase()}`,
        {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        }
      );
      const $ = load(response.result.html);

      return $("li a")
        .map((_, item) => ({
          id: $(item).attr("data-id"),
          lang: lang.toUpperCase(),
          chapter: $(item).attr("data-number"),
          title: decode($(item).attr("title") || "")
            .split(":")
            .pop()
            ?.trim(),
        }))
        .get();
    } catch (error) {
      throw this.handleError(error);
    }
  }

  static async getPages(id: string) {
    try {
      const response = await this.makeRequest(
        `${this.BASE_URL}/ajax/read/chapter/${id}`,
        {
          "X-Requested-With": "XMLHttpRequest",
          Accept: "application/json, text/javascript, */*; q=0.01",
        }
      );
      return response.result.images.map((item: any) => item[0]);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private static parseBasicCards($: CheerioAPI, selector: string) {
    return $(selector)
      .map((_, element) => ({
        id: $(element).find("a").attr("href")?.split("/").pop(),
        image: $(element).find("img").attr("src"),
        title: $(element).find("span").text().trim(),
      }))
      .get();
  }

  private static parseCards($: CheerioAPI, selector: string) {
    return $(selector)
      .map((_, element) => ({
        type: $(element).find(".type").text().trim(),
        id: $(element).find(".poster").attr("href")?.split("/").pop(),
        image: $(element).find("img").attr("src"),
        title: $(element).find("img").attr("alt"),
        recentChapters: this.parseChapterList(
          $,
          element,
          '.content[data-name="chap"]'
        ),
        recentVolumes: this.parseChapterList(
          $,
          element,
          '.content[data-name="vol"]'
        ),
      }))
      .get();
  }

  private static parseChapterList(
    $: CheerioAPI,
    element: BasicAcceptedElems<any>,
    selector: string
  ) {
    return $(element)
      .find(`${selector} li`)
      .map((_, item) => {
        const [chap, time] = $(item).find("span");
        const lang = $(chap).find("b").text().trim();
        return {
          id: $(item).find("a").attr("href"),
          chapter: $(chap).text().split(lang)[0].trim(),
          lang: lang,
          airedAt: $(time).text().trim(),
        };
      })
      .get();
  }
}
