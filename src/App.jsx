import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// --- IMPORTS ---
import PastEventPage from './components/PastEvent';
import { EVENTS_DATA } from './components/EventData';
import Admin from './components/Admin';
import RegisterPage from './components/RegisterPage'; 
import AboutUs from './components/AboutUs'; 

// --- CONFIGURATION ---
const API_URL = 'https://g7l.c49.mytemp.website/api.php';

// --- SCROLL TO TOP & ANIMATION FIX ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
        const elements = document.querySelectorAll('.fade-up');
        elements.forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [pathname]);

  return null;
};

// --- OPTIMIZATION HELPERS ---
const getOptimizedUrl = (url, width) => {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto:good,w_${width}/`);
};

const ImageWithLoader = ({ src, alt, className, onClick, style }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className={`img-loader-container ${className || ''}`} onClick={onClick} style={style}>
      {!isLoaded && <div className="skeleton-loader" style={{position:'absolute', inset:0, background:'#1a1a1a'}}></div>}
      <img 
        src={src} alt={alt} loading="lazy" decoding="async"
        className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        style={{width:'100%', height:'100%', objectFit:'cover'}}
        onError={(e) => { setIsLoaded(true); }} 
      />
    </div>
  );
};

// --- LEGACY EVENT POPUP COMPONENT (RESPONSIVE) ---
const LegacyEventModal = ({ event, onClose }) => {
  const [fullScreenImg, setFullScreenImg] = useState(null);
  const [lightboxLoading, setLightboxLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!event) return null;

  const MAX_PREVIEW = 6;
  const hasGallery = event.gallery && event.gallery.length > 0;
  const previewImages = hasGallery ? event.gallery.slice(0, MAX_PREVIEW) : [];
  const showGallerySection = hasGallery || (event.dropboxLink && event.dropboxLink.trim() !== "");

  if (fullScreenImg) {
    return (
      <div className="lightbox-overlay" onClick={() => setFullScreenImg(null)} style={{zIndex: 10000, position:'fixed', inset:0, background:'rgba(0,0,0,0.95)', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <button className="lightbox-close-btn" onClick={(e) => { e.stopPropagation(); setFullScreenImg(null); }} style={{position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50%', width:'50px', height:'50px', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex: 10001}}>
          <i className="bi bi-x-lg"></i>
        </button>
        <div className="lightbox-content position-relative">
            {lightboxLoading && (
                <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-light" role="status"></div>
                </div>
            )}
            <img 
                src={getOptimizedUrl(fullScreenImg, 1200)} 
                alt="Full Screen" 
                style={{maxWidth:'95vw', maxHeight:'95vh', objectFit:'contain', transition: 'opacity 0.3s'}}
                className={lightboxLoading ? 'opacity-0' : 'opacity-100'}
                onClick={(e) => e.stopPropagation()} 
                onLoadStart={() => setLightboxLoading(true)}
                onLoad={() => setLightboxLoading(false)}
            />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{zIndex: 9999}}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><i className="bi bi-x-lg"></i></button>

        <div className="modal-header-img">
          <ImageWithLoader src={getOptimizedUrl(event.image, 800)} alt={event.name} className="w-100 h-100" />
          <div className="modal-title-overlay">
            <div className="modal-title-text fade-in-up">
              <span className="badge bg-white text-black fw-bold mb-2">{event.year}</span>
              <h2 className="display-5 fw-black text-white mb-0">{event.name}</h2>
              <p className="text-white-50 m-0 fw-bold">{event.date}</p>
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

          {event.youtubeId && (
            <div className="mb-5">
              <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                  <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-play-circle-fill text-danger fs-4"></i> Official Highlights
                  </h5>
                  <div className="d-flex justify-content-center w-100">
                    <div className="video-wrapper ratio ratio-16x9 w-100" style={{ maxWidth: '750px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                      <iframe 
                        src={`https://www.youtube.com/embed/${event.youtubeId}?modestbranding=1&rel=0`} 
                        title="YT" 
                        allowFullScreen 
                        style={{border:0}}
                      ></iframe>
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
                        <h5 className="text-white fw-bold m-0">
                            <i className="bi bi-images text-primary me-2"></i>Gallery
                        </h5>
                    </div>

                    {hasGallery ? (
                        <div className="row g-2 mb-4">
                        {previewImages.map((img, idx) => (
                            <div key={idx} className="col-6 col-md-4" onClick={() => { setLightboxLoading(true); setFullScreenImg(img); }}>
                                <div style={{aspectRatio:'1', overflow:'hidden', borderRadius:'8px', cursor:'pointer', position:'relative', border:'1px solid rgba(255,255,255,0.1)'}}>
                                    <ImageWithLoader src={getOptimizedUrl(img, 400)} alt={`Gallery ${idx}`} className="w-100 h-100" />
                                    <div style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.2s'}} onMouseEnter={(e)=>e.currentTarget.style.opacity=1} onMouseLeave={(e)=>e.currentTarget.style.opacity=0}>
                                                <i className="bi bi-arrows-fullscreen text-white fs-4"></i>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-white-50 small mb-4 fst-italic py-3 text-center border border-white border-opacity-10 rounded-3 bg-white bg-opacity-5">
                        Preview images coming soon.
                        </p>
                    )}

                    <a 
                        href={event.dropboxLink && event.dropboxLink.trim() !== "" ? event.dropboxLink : "#"} 
                        target={event.dropboxLink && event.dropboxLink.trim() !== "" ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={`btn btn-outline-light w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 hover-glow ${(!event.dropboxLink || event.dropboxLink.trim() === "") ? 'opacity-50' : ''}`}
                        onClick={(e) => {
                           if (!event.dropboxLink || event.dropboxLink.trim() === "") e.preventDefault();
                        }}
                    >
                        <span>View Full Album on Dropbox</span>
                        <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                </div>
            </div>
          )}
           
          <div className="text-center mt-5 mb-3">
             <Link to="/past-events" className="btn btn-outline-custom px-4 px-md-5 py-2">
                View All Past Events <i className="bi bi-arrow-right ms-2"></i>
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- UI COMPONENTS ---
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      if (location.hash) {
        const elem = document.getElementById(location.hash.slice(1));
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
  }, [location]);

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${scrolled ? 'navbar-scrolled' : ''}`} id="navbar">
      <div className="container">
        <Link className="navbar-brand position-relative z-3" to="/" aria-label="Levitate Home">
          {!logoError ? (
            <img
              src="/0f29a9bb-de5e-4bd8-9e9e-56c22da65766.png"
              alt="Levitate Logo"
              className="navbar-logo-img"
              width="150"
              height="50"
              loading="eager"
              onError={() => setLogoError(true)}
            />
          ) : (
             <span className="h3 fw-black text-white" style={{ letterSpacing: '2px' }}>LEVITATE</span>
          )}
        </Link>
        <button
          className="navbar-toggler text-white border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" width="30" height="30">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-lg-4 gap-3 py-3 py-lg-0">
            <li className="nav-item"><a className="nav-link" href="/#about" onClick={() => setIsOpen(false)}>About</a></li>
            <li className="nav-item"><a className="nav-link" href="/#events" onClick={() => setIsOpen(false)}>Upcoming</a></li>
            <li className="nav-item"><a className="nav-link" href="/#legacy" onClick={() => setIsOpen(false)}>Past Events</a></li>
            <li className="nav-item"><a className="nav-link" href="/#gallery" onClick={() => setIsOpen(false)}>Gallery</a></li>
            <li className="nav-item"><a className="nav-link" href="/#community" onClick={() => setIsOpen(false)}>Community</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => (
  <header className="hero-section">
    <div className="hero-bg">
      <img
        src="https://res.cloudinary.com/dhqferqbw/image/upload/f_auto,q_auto/v1768370701/photo-1492684223066-81342ee5ff30_psivl4.avif"
        srcSet="https://res.cloudinary.com/dhqferqbw/image/upload/f_auto,q_auto,w_600/v1768370701/photo-1492684223066-81342ee5ff30_psivl4.avif 600w,
                https://res.cloudinary.com/dhqferqbw/image/upload/f_auto,q_auto,w_1200/v1768370701/photo-1492684223066-81342ee5ff30_psivl4.avif 1200w,
                https://res.cloudinary.com/dhqferqbw/image/upload/f_auto,q_auto,w_1920/v1768370701/photo-1492684223066-81342ee5ff30_psivl4.avif 1920w"
        sizes="100vw"
        alt="Concert Crowd"
        width="1920" height="1080"
        fetchPriority="high"
        loading="eager"
        decoding="sync"
        onError={(e) => e.target.style.display = 'none'}
      />
      <div className="hero-overlay"></div>
    </div>

    <div className="container position-relative z-1 text-center fade-up">
      <h1 className="hero-title mt-5 pt-5">UPLIFTING ARTISTS.<br/><span className="text-gradient">BUILDING COMMUNITY.</span></h1>
      <p className="text-white opacity-90 mx-auto mb-4 hero-subtitle">Levitate Entertainment creates cultural festivals
        and live experiences that bring people together and give artists
        meaningful platforms to grow.</p>
      <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mt-4">
        <a href="#events" className="btn btn-gradient">Explore Events</a>
        <a href="#community" className="btn btn-outline-custom">Join Community</a>
      </div>
    </div>
  </header>
);

const CounterItem = ({ target, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const end = parseInt(target);
        const duration = 1200;
        const incrementTime = 20;
        const totalSteps = duration / incrementTime;
        const increment = Math.ceil(end / totalSteps); 
        
        let timer = setInterval(() => {
          start += increment;
          if(start >= end) {
            start = end;
            clearInterval(timer);
          }
          setCount(start);
        }, incrementTime);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="col-12 col-md-4" ref={ref}>
      <div className="glass p-4 rounded-4 text-center glass-card justify-content-center h-100 d-flex flex-column align-items-center">
        <div className="display-4 fw-black text-gradient mb-0 lh-1">{count.toLocaleString()}+</div>
        <div className="small fw-bold text-white opacity-75 text-uppercase letter-spacing-1 mt-2">{label}</div>
      </div>
    </div>
  );
};

const About = () => (
  <section id="about" className="position-relative z-1">
    <div className="container fade-up">
      <div className="text-center mx-auto mb-5" style={{maxWidth: '800px'}}>
        <span className="fw-bold text-uppercase small d-block mb-2" style={{color: '#f97316', letterSpacing: '3px'}}>Our Story</span>
        <h2 className="section-title fw-black mb-3">More than just an event.</h2>
        <p className="text-white-50 fs-5">
          Levitate Entertainment creates live experiences that go beyond traditional venues,
          from intimate gatherings to large-scale, free public festivals designed to bring people together.
        </p>
      </div>
      
      <div className="row g-4 justify-content-center">
        <CounterItem target="22" label="Events" />
        <CounterItem target="50000" label="Attendees" />
        <CounterItem target="1000" label="Artists" />
      </div>
      
    </div>
  </section>
);

const Services = () => (
  <section>
    <div className="container">
      <div className="d-flex flex-column flex-md-row align-items-md-end justify-content-between mb-4 fade-up">
        <div><h2 className="section-title fw-black m-0">What We <span className="text-gradient">Do</span></h2></div>
        <div className="d-none d-md-block text-white-50 small text-uppercase fw-bold letter-spacing-1">Crafting Experiences</div>
      </div>
      <div className="row g-3">
        {[
          { icon: "🎪", title: "Large-Scale Festivals", text: "Massive cultural celebrations bringing thousands together for unforgettable moments of joy and heritage.", delay: "100ms" },
          { icon: "🎨", title: "Cultural Programs", text: "Workshops, art showcases, and educational experiences that keep traditions alive for the next generation.", delay: "200ms" },
          { icon: "🤝", title: "Community Gatherings", text: "Intimate meetups and networking events designed to strengthen bonds and foster collaboration.", delay: "300ms" }
        ].map((item, index) => (
          <div className="col-md-4 fade-up" style={{transitionDelay: item.delay}} key={index}>
            <div className="glass p-4 rounded-4 glass-card border-0 h-100">
              <div className="fs-2 mb-3">{item.icon}</div>
              <h3 className="h5 fw-bold mb-2">{item.title}</h3>
              <p className="text-white-50 small mb-0">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- UPGRADED BOOKING MODAL: Banner + Map Popup + Paid/Free Buttons ---
const BookingModal = ({ event, onClose }) => {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const onEsc = (e) => {
      if (e.key === 'Escape') {
        if (showMap) setShowMap(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onEsc);
    };
  }, [onClose, showMap]);

  if (!event) return null;

  const isFree = event.eventType === 'free';
  const hasMap = event.mapUrl && event.mapUrl.trim() !== '';
  const paidEmail = event.paidTicketEmail || "contact@levitateinc.ca";

  // --- CHANGED LOGIC TO USE BANNER IF AVAILABLE ---
  const bannerSrc =
    event.bannerImg && event.bannerImg.length > 5
      ? event.bannerImg
      : (event.img || "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1200&auto=format&fit=crop");

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("event-modal-overlay")) onClose();
  };

  const openMap = () => {
    if (hasMap) setShowMap(true);
  };

  const mailtoLink = `mailto:${paidEmail}?subject=${encodeURIComponent(
    `Tickets for ${event.title}`
  )}&body=${encodeURIComponent(
    `Hi Levitate Team,\n\nI want tickets for ${event.title}.\nDate: ${event.date}\nLocation: ${event.location || ""}\n\nPlease share price & payment details.\n\nThanks,`
  )}`;

  const freeRedirect = event.freeEventUrl || event.ticketUrl;

  return (
    <div className="event-modal-overlay" onClick={handleOverlayClick}>
      <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className="event-modal-close" onClick={onClose} aria-label="Close">
          <i className="bi bi-x-lg"></i>
        </button>

        {/* HERO BANNER */}
        <div className="event-hero">
          <img src={bannerSrc} alt={event.title} className="event-hero-img" />
          <div className="event-hero-overlay"></div>

          <div className="event-hero-top">
            <div className="event-present">LEVITATE ENTERTAINMENT PRESENTS</div>
          </div>

          <div className="event-hero-content">
            <span className="event-pill">{(event.location || "CHENNAI").toUpperCase()}</span>
            <h2 className="event-title">{event.title}</h2>
          </div>
        </div>

        {/* META ROW */}
        <div className="event-meta-row">
          <div className="event-meta-box">
            <i className="bi bi-calendar-event"></i>
            <div>
              <div className="meta-label">DATE</div>
              <div className="meta-value">{event.date || "TBA"}</div>
            </div>
          </div>

          <button
            className={`event-meta-box event-meta-btn ${hasMap ? "" : "disabled"}`}
            onClick={openMap}
            disabled={!hasMap}
            aria-label="Check map"
          >
            <i className="bi bi-geo-alt"></i>
            <div>
              <div className="meta-label">LOCATION</div>
              <div className="meta-value">{hasMap ? "CHECK MAP" : "COMING SOON"}</div>
            </div>
            <i className="bi bi-chevron-right ms-auto opacity-50"></i>
          </button>
        </div>

        {/* ABOUT */}
        <div className="event-body">
          <h5 className="event-section-title">About Event</h5>
          {/* Added whiteSpace style here as requested */}
          <p className="event-desc" style={{ whiteSpace: "pre-wrap" }}>
            {event.description ||
              "Join us for an unforgettable experience. Lineup and schedule will be announced soon."}
          </p>
        </div>

        {/* CTA */}
        <div className="event-cta">
          {!isFree ? (
            <a className="event-cta-btn primary" href={mailtoLink}>
              <i className="bi bi-envelope-fill"></i>
              Email us for tickets
            </a>
          ) : (
            <button
              className="event-cta-btn primary"
              onClick={() => {
                if (freeRedirect) window.location.href = freeRedirect;
              }}
              disabled={!freeRedirect}
            >
              <i className="bi bi-box-arrow-up-right"></i>
              Free Event
            </button>
          )}

          {/* Optional secondary button */}
          {!isFree && event.ticketUrl ? (
            <a className="event-cta-btn secondary" href={event.ticketUrl} target="_blank" rel="noreferrer">
              <i className="bi bi-ticket-perforated-fill"></i>
              Book Now
            </a>
          ) : null}
        </div>

        {/* MAP POPUP */}
        {showMap && (
          <div className="map-popup-overlay" onClick={() => setShowMap(false)}>
            <div className="map-popup-card" onClick={(e) => e.stopPropagation()}>
              <button className="map-popup-close" onClick={() => setShowMap(false)} aria-label="Close map">
                <i className="bi bi-x-lg"></i>
              </button>

              <div className="map-popup-title">
                <i className="bi bi-geo-alt-fill"></i>
                <span>Event Location</span>
              </div>

              <div className="map-popup-frame">
                <iframe
                  src={event.mapUrl}
                  title="Event Map"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <a className="map-popup-open" href={event.mapUrl} target="_blank" rel="noreferrer">
                Open in Google Maps <i className="bi bi-arrow-right"></i>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard = React.memo(({ eventData, onBook }) => {
  const isLocked = eventData.isLocked === true;
  
  const imageSrc = eventData.img && eventData.img.length > 5
    ? eventData.img
    : "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="col-lg-4 col-md-6 fade-up group" style={{transitionDelay: eventData.delay || '0ms'}}>
      <div className="glass-card rounded-4 overflow-hidden border-0">
        
        <div className={`position-relative img-hover-zoom ${eventData.variant === 'poster' ? 'card-img-poster' : 'card-img-landscape'}`}>
          <div className="w-100 h-100 bg-dark position-relative">
            <img
              src={imageSrc}
              className={`w-100 h-100 object-fit-cover ${isLocked ? 'locked-event-img' : ''}`}
              alt={eventData.title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                 e.target.src = "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop";
              }}
            />
            {isLocked && (
              <div className="lock-overlay">
                <div className="lock-icon"><i className="bi bi-lock-fill"></i></div>
                <div className="lock-text">Revealing Soon</div>
              </div>
            )}
          </div>
          
          {!isLocked && (
            <div className="position-absolute top-0 end-0 m-3 glass text-white fw-bold px-3 py-1 rounded-pill small">{eventData.date}</div>
          )}
        </div>

        <div className="p-4 flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
             <div className="small fw-bold text-uppercase" style={{letterSpacing: '1.5px', color: '#f97316'}}>{eventData.category}</div>
             {eventData.eventType === 'free' && <span className="badge bg-success text-white small">FREE</span>}
          </div>
          <h3 className="h4 fw-bold mb-3">{eventData.title}</h3>
          
          <button
            className={`btn w-100 mt-auto btn-sm ${isLocked ? 'btn-secondary opacity-50' : 'btn-outline-custom'}`}
            onClick={() => !isLocked && onBook(eventData)}
            disabled={isLocked}
            style={{cursor: isLocked ? 'not-allowed' : 'pointer'}}
          >
            {isLocked ? 'Stay Tuned' : (eventData.eventType === 'free' ? 'Get Tickets' : 'Book Now')}
          </button>
        </div>
      </div>
    </div>
  );
});

const Events = ({ events }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6); 

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <section id="events">
      <div className="container">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 fade-up gap-3">
          <div className="text-start"><h2 className="section-title fw-black mb-1">Upcoming <span className="text-gradient">Lineup</span></h2></div>
        </div>
        
        {events.length === 0 ? (
              <div className="text-center text-white-50 py-5 fade-up">Loading events or no events found...</div>
        ) : (
            <div className="row g-3">
            {events.slice(0, visibleCount).map(event => (
                <EventCard
                key={event.id}
                eventData={event}
                onBook={setSelectedEvent}
                />
            ))}
            </div>
        )}

        {visibleCount < events.length && (
            <div className="text-center mt-5 fade-up">
                <button 
                className="btn btn-outline-custom px-5 py-2" 
                onClick={handleLoadMore}
                >
                Load More Events
                </button>
            </div>
        )}
      </div>
      
      {selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </section>
  );
};

// --- UPDATED: HomeLegacySection with Interaction ---
const HomeLegacySection = () => {
  const [selectedLegacyEvent, setSelectedLegacyEvent] = useState(null);
  const featuredEvents = EVENTS_DATA.slice(0, 3);

  return (
    <section id="legacy" className="position-relative">
      <div className="position-absolute start-0 top-50 translate-middle-y bg-primary opacity-10 rounded-circle blur-bg-circle" style={{left: '-20%'}}></div>

      <div className="container">
        <div className="text-center mx-auto mb-5 fade-up" style={{maxWidth: '700px'}}>
          <span className="small fw-bold text-uppercase text-white-50 letter-spacing-2">Track Record</span>
          <h2 className="section-title fw-black">Our <span className="text-gradient">Legacy</span></h2>
          <p className="text-white opacity-75 mt-3">
            From intimacy to spectacle. A history of sold-out shows, first-of-its-kind concepts, and cultural milestones across Canada.
          </p>
        </div>

        <div className="row g-3 mb-5">
          {featuredEvents.map((event, i) => (
            <div className="col-6 col-lg-4 fade-up" key={event.id} style={{transitionDelay: `${i * 50}ms`}}>
              <div 
                className="glass h-100 rounded-4 overflow-hidden border-0 position-relative group hover-lift"
                style={{cursor: 'pointer'}}
                onClick={() => setSelectedLegacyEvent(event)}
              >
                
                <div className="position-relative overflow-hidden" style={{height: '180px'}}>
                    <div className="w-100 h-100 bg-dark">
                      <img
                        src={`${event.image}?q=80&w=600&auto=format&fit=crop`}
                        alt={event.name}
                        className="w-100 h-100 object-fit-cover opacity-75 img-zoom"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => e.target.style.display='none'}
                      />
                    </div>
                    <div className="position-absolute top-0 end-0 m-2 m-md-3 badge bg-white text-black fw-bold small">{event.year}</div>
                    <div className="position-absolute bottom-0 start-0 m-2 m-md-3 badge bg-gradient text-white small fw-bold" style={{background: 'var(--levitate-gradient)'}}>{event.location}</div>
                </div>
                
                <div className="p-3 p-md-4">
                  <h4 className="h6 fw-bold mb-2 text-white text-truncate">{event.name}</h4>
                  <p className="text-white-50 small mb-3 d-none d-md-block text-truncate">{event.desc}</p>
                  
                  <div className="d-flex align-items-center justify-content-between text-white-50 small fw-bold text-uppercase">
                      <div className="d-flex align-items-center gap-2">
                          <span className="text-warning small">★</span>
                          <span className="text-truncate">{event.date}</span>
                      </div>
                      <i className="bi bi-arrow-up-right-circle text-white opacity-50"></i>
                  </div>
                </div>

              </div>
            </div>
          ))}
          
        </div>

        <div className="text-center fade-up">
            <Link
              to="/past-events"
              className="btn btn-outline-custom px-5 py-3 d-inline-flex align-items-center gap-2"
            >
              View All Past Events
              <i className="bi bi-arrow-right"></i>
            </Link>
        </div>
      </div>

      {/* Render Legacy Modal */}
      {selectedLegacyEvent && (
        <LegacyEventModal 
            event={selectedLegacyEvent} 
            onClose={() => setSelectedLegacyEvent(null)} 
        />
      )}
    </section>
  );
};

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState("Loading...");

  useEffect(() => {
    const targetDate = new Date("August 28, 2025 10:00:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft("LIVE");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days < 10 ? '0'+days : days}d ${hours < 10 ? '0'+hours : hours}h ${minutes < 10 ? '0'+minutes : minutes}m`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft === "LIVE") return <div className='text-warning fw-bold'>LIVE</div>;

  return (
    <>
      <span className="text-white-50 small">STARTS IN:</span>
      <span className="fw-bold text-white ms-1">{timeLeft}</span>
    </>
  );
};

