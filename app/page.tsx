import { HeroSection } from "@/components/sections/hero-section";
import { OffersSection } from "@/components/sections/offers-section";
import { GallerySection } from "@/components/sections/gallery-section";
import { BookingSection } from "@/components/sections/booking-section";
import { ReviewsSection } from "@/components/sections/reviews-section";
import { TeamSection } from "@/components/sections/team-section";
import { JsonLd } from "@/components/json-ld";
import { getHomepageSchemas } from "@/lib/schema";

export default function HomePage() {
  return (
    <>
      <JsonLd data={getHomepageSchemas()} />
      <HeroSection />
      <OffersSection />
      <GallerySection />
      <BookingSection />
      <ReviewsSection />
      <TeamSection />
    </>
  );
}
