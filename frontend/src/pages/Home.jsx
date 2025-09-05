// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import DramaCard from "../components/DramaCard";

// const Home = () => {
//   const [items, setItems] = useState([]); 
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await axios.get(
//           `http://localhost:1000/home?page=${currentPage}`
//         );

//         if (res.status === 200) {
//           setItems(res.data.items); 
//           setTotalPages(res.data.totalPages); 14
//         }
//       } catch (err) {
//         console.error("Error fetching data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentPage]);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-950 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-emerald-500 text-sm">Loading dramas...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-950">
//       {/* Header */}
//       <header className="border-b border-emerald-500/10 bg-gray-950/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
//         <div className="max-w-6xl mx-auto px-6 py-6">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold text-slate-50 mb-2 text-balance">
//               Korean Drama Collection
//             </h1>
//             <p className="text-slate-400 text-base leading-relaxed">
//               Discover exceptional Korean dramas and series
//             </p>
//           </div>
//         </div>
//       </header>

//       {/* Main */}
//       <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
//         {items.length === 0 ? (
//           <div className="text-center py-20">
//             <p className="text-slate-400 text-lg">No dramas available</p>
//           </div>
//         ) : (
//           <>
//             {/* Grid Items */}
//             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-8 gap-3">
//               {items.map((drama, index) => (
//                 <div
//                   key={index}
//                   className="group bg-gray-800 border border-emerald-500/10 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1"
//                 >
//                   <div className="aspect-[2/3] bg-gray-700 relative overflow-hidden">
//                     <DramaCard key={`${currentPage}-${index}`} drama={drama} />
//                     <div className="absolute top-2 right-2">
//                       <span className="bg-emerald-800 text-emerald-500 text-xs font-medium px-1.5 py-0.5 rounded-full">
//                         {drama.year}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="p-2">
//                     <h3 className="font-semibold text-slate-50 text-xs leading-tight mb-1 line-clamp-2">
//                       {drama.title}
//                     </h3>
//                     <div className="flex items-center justify-between">
//                       <span className="text-slate-400 text-xs">
//                         {drama.episode} eps
//                       </span>
//                       <a
//                         onClick={() =>
//                           navigate(`/detail/${drama.title}`, {
//                             state: { url: drama.link },
//                           })
//                         }
//                         className="cursor-pointer inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-medium text-xs transition-colors"
//                       >
//                         Watch →
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="flex justify-center items-center mt-12 gap-2">
//                 <button
//                   onClick={() => handlePageChange(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 text-sm text-slate-400 bg-gray-800 border border-emerald-500/20 rounded-lg hover:bg-gray-700 disabled:opacity-50"
//                 >
//                   {"<"}
//                 </button>

//                 {[
//                   currentPage > 1 ? currentPage - 1 : null,
//                   currentPage,
//                   currentPage < totalPages ? currentPage + 1 : null,
//                 ]
//                   .filter(Boolean) // buang null biar ga error
//                   .map((page) => (
//                     <button
//                       key={page}
//                       onClick={() => handlePageChange(page)}
//                       className={`px-3 py-2 text-sm font-medium rounded-lg ${
//                         currentPage === page
//                           ? "bg-emerald-800 text-emerald-500 border border-emerald-500/50"
//                           : "text-slate-400 bg-gray-800 border border-emerald-500/20 hover:bg-gray-700"
//                       }`}
//                     >
//                       {page}
//                     </button>
//                   ))}

//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 text-sm text-slate-400 bg-gray-800 border border-emerald-500/20 rounded-lg hover:bg-gray-700 disabled:opacity-50"
//                 >
//                   {">"}
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// };

// export default Home;


"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DramaCard from "../components/DramaCard";

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1000/home?page=${currentPage}`
        );

        if (res.status === 200) {
          setItems(res.data.items);
          setTotalPages(res.data.totalPages);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-emerald-500 text-base sm:text-lg font-medium">
            Loading dramas...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-emerald-500/10 bg-gray-950/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-50 mb-2 text-balance">
              Korean Drama Collection
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Discover exceptional Korean dramas and series
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pt-24 sm:pt-32">
        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <p className="text-slate-400 text-base sm:text-lg">
              No dramas available
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4 lg:gap-6">
              {items.map((drama, index) => (
                <div
                  key={index}
                  className="group bg-gray-800 border border-emerald-500/10 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] bg-gray-700 relative overflow-hidden">
                    <DramaCard key={`${currentPage}-${index}`} drama={drama} />
                    <div className="absolute top-2 right-2">
                      <span className="bg-emerald-800 text-emerald-500 text-xs font-medium px-2 py-1 rounded-full">
                        {drama.year}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-slate-50 text-xs sm:text-sm leading-tight mb-2 line-clamp-2">
                      {drama.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">
                        {drama.episode} eps
                      </span>
                      <button
                        onClick={() =>
                          navigate(`/detail/${drama.title}`, {
                            state: { url: drama.link, poster: drama.poster },
                          })
                        }
                        className="inline-flex items-center gap-1 text-emerald-500 hover:text-emerald-400 font-medium text-xs transition-colors touch-manipulation"
                      >
                        Watch →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center mt-8 sm:mt-12 gap-4 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 text-sm text-slate-400 bg-gray-800 border border-emerald-500/20 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors touch-manipulation"
                  >
                    {"<"}
                  </button>

                  <div className="flex gap-1 sm:gap-2">
                    {[
                      currentPage > 1 ? currentPage - 1 : null,
                      currentPage,
                      currentPage < totalPages ? currentPage + 1 : null,
                    ]
                      .filter(Boolean)
                      .map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors touch-manipulation ${
                            currentPage === page
                              ? "bg-emerald-800 text-emerald-500 border border-emerald-500/50"
                              : "text-slate-400 bg-gray-800 border border-emerald-500/20 hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 text-sm text-slate-400 bg-gray-800 border border-emerald-500/20 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors touch-manipulation"
                  >
                    {">"}
                  </button>
                </div>

                <div className="text-slate-400 text-xs sm:text-sm bg-gray-800/50 px-3 py-2 rounded-full border border-emerald-500/10">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
