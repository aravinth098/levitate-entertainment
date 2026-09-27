import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Determine Form Type
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'artist'; 

  // 2. YOUR WEB APP URL (Google Script)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzn1ZsW6WTLAyTXnr2pitnxcvB7yyrNTQMywdFVypiQl0HkhhPPNajoK4na7lLooIEW/exec";

  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState({ loading: false, success: false, error: false });

  // --- FIX: INSTANT SCROLL TO TOP (Like turning a page) ---
  useLayoutEffect(() => {
    // 1. Disable browser's default scroll restoration
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    
    // 2. Instantly jump to top (0,0)
    window.scrollTo(0, 0);
    
    // 3. Ensure body isn't locked from previous modals
    document.body.style.overflow = 'auto'; 

  }, [location.pathname]); // Runs every time the URL path changes

  // Clear form when switching types
  useEffect(() => {
    setFormData({});
    setStatus({ loading: false, success: false, error: false });
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: false });
    
    const form = new FormData();
    form.append('timestamp', new Date().toISOString());
    form.append('formType', type); 
    
    Object.keys(formData).forEach(key => {
        form.append(key, formData[key]);
    });

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: form,
            mode: 'no-cors' 
        });

        setStatus({ loading: false, success: true, error: false });
        setFormData({});
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Submission Error:", error);
        setStatus({ loading: false, success: false, error: true });
    }
  };

  // --- Dynamic Content Headers ---
  const pageContent = {
    artist: { 
        title: "Artist Registration", 
        subtitle: "Take the Stage", 
        icon: "bi-mic-fill", 
        desc: "Showcase your talent at Canada's largest Onam celebration." 
    },
    volunteer: { 
        title: "Join the Team", 
        subtitle: "Make an Impact", 
        icon: "bi-heart-fill", 
        desc: "Looking to gain experience, explore your talents, and meet amazing people? This is your sign to be part of something meaningful. ❤️" 
    },
    sponsor: { 
        title: "Sponsorship Inquiry", 
        subtitle: "Partner With Us", 
        icon: "bi-briefcase-fill", 
        desc: "Connect your brand with a vibrant, growing community." 
    }
  };
  
  const content = pageContent[type] || pageContent.artist;

  return (
    <div className="register-page-wrapper">
        <div className="container">
            
            {/* --- NAVIGATION --- */}
            <div className="d-flex justify-content-end mb-4 fade-up">
                <Link to="/" className="btn reg-nav-btn rounded-pill px-4 py-2 fw-bold text-decoration-none">
                    <i className="bi bi-house-door-fill me-2"></i> Return Home
                </Link>
            </div>

            {/* --- HEADER --- */}
            <div className="text-center mb-5 fade-up mx-auto" style={{maxWidth: '800px'}}>
                <div className="d-inline-flex align-items-center justify-content-center p-3 rounded-circle mb-3 border border-secondary" style={{background: 'rgba(0,0,0,0.5)'}}>
                    <i className={`bi ${content.icon} fs-2 text-warning`}></i>
                </div>
                <h1 className="display-4 fw-black text-white mb-2">{content.title}</h1>
                <p className="text-warning text-uppercase fw-bold letter-spacing-2 small mb-3">{content.subtitle}</p>
                <p className="text-white-50 fs-5">{content.desc}</p>
            </div>

            {/* --- FORM CARD --- */}
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="reg-glass-card p-4 p-md-5">
                        
                        {status.success ? (
                            <div className="text-center py-5">
                                <div className="mb-4">
                                    <i className="bi bi-check-circle-fill text-success display-1"></i>
                                </div>
                                <h2 className="text-white fw-bold mb-3">Application Received!</h2>
                                <p className="text-white-50 mb-4 px-5">Your details have been securely saved. Our team will review your application and contact you shortly.</p>
                                <div className="d-flex justify-content-center gap-3">
                                    <button onClick={() => setStatus({...status, success: false})} className="btn btn-outline-light px-4">Submit Another</button>
                                    <Link to="/" className="btn btn-warning fw-bold px-4">Back to Home</Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                
                                {/* ================= ARTIST FORM ================= */}
                                {type === 'artist' && (
                                    <>
                                        <div className="reg-section-header"><i className="bi bi-person-circle"></i> Personal Details</div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="reg-label">Full Name / Team Name *</label>
                                                <input required type="text" name="name" className="reg-input" placeholder="e.g. Adithya Kiran" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Email Address *</label>
                                                <input required type="email" name="email" className="reg-input" placeholder="e.g. email@example.com" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Phone Number *</label>
                                                <input required type="tel" name="phone" className="reg-input" placeholder="e.g. +1 555 123 4567" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">City / Location *</label>
                                                <input required type="text" name="address" className="reg-input" placeholder="e.g. Toronto, ON" onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="reg-section-header"><i className="bi bi-music-note-list"></i> Performance Info</div>
                                        <div className="mb-3">
                                            <label className="reg-label">Art Form *</label>
                                            <select required name="category" className="reg-select" onChange={handleChange}>
                                                <option value="">— Select Category —</option>
                                                <option value="Dance">Dance</option>
                                                <option value="Music">Music</option>
                                                <option value="Skit">Skit / Drama</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-6">
                                                <label className="reg-label">Group Size *</label>
                                                <input required type="number" name="groupSize" className="reg-input" placeholder="e.g. 6" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Duration (Mins) *</label>
                                                <input required type="text" name="duration" className="reg-input" placeholder="e.g. 5-7 mins" onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="reg-label">Demo Link (YouTube/Drive)</label>
                                            <input type="url" name="demoLink" className="reg-input" placeholder="https://..." onChange={handleChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="reg-label">Short Bio / Description</label>
                                            <textarea name="bio" rows="3" className="reg-textarea" placeholder="Tell us about your performance..." onChange={handleChange}></textarea>
                                        </div>
                                    </>
                                )}

                                {/* ================= VOLUNTEER FORM (UPDATED) ================= */}
                                {type === 'volunteer' && (
                                    <>
                                        {/* Benefits Section */}
                                        <div className="mb-5 p-4 rounded-4" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>
                                            <h5 className="text-warning fw-bold mb-3"><i className="bi bi-stars me-2"></i>Why Join Levitate?</h5>
                                            <ul className="list-unstyled text-white-50 mb-0 small" style={{lineHeight: '1.8'}}>
                                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Build Your Network:</strong> Connect with creatives, artists, and industry pros.</li>
                                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Real-World Experience:</strong> Learn how large-scale events are executed.</li>
                                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Skill Development:</strong> Strengthen leadership and technical abilities.</li>
                                                <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Reference Letter:</strong> Earn a personalized letter upon completion.</li>
                                                <li><i className="bi bi-check-circle-fill text-success me-2"></i><strong>Community Impact:</strong> Bring unforgettable experiences to life.</li>
                                            </ul>
                                        </div>

                                        <div className="reg-section-header"><i className="bi bi-person-vcard"></i> Your Details</div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="reg-label">Full Name *</label>
                                                <input required type="text" name="name" className="reg-input" placeholder="Enter your full name" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Email Address *</label>
                                                <input required type="email" name="email" className="reg-input" placeholder="Enter your email" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Phone Number *</label>
                                                <input required type="tel" name="phone" className="reg-input" placeholder="Enter your phone number" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">City / Location *</label>
                                                <input required type="text" name="address" className="reg-input" placeholder="Which city are you in?" onChange={handleChange} />
                                            </div>
                                        </div>

                                        <div className="reg-section-header"><i className="bi bi-briefcase"></i> Role Preferences</div>
                                        
                                        <div className="mb-4">
                                            <label className="reg-label">Which position interests you most? *</label>
                                            <select required name="interest" className="reg-select" onChange={handleChange}>
                                                <option value="">— Select a Position —</option>
                                                <optgroup label="Creative & Content">
                                                    <option value="Content Creator">Content Creator</option>
                                                    <option value="Graphic Designer">Graphic Designer</option>
                                                    <option value="Social Media">Social Media & Content</option>
                                                    <option value="Branding Strategy">Branding & Creative Strategy</option>
                                                    <option value="Videography">Videography & Visual Storytelling</option>
                                                </optgroup>
                                                <optgroup label="Event Operations">
                                                    <option value="Event Coordination">Event Coordination</option>
                                                    <option value="Guest Experience">Guest Experience</option>
                                                    <option value="Backstage Crew">Backstage Crew</option>
                                                    <option value="Project Coordinator">Project Coordinator</option>
                                                </optgroup>
                                                <optgroup label="Community & Outreach">
                                                    <option value="Community Engagement">Community Engagement</option>
                                                    <option value="Outreach Networking">Outreach & Networking</option>
                                                    <option value="Sales Partnerships">Sales & Partnerships</option>
                                                    <option value="Research Data">Research & Data Support</option>
                                                </optgroup>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="reg-label">Role Preference (Paid/Unpaid) *</label>
                                            <div className="d-flex flex-column gap-2 mt-2">
                                                <label className="d-flex align-items-center gap-2 text-white-50 cursor-pointer">
                                                    <input type="radio" name="roleType" value="Unpaid" required onChange={handleChange} className="form-check-input bg-dark border-secondary" />
                                                    I am open to an unpaid role.
                                                </label>
                                                <label className="d-flex align-items-center gap-2 text-white-50 cursor-pointer">
                                                    <input type="radio" name="roleType" value="Paid" required onChange={handleChange} className="form-check-input bg-dark border-secondary" />
                                                    I am only looking for a paid role.
                                                </label>
                                                <label className="d-flex align-items-center gap-2 text-white-50 cursor-pointer">
                                                    <input type="radio" name="roleType" value="Both" required onChange={handleChange} className="form-check-input bg-dark border-secondary" />
                                                    I am open to both, depending on the opportunity.
                                                </label>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="reg-label">Why are you a great fit? (Optional)</label>
                                            <textarea name="reason" rows="3" className="reg-textarea" placeholder="Tell us about your skills, passion, or past experience..." onChange={handleChange}></textarea>
                                        </div>
                                    </>
                                )}

                                {/* ================= SPONSOR FORM ================= */}
                                {type === 'sponsor' && (
                                    <>
                                        <div className="reg-section-header"><i className="bi bi-building-check"></i> Company Information</div>
                                        <div className="row g-3 mb-4">
                                            <div className="col-md-6">
                                                <label className="reg-label">Company / Brand Name *</label>
                                                <input required type="text" name="companyName" className="reg-input" placeholder="e.g. Tech Solutions Inc." onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Contact Person Name *</label>
                                                <input required type="text" name="contactName" className="reg-input" placeholder="e.g. David Miller" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Official Email *</label>
                                                <input required type="email" name="email" className="reg-input" placeholder="e.g. contact@company.com" onChange={handleChange} />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="reg-label">Phone Number *</label>
                                                <input required type="tel" name="phone" className="reg-input" placeholder="e.g. +1 555 000 1111" onChange={handleChange} />
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="reg-label">Message / Sponsorship Goals</label>
                                            <textarea name="message" rows="4" className="reg-textarea" placeholder="We are interested in a Gold Sponsorship..." onChange={handleChange}></textarea>
                                        </div>
                                    </>
                                )}

                                <button type="submit" className="reg-btn-submit" disabled={status.loading}>
                                    {status.loading ? (
                                        <span><span className="spinner-border spinner-border-sm me-2"></span> Sending...</span>
                                    ) : (
                                        <span>SUBMIT APPLICATION <i className="bi bi-arrow-right-short fs-5 align-middle"></i></span>
                                    )}
                                </button>

                                {status.error && (
                                    <div className="alert alert-danger mt-4 text-center border-0 bg-danger bg-opacity-25 text-white">
                                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                                        Submission failed. Please check your internet connection.
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RegisterPage;