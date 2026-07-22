"use client";

import { Icon } from "@iconify/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const media = [
  {
    type: "image",
    src: "/experience/05461155-b2fe-4832-b40e-a35900fb172f.JPG",
  },
  {
    type: "video",
    src: "/experience/05dd8bf5-c987-496b-9236-74f7245657b7.MP4",
  },
  {
    type: "image",
    src: "/experience/1965cae9-916e-4bc2-8acc-73a266cb42a5.JPG",
  },
  {
    type: "image",
    src: "/experience/5291c899-c549-4d95-9038-77d811518927.JPG",
  },
  {
    type: "image",
    src: "/experience/747c85fb-6ebe-4aa6-b519-a8cf5c293a72.JPG",
  },
  {
    type: "image",
    src: "/experience/8a0d1c54-4e0f-43a3-bcdb-7d4fb3010b08.JPG",
  },
  {
    type: "image",
    src: "/experience/94104052-ed11-4193-b8ab-bdf4bab64b01.JPG",
  },
  {
    type: "image",
    src: "/experience/9799e08f-c935-498a-a5f8-a3c2663ac8cc.JPG",
  },
  { type: "image", src: "/experience/IMG_1661.JPG" },
  {
    type: "image",
    src: "/experience/a44151ba-302a-454e-8018-563de8fd167d.JPG",
  },
  {
    type: "image",
    src: "/experience/ab7345c0-1b7f-4875-bf91-f4127ae8c6a1.JPG",
  },
  {
    type: "video",
    src: "/experience/b54008aa-5053-4c36-8c0c-f3274c6d9f6d.MP4",
  },
  {
    type: "image",
    src: "/experience/b6aef11b-5a4a-4b88-bda2-79cce646255f.JPG",
  },
  {
    type: "image",
    src: "/experience/bf47b579-fa13-48e2-ab51-f9ceedd154c6.JPG",
  },
  {
    type: "image",
    src: "/experience/c67989c5-c543-49d4-b2e1-6573f9064fa2.JPG",
  },
  {
    type: "image",
    src: "/experience/c7769d4f-84bd-488e-8108-330075e20caf.JPG",
  },
  {
    type: "image",
    src: "/experience/ca61f5a1-ffc7-4839-b00b-c13a05676a8e.JPG",
  },
  {
    type: "image",
    src: "/experience/cd6d947a-426b-4176-a37d-85c8be32af4a.JPG",
  },
  {
    type: "image",
    src: "/experience/df0b41c7-7a7d-4448-a12f-346b67ba191f.JPG",
  },
  {
    type: "image",
    src: "/experience/df2ee63c-2062-46ed-bb71-13c6a007a004.JPG",
  },
  {
    type: "image",
    src: "/experience/eaa43543-1145-4bbb-92df-dcdee66ad8c3.JPG",
  },
];

function VideoThumbnail({ src, onClick }) {
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
      onClick={onClick}
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

export default function ExperienceShowcase() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    setCurrentIndex((prev) => (prev + 1) % media.length);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  }, []);

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

  // Drag to scroll
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

  const currentItem = media[currentIndex];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-cyan-50/40 to-white" />

      <div className="container relative mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
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
        </div>

        {/* Horizontal Scroll Gallery */}
        <div className="relative group/slider">
          {/* Left Arrow */}
          <button
            onClick={() => scroll(-1)}
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
            {media.map((item, index) => (
              <div
                key={index}
                data-card
                onClick={() => openLightbox(index)}
                className="group relative flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] overflow-hidden rounded-3xl bg-white shadow-xl cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 snap-start aspect-[4/3]"
              >
                {item.type === "image" ? (
                  <Image
                    src={item.src}
                    alt={`Experience ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    sizes="360px"
                  />
                ) : (
                  <VideoThumbnail src={item.src} />
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Icon
                          icon={
                            item.type === "video"
                              ? "solar:play-bold"
                              : "solar:gallery-bold"
                          }
                          width={20}
                          className="text-white"
                        />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {item.type === "video" ? "Watch Video" : "View Photo"}
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
                        item.type === "video"
                          ? "solar:video-library-bold"
                          : "solar:camera-bold"
                      }
                      width={16}
                      className="text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(media.length / 4) }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-cyan-200" />
            ))}
          </div>
        </div>
      </div>

      {/* ===== LIGHTBOX ===== */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300"
          onClick={(e) => e.target === e.currentTarget && closeLightbox()}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition z-50 p-2 rounded-full hover:bg-white/10"
          >
            <Icon icon="solar:close-circle-bold" width={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition p-3 rounded-full hover:bg-white/10 z-50 hidden sm:block"
          >
            <Icon icon="solar:arrow-left-bold" width={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition p-3 rounded-full hover:bg-white/10 z-50 hidden sm:block"
          >
            <Icon icon="solar:arrow-right-bold" width={32} />
          </button>

          <div className="relative max-w-6xl max-h-[85vh] w-full mx-4 flex items-center justify-center">
            {currentItem.type === "image" ? (
              <Image
                src={currentItem.src}
                alt={`Experience ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                priority
              />
            ) : (
              <div className="relative w-full max-w-4xl aspect-video">
                <video
                  src={currentItem.src}
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
                  {currentIndex + 1} / {media.length}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold uppercase tracking-wider border border-cyan-500/30">
                  {currentItem.type === "video" ? "Video" : "Image"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10">
                  <Icon icon="solar:download-minimalistic-bold" width={20} />
                </button>
                <button className="text-white/60 hover:text-white transition p-2 rounded-lg hover:bg-white/10">
                  <Icon icon="solar:share-circle-bold" width={20} />
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