const Gallery = () => (
  <section id="gallery">
    <div className="container">
      <div className="text-center mb-4 fade-up"><h2 className="section-title fw-black m-0">Gallery</h2></div>
      
      <div className="gallery-grid fade-up">
        <div className="gallery-item-large gallery-img-wrapper">
          <img
            src="https://res.cloudinary.com/dhqferqbw/image/upload/v1768196493/DSC01438_xrxuuw.jpg"
            alt="Festival Crowd"
            loading="lazy"
            decoding="async"
            onError={(e) => e.target.style.display='none'}
          />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
          <img src="https://res.cloudinary.com/dhqferqbw/image/upload/v1768195950/Crowd2_lveepl.jpg" alt="Audience Energy" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
            <img src="https://res.cloudinary.com/dhqferqbw/image/upload/v1768195953/IMG_9412-scaled_eabt1y.jpg" alt="Lights" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
          <img src="https://res.cloudinary.com/dhqferqbw/image/upload/v1768195952/DSC03795-scaled_kzt21m.jpg" alt="DJ Set" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
            <img src="https://res.cloudinary.com/dhqferqbw/image/upload/v1768195942/3-scaled-q89by2kvpqsptvw9eej3zd2xgvdusw8fspkglzgue8_b46syd.jpg" alt="Vibes" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

      </div>
    </div>
  </section>
);

