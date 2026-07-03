import { Star, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { reviews } from "@/lib/reviews-data";

export function ReviewsSection() {
  return (
    <section
      id="rezensionen"
      aria-labelledby="reviews-heading"
      className="section-padding bg-sand-50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="reviews-heading"
            className="font-display text-3xl font-bold text-aqua-900 sm:text-4xl"
          >
            Das sagen unsere Kunden
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Vertrauen, den Eltern und Familien aus Barntrup und Umgebung in uns
            setzen.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="relative overflow-hidden border-aqua-100/50"
            >
              <div
                className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-aqua-100/40 blur-2xl"
                aria-hidden="true"
              />
              <CardContent className="relative p-6">
                <Quote
                  className="mb-3 h-8 w-8 text-aqua-300"
                  aria-hidden="true"
                />
                <blockquote className="text-sm leading-relaxed text-slate-700">
                  &bdquo;{review.quote}&ldquo;
                </blockquote>
                <div className="mt-4 flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-aqua-400 to-aqua-700 text-sm font-semibold text-white"
                    aria-hidden="true"
                  >
                    {review.initials}
                  </span>
                  <div
                    className="flex gap-0.5"
                    role="img"
                    aria-label={`${review.rating} von 5 Sternen`}
                  >
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
