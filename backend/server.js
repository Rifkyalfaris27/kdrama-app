import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import puppeteer from "puppeteer";
import { scrapeEpisodePage } from "./scrapper/scrapeDetail.js";
import proxyRouter from "./router/proxy.js";

const app = express();
const PORT = 1000;
app.use(proxyRouter);

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

const mainUrl = "https://tv1.nontondrama.my/";

app.use("/", proxyRouter);

app.get("/home", async (req, res) => {
  try {
    try {
      const page = req.query.page || 1;
      const mainUrl = "https://tv1.nontondrama.my";
      let url = "";

      page === 1
        ? (url = `${mainUrl}/latest/type/series/country/south-korea`)
        : (url = `${mainUrl}/latest/type/series/country/south-korea/page/${page}`);

      // Ambil HTML dari halaman
      const { data } = await axios.get(url);

      // Load ke cheerio
      const $ = cheerio.load(data);

      const dramas = [];
      $("article").each((i, el) => {
        const relativeLink = $(el).find("a").attr("href");
        const directLink = relativeLink.replace(
          "-2025",
          "-season-1-episode-1-2025"
        );
        const link = mainUrl + directLink;

        const title = $(el).find(".poster-title").text().trim();
        const episode = $(el).find(".episode strong").text().trim();
        const poster = $(el).find("picture img").attr("src");
        const year = $(el).find(".year").text().trim();

        dramas.push({ title, episode, poster, year, link });
      });

      // cari total pages dari pagination website
      const lastPage = $(".pagination li").last().prev().text(); // contoh kalau struktur HTML-nya begitu
      const totalPages = parseInt(lastPage) || page; // fallback kalau nggak ketemu

      res.json({
        items: dramas,
        totalPages: totalPages,
        currentPage: page,
      });

    } catch (err) {
      console.error("Error:", err.message);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/scrape/detail", async (req, res) => {
  try {
    const episodeUrl = req.query.url;
    if (!episodeUrl) {
      return res.status(400).json({ error: "Parameter 'url' wajib diisi" });
    }

    const result = await scrapeEpisodePage(episodeUrl);
    res.json(result);
    console.log(result);
    console.log(episodeUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
