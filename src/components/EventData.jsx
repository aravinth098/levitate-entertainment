import React from 'react';

// --- 1. AUTO-IMPORT IMAGES ---
// Fix: Use '../' because the 'romacham' folder is outside of 'components'
const romachamGlob = import.meta.glob('../romacham/*.{jpg,JPG,jpeg,png}', { eager: true });

// Convert the import object into a clean array of image URLs
const romachamGallery = Object.values(romachamGlob).map((module) => module.default);

// Debugging: This will show up in your browser Console (F12)
console.log("Found images:", romachamGallery.length); 

// --- 2. YOUR DATA ---
export const EVENTS_DATA = [
  {
    id: 1,
    name: "Romancham",
    location: "Toronto",
    date: "April 26",
    year: "2023",
    desc: "First-ever Mallu DJ Night. A night of electrifying beats.",
    
    // Use the first image from the folder as the cover, or a fallback
    image: romachamGallery[0] || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800&auto=format&fit=crop",
    
    youtubeId: "l8quhsX5VpU", 
    
    // Pass the auto-imported images here
    gallery: romachamGallery
  },
  {
    id: 2,
    name: "Romancham 2",
    location: "Waterloo",
    date: "April 30",
    year: "2023",
    desc: "The sequel to the biggest Mallu DJ Night in Waterloo.",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop",
    youtubeId: "LXb3EKWsInQ",
    gallery: [
      "https://images.unsplash.com/photo-1514525253440-b39345208668?w=500&auto=format&fit=crop",
      // ... more images
    ]
  },
  {
    id: 3,
    name: "Rock 'N Kuthu",
    location: "Toronto",
    date: "May 19",
    year: "2023",
    desc: "South Indian DJ Night featuring the best tracks.",
    image: "https://images.unsplash.com/photo-1514525253440-b39345208668?q=80&w=800&auto=format&fit=crop",
    youtubeId: "",
    gallery: []
  },
  {
    id: 4,
    name: "Maha Onam",
    location: "Toronto",
    date: "Sept 7",
    year: "2024",
    desc: "Biggest Onam celebration in North America.",
    image: "https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?q=80&w=800&auto=format&fit=crop",
    youtubeId: "",
    gallery: []
  },
  {
    id: 5,
    name: "Neon Glow Party",
    location: "Niagara",
    date: "June 18",
    year: "2023",
    desc: "A glowing night of music and lights at Niagara.",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=800&auto=format&fit=crop",
    youtubeId: "",
    gallery: []
  },
  {
    id: 6,
    name: "Kattanum Paatum",
    location: "London",
    date: "Dec 19",
    year: "2025",
    desc: "Canada's first-ever Mallu jamming night. Pure acoustic vibes.",
    image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop",
    youtubeId: "",
    gallery: []
  }
];