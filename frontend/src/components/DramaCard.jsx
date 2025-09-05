import { useState } from "react";
import PlaceHolder from "../assets/placeholder.jpg";

const DramaCard = ({ drama }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="group bg-gray-800 border border-emerald-500/10 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[2/3] bg-gray-700 relative overflow-hidden">
        {/* Placeholder */}
        {!loaded && (
          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center animate-pulse">
            <img
              src={PlaceHolder} // boleh pakai default image kamu
              alt="Loading..."
              className="w-12 h-12 opacity-40"
            />
          </div>
        )}

        {/* Poster */}
        <img
          src={drama.poster || PlaceHolder}
          alt={`${drama.title} poster`}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.target.src = PlaceHolder; // fallback kalau poster gagal load
            setLoaded(true);
          }}
        />

        <div className="absolute top-2 right-2">
          <span className="bg-emerald-800 text-emerald-500 text-xs font-medium px-1.5 py-0.5 rounded-full">
            {drama.year}
          </span>
        </div>
      </div>

      <div className="p-2">
        <h3 className="font-semibold text-slate-50 text-xs leading-tight mb-1 line-clamp-2">
          {drama.title}
        </h3>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">{drama.episode} eps</span>
          <a
            href={drama.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-500 text-xs hover:text-emerald-400"
          >
            Watch →
          </a>
        </div>
      </div>
    </div>
  );
};

export default DramaCard;
