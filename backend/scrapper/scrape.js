import axios from "axios";
import * as cheerio from "cheerio";

(async () => {
  try {
    const mainUrl = "https://tv1.nontondrama.my";
    let url = "";

    let page = 1;

    page === 1
      ? (url = `${mainUrl}/latest/type/series/country/south-korea`)
      : (url = `${mainUrl}/latest/type/series/country/south-korea/page/${page}`);

    // Ambil HTML dari halaman
    const { data } = await axios.get(url);

    // Load ke cheerio
    const $ = cheerio.load(data);

    const results = [];

    $("article").each((i, el) => {
      const relativeLink = $(el).find("a").attr("href");
      const directLink = relativeLink.replace(
        "-2025",
        "-season-1-episode-1-2025"
      );
      const link = mainUrl + directLink;

      const title = $(el).find(".poster-title").text().trim();
      const episode = $(el).find(".episode strong").text().trim();
      const poster = $(el).find("img[itemprop='image']").attr("src");
      const year = $(el).find(".year").text().trim();

      results.push({ link, title, episode, poster, year });
    });

    console.log(results);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();

// import axios from "axios";
// import * as cheerio from "cheerio";

// async function scrapeDrakor() {
//   try {
//     const mainUrl = "https://drakor9.kita.hair";
//     let url = "";

//     let page = 1;

//     page === 1
//       ? (url = "https://drakor9.kita.hair/all?country=Korea")
//       : (url = `https://drakor9.kita.hair/all?page=${page}&country=Korea&year=c2d0de&genre=c2d0de&media_type=c2d0de`);

//     const { data } = await axios.get(url);
//     const $ = cheerio.load(data);

//     let results = [];

//     $("a.poster").each((i, el) => {
//       //   const link = mainUrl + $(el).attr("href");
//       const link = $(el).attr("href");
//       const img = $(el).find("img.poster").attr("src");

//       let rawTitle = $(el).find("img.poster").attr("alt") || "";
//       const title = rawTitle.replace(/^Nonton Drama Korea\s*/i, "").trim();
//       let rawEpisode = $(el).find(".bungkus .tagw .qua").text().trim();
//       let episode = rawEpisode.includes("END")
//         ? rawEpisode.slice(1).replace("END", "").trim()
//         : rawEpisode.split("/")[1];

//       results.push({
//         title,
//         link,
//         img,
//         episode,
//       });
//     });

//     console.log(results);
//     console.log(url);
//   } catch (err) {
//     console.error("Error:", err.message);
//   }
// }

// scrapeDrakor();
