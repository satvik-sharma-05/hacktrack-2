// src/components/events/EventCard.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiStar, FiCalendar, FiMapPin, FiUsers, FiAward } from "react-icons/fi";
import { toggleBookmark } from "../../services/api";

export default function EventCard({ event = {}, onBookmarkToggled }) {
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(Boolean(event?.bookmarked));
  const [imageError, setImageError] = useState(false);

  const mongoId = event?._id || null;
  const externalId = event?.externalId || event?.id || event?.external_id || null;
  const platform = event?.platform || event?.source || null;
  const bookmarkId = mongoId || (platform && externalId ? `${platform}:${externalId}` : null);

  async function handleBookmark(e) {
    e.preventDefault();
    if (!bookmarkId) {
      alert("This event cannot be bookmarked (missing ID).");
      return;
    }
    setLoading(true);
    try {
      const data = await toggleBookmark(bookmarkId);
      const newState = !!data.bookmarked;
      setBookmarked(newState);
      onBookmarkToggled?.(bookmarkId, newState);
    } catch (err) {
      console.error("Bookmark error:", err);
      alert("Failed to toggle bookmark. Please log in first.");
    } finally {
      setLoading(false);
    }
  }

  // Handle image with fallback
  const getImageUrl = () => {
    // If image already failed, use fallback
    if (imageError) return '/bg2.jpg';
    
    // Check if we have a valid banner image
    const bannerImage = event.bannerImage || event.thumbnailUrl || event.cover;
    
    if (bannerImage && 
        bannerImage !== "" && 
        !bannerImage.includes('placeholder') &&
        !bannerImage.includes('defaults')) {
      
      // Handle relative URLs from Devpost (starts with //)
      if (bannerImage.startsWith('//')) {
        return `https:${bannerImage}`;
      }
      
      // Handle full URLs
      if (bannerImage.startsWith('http')) {
        return bannerImage;
      }
    }
    
    // No valid image found, use fallback
    return '/bg2.jpg';
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const isOrganizerEvent = event?.source === "organizer" || event?.platform === "organizer";
  const sourceLabel = isOrganizerEvent ? "Organizer" : (platform ? platform.toUpperCase() : "External");
  const internalEventPath = platform && externalId ? `/events/${platform}:${externalId}` : null;

  const description =
    event.description ||
    event.summary ||
    (event.raw && (event.raw.summary || event.raw.description || event.raw.short_description)) ||
    "";

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format prize
  const formatPrize = (prize) => {
    if (!prize || prize === 0) return null;
    if (prize >= 1000) return `$${(prize / 1000).toFixed(0)}K+`;
    return `$${prize}`;
  };

  const imageUrl = getImageUrl();
  const hasValidImage = imageUrl && !imageUrl.includes('/bg2.jpg');

  return (
    <div className="relative rounded-xl bg-gray-950 border border-cyan-500/40 p-5 shadow-[0_0_20px_rgba(0,255,255,0.25)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-400 hover:scale-105 group">

      {/* ────── Event Image ────── */}
      <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-xl">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={event.title || "Event image"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        ) : (
            <img
            src="/bg2.jpg"
            alt={event.title || "Event image"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={handleImageError}
          />
        )}
        
        {/* ────── Platform Badge ────── */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-cyan-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border border-cyan-400/50">
          {platform || sourceLabel}
        </div>
        
        {/* ────── Featured Badge ────── */}
        {event.isFeatured && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-black px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border border-yellow-400">
            ⭐ FEATURED
          </div>
        )}
        
        {/* ────── Online/Offline Badge ────── */}
        <div className={`absolute bottom-3 right-3 ${
          event.isOnline ? 'bg-green-600/90' : 'bg-blue-600/90'
        } text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border border-white/20`}>
          {event.isOnline ? '🌐 ONLINE' : '📍 IN-PERSON'}
        </div>
      </div>

      {/* ────── Bookmark Star ────── */}
      <button
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        onClick={handleBookmark}
        disabled={loading}
        className="absolute top-44 right-4 p-2 rounded-full bg-black/80 hover:bg-cyan-900/80 transition-all duration-300 border border-cyan-400/50 hover:border-cyan-300 hover:scale-110"
      >
        <FiStar
          size={20}
          fill={bookmarked ? "#00ffff" : "none"}
          stroke={bookmarked ? "#00ffff" : "#00ffff"}
          className={bookmarked ? "animate-pulse" : "opacity-80"}
        />
      </button>

      {/* ────── Title ────── */}
      <h3 className="text-xl font-black text-cyan-300 line-clamp-2 mb-2 group-hover:text-cyan-200 transition-colors">
        {event.title || "Untitled Event"}
      </h3>

      {/* ────── Organization ────── */}
      {event.organizationName && (
        <p className="text-cyan-400 text-sm font-medium mb-3 flex items-center gap-2">
          <FiUsers className="text-cyan-500" />
          {event.organizationName}
        </p>
      )}

      {/* ────── Description ────── */}
      <p className="text-sm text-cyan-100/80 line-clamp-3 mb-4 flex-1">
        {description || "No description available."}
      </p>

      {/* ────── Event Details ────── */}
      <div className="space-y-2 mb-4">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-cyan-300">
          <FiCalendar className="text-cyan-500 flex-shrink-0" />
          <span>{formatDate(event.start)}</span>
          {event.end && event.end !== event.start && (
            <>
              <span className="text-cyan-500">→</span>
              <span>{formatDate(event.end)}</span>
            </>
          )}
        </div>

        {/* Location */}
        {event.location && event.location !== "Online" && (
          <div className="flex items-center gap-2 text-sm text-cyan-300">
            <FiMapPin className="text-cyan-500 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}

        {/* Prize */}
        {event.prize > 0 && (
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <FiAward className="text-yellow-500 flex-shrink-0" />
            <span className="font-bold">{formatPrize(event.prize)} Prize</span>
          </div>
        )}

        {/* Registrations */}
        {event.registrations > 0 && (
          <div className="flex items-center gap-2 text-sm text-purple-400">
            <FiUsers className="text-purple-500 flex-shrink-0" />
            <span>{event.registrations.toLocaleString()} registered</span>
          </div>
        )}
      </div>

      {/* ────── Action Link ────── */}
      <div className="mt-4 pt-4 border-t border-cyan-400/20">
        {isOrganizerEvent && mongoId ? (
          <Link
            to={`/participate/${mongoId}`}
            className="block w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30"
          >
            Participate
          </Link>
        ) : event.url ? (
          <a
            href={event.url}
            target="_blank"
            rel="noreferrer"
            className="block w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30"
          >
            View Details
          </a>
        ) : internalEventPath ? (
          <Link
            to={internalEventPath}
            className="block w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl text-center transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/30"
          >
            View Details
          </Link>
        ) : (
          <span className="block w-full bg-gray-700 text-gray-400 font-bold py-3 px-4 rounded-xl text-center text-sm">
            No details available
          </span>
        )}
      </div>
    </div>
  );
}