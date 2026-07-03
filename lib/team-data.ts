export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string[];
  image: string;
  imageAlt: string;
};

export const teamMembers: TeamMember[] = [
  {
    id: "kasimir",
    name: "Kasimir Eckhardt",
    role: "Geschäftsführer",
    bio: [
      "Als leidenschaftlicher Programmierer und Technologie-Enthusiast bin ich neben der Führung des Unternehmens für die Entwicklung unserer Website verantwortlich.",
      "In meiner Freizeit erkunde ich gerne die neuesten Entwicklungen in der Programmierwelt und bilde mich fort. So bemühe ich mich, dafür zu sorgen, dass diese Website stets auf dem neuesten Stand der Technik ist.",
    ],
    image: "/images/team/kasimir-eckhardt.webp",
    imageAlt: "Kasimir Eckhardt – Geschäftsführer von AquaFotos Barntrup",
  },
  {
    id: "annika",
    name: "Annika Eckhardt",
    role: "Fotografin",
    bio: [
      "Begonnen hat meine Reise in die Welt der Fotografie als Model, aber mich hat auch die Seite hinter der Kamera interessiert. Also bin ich tiefer eingetaucht und fotografiere nun bereits mein halbes Leben lang auf den verschiedensten Gebieten.",
      "Für euch tauche ich nun im wahrsten Sinne des Wortes mit meiner Kamera unter!",
    ],
    image: "/images/team/annika-eckhardt.webp",
    imageAlt: "Annika Eckhardt – Unterwasserfotografin bei AquaFotos Barntrup",
  },
];
