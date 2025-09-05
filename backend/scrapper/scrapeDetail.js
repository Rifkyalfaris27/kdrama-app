// utils/scrape.js
import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const mainUrl = "https://tv1.nontondrama.my";
let browser;

export const initBrowser = async () => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });
  }
  return browser;
};

export const setupPage = async (page) => {
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const type = req.resourceType();
    if (["image", "stylesheet", "font", "media"].includes(type)) {
      req.abort();
    } else {
      req.continue();
    }
  });
};

// Ambil link iframe
export const getStreamIframe = async (page) => {
  try {
    await page.waitForSelector("iframe", { timeout: 5000 });
    return await page.$eval("iframe", (el) => el.src);
  } catch {
    return null;
  }
};

// Ambil link video (.m3u8/.mp4) dari request
export const z = async (page, iframeUrl) => {
  let videoUrl = null;

  const iframePage = await page.browser().newPage();
  await setupPage(iframePage);

  const videoPromise = new Promise((resolve) => {
    // Tangkap response dari API endpoint
    iframePage.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/api.php?id=")) {
        try {
          const body = await response.text();
          const match = body.match(/(https?:\/\/[^\s"']+\.m3u8)/);
          if (match) {
            videoUrl = match[1];
            console.log("Found videoUrl:", videoUrl);
            //add
            resolve(videoUrl);
          }
        } catch (err) {
          console.log("Error parsing API response:", err.message);
        }
      }
      if (url.includes(".m3u8") || url.includes(".mp4")) {
        videoUrl = url;
        console.log("Direct videoUrl:", videoUrl);
        //add
        resolve(videoUrl);
      }
    });
  });

  await iframePage.goto(iframeUrl, {
    // waitUntil: "networkidle2",
    waitUntil: "domcontentloaded",
    timeout: 20000,
  });

  //addd
  const result = await Promise.race([
    videoPromise,
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ]);

  await iframePage.close();
  return result;
};

export const scrapeEpisodePage = async (episodeUrl) => {
  const browser = await initBrowser();
  const page = await browser.newPage();
  await setupPage(page);

  await page.goto(episodeUrl, {
    waitUntil: "networkidle2",
    timeout: 20000,
  });

  //static cheerio
  const html = await page.content();
  const $ = cheerio.load(html);

  const title = $(".movie-info h1").text().trim();
  const poster = $(".poster img").attr("src");
  const synopsis =
    $(".synopsis.expanded").attr("data-full") || $(".synopsis").text().trim();

  const seasons = [];
  $(".season-list .season-select option").each((i, el) => {
    seasons.push({ name: $(el).text().trim() });
  });

  const episodes = await page.$$eval(
    ".mob-list-eps.second ul.episode-list li a",
    (els) => {
      const seen = new Set();
      return els
        .map((el) => ({
          epTitle: "Episode " + el.textContent.trim(),
          epUrl: el.href,
        }))
        .filter((ep) => {
          if (seen.has(ep.epUrl)) return false;
          seen.add(ep.epUrl);
          return true;
        });
    }
  );

  // Ambil iframe
  const iframeUrl = await getStreamIframe(page);

  // Ambil video asli
  let videoUrl = null;
  if (iframeUrl) {
    videoUrl = await z(page, iframeUrl);
  }

  await page.close();

  return {
    title,
    poster,
    synopsis,
    seasons,
    episodes,
    currentEpisode: {
      url: episodeUrl,
      iframeUrl,
      videoUrl,
    },
  };
};
