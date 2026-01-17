import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import './PastEvent.css';
import { EVENTS_DATA } from './EventData';
import levitateLogo from '../assets/logo.png'; 

// --- CLOUDINARY OPTIMIZER HELPER ---
const getOptimizedUrl = (url, width) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
};

// --- HELPER: Fast Image Loader ---
const ImageWithLoader = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div 
      className={`img-loader-container ${className || ''}`} 
      onClick={onClick}
    >
      {!isLoaded && !hasError && <div className="skeleton-loader"></div>}
      <img 
        src={src} 
        alt={alt} 
        loading="lazy"
        decoding="async"
        className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => { setIsLoaded(true); setHasError(true); }}
      />
    </div>
  );
};

// --- COMPONENT: Event Modal ---
const EventModal = ({ event, onClose }) => {
  const [fullScreenImg, setFullScreenImg] = useState(null); 
  const [lightboxLoading, setLightboxLoading] = useState(false); 

  // FIX: Prevent Layout Shift when scrollbar disappears
  useEffect(() => {
    if (event) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`; // Add padding
    } else {
      document.body.style.overflow = ''; 
      document.body.style.paddingRight = ''; // Remove padding
    }
    return () => { 
      document.body.style.overflow = ''; 
      document.body.style.paddingRight = '';
    };
  }, [event]);

  if (!event) return null;

  // Logic cleanup
  const MAX_PREVIEW = 6;
  const hasGallery = event.gallery && event.gallery.length > 0;
  const previewImages = hasGallery ? event.gallery.slice(0, MAX_PREVIEW) : [];
  const hasDropbox = event.dropboxLink && event.dropboxLink.trim() !== "";
  const showGallerySection = hasGallery || hasDropbox;

  if (fullScreenImg) {
    return (
      <div className="lightbox-overlay" onClick={() => setFullScreenImg(null)}>
        <button 
          className="lightbox-close-btn" 
          onClick={(e) => { e.stopPropagation(); setFullScreenImg(null); }}
          aria-label="Close Lightbox"
        >
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="lightbox-content position-relative">
            {lightboxLoading && (
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-light" role="status" style={{width: '3rem', height: '3rem'}}>
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}
            <img 
                src={getOptimizedUrl(fullScreenImg, 1200)} 
                alt="Full Screen View" 
                className={`lightbox-img ${lightboxLoading ? 'opacity-0' : 'opacity-100'}`}
                style={{ transition: 'opacity 0.3s ease' }}
                onClick={(e) => e.stopPropagation()} 
                onLoadStart={() => setLightboxLoading(true)}
                onLoad={() => setLightboxLoading(false)}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close Modal">
          <i className="bi bi-x-lg fs-5"></i>
        </button>

        <div className="modal-header-img">
          <ImageWithLoader src={getOptimizedUrl(event.image, 800)} alt={event.name} className="w-100 h-100" />
          <div className="modal-title-overlay">
            <div className="modal-title-text fade-in-up">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge bg-white text-black fw-bold px-3 py-1">{event.year}</span>
                <span className="badge glass-badge text-white border border-white border-opacity-25 px-3 py-1">
                  <i className="bi bi-geo-alt-fill text-warning me-1"></i> {event.location}
                </span>
              </div>
              <h2 className="display-5 fw-black text-white mb-0" style={{ letterSpacing: '-1px' }}>{event.name}</h2>
              <p className="text-white-50 m-0 fw-bold">{event.date}, {event.year}</p>
            </div>
          </div>
        </div>

        <div className="modal-body custom-scrollbar">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
                <h5 className="text-white fw-bold mb-3">About the Event</h5>
                <p className="text-white opacity-75 fs-6 mb-5 lh-lg">{event.desc}</p>
            </div>
          </div>

          {event.youtubeId && event.youtubeId.trim() !== "" && (
            <div className="mb-5">
               <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                  <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-play-circle-fill text-danger fs-4"></i> Official Highlights
                  </h5>
                  <div className="d-flex justify-content-center w-100">
                    <div className="video-wrapper ratio ratio-16x9 w-100" style={{ maxWidth: '750px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <iframe src={`https://www.youtube.com/embed/${event.youtubeId}?modestbranding=1&rel=0`} title="YouTube video" allowFullScreen style={{border:0}}></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showGallerySection && (
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-white border-opacity-10 pb-2">
                        <h5 className="text-white fw-bold m-0"><i className="bi bi-images text-primary me-2"></i>Gallery</h5>
                    </div>
                    {hasGallery ? (
                        <div className="gallery-grid-container mb-4">
                        {previewImages.map((img, idx) => (
                            <div className="gallery-item" key={idx} onClick={() => { setLightboxLoading(true); setFullScreenImg(img); }}>
                            <ImageWithLoader src={getOptimizedUrl(img, 400)} alt={`Gallery ${idx}`} className="w-100 h-100" />
                            <div className="gallery-overlay"><i className="bi bi-arrows-fullscreen"></i></div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-white-50 small mb-4 fst-italic py-3 text-center border border-white border-opacity-10 rounded-3 bg-white bg-opacity-5">Preview images coming soon.</p>
                    )}
                    <a 
                        href={hasDropbox ? event.dropboxLink : "#"} 
                        target={hasDropbox ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`btn btn-outline-light w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 hover-glow ${!hasDropbox ? 'opacity-50' : ''}`}
                        onClick={(e) => { if (!hasDropbox) e.preventDefault(); }}
                    >
                        <span>View Full Album on Dropbox</span>
                        <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: Main List Card ---
const EventCard = ({ event, index, onOpen }) => (
  <div className="col" 
       // FIX: Capped animation delay to max 500ms to prevent infinite waiting
       style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}>
    <div className="glass-card rounded-4 overflow-hidden h-100 d-flex flex-column fade-in-up">
      
      <div className="position-relative img-hover-zoom card-img-wrapper">
        <ImageWithLoader src={getOptimizedUrl(event.image, 500)} alt={event.name} className="w-100 h-100" />
        
        <div className="position-absolute top-0 end-0 m-2 m-md-3 z-3">
          <span className="badge glass-badge rounded-pill px-2 py-1 px-md-3 py-md-2 fw-bold text-white shadow-sm border border-white border-opacity-10 small-badge">
            <i className="bi bi-geo-alt-fill text-warning me-1"></i> 
            <span className="d-none d-sm-inline">{event.location}</span>
            <span className="d-sm-none">{event.location.split(',')[0]}</span>
          </span>
        </div>
        
        <div className="position-absolute bottom-0 start-0 w-100 p-3 z-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}></div>
      </div>

      <div className="p-3 p-md-4 flex-grow-1 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="text-white-50 fw-bold text-uppercase tracking-wide" style={{fontSize: '0.7rem'}}>{event.date}</small>
          <small className="badge bg-white bg-opacity-10 text-white rounded-pill px-2" style={{fontSize: '0.7rem'}}>{event.year}</small>
        </div>
        
        <h5 className="fw-bold text-white mb-2 text-truncate" style={{fontSize: '1rem'}} title={event.name}>{event.name}</h5>
        
        <p className="text-white-50 small mb-3 text-truncate d-none d-md-block">{event.desc}</p>
        
        <button className="btn btn-outline-light rounded-pill btn-sm w-100 mt-auto opacity-75 hover-glow" onClick={() => onOpen(event)}>
            <span className="d-none d-md-inline">View Details</span>
            <span className="d-md-none">View</span> 
            <i className="bi bi-arrow-right ms-1"></i>
        </button>
      </div>
    </div>
  </div>
);

// --- COMPONENT: Filter Bar ---
const FilterBar = ({ search, setSearch, location, setLocation, year, setYear, locations, years }) => (
  <div className="row g-3 mb-5 fade-in-up">
    <div className="col-12 col-lg-6">
      <div className="position-relative">
        <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-white-50"></i>
        <input 
          type="text" 
          className="form-control form-control-lg rounded-pill custom-input ps-5 py-3 fs-6" 
          placeholder="Search events..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search events" 
        />
      </div>
    </div>
    <div className="col-6 col-lg-3">
      <select 
        className="form-select form-select-lg rounded-pill custom-input ps-4 py-3 fs-6" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)}
        aria-label="Filter by location"
      >
        <option value="All">All Locations</option>
        {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
    </div>
    <div className="col-6 col-lg-3">
      <select 
        className="form-select form-select-lg rounded-pill custom-input ps-4 py-3 fs-6" 
        value={year} 
        onChange={(e) => setYear(e.target.value)}
        aria-label="Filter by year"
      >
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

  const uniqueLocations = useMemo(() => [...new Set(EVENTS_DATA.map(e => e.location))].sort(), []);
  const uniqueYears = useMemo(() => [...new Set(EVENTS_DATA.map(e => e.year))].sort((a, b) => b - a), []);

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
          <Link to="/" className="d-flex align-items-center gap-3 text-white fw-bold back-link text-decoration-none" aria-label="Go back to home">
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
          <div className="row row-cols-2 row-cols-md-2 row-cols-lg-3 g-3 g-md-4">
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

      <EventModal 
        event={selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}