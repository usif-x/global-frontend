"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "image", label: "Photos" },
  { key: "video", label: "Videos" },
];

function VideoThumbnail({ src }) {
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isHovered) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isHovered]);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        preload="metadata"
      />
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-0" : "opacity-100"}`}
      >
        <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
          <Icon
            icon="solar:play-bold"
            width={24}
            className="text-cyan-600 ml-0.5"
          />
        </div>
      </div>
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
        Video
      </div>
    </div>
  );
}

function MediaCard({ item, index, onOpen }) {
  const [loaded, setLoaded] = useState(false);
  const label =
    item.media === "video"
      ? `Play video ${index + 1}`
      : `View photo ${index + 1}`;

  return (
    <div
      data-card
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => onOpen(index)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(index);
        }
      }}
      className="group relative flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] overflow-hidden rounded-3xl bg-gray-100 shadow-xl cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 snap-start aspect-[4/3] focus:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
    >
      {item.media === "image" ? (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-cyan-100 to-sky-50" />
          )}
          <Image
            src={item.source}
            alt={`Experience ${index + 1}`}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-110 ${loaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            sizes="360px"
            onLoad={() => setLoaded(true)}
          />
        </>
      ) : (
        <VideoThumbnail src={item.source} />
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon
                icon={
                  item.media === "video"
                    ? "solar:play-bold"
                    : "solar:gallery-bold"
                }
                width={20}
                className="text-white"
              />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">
                {item.media === "video" ? "Watch Video" : "View Photo"}
              </p>
              <p className="text-white/60 text-xs">Click to open</p>
            </div>
          </div>
        </div>
      </div>

      {/* Type Badge */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <Icon
            icon={
              item.media === "video"
                ? "solar:video-library-bold"
                : "solar:camera-bold"
            }
            width={16}
            className="text-white"
          />
        </div>
      </div>
    </div>
  );
}

// `items` comes from ExperienceService.getAll() — shape: { id, media: "image"|"video", source }
export default function ExperienceShowcase({ items = [] }) {
  const [filter, setFilter] = useState("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef(null);
  const touchStartX = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const counts = useMemo(
    () => ({
      all: items.length,
      image: items.filter((i) => i.media === "image").length,
      video: items.filter((i) => i.media === "video").length,
    }),
    [items],
  );

  const filteredItems = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.media === filter)),
    [items, filter],
  );

  const openLightbox = useCallback((index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    document.body.style.overflow = "";
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % filteredItems.length);
  }, [filteredItems.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + filteredItems.length) % filteredItems.length,
    );
  }, [filteredItems.length]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scroll = useCallback(
    (direction) => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector("[data-card]")?.offsetWidth || 320;
      const gap = 20;
      el.scrollBy({ left: direction * (cardWidth + gap), behavior: "smooth" });
      setTimeout(checkScroll, 400);
    },
    [checkScroll],
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  // Reset scroll position when the filter changes so the new set starts at the beginning.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    checkScroll();
  }, [filter, checkScroll]);

  // Drag to scroll (desktop mouse)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onMouseUp = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseleave", onMouseLeave);
    el.addEventListener("mouseup", onMouseUp);
    el.addEventListener("mousemove", onMouseMove);
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, goNext, goPrev]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      if (delta < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const handleShare = useCallback(
    async (e) => {
      e.stopPropagation();
      const current = filteredItems[currentIndex];
      if (!current) return;
      if (navigator.share) {
        try {
          await navigator.share({
            url: current.source,
            title: "TopDivers Experience",
          });
        } catch {
          // user cancelled — no-op
        }
      } else {
        try {
          await navigator.clipboard.writeText(current.source);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // clipboard unavailable — no-op
        }
      }
    },
    [filteredItems, currentIndex],
  );

  if (!items || items.length === 0) return null;

  const currentItem = filteredItems[currentIndex];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-cyan-50/40 to-white" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-6 py-2 shadow-sm mb-6">
            <Icon
              icon="solar:camera-bold"
              width={20}
              className="text-cyan-500"
            />
            <span className="uppercase tracking-widest text-sm font-semibold">
              Gallery
            </span>
          </div>
          <h2 className="text-5xl font-bold mb-5">Some of Our Experiences</h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Explore unforgettable moments from our diving adventures, snorkeling
            trips, island escapes, and private boat experiences across the
            beautiful Red Sea.
          </p>
          <p className="mt-3 text-sm font-medium text-cyan-700">
            {counts.all} moments captured · {counts.image} photos ·{" "}
            {counts.video} videos
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                filter === f.key
                  ? "bg-cyan-600 border-cyan-600 text-white"
                  : "bg-white border-cyan-200 text-gray-700 hover:border-cyan-400"
              }`}
            >
              {f.label} <span className="opacity-70">({counts[f.key]})</span>
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No {filter === "video" ? "videos" : "photos"} yet — check back soon.
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Left Arrow */}
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 ${canScrollLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"}`}
            >
              <Icon
                icon="solar:arrow-left-bold"
                width={24}
                className="text-gray-700"
              />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-110 ${canScrollRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"}`}
            >
              <Icon
                icon="solar:arrow-right-bold"
                width={24}
                className="text-gray-700"
              />
            </button>

            {/* Scroll Track */}
            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {filteredItems.map((item, index) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={openLightbox}
                />
              ))}
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: Math.ceil(filteredItems.length / 4) }).map(
                (_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-cyan-200" />
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close"
            className="absolute top-6 right-6 text-white/70 hover:text-white transition z-50 p-2 rounded-full hover:bg-white/10"
          >
            <Icon icon="solar:close-circle-bold" width={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition p-3 rounded-full hover:bg-white/10 z-50 hidden sm:block"
          >
            <Icon icon="solar:arrow-left-bold" width={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition p-3 rounded-full hover:bg-white/10 z-50 hidden sm:block"
          >
            <Icon icon="solar:arrow-right-bold" width={32} />
          </button>

          <div
            className="relative max-w-6xl max-h-[85vh] w-full mx-4 flex items-center justify-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {currentItem.media === "image" ? (
              <Image
                src={currentItem.source}
                alt={`Experience ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
                priority
              />
            ) : (
              <div className="relative w-full max-w-4xl aspect-video">
                <video
                  src={currentItem.source}
                  className="w-full h-full rounded-lg shadow-2xl"
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent py-6 px-8">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white/80 text-sm font-medium">
                  {currentIndex + 1} / {filteredItems.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
                  {currentItem.media === "video" ? "Video" : "Image"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={currentItem.source}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Download"
                  className="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
                >
                  <Icon icon="solar:download-minimalistic-bold" width={20} />
                </a>
                <button
                  onClick={handleShare}
                  aria-label="Share"
                  className="relative text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10"
                >
                  <Icon icon="solar:share-circle-bold" width={20} />
                  {copied && (
                    <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-xs bg-white text-gray-900 px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                      Link copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
