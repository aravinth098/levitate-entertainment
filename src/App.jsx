import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom'; 
import './index.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// ✅ IMPORT 1: Your separate page component
import PastEventPage from './components/PastEvent'; 

// ✅ IMPORT 2: Your shared Data Source
import { EVENTS_DATA } from './components/EventData';

// --- ✅ NEW COMPONENT: Scroll To Top Fix ---
// This component listens to route changes and resets the scroll position
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// --- Sub-Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Note: We keep the hash scrolling logic here for in-page anchors
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
            <li className="nav-item d-none d-lg-block mt-2 mt-lg-0">
              <a href="/#events" className="btn btn-gradient btn-sm w-100">Get Tickets</a>
            </li>
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
        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1920&auto=format&fit=crop" 
        srcSet="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop 600w,
                https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop 1200w,
                https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1920&auto=format&fit=crop 1920w"
        sizes="100vw"
        alt="" 
        width="1920" height="1080"
        fetchPriority="high"
        loading="eager"
        decoding="async"
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
        let timer = setInterval(() => {
          start += Math.ceil(end / 40); 
          if(start >= end) {
            start = end;
            clearInterval(timer);
          }
          setCount(start);
        }, 40);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="col-6 col-lg-3" ref={ref}>
      <div className="glass p-4 rounded-4 text-center glass-card justify-content-center h-100">
        <div className="display-5 fw-black text-gradient mb-0">{count.toLocaleString()}+</div>
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
      <div className="row g-3">
        <CounterItem target="50" label="Events" />
        <CounterItem target="2500" label="Attendees" />
        <CounterItem target="200" label="Artists" />
        <CounterItem target="15" label="Cities" />
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

const EventCard = ({ img, date, category, title, delay }) => (
  <div className="col-lg-4 col-md-6 fade-up group" style={{transitionDelay: delay}}>
    <div className="glass-card rounded-4 overflow-hidden border-0">
      <div className="position-relative img-hover-zoom" style={{height: '240px'}}>
        <div className="w-100 h-100 bg-dark">
          <img 
            src={`${img}?q=80&w=800&auto=format&fit=crop`} 
            className="w-100 h-100 object-fit-cover" 
            alt={title} 
            loading="lazy" 
            decoding="async"
            onError={(e) => e.target.style.display='none'}
          />
        </div>
        <div className="position-absolute top-0 end-0 m-3 glass text-white fw-bold px-3 py-1 rounded-pill small">{date}</div>
      </div>
      <div className="p-4 flex-grow-1 d-flex flex-column">
        <div className="small fw-bold text-uppercase mb-2" style={{letterSpacing: '1.5px', color: '#f97316'}}>{category}</div>
        <h3 className="h4 fw-bold mb-3">{title}</h3>
        <button className="btn btn-outline-custom w-100 mt-auto btn-sm">Read More</button>
      </div>
    </div>
  </div>
);

const Events = () => (
  <section id="events">
    <div className="container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 fade-up gap-3">
        <div className="text-start"><h2 className="section-title fw-black mb-1">Upcoming <span className="text-gradient">Lineup</span></h2></div>
        <a href="#" className="btn btn-outline-custom btn-sm">All Events →</a>
      </div>
      <div className="row g-3">
        <EventCard img="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7" date="JUL 20" category="Music • Vancouver" title="Summer Beats '25" delay="0ms" />
        <EventCard img="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7" date="AUG 05" category="Culture • Montreal" title="Neon Nights" delay="100ms" />
        <EventCard img="https://images.unsplash.com/photo-1506157786151-b8491531f063" date="SEP 15" category="Concert • Toronto" title="Indie Fusion Fest" delay="200ms" />
      </div>
    </div>
  </section>
);

