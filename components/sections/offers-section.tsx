import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { offers } from "@/lib/offers-data";

export function OffersSection() {
  return (
    <section
      id="angebote"
      aria-labelledby="offers-heading"
      className="section-padding bg-sand-50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="offers-heading"
            className="font-display text-3xl font-bold text-aqua-900 sm:text-4xl"
          >
            Unsere Angebote
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Emotionale Unterwasserbilder für jeden Anlass – individuell,
            professionell und familienfreundlich in Barntrup und Umgebung.
          </p>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <Card key={offer.id} className="group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={offer.image}
                  alt={offer.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/40 to-transparent" />
              </div>
              <CardHeader>
                <CardTitle>{offer.title}</CardTitle>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm font-medium text-aqua-700">{offer.priceHint}</p>
                <Button asChild className="w-full">
                  <Link href={offer.cta.href}>
                    {offer.cta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
