import type { GalleryCategory } from "./site-config";

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  aspect: "portrait" | "landscape" | "square";
};

export const galleryItems: GalleryItem[] = [
  {
    id: "uw-01",
    src: "/images/gallery/unterwasser-01.webp",
    alt: "Unterwasserfoto Kind – professionelles Unterwasserfotoshooting AquaFotos Barntrup",
    category: "unterwasser",
    aspect: "portrait",
  },
  {
    id: "uw-02",
    src: "/images/gallery/unterwasser-02.webp",
    alt: "Emotionales Unterwasserporträt – AquaFotos Lippe",
    category: "unterwasser",
    aspect: "landscape",
  },
  {
    id: "ki-01",
    src: "/images/gallery/kinder-01.webp",
    alt: "Unterwasserfotos Kinder – fröhliches Shooting bei AquaFotos",
    category: "kinder",
    aspect: "square",
  },
  {
    id: "ki-02",
    src: "/images/gallery/kinder-02.webp",
    alt: "Kinder Unterwasser Fotoshooting Barntrup – AquaFotos",
    category: "kinder",
    aspect: "portrait",
  },
  {
    id: "fa-01",
    src: "/images/gallery/familien-01.webp",
    alt: "Unterwasser Fotos Familie – gemeinsame Erinnerungen AquaFotos",
    category: "familien",
    aspect: "landscape",
  },
  {
    id: "fa-02",
    src: "/images/gallery/familien-02.webp",
    alt: "Familien Unterwasserfotografie OWL – AquaFotos Barntrup",
    category: "familien",
    aspect: "portrait",
  },
  {
    id: "ev-01",
    src: "/images/gallery/events-01.webp",
    alt: "Event Unterwasserfotografie – Veranstaltung AquaFotos Lippe",
    category: "events",
    aspect: "square",
  },
  {
    id: "ev-02",
    src: "/images/gallery/events-02.webp",
    alt: "Veranstaltungsfotos Unterwasser – AquaFotos Barntrup",
    category: "events",
    aspect: "landscape",
  },
  {
    id: "wm-01",
    src: "/images/gallery/weihnachtsminis-01.webp",
    alt: "WeihnachtsMinis Barntrup – festliches Unterwasserfoto AquaFotos",
    category: "weihnachtsminis",
    aspect: "portrait",
  },
  {
    id: "wm-02",
    src: "/images/gallery/weihnachtsminis-02.webp",
    alt: "WeihnachtsMinis Unterwasserfotografie – AquaFotos OWL",
    category: "weihnachtsminis",
    aspect: "landscape",
  },
  {
    id: "uw-03",
    src: "/images/gallery/unterwasser-03.webp",
    alt: "Professionelle Unterwasserbilder – AquaFotos Fotostudio Lippe",
    category: "unterwasser",
    aspect: "square",
  },
  {
    id: "ki-03",
    src: "/images/gallery/kinder-03.webp",
    alt: "Unterwasserfotos Kinder Barntrup – natürliche Portraits AquaFotos",
    category: "kinder",
    aspect: "landscape",
  },
];