const HomeLegacySection = () => {
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
              <div className="glass h-100 rounded-4 overflow-hidden border-0 position-relative group hover-lift">
                
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
                  
                  <div className="d-flex align-items-center text-white-50 small fw-bold text-uppercase gap-2">
                      <span className="text-warning small">★</span>
                      <span className="text-truncate">{event.date}</span>
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

const MahaOnam = () => (
  <section className="position-relative overflow-hidden py-5">
    <div className="position-absolute top-50 start-50 translate-middle bg-warning opacity-10 rounded-circle blur-bg-circle"></div>
    <div className="container position-relative z-1 fade-up">
      <div className="onam-card-modern rounded-5">
        <div className="row g-0">
          <div className="col-lg-6 position-relative onam-img-container">
            <img 
              src="/1.png" 
              className="w-100 h-100 object-fit-cover position-absolute start-0 top-0" 
              alt="Kathakali Dancer" 
              loading="lazy" 
              decoding="async"
              onError={(e) => e.target.style.display='none'} 
            />
            <div className="position-absolute inset-0 w-100 h-100 gradient-overlay"></div>
          </div>
          <div className="col-lg-6 p-4 p-md-5 d-flex flex-column justify-content-center">
            <div className="d-flex align-items-center gap-3 mb-3">
              <span className="badge bg-warning text-black px-3 py-2 rounded-pill text-uppercase fw-bold" style={{letterSpacing: '1px'}}>★ Flagship Event</span>
              <div className="small fw-bold text-warning"><Countdown /></div>
            </div>
            <h2 className="display-5 fw-black text-uppercase lh-1 mb-2">Maha Onam <br/><span style={{background: 'linear-gradient(to right, #FFD700, #FFA500)', WebkitBackgroundClip: 'text', color: 'transparent'}}>Celebration 2025</span></h2>
            <div className="gold-divider"></div>
            <p className="text-white opacity-75 fs-6 mb-4 fw-light">Experience Canada's largest authentic Kerala festival. From the grand 26-course Sadya to the electrifying Pulikali, immerse yourself in tradition.</p>
            <div className="d-flex flex-wrap gap-4 mb-4 text-uppercase small letter-spacing-1 fw-bold text-white-50">
              <div><span className="d-block text-white">Aug 28</span> Date</div>
              <div><span className="d-block text-white">Paramount</span> Location</div>
              <div><span className="d-block text-white">5,000+</span> Capacity</div>
            </div>
            <div className="d-flex gap-3 flex-column flex-sm-row">
              <button className="btn btn-gradient px-4 py-2 text-uppercase letter-spacing-1 fw-bold">Book Tickets</button>
              <a href="#" className="btn btn-outline-custom px-4 py-2 text-uppercase letter-spacing-1 fw-bold">Read More</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Gallery = () => (
  <section id="gallery">
    <div className="container">
      <div className="text-center mb-4 fade-up"><h2 className="section-title fw-black m-0">Gallery</h2></div>
      
      <div className="gallery-grid fade-up">
        <div className="gallery-item-large gallery-img-wrapper">
          <img 
            src="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=800&auto=format&fit=crop" 
            alt="Festival Crowd" 
            loading="lazy" 
            decoding="async"
            onError={(e) => e.target.style.display='none'}
          />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
          <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=500&auto=format&fit=crop" alt="Audience Energy" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
            <img src="https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=500&auto=format&fit=crop" alt="Lights" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
          <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop" alt="DJ Set" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
        </div>

        <div className="gallery-item-small gallery-img-wrapper">
            <img src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=500&auto=format&fit=crop" alt="Vibes" loading="lazy" decoding="async" onError={(e) => e.target.style.display='none'} />
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
          { color: "primary", iconPath: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z", title: "Volunteers", text: "Become the backbone of our events. Gain backstage access, mentorship, and join a network.", btn: "Apply Now", delay: "100ms" },
          { color: "warning", iconPath: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z", title: "Artists", text: "Musicians, dancers, visual artists. We provide the platform; you bring the vision.", btn: "Submit Portfolio", delay: "200ms" },
          { color: "info", iconPath: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z", title: "Sponsors", text: "Align your brand with Canada's fastest-growing cultural platform. Let's create impact.", btn: "Partner With Us", delay: "300ms" }
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
              <a href="#" className="btn btn-outline-custom w-100 btn-sm">{item.btn}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="pt-5 pb-3 bg-black border-top border-white border-opacity-10">
      <div className="container">
        <div className="row g-5 mb-5">
          <div className="col-lg-5">
              <Link to="/" aria-label="Levitate Home" className="d-block mb-3">
                {!logoError ? (
                  <img 
                    src="/0f29a9bb-de5e-4bd8-9e9e-56c22da65766.png" 
                    alt="Levitate Logo" 
                    className="img-fluid" 
                    style={{maxHeight: '60px', width: 'auto'}}
                    loading="lazy"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="h3 fw-black text-white">LEVITATE</span>
                )}
              </Link>
            <p className="text-white-50 mb-4" style={{maxWidth: '300px'}}>Redefining cultural entertainment. Based in Canada, celebrating everywhere.</p>
            <div className="input-group mb-3" style={{maxWidth: '300px'}}>
              <input type="email" className="form-control bg-dark text-white border-secondary" placeholder="Enter your email" aria-label="Email for subscription" />
              <button className="btn btn-light" type="button">Subscribe</button>
            </div>
          </div>
          <div className="col-6 col-lg-3">
            <h5 className="fw-bold mb-4">Explore</h5>
            <ul className="list-unstyled text-white-50 d-flex flex-column gap-3">
              <li><a href="#" className="hover-purple">Maha Onam 2025</a></li>
              <li><a href="/#events" className="hover-purple">Upcoming Events</a></li>
              <li><a href="/#legacy" className="hover-purple">Past Events</a></li>
              <li><a href="/#gallery" className="hover-purple">Gallery</a></li>
            </ul>
          </div>
          <div className="col-6 col-lg-3">
            <h5 className="fw-bold mb-4">Connect</h5>
            <ul className="list-unstyled text-white-50 d-flex flex-column gap-3">
              <li><a href="#" className="hover-purple">Instagram</a></li>
              <li><a href="#" className="hover-purple">TikTok</a></li>
              <li><a href="#" className="hover-purple">Email Us</a></li>
            </ul>
          </div>
        </div>
        <div className="border-top border-white border-opacity-10 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center small text-white-50">
          <p className="mb-2 mb-md-0">© 2025 Levitate Entertainment. All rights reserved.</p>
          <div className="d-flex gap-3"><a href="#">Privacy</a><a href="#">Terms</a></div>
        </div>
      </div>
    </footer>
  );
};

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 50);
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

const Home = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.fade-up');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Events />
      <HomeLegacySection /> 
      <MahaOnam />
      <Gallery />
      <Community />
      <Footer />
      <BackToTop />
    </>
  );
};

function App() {
  return (
    <>
      {/* ✅ FIX ADDED HERE: This forces the page to start at the top on every route change */}
      <ScrollToTop />
      
      <div className="fixed-bg"></div>
      <div className="grain-overlay"></div>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/past-events" element={<PastEventPage />} />
      </Routes>
    </>
  );
}

export default App;