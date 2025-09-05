// router/proxy.js
import express from "express";
import axios from "axios";

const router = express.Router();

// Streamer umum untuk segmen/keys/subs/dll
router.get("/proxy", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing url");

  try {
    const u = new URL(url);
    const r = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Referer: u.origin + "/",
        Origin: u.origin,
      },
    });

    res.set("Access-Control-Allow-Origin", "*");
    if (r.headers["content-type"]) {
      res.set("Content-Type", r.headers["content-type"]);
    }
    r.data.pipe(res);
  } catch (e) {
    console.error("❌ Proxy error:", e.message);
    res.status(500).send("Proxy error");
  }
});

// Playlist rewriter
router.get("/hls.m3u8", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing url");

  try {
    const src = new URL(url);
    const originProxy = `${req.protocol}://${req.get("host")}`;

    const absolutize = (maybe) => {
      if (!maybe || maybe.startsWith("#")) return maybe;
      if (/^https?:\/\//i.test(maybe)) return maybe;
      if (maybe.startsWith("/")) return src.origin + maybe;
      const basePath = src.pathname.substring(
        0,
        src.pathname.lastIndexOf("/") + 1
      );
      return src.origin + basePath + maybe;
    };

    const resp = await axios.get(url, {
      responseType: "text",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36",
        Referer: src.origin + "/",
        Origin: src.origin,
      },
    });

    const rewritten = resp.data
      .split("\n")
      .map((line) => {
        if (line.startsWith("#EXT-X-KEY")) {
          return line.replace(/URI="([^"]+)"/, (_, p1) => {
            const abs = absolutize(p1);
            return `URI="${originProxy}/proxy?url=${encodeURIComponent(abs)}"`;
          });
        }
        if (line.startsWith("#") || line.trim() === "") return line;

        const abs = absolutize(line.trim());
        return `${originProxy}/proxy?url=${encodeURIComponent(abs)}`;
      })
      .join("\n");

    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", "application/vnd.apple.mpegurl");
    res.send(rewritten);
  } catch (e) {
    console.error("❌ Rewrite error:", e.message);
    res.status(500).send("Rewrite error");
  }
});

export default router;
