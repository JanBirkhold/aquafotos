export type Review = {
  id: string;
  quote: string;
  initials: string;
  rating: number;
};

export const reviews: Review[] = [
  {
    id: "r1",
    quote: "Vielen herzlichen Dank.",
    initials: "S.M.",
    rating: 5,
  },
  {
    id: "r2",
    quote: "Die Fotos machen Spaß.",
    initials: "K.B.",
    rating: 5,
  },
  {
    id: "r3",
    quote: "Das Foto ist super geworden. Vielen, vielen Dank!",
    initials: "L.H.",
    rating: 5,
  },
  {
    id: "r4",
    quote:
      "Vielen herzlichen Dank für das schöne Foto! Ich wünsche Ihnen alles Gute und viel Erfolg bei Ihren weiteren Shootings.",
    initials: "M.W.",
    rating: 5,
  },
];
