"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://api.topdivers.online";
const REVIEWS_ENDPOINT = `${API_BASE}/google_reviews/?limit=300`;

// TODO: replace with your real Google Place ID (find it at
// https://developers.google.com/maps/documentation/places/web-service/place-id)
const GOOGLE_WRITE_REVIEW_URL =
  "https://www.google.com/maps/place/?q=place_id:ChIJQTKx7byBUhQR3kQqfJ4HUXc";

const ARABIC_RE = /[\u0600-\u06FF]/;

function safeJsonParse(value, fallback) {
  if (value == null) return fallback;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// review_text arrives as a JSON string like {"ar": "..."} or {"en": "..."}
function extractReviewText(raw) {
  const parsed = safeJsonParse(raw, null);
  if (!parsed || typeof parsed !== "object") return raw || "";
  return parsed.en || parsed.ar || Object.values(parsed)[0] || "";
}

function timeAgo(isoDate) {
  if (!isoDate) return "";
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(now - then, 0);
  const day = 86400000;
  const days = Math.floor(diffMs / day);

  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

const AVATAR_PALETTE = [
  "#0891b2",
  "#0d9488",
  "#0284c7",
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
];

function colorForName(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function initialsForName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Avatar({ name, src }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm"
        style={{ backgroundColor: colorForName(name) }}
      >
        {initialsForName(name)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setBroken(true)}
      className="w-11 h-11 rounded-full object-cover shrink-0 shadow-sm"
    />
  );
}

function Stars({ rating = 5, size = 14 }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          icon="solar:star-bold"
          width={size}
          className={i < rating ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </div>
  );
}

const TEXT_LIMIT = 170;

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);

  const text = useMemo(() => extractReviewText(review.review_text), [review]);
  const images = useMemo(
    () => safeJsonParse(review.user_images, []) || [],
    [review],
  );
  const isRtl = ARABIC_RE.test(text);
  const isLong = text.length > TEXT_LIMIT;
  const displayText =
    expanded || !isLong ? text : `${text.slice(0, TEXT_LIMIT).trim()}…`;

  return (
    <div
      data-card
      className="group relative flex-shrink-0 w-[300px] sm:w-[340px] snap-start rounded-3xl border border-cyan-100 bg-white/70 backdrop-blur-md shadow-lg shadow-cyan-900/5 p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={review.author} src={review.profile_picture} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {review.author}
            </p>
            <Icon
              icon="solar:verified-check-bold"
              width={15}
              className="text-cyan-500 shrink-0"
            />
          </div>
          <p className="text-xs text-gray-400">{timeAgo(review.review_date)}</p>
        </div>
        <Icon
          icon="logos:google-icon"
          width={18}
          className="shrink-0 opacity-80"
        />
      </div>

      <Stars rating={review.rating} />

      {/* Body */}
      <p
        dir={isRtl ? "rtl" : "ltr"}
        className={`mt-3 text-sm leading-relaxed text-gray-700 flex-1 ${isRtl ? "text-right" : "text-left"}`}
      >
        {displayText}
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="ml-1.5 text-cyan-600 font-medium hover:text-cyan-700 whitespace-nowrap"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </p>

      {/* Photos */}
      {images.length > 0 && (
        <div className="flex gap-2 mt-4">
          {images.slice(0, 3).map((src, i) => (
            <button
              key={i}
              onClick={() => setLightboxImg(src)}
              className="w-14 h-14 rounded-xl overflow-hidden shrink-0 ring-1 ring-cyan-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {images.length > 3 && (
            <div className="w-14 h-14 rounded-xl bg-cyan-50 flex items-center justify-center text-xs font-semibold text-cyan-700 shrink-0">
              +{images.length - 3}
            </div>
          )}
        </div>
      )}

      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightboxImg(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImg}
            alt=""
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full rounded-lg object-contain"
          />
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-6 right-6 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <Icon icon="solar:close-circle-bold" width={32} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function GoogleReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(REVIEWS_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        const data = Array.isArray(json?.data) ? json.data : [];
        // newest first
        const sorted = [...data].sort(
          (a, b) => new Date(b.review_date) - new Date(a.review_date),
        );
        setReviews(sorted);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const { average, count } = useMemo(() => {
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return {
      average: Math.round((sum / reviews.length) * 10) / 10,
      count: reviews.length,
    };
  }, [reviews]);

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
      const cardWidth = el.querySelector("[data-card]")?.offsetWidth || 340;
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
  }, [checkScroll, reviews]);

  // Desktop drag-to-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    const onDown = (e) => {
      isDown = true;
      el.style.cursor = "grabbing";
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onLeave = () => {
      isDown = false;
      el.style.cursor = "grab";
    };
    const onMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      el.scrollLeft = scrollLeft - (x - startX) * 1.5;
    };

    el.addEventListener("mousedown", onDown);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mouseup", onLeave);
    el.addEventListener("mousemove", onMove);
    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mouseup", onLeave);
      el.removeEventListener("mousemove", onMove);
    };
  }, [reviews]);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="container relative mx-auto px-4">
        {/* Header / aggregate */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10 rounded-3xl border border-cyan-100 bg-white/70 backdrop-blur-md shadow-sm p-6 sm:p-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="logos:google-icon" width={26} />
              <span className="text-xl font-bold text-gray-900">Reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-gray-900">
                {average ? average.toFixed(1) : "—"}
              </span>
              <Stars rating={Math.round(average)} size={20} />
              <span className="text-gray-400 font-medium">
                ({count.toLocaleString()})
              </span>
            </div>
          </div>
          <a
            href={GOOGLE_WRITE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 hover:bg-cyan-700 transition-colors text-white font-semibold px-6 py-3 shadow-lg shadow-cyan-600/20 whitespace-nowrap"
          >
            <Icon icon="solar:pen-2-bold" width={18} />
            Review us on Google
          </a>
        </div>

        {status === "loading" && (
          <div className="flex gap-5 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[300px] sm:w-[340px] h-64 rounded-3xl bg-cyan-50 animate-pulse"
              />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-16 text-gray-500">
            Couldn&apos;t load reviews right now — please refresh the page.
          </div>
        )}

        {status === "ready" && reviews.length === 0 && (
          <div className="text-center py-16 text-gray-500">No reviews yet.</div>
        )}

        {status === "ready" && reviews.length > 0 && (
          <div className="relative group/slider">
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

            <div
              ref={scrollRef}
              className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 snap-x snap-mandatory scrollbar-hide"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {reviews.map((review) => (
                <ReviewCard key={review.review_id} review={review} />
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
