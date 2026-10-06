import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:5000/api/events'; 

const Admin = () => {
  // --- AUTH STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // --- DATA STATE ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- FORM STATE ---
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    category: '',
    img: '',          // Poster Image
    bannerImg: '',    // New Banner Image
    description: '',
    isLocked: false,
    eventType: 'paid',
    ticketUrl: '',    
    mapUrl: ''        
  });

  // Fetch events from DB
  const fetchEvents = async () => {
    try {
      const res = await axios.get(API_URL);
      const mappedEvents = res.data.map(e => ({
        ...e,
        img: e.img_url,
        // Map backend banner_url to frontend state if needed for editing later
        bannerImg: e.banner_url || '', 
        isLocked: e.is_locked === 1 || e.is_locked === true,
        eventType: e.event_type || 'paid',
        ticketUrl: e.ticket_url || '',
        mapUrl: e.map_url || ''
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.error("Error fetching events", err);
    }
  };

  // Trigger fetch on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // --- HANDLE LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'leviadmin@123') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Incorrect Password');
      setIsAuthenticated(false);
    }
  };

  const getAuthHeaders = () => ({
    headers: { 'x-admin-password': passwordInput }
  });

  // --- HANDLE POSTER UPLOAD ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLE BANNER UPLOAD (NEW) ---
  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, bannerImg: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- HANDLE ADD EVENT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) return;
    
    // Validation
    if (newEvent.eventType === 'free' && !newEvent.ticketUrl) {
        alert("Please provide a Ticket URL for free events.");
        return;
    }

    setLoading(true);
    const finalImg = newEvent.img || "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=800&auto=format&fit=crop";

    // Prepare payload for DB
    const payload = {
        title: newEvent.title,
        date: newEvent.date,
        category: newEvent.category,
        img_url: finalImg,
        banner_url: newEvent.bannerImg, // Send banner to backend
        description: newEvent.description,
        is_locked: newEvent.isLocked,
        event_type: newEvent.eventType,
        ticket_url: newEvent.ticketUrl,
        map_url: newEvent.mapUrl
    };

    try {
        await axios.post(API_URL, payload, getAuthHeaders());
        
        // Reset Form
        setNewEvent({ 
            title: '', date: '', category: '', img: '', bannerImg: '', description: '', isLocked: false,
            eventType: 'paid', ticketUrl: '', mapUrl: ''
        });
        
        // Clear file inputs
        const fileInput = document.getElementById('fileInput');
        const bannerInput = document.getElementById('bannerInput');
        if(fileInput) fileInput.value = ""; 
        if(bannerInput) bannerInput.value = ""; 
        
        fetchEvents();
        alert("Event Saved to Database!");
    } catch (err) {
        alert("Failed to save: " + (err.response?.data?.error || err.message));
        if(err.response?.status === 403) setIsAuthenticated(false);
    } finally {
        setLoading(false);
    }
  };

  // --- HANDLE DELETE ---
  const handleDelete = async (id) => {
      if(!window.confirm("Are you sure you want to delete this event?")) return;
      try {
          await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
          setEvents(events.filter(e => e.id !== id));
      } catch (err) {
          alert("Delete failed: " + (err.response?.data?.error || err.message));
      }
  };

  // --- HANDLE LOCK TOGGLE ---
  const handleToggleLock = async (id) => {
      try {
          await axios.put(`${API_URL}/${id}/lock`, {}, getAuthHeaders());
          setEvents(events.map(e => e.id === id ? { ...e, isLocked: !e.isLocked } : e));
      } catch (err) {
          alert("Update failed: " + (err.response?.data?.error || err.message));
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="glass p-5 rounded-4 text-center" style={{ maxWidth: '400px', width: '100%' }}>
          <h2 className="fw-black mb-4">Admin <span className="text-gradient">Access</span></h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              className="form-control bg-dark text-white border-secondary mb-3 text-center" 
              placeholder="Enter Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            {errorMsg && <p className="text-danger small fw-bold mb-3">{errorMsg}</p>}
            <button type="submit" className="btn btn-gradient w-100">Unlock Dashboard</button>
          </form>
          <div className="mt-4">
             <Link to="/" className="text-white-50 small text-decoration-none">← Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 mt-5 fade-up visible">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="fw-black">Admin <span className="text-gradient">Dashboard</span></h1>
        <div className="d-flex gap-3">
            <button onClick={() => setIsAuthenticated(false)} className="btn btn-sm btn-outline-danger">Logout</button>
            <Link to="/" className="btn btn-sm btn-outline-custom">Back to Home</Link>
        </div>
      </div>

      <div className="row g-5">
        <div className="col-lg-5">
          <div className="glass p-4 rounded-4">
            <h3 className="h5 fw-bold mb-4">Add New Event</h3>
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              
              {/* Event Type Selection */}
              <div className="row g-2">
                <div className="col-6">
                    <label className="text-white-50 small mb-1 ms-1">Event Type</label>
                    <select 
                        className="form-select bg-dark text-white border-secondary"
                        value={newEvent.eventType}
                        onChange={e => setNewEvent({...newEvent, eventType: e.target.value})}
                    >
                        <option value="paid">Paid Event</option>
                        <option value="free">Free Event</option>
                    </select>
                </div>
                <div className="col-6">
                    <label className="text-white-50 small mb-1 ms-1">Date</label>
                    <input 
                        type="text" 
                        className="form-control bg-dark text-white border-secondary" 
                        placeholder="OCT 2026"
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        required
                    />
                </div>
              </div>

              {/* Conditional Ticket URL */}
              {newEvent.eventType === 'free' && (
                  <div className="animate__animated animate__fadeIn">
                    <label className="text-warning small mb-1 ms-1 fw-bold">Ticket Link (External URL)</label>
                    <input 
                        type="url" 
                        className="form-control bg-dark text-white border-warning" 
                        placeholder="https://eventbrite.com/..."
                        value={newEvent.ticketUrl}
                        onChange={e => setNewEvent({...newEvent, ticketUrl: e.target.value})}
                        required
                    />
                  </div>
              )}

              <div>
                <label className="text-white-50 small mb-1 ms-1">Event Title</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="e.g. Neon Nights"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-white-50 small mb-1 ms-1">Category / Location</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="e.g. Music • Canada"
                  value={newEvent.category}
                  onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                />
              </div>

              <div>
                <label className="text-white-50 small mb-1 ms-1">Google Maps Embed URL</label>
                <input 
                  type="text" 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="Paste 'src' from Google Maps Embed"
                  value={newEvent.mapUrl}
                  onChange={e => setNewEvent({...newEvent, mapUrl: e.target.value})}
                />
                <div className="form-text text-white-50" style={{fontSize: '0.7rem'}}>
                    Go to Google Maps → Share → Embed a map → Copy the link inside src="..."
                </div>
              </div>

              {/* POSTER IMAGE UPLOAD */}
              <div>
                <label className="text-white-50 small mb-1 ms-1">Event Poster (Vertical)</label>
                <input 
                  id="fileInput"
                  type="file" 
                  accept="image/*"
                  className="form-control bg-dark text-white border-secondary" 
                  onChange={handleImageUpload}
                />
                {newEvent.img && (
                  <div className="mt-2 text-center p-2 border border-secondary rounded bg-black bg-opacity-25">
                    <p className="small text-white-50 mb-1">Poster Preview:</p>
                    <img src={newEvent.img} alt="Preview" style={{ maxHeight: '100px', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              {/* BANNER IMAGE UPLOAD */}
              <div>
                <div className="d-flex justify-content-between align-items-center">
                    <label className="text-white-50 small mb-1 ms-1">Event Banner (Landscape)</label>
                    <span className="badge bg-secondary text-white small" style={{fontSize:'0.65rem'}}>Rec: 1920x600 px</span>
                </div>
                <input 
                  id="bannerInput"
                  type="file" 
                  accept="image/*"
                  className="form-control bg-dark text-white border-secondary" 
                  onChange={handleBannerUpload}
                />
                {newEvent.bannerImg && (
                  <div className="mt-2 text-center p-2 border border-secondary rounded bg-black bg-opacity-25">
                    <p className="small text-white-50 mb-1">Banner Preview:</p>
                    <img src={newEvent.bannerImg} alt="Banner Preview" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-white-50 small mb-1 ms-1">Description</label>
                <textarea 
                  className="form-control bg-dark text-white border-secondary" 
                  placeholder="Event details... (Line breaks will be saved)"
                  rows="6"
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>

              <div className="form-check form-switch p-3 glass rounded-3 border border-secondary">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="lockedSwitch"
                  checked={newEvent.isLocked}
                  onChange={e => setNewEvent({...newEvent, isLocked: e.target.checked})}
                />
                <label className="form-check-label text-white ms-2" htmlFor="lockedSwitch">
                  Mark as "Mystery Event" (Locked)
                </label>
              </div>

              <button type="submit" className="btn btn-gradient w-100 mt-2" disabled={loading}>
                {loading ? "Saving..." : "Add Event"}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass p-4 rounded-4">
            <h3 className="h5 fw-bold mb-4">Manage Events ({events.length})</h3>
            
            {events.length === 0 ? (
                <p className="text-white-50">No events found in database.</p>
            ) : (
                <div className="d-flex flex-column gap-3" style={{maxHeight: '600px', overflowY: 'auto'}}>
                {events.map(event => (
                    <div key={event.id} className="d-flex align-items-center justify-content-between p-3 border border-secondary rounded-3 bg-black bg-opacity-25">
                        <div className="d-flex align-items-center gap-3">
                            <img 
                                src={event.img || "https://images.unsplash.com/photo-1514525253440-b393452e8d26"} 
                                alt="thumb" 
                                style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', filter: event.isLocked ? 'grayscale(100%)' : 'none'}}
                            />
                            <div style={{maxWidth: '200px'}}>
                                <div className="fw-bold text-truncate text-white">
                                  {event.title} 
                                </div>
                                <div className="small text-white-50">
                                    <span className={`badge ${event.eventType === 'free' ? 'bg-success' : 'bg-primary'} me-2`}>
                                        {event.eventType === 'free' ? 'FREE' : 'PAID'}
                                    </span>
                                    {event.date}
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-2">
                           <button 
                             onClick={() => handleToggleLock(event.id)}
                             className={`btn btn-sm ${event.isLocked ? 'btn-outline-warning' : 'btn-outline-light'}`}
                           >
                             {event.isLocked ? <i className="bi bi-unlock-fill"></i> : <i className="bi bi-lock-fill"></i>}
                           </button>

                           <button 
                             onClick={() => handleDelete(event.id)} 
                             className="btn btn-danger btn-sm"
                           >
                             <i className="bi bi-trash"></i>
                           </button>
                        </div>
                    </div>
                ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;