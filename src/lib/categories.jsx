import electricianImage from "../assets/category-electrician.jpg";
import mechanicImage from "../assets/category-mechanic.jpg";
import painterImage from "../assets/category-painter.jpg";
import plumberImage from "../assets/category-plumber.jpg";
export const categories = [
  {
    name: "Elektricist",
    image: electricianImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M13 2L4 14h7l-1 8 10-13h-7l0-7z" />
      </svg>
    ),
    text: "Instalime, defekte, ndriçim",
  },
  {
    name: "Hidraulik",
    image: plumberImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M7 3h10v4H7V3zm2 6h6v3l4 4v3a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-3l4-4V9z" />
      </svg>
    ),
    text: "Ujë, ngrohje, banjo",
  },
  {
    name: "Mekanik",
    image: mechanicImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M22 19.6l-6.3-6.3a6.5 6.5 0 0 1-8.5-8.5l4.1 4.1 2.8-2.8L10 2a6.5 6.5 0 0 1 8.5 8.5l6.3 6.3-2.8 2.8z" />
      </svg>
    ),
    text: "Makina, servis, riparime",
  },
  {
    name: "Bojaxhi",
    image: painterImage,
    icon: (
      <svg viewBox="0 0 24 24" className="category-icon">
        <path d="M4 3h12a3 3 0 0 1 3 3v2H7v3H4V3zm3 10h12v4a4 4 0 0 1-8 0v-1H7v-3z" />
      </svg>
    ),
    text: "Lyerje, renovim, mure",
  },
];