const Community = () => (
  <section id="community">
    <div className="container">
      <div className="text-center mb-4 fade-up">
        <span className="small fw-bold text-uppercase text-white-50 letter-spacing-2">Get Involved</span>
        <h2 className="section-title fw-black">Build the <span className="text-gradient">Experience</span></h2>
      </div>
      <div className="row g-3">
        {[
          { 
            id: 'volunteer',
            color: "primary", 
            iconPath: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", 
            title: "Volunteers", 
            text: "Become the backbone of our events. Gain backstage access, mentorship, and join a network.", 
            btn: "Apply Now", 
            delay: "100ms" 
          },
          { 
            id: 'artist',
            color: "warning", 
            iconPath: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z", 
            title: "Artists", 
            text: "Musicians, dancers, visual artists. We provide the platform; you bring the vision.", 
            btn: "Register Now", 
            delay: "200ms" 
          },
          { 
            id: 'sponsor',
            color: "info", 
            iconPath: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z", 
            title: "Sponsors", 
            text: "Align your brand with Canada's fastest-growing cultural platform. Let's create impact.", 
            btn: "Partner With Us", 
            delay: "300ms" 
          }
        ].map((item, index) => (
          <div className="col-md-4 fade-up" style={{transitionDelay: item.delay}} key={index}>
            <div className="glass p-4 rounded-4 text-center position-relative overflow-hidden group border-0 h-100" style={{background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), transparent)'}}>
              <div className={`position-absolute top-0 start-50 translate-middle bg-${item.color} opacity-25 rounded-circle`} style={{width: '100px', height: '100px', filter: 'blur(50px)'}}></div>
              <div className={`mb-3 text-${item.color}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" width="40" height="40">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.iconPath} />
                </svg>
              </div>
              <h3 className="h5 fw-bold mb-2">{item.title}</h3>
              <p className="text-white-50 mb-4 small">{item.text}</p>
              
              <Link to={`/register?type=${item.id}`} className="btn btn-outline-custom w-100 btn-sm">{item.btn}</Link>
            
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- UPDATED FOOTER COMPONENT ---
const Footer = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="pt-5 pb-4 position-relative z-2" style={{ backgroundColor: '#05020a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <div className="row g-5 mb-5">
          
          {/* Column 1: Brand Identity */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" aria-label="Levitate Home" className="d-block mb-4">
              {!logoError ? (
                <img
                  src="/0f29a9bb-de5e-4bd8-9e9e-56c22da65766.png"
                  alt="Levitate Logo"
                  className="img-fluid"
                  style={{ maxHeight: '45px', width: 'auto' }}
                  loading="lazy"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="h3 fw-black text-white">LEVITATE</span>
              )}
            </Link>
            <p className="text-white-50 mb-4 lh-lg small">
              Canada's premier cultural entertainment brand. We build stages where communities celebrate, artists thrive, and heritage meets the future.
            </p>
            <div className="d-flex flex-column gap-2">
              <a href="mailto:contact@levitateinc.ca" className="d-flex align-items-center gap-2 text-white text-decoration-none hover-purple transition-all">
                <i className="bi bi-envelope-at text-secondary"></i>
                <span className="small">contact@levitateinc.ca</span>
              </a>
              <div className="d-flex align-items-center gap-2 text-white-50">
                <i className="bi bi-geo-alt-fill text-secondary"></i>
                <span className="small">Canada</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Company</h6>
            <ul className="list-unstyled d-flex flex-column gap-3 small">
              <li><Link to="/about" className="text-white-50 text-decoration-none hover-purple transition-all">About Us</Link></li>
              <li><a href="/#gallery" className="text-white-50 text-decoration-none hover-purple transition-all">Gallery</a></li>
              <li><Link to="/register" className="text-white-50 text-decoration-none hover-purple transition-all">Careers / Volunteer</Link></li>
              <li><Link to="/register?type=sponsor" className="text-white-50 text-decoration-none hover-purple transition-all">Sponsorship</Link></li>
            </ul>
          </div>

          {/* Column 3: Events */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Events</h6>
            <ul className="list-unstyled d-flex flex-column gap-3 small">
              <li><a href="/#events" className="text-white-50 text-decoration-none hover-purple transition-all">Upcoming Lineup</a></li>
              <li><Link to="/past-events" className="text-white-50 text-decoration-none hover-purple transition-all">Past Archive</Link></li>
            </ul>
          </div>

          {/* Column 4: Flagship & Socials */}
          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Flagship Event</h6>
            
            {/* Professional Event Highlight Card */}
            <div className="glass p-3 rounded-3 border border-warning border-opacity-10 mb-4 position-relative overflow-hidden group">
               <div className="position-absolute top-0 end-0 p-2 opacity-10 text-warning"><i className="bi bi-star-fill"></i></div>
               <h6 className="text-white fw-bold mb-1">Maha Onam 2026</h6>
               <p className="text-white-50 small mb-2" style={{fontSize: '0.85rem'}}>The largest Kerala cultural festival in North America.</p>
               <a href="http://mahaonam.ca" className="text-warning small fw-bold text-decoration-none d-inline-flex align-items-center gap-1 hover-lift">
                 Explore Festival <i className="bi bi-arrow-right"></i>
               </a>
            </div>

            <div className="d-flex gap-2">
              <a href="https://www.instagram.com/levitate.entertainment/" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} aria-label="Instagram"><i className="bi bi-instagram"></i></a>
              <a href="https://www.youtube.com/@LevitateEntertainmentInc" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} aria-label="YouTube"><i className="bi bi-youtube"></i></a>
              <a href="https://www.facebook.com/levitateentertainmentinc" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}} aria-label="Facebook"><i className="bi bi-facebook"></i></a>
            </div>
          </div>

        </div>
      

        {/* Bottom Bar */}
        <div className="border-top border-white border-opacity-10 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
          <p className="mb-2 mb-md-0">© {new Date().getFullYear()} Levitate Entertainment Inc. All rights reserved.</p>
          <div className="d-flex gap-4">
            <a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Privacy Policy</a>
            <a href="#" className="text-white-50 text-decoration-none hover-text-white transition-all">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setVisible(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      className={`back-to-top ${visible ? 'active' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to Top"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" width="24" height="24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  );
};

// --- Home Component ---
const Home = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(API_URL);
        const mappedEvents = res.data.map(e => ({
          ...e,
          img: e.img_url,
          // MAP BANNER URL
          bannerImg: e.banner_url, 
          isLocked: Boolean(e.is_locked),
          mapUrl: e.map_url, 
          ticketUrl: e.ticket_url, 
          eventType: e.event_type, 
          delay: '0ms',
          variant: 'poster'
        }));
        
        mappedEvents.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateA - dateB;
        });

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Error connecting to backend:", err);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    setTimeout(() => {
        const elements = document.querySelectorAll('.fade-up');
        elements.forEach(el => observer.observe(el));
    }, 100);

    return () => observer.disconnect();
  }, [events]); 

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Events events={events} />
      <HomeLegacySection />
      <Gallery />
      <Community />
      <Footer />
      <BackToTop />
    </>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <>
      <ScrollToTop />
      
      <div className="fixed-bg"></div>
      <div className="grain-overlay"></div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/past-events" element={<PastEventPage />} />
        
        {/* ADD ABOUT US ROUTE */}
        <Route path="/about" element={<AboutUs />} />
        
        {/* IMPORTANT: Wrap RegisterPage with Navbar and Footer since it is an external file */}
        <Route path="/register" element={
            <>
                <Navbar />
                <RegisterPage />
                <Footer />
            </>
        } />
      </Routes>
    </>
  );
}

export default App;