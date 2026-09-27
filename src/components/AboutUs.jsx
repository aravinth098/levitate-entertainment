import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AboutUs.css';
import levitateLogo from '../assets/logo.png'; // Verify path

// --- INTERNAL COMPONENT: ANIMATED COUNTER ---
const AnimatedCounter = ({ target, label, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        let start = 0;
        const end = parseInt(target);
        const duration = 1500;
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
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div className="col-6 col-md-3" ref={ref}>
      <div className="p-3">
        <h2 className="display-4 gradient-num mb-0">{count}{suffix}</h2>
        <div className="small text-white-50 text-uppercase fw-bold mt-2 letter-spacing-1">{label}</div>
      </div>
    </div>
  );
};

const AboutUs = () => {
  const [logoError, setLogoError] = useState(false);
  const location = useLocation();

  // --- FIX: INSTANT SCROLL TO TOP (Book Turn Effect) ---
  useLayoutEffect(() => {
    // 1. Disable browser's default scroll restoration
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    // 2. Instantly jump to top (0,0) before paint
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="levitate-app about-page">
      {/* Background Elements */}
      <div className="fixed-bg"></div>
      <div className="grain-overlay"></div>
      
      {/* Animated Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed-top p-3 glass-nav">
        <div className="container d-flex align-items-center justify-content-between">
          <Link to="/" className="d-flex align-items-center gap-3 text-white fw-bold back-link text-decoration-none">
            <div className="d-flex align-items-center justify-content-center rounded-circle border border-secondary icon-box">
              <i className="bi bi-arrow-left fs-5"></i>
            </div>
            <span className="tracking-wide d-none d-md-block">BACK TO HOME</span>
          </Link>
          <div className="logo-container">
            <img src={levitateLogo} alt="Levitate Entertainment" className="img-fluid" style={{ maxHeight: '50px' }} />
          </div>
        </div>
      </nav>

      <main className="container content-wrapper" style={{ paddingTop: '120px' }}>
        
        {/* 1. HERO SECTION */}
        <section className="text-center mb-5 fade-in-up">
          <h1 className="display-1 fw-black text-white mb-3">
            About <span className="text-gradient">Us</span>
          </h1>
          <div className="gold-divider mx-auto mb-4" style={{ width: '100px', height:'3px', background:'linear-gradient(90deg, transparent, #f97316, transparent)' }}></div>
          <p className="lead text-white-50 mx-auto fs-4" style={{ maxWidth: '800px', lineHeight: '1.6' }}>
            We are the pulse of live entertainment in Canada. <br className="d-none d-md-block"/>
            Creating experiences that bring people together.
          </p>
        </section>

        {/* 2. INTRO & PURPOSE */}
        <section className="row g-5 mb-5 align-items-center fade-in-up">
          <div className="col-lg-6">
            <div className="glass-card p-4 p-md-5 rounded-4 h-100 position-relative overflow-hidden border-0">
               {/* Subtle gradient overlay inside card */}
               <div className="position-absolute top-0 end-0 bg-primary opacity-25 rounded-circle" style={{width:'200px', height:'200px', filter:'blur(80px)', transform:'translate(30%, -30%)'}}></div>
               
               <h3 className="fw-bold text-white mb-4">Built from the Ground Up</h3>
               <p className="text-white opacity-75 lh-lg fs-5">
                 Built by a community that believes in shared energy, music, and celebration, Levitate produces live experiences that go beyond traditional venues—from intimate gatherings to large-scale, free public festivals enjoyed by thousands.
               </p>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="ps-lg-4">
              <h2 className="display-6 fw-bold text-white mb-4">Our <span className="text-levitate-orange">Purpose</span></h2>
              <p className="text-white opacity-75 lh-lg mb-4 fs-5">
                We exist to create spaces where people connect, artists shine, and communities come alive through live entertainment.
              </p>
              <div className="d-flex align-items-center gap-3">
                  <div className="bg-white bg-opacity-10 p-3 rounded-3">
                      <i className="bi bi-people-fill fs-3 text-white"></i>
                  </div>
                  <p className="text-white opacity-90 m-0">
                    Every event is designed to be <strong className="text-gradient">inclusive, immersive, and unforgettable.</strong>
                  </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. IMPACT STATS (Animated) */}
        <section className="mb-5 py-4 fade-in-up">
            <div className="glass-card rounded-4 p-4 p-md-5 border-0 bg-dark bg-opacity-50">
                <div className="row text-center g-4 justify-content-center align-items-center">
                    <AnimatedCounter target="20" label="Live Events" suffix="+" />
                    <AnimatedCounter target="25" label="People United" suffix="k+" />
                    <AnimatedCounter target="200" label="Artists Showcased" suffix="+" />
                    <div className="col-6 col-md-3">
                        <div className="p-3">
                            <h2 className="display-4 gradient-num mb-0"><i className="bi bi-globe-americas"></i></h2>
                            <div className="small text-white-50 text-uppercase fw-bold mt-2 letter-spacing-1">Global Reach</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* 4. OUR JOURNEY (Timeline) */}
        <section className="mb-5 py-5 fade-in-up">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <h2 className="display-6 fw-bold text-white mb-5 text-center">Our <span className="text-gradient">Journey</span></h2>
              
              <div className="timeline-container">
                {[
                    { title: "The Beginning", text: "Levitate began in 2023 with grassroots DJ nights and youth-driven events across Ontario. What started small quickly grew into something bigger—as the community grew with us." },
                    { title: "Expansion", text: "Over time, Levitate expanded into workshops, cruise events, theatrical productions, summits, and multi-city experiences—each one shaped by the people who showed up." },
                    { title: "A Defining Moment", text: "We produced Maha Onam at Yonge-Dundas Square—a large-scale, free public festival. This marked Levitate’s evolution into a city-level entertainment platform." },
                    { title: "Today", text: "Today, Levitate continues to grow as a trusted name in live entertainment—producing experiences that scale without losing their soul." }
                ].map((item, index) => (
                    <div className="timeline-item" key={index}>
                        <div className="timeline-dot"></div>
                        <h4 className="text-levitate-purple fw-bold mb-2">{item.title}</h4>
                        <p className="text-white opacity-75 m-0">{item.text}</p>
                    </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 5. WHAT WE CREATE (Grid) */}
        <section className="mb-5 py-5 fade-in-up">
          <h2 className="display-6 fw-bold text-white mb-5 text-center">What We <span className="text-gradient">Create</span></h2>
          <div className="row g-4">
            {[
              { title: "Live Entertainment", icon: "bi-music-note-beamed", desc: "DJ nights, jamming sessions, concerts, and high energy music experiences." },
              { title: "Public Festivals", icon: "bi-people-fill", desc: "Large scale, free festivals designed for families, youth, and communities." },
              { title: "Experiential Events", icon: "bi-stars", desc: "Cruise parties, themed productions, appreciation nights, and curated concepts." },
              { title: "Community Platforms", icon: "bi-heart-fill", desc: "Opportunities for artists, volunteers, and collaborators to be part of something bigger." }
            ].map((item, idx) => (
              <div className="col-md-6 col-lg-3" key={idx}>
                <div className="glass-card p-4 rounded-4 h-100 text-center">
                  <div className="icon-circle mb-4 mx-auto">
                    <i className={`bi ${item.icon} fs-2 text-white`}></i>
                  </div>
                  <h5 className="fw-bold text-white mb-3">{item.title}</h5>
                  <p className="text-white-50 small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CTA SECTION (Corrected Links) */}
        <section className="text-center py-5 fade-in-up">
          <div className="glass-card p-5 rounded-5 d-inline-block mx-auto position-relative overflow-hidden" style={{ maxWidth: '900px' }}>
            <div className="position-absolute top-50 start-50 translate-middle bg-warning opacity-10 rounded-circle" style={{width:'400px', height:'400px', filter:'blur(100px)'}}></div>
            
            <h2 className="fw-bold text-white mb-3 position-relative z-1">Be Part of Levitate</h2>
            <p className="text-white-50 mb-4 fs-5 position-relative z-1">Whether you are an artist, volunteer, sponsor, or supporter, there is a place for you here.</p>
            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center position-relative z-1">
              
              {/* Redirect to Home#community */}
              <a href="/#community" className="btn btn-gradient rounded-pill px-5 py-3 fw-bold shadow-lg">
                Get Involved
              </a>
              
              {/* Mailto Pop Up */}
              <a href="mailto:contact@levitateinc.ca" className="btn btn-outline-custom rounded-pill px-5 py-3 fw-bold">
                <i className="bi bi-envelope-fill me-2"></i> Email Us
              </a>
            </div>
          </div>
        </section>

        {/* 7. FULL FOOTER (Responsive Match) */}
        <footer className="pt-5 pb-4 position-relative z-2" style={{ backgroundColor: '#05020a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="container">
            <div className="row g-5 mb-5">
              
              {/* Column 1 */}
              <div className="col-lg-4 col-md-6">
                <Link to="/" aria-label="Levitate Home" className="d-block mb-4">
                  {!logoError ? (
                    <img
                      src={levitateLogo}
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

              {/* Column 2 */}
              <div className="col-lg-2 col-md-6 col-6">
                <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Company</h6>
                <ul className="list-unstyled d-flex flex-column gap-3 small">
                  <li><Link to="/about" className="text-white-50 text-decoration-none hover-purple transition-all">About Us</Link></li>
                  <li><a href="/#gallery" className="text-white-50 text-decoration-none hover-purple transition-all">Gallery</a></li>
                  <li><Link to="/register" className="text-white-50 text-decoration-none hover-purple transition-all">Careers / Volunteer</Link></li>
                  <li><Link to="/register?type=sponsor" className="text-white-50 text-decoration-none hover-purple transition-all">Sponsorship</Link></li>
                </ul>
              </div>

              {/* Column 3 */}
              <div className="col-lg-2 col-md-6 col-6">
                <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Events</h6>
                <ul className="list-unstyled d-flex flex-column gap-3 small">
                  <li><a href="/#events" className="text-white-50 text-decoration-none hover-purple transition-all">Upcoming Lineup</a></li>
                  <li><Link to="/past-events" className="text-white-50 text-decoration-none hover-purple transition-all">Past Archive</Link></li>
                </ul>
              </div>

              {/* Column 4 */}
              <div className="col-lg-4 col-md-12">
                <h6 className="fw-bold text-white mb-4 text-uppercase letter-spacing-1 small opacity-75">Flagship Event</h6>
                <div className="glass p-3 rounded-3 border border-warning border-opacity-10 mb-4 position-relative overflow-hidden group">
                   <div className="position-absolute top-0 end-0 p-2 opacity-10 text-warning"><i className="bi bi-star-fill"></i></div>
                   <h6 className="text-white fw-bold mb-1">Maha Onam 2026</h6>
                   <p className="text-white-50 small mb-2" style={{fontSize: '0.85rem'}}>The largest Kerala cultural festival in North America.</p>
                   <a href="http://mahaonam.ca" className="text-warning small fw-bold text-decoration-none d-inline-flex align-items-center gap-1 hover-lift">
                     Explore Festival <i className="bi bi-arrow-right"></i>
                   </a>
                </div>
                <div className="d-flex gap-2">
                  <a href="https://www.instagram.com/levitate.entertainment/" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}><i className="bi bi-instagram"></i></a>
                  <a href="https://www.youtube.com/@LevitateEntertainmentInc" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}><i className="bi bi-youtube"></i></a>
                  <a href="https://www.facebook.com/levitateentertainmentinc" className="glass p-2 rounded-circle text-white hover-lift d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}><i className="bi bi-facebook"></i></a>
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

      </main>
    </div>
  );
};

export default AboutUs;