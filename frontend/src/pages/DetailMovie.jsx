import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Hls from "hls.js";

const DetailMovie = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  const videoRef = useRef(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { url, poster } = location.state || {};

  // Get data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:1000/scrape/detail?url=${encodeURIComponent(url)}`
        );
        if (response.status === 200) {
          setData(response.data);

          if (response.data.seasons && response.data.seasons.length > 0) {
            setSelectedSeason(response.data.seasons[0]);
          }

          // Set episode pertama sebagai default
          if (response.data.episodes && response.data.episodes.length > 0) {
            setSelectedEpisode(response.data.episodes[0]);
          }

          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [url]);

  // HLS video setup
  useEffect(() => {
    const rawVideoUrl =
      selectedEpisode?.videoUrl || data?.currentEpisode?.videoUrl || "";

    const proxiedUrl = rawVideoUrl
      ? `http://localhost:1000/hls.m3u8?url=${encodeURIComponent(rawVideoUrl)}`
      : "";

    if (proxiedUrl && videoRef.current) {
      let hls;

      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(proxiedUrl);
        hls.attachMedia(videoRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setVideoLoading(false);
          if (videoRef.current) {
            videoRef.current.play().catch((error) => {
              console.warn("Error playing video:", error);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS.js error:", data);
          setVideoLoading(false);
        });
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = proxiedUrl;

        videoRef.current.addEventListener("loadedmetadata", () => {
          setVideoLoading(false);
          videoRef.current
            .play()
            .catch((err) =>
              console.warn("Autoplay blocked, user interaction required:", err)
            );
        });
      }

      return () => {
        if (hls) {
          hls.destroy();
        }
      };
    }
  }, [data, selectedEpisode]);

  const handleEpisodeSelect = async (episode) => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute("src"); // reset source
      videoRef.current.load();
    }
    setVideoLoading(true);

    setSelectedEpisode(episode);

    try {
      const response = await axios.get(
        `http://localhost:1000/scrape/detail?url=${encodeURIComponent(
          episode.epUrl
        )}`
      );

      if (response.status === 200) {
        setData(response.data);

        // Update season & episode dari hasil scrape
        if (response.data.seasons && response.data.seasons.length > 0) {
          setSelectedSeason(response.data.seasons[0]);
        }

        if (response.data.episodes && response.data.episodes.length > 0) {
          // Cari episode yang sama dengan yang diklik
          const foundEp = response.data.episodes.find(
            (ep) => ep.epUrl === episode.epUrl
          );
          setSelectedEpisode(foundEp || response.data.episodes[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching episode data:", error);
    }
  };

  const handleSeasonSelect = (season) => {
    setSelectedSeason(season);
    setSelectedEpisode(null); // reset episode ketika season berganti
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-emerald-500">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-800 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-950 text-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-950/95 backdrop-blur-xl border-b border-emerald-500/10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-500 m-0 truncate">
            Korean Drama
          </h1>
          <button
            onClick={() => navigate("/home")}
            className="bg-transparent border border-emerald-800 text-emerald-500 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg cursor-pointer text-xs sm:text-sm lg:text-base font-medium transition-all duration-200 hover:bg-emerald-800/20 hover:border-emerald-600 active:scale-95 min-w-[80px] sm:min-w-[100px]"
          >
            <span className="hidden sm:inline">← Back to Home</span>
            <span className="sm:hidden">← Back</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 lg:pt-24 px-3 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Video Player */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-emerald-500/10 shadow-2xl">
            <div className="relative w-full pb-[56.25%] bg-black rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4 shadow-inner">
              <video
                ref={videoRef}
                controls
                muted
                className="absolute top-0 left-0 w-full h-full border-none"
                style={{ background: "#000" }}
              />
              {videoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-emerald-400 text-xs sm:text-sm font-medium">
                      Loading video...
                    </p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-slate-400 text-xs sm:text-sm lg:text-base m-0 text-center font-medium">
              <span className="text-emerald-400">Now playing:</span>{" "}
              {selectedEpisode?.epTitle || "Select an Episode"}
            </p>
          </div>

          {/* Drama Info */}
          <div className="flex flex-col lg:grid lg:grid-cols-[280px_1fr] gap-6 sm:gap-8 lg:gap-12 mb-6 sm:mb-8">
            <div className="w-40 sm:w-48 lg:w-full flex-shrink-0 mx-auto lg:mx-0">
              <div className="relative group">
                <img
                  src={poster || "/placeholder.svg"}
                  alt={data.title}
                  className="w-full h-60 sm:h-72 lg:h-96 object-cover rounded-xl border border-emerald-500/20 shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
              </div>
            </div>

            <div className="text-center lg:text-left space-y-4 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-50 leading-tight tracking-tight">
                {data.title}
              </h1>

              <div className="flex gap-2 sm:gap-3 lg:gap-4 justify-center lg:justify-start flex-wrap">
                <span className="bg-emerald-800/80 backdrop-blur-sm text-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-emerald-500/20">
                  {data.seasons.length} Season
                  {data.seasons.length > 1 ? "s" : ""}
                </span>
                <span className="bg-emerald-800/80 backdrop-blur-sm text-emerald-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border border-emerald-500/20">
                  {data.episodes.length} Episodes
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-400 flex items-center justify-center lg:justify-start gap-2">
                  <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                  Synopsis
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm sm:text-base lg:text-lg max-w-none lg:max-w-2xl">
                  {data.synopsis}
                </p>
              </div>
            </div>
          </div>

          {/* Season List */}
          {data.seasons && data.seasons.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-500/10 mb-6 sm:mb-8 shadow-xl">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-400 mb-4 sm:mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Seasons
              </h3>
              <div className="flex gap-2 sm:gap-3 lg:gap-4 flex-wrap">
                {data.seasons.map((season, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSeason(season)}
                    className={`${
                      selectedSeason?.name === season.name
                        ? "bg-emerald-700 text-emerald-300 border-emerald-400 shadow-lg shadow-emerald-500/25"
                        : "bg-gray-700/80 text-slate-300 border-gray-600 hover:bg-gray-600 hover:text-slate-50 hover:border-emerald-500/50"
                    } border-2 rounded-xl px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 cursor-pointer text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300 active:scale-95 min-w-[80px] sm:min-w-[100px] backdrop-blur-sm`}
                  >
                    {season.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episode List */}
          {selectedSeason && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-emerald-500/10 shadow-xl">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-emerald-400 mb-4 sm:mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Episodes - {selectedSeason.name}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {data.episodes?.map((episode, index) => (
                  <button
                    key={index}
                    onClick={() => handleEpisodeSelect(episode)}
                    className={`${
                      selectedEpisode?.epUrl === episode.epUrl
                        ? "bg-emerald-700 text-emerald-300 border-emerald-400 shadow-lg shadow-emerald-500/25"
                        : "bg-gray-700/80 text-slate-300 border-gray-600 hover:bg-gray-600 hover:text-slate-50 hover:border-emerald-500/50"
                    } border-2 rounded-xl px-4 sm:px-5 lg:px-6 py-3 sm:py-4 cursor-pointer text-sm sm:text-base font-medium transition-all duration-300 text-left active:scale-95 backdrop-blur-sm min-h-[50px] sm:min-h-[60px] flex items-center`}
                  >
                    <span className="truncate">{episode.epTitle}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DetailMovie;
