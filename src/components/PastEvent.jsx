import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import './PastEvent.css';

// ✅ Import your data source
import { EVENTS_DATA } from './EventData';

// ✅ Ensure this path matches your project structure
import levitateLogo from '../assets/logo.png'; 

// --- HELPER: Fast Image Loader ---
const ImageWithLoader = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={`img-loader-container ${className || ''}`} 
      onClick={onClick}
    >
      {/* Show Skeleton only if NOT loaded and NOT broken */}
      {!isLoaded && !hasError && <div className="skeleton-loader"></div>}
      
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setIsLoaded(true); setHasError(true); }}
      />
    </div>
  );
};

// --- COMPONENT: Turbo-Charged Event Modal ---
const EventModal = ({ event, onClose }) => {
  // Start with 50 images for instant fullness
  const [visibleCount, setVisibleCount] = useState(50);
  const [fullScreenImg, setFullScreenImg] = useState(null); 
  const loadMoreRef = useRef(null); 

  useEffect(() => {
    setVisibleCount(50);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [event]);

  // Aggressive Loading (Pre-loads 2000px ahead)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 50);
        }
      },
      { threshold: 0, rootMargin: '2000px' } 
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, event]);

  if (!event) return null;

  const totalImages = event.gallery ? event.gallery.length : 0;
  const currentImages = event.gallery ? event.gallery.slice(0, visibleCount) : [];

  // --- RENDER: Lightbox (Full Screen) ---
  if (fullScreenImg) {
    return (
      <div className="lightbox-overlay" onClick={() => setFullScreenImg(null)}>
        <button className="lightbox-close-btn" onClick={() => setFullScreenImg(null)}>
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="lightbox-content">
          <img src={fullScreenImg} alt="Full Screen" className="lightbox-img" />
        </div>
      </div>
    );
  }

  // --- RENDER: Modal ---
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        
        <button className="modal-close-btn" onClick={onClose}>
          <i className="bi bi-x-lg fs-5"></i>
        </button>

        {/* Header */}
        <div className="modal-header-img">
          <ImageWithLoader src={event.image} alt={event.name} className="w-100 h-100" />
          <div className="modal-title-overlay">
            <div className="modal-title-text fade-in-up">
              <h2 className="display-6 fw-black mb-1">{event.name}</h2>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="badge bg-white text-black fw-bold">{event.year}</span>
                <span className="badge bg-warning text-black fw-bold">
                  <i className="bi bi-geo-alt-fill me-1"></i> {event.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body custom-scrollbar">
          <p className="text-white opacity-75 fs-6 mb-5 lh-lg">{event.desc}</p>

          {/* Video */}
          {event.youtubeId && (
            <div className="mb-5">
              <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-play-circle-fill text-danger fs-4"></i> Highlights
              </h5>
              <div className="video-wrapper ratio ratio-16x9">
                <iframe 
                    src={`https://www.youtube.com/embed/${event.youtubeId}?modestbranding=1&rel=0`} 
                    title="YouTube video" 
                    allowFullScreen
                    style={{border:0}}
                ></iframe>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {totalImages > 0 && (
            <div>
              {/* CLEAN HEADER: Removed the "Showing X/Y" count */}
              <div className="mb-4 border-bottom border-white border-opacity-10 pb-2">
                <h5 className="text-white fw-bold m-0 d-flex align-items-center gap-2">
                   <i className="bi bi-grid-3x3-gap-fill text-primary"></i> Gallery
                </h5>
              </div>

              <div className="gallery-grid-container">
                {currentImages.map((img, idx) => (
                  <div className="gallery-item" key={idx} onClick={() => setFullScreenImg(img)}>
                    <ImageWithLoader src={img} alt={`Gallery ${idx}`} className="w-100 h-100" />
                    <div className="gallery-overlay"><i className="bi bi-arrows-fullscreen"></i></div>
                  </div>
                ))}
              </div>

              {/* Invisible trigger to load more */}
              {visibleCount < totalImages && (
                <div ref={loadMoreRef} style={{ height: '200px', width: '100%', background: 'transparent' }}></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Main List ---
const EventCard = ({ event, index, onOpen }) => (
  <div className="col" style={{ animationDelay: `${index * 100}ms` }}>
    <div className="glass-card rounded-4 overflow-hidden h-100 d-flex flex-column fade-in-up">
      <div className="position-relative img-hover-zoom" style={{ height: '220px' }}>
        <ImageWithLoader src={event.image} alt={event.name} className="w-100 h-100" />
        <div className="position-absolute top-0 end-0 m-2">
          <span className="badge glass-badge rounded-pill px-2 py-1 fw-light"><i className="bi bi-geo-alt-fill text-warning me-1"></i> {event.location}</span>
        </div>
      </div>
      <div className="p-4 flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-white-50 fw-bold text-uppercase">{event.date}</small>
          <small className="badge bg-white bg-opacity-10 text-white">{event.year}</small>
        </div>
        <h5 className="fw-bold text-white mb-2">{event.name}</h5>
        <p className="text-white-50 small mb-4 text-truncate">{event.desc}</p>
        <button className="btn btn-outline-light rounded-pill btn-sm w-100 mt-auto opacity-75 hover-glow" onClick={() => onOpen(event)}>
            View Details <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
);

const FilterBar = ({ search, setSearch, location, setLocation, year, setYear, locations, years }) => (
  <div className="row g-3 mb-5 fade-in-up">
    <div className="col-12 col-lg-6">
      <div className="position-relative">
        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
        <input type="text" className="form-control form-control-lg rounded-pill custom-input ps-5 py-3 fs-6" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
    </div>
    <div className="col-6 col-lg-3">
      <select className="form-select form-select-lg rounded-pill custom-input ps-4 py-3 fs-6" value={location} onChange={(e) => setLocation(e.target.value)}>
        <option value="All">All Locations</option>
        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
    </div>
    <div className="col-6 col-lg-3">
      <select className="form-select form-select-lg rounded-pill custom-input ps-4 py-3 fs-6" value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="All">All Years</option>
        {years.map(yr => <option key={yr} value={yr}>{yr}</option>)}
      </select>
    </div>
  </div>
);

export default function PastEvent() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [year, setYear] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const uniqueLocations = [...new Set(EVENTS_DATA.map(e => e.location))];
  const uniqueYears = [...new Set(EVENTS_DATA.map(e => e.year))].sort((a, b) => b - a);

  const filteredEvents = useMemo(() => {
    return EVENTS_DATA.filter(event => {
      const matchSearch = event.name.toLowerCase().includes(search.toLowerCase());
      const matchLocation = location === 'All' || event.location === location;
      const matchYear = year === 'All' || event.year === year;
      return matchSearch && matchLocation && matchYear;
    });
  }, [search, location, year]);

  return (
    <div className="levitate-app">
      <div className="fixed-bg"></div>
      <div className="grain-overlay"></div>
      <nav className="fixed-top p-3 glass-nav">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-3 text-white fw-bold back-link text-decoration-none">
            <div className="d-flex align-items-center justify-content-center rounded-circle border border-secondary icon-box"><i className="bi bi-arrow-left fs-5"></i></div>
            <span className="tracking-wide">BACK TO HOME</span>
          </Link>
          <div className="logo-container"><img src={levitateLogo} alt="Levitate Entertainment" className="img-fluid" style={{ maxHeight: '50px' }} /></div>
        </div>
      </nav>
      <main className="container content-wrapper">
        <div className="mb-5 fade-in-up header-section">
          <h1 className="display-4 fw-black mb-3 text-white">Past <span className="text-gradient">Events</span></h1>
          <p className="text-white-50 fs-5">Relive the moments that defined our journey.</p>
        </div>
        <FilterBar search={search} setSearch={setSearch} location={location} setLocation={setLocation} year={year} setYear={setYear} locations={uniqueLocations} years={uniqueYears} />
        {filteredEvents.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {filteredEvents.map((event, index) => <EventCard key={event.id} event={event} index={index} onOpen={setSelectedEvent} />)}
          </div>
        ) : (
          <div className="text-center py-5 fade-in-up">
            <div className="d-inline-flex align-items-center justify-content-center bg-white bg-opacity-5 rounded-circle mb-3" style={{ width: '80px', height: '80px' }}><i className="bi bi-search fs-1 text-white-50"></i></div>
            <h3 className="fw-bold text-white">No events found</h3>
            <p className="text-white-50">Try adjusting your filters.</p>
          </div>
        )}
      </main>
      {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}