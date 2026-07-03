import Image from "next/image";
import Link from "next/link";
import { Camera, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { teamMembers } from "@/lib/team-data";
import { cn } from "@/lib/utils";

const roleIcons = {
  kasimir: Code2,
  annika: Camera,
} as const;

type TeamSectionProps = {
  showCta?: boolean;
};

export function TeamSection({ showCta = true }: TeamSectionProps) {
  return (
    <section
      id="ueber-uns"
      aria-labelledby="team-heading"
      className="section-padding bg-gradient-to-b from-sand-50 via-white to-aqua-50/40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-aqua-600">
            Über uns
          </p>
          <h2
            id="team-heading"
            className="mt-2 font-display text-3xl font-bold text-aqua-900 sm:text-4xl"
          >
            Das Team hinter AquaFotos
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            In Barntrup verbinden wir Leidenschaft für Fotografie und Technik –
            persönlich, familiär und mit Herz für besondere Unterwassermomente.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-10">
          {teamMembers.map((member, index) => {
            const Icon = roleIcons[member.id as keyof typeof roleIcons];

            return (
              <Card
                key={member.id}
                className={cn(
                  "overflow-hidden border-aqua-100/80",
                  index === 1 && "lg:mt-8",
                )}
              >
                <div className="grid sm:grid-cols-[11rem_1fr] lg:grid-cols-1 xl:grid-cols-[12rem_1fr]">
                  <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-full lg:aspect-[5/4] xl:aspect-auto xl:min-h-[18rem]">
                    <Image
                      src={member.image}
                      alt={member.imageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 11rem, 12rem"
                      className="object-cover object-top"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-aqua-950/25 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-aqua-950/10 lg:bg-gradient-to-t" />
                  </div>

                  <CardContent className="flex flex-col justify-center p-6 sm:p-7 lg:p-8">
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-aqua-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-aqua-700">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {member.role}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-aqua-900">
                      {member.name}
                    </h3>
                    <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                      {member.bio.map((paragraph) => (
                        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>

        {showCta && (
          <div className="mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/#termin">Termin bei Annika buchen</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
