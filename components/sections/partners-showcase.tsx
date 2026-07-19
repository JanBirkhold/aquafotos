import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { partnerTypeLabels, type PartnerPublic } from "@/lib/featured-partners";

type Props = {
  partners: PartnerPublic[];
  title?: string;
  subtitle?: string;
};

export function PartnersShowcase({
  partners,
  title = "Unsere Partner",
  subtitle = "Gemeinsam bieten wir Familien unvergessliche Fotomomente.",
}: Props) {
  if (partners.length === 0) return null;

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-aqua-900">{title}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">{subtitle}</p>
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <li key={p.id}>
              <Card className="h-full border-aqua-100">
                <CardContent className="flex h-full flex-col p-6">
                  {p.logoUrl ? (
                    <div className="flex h-20 items-center justify-center rounded-xl bg-slate-50 px-4">
                      <div className="relative h-14 w-full max-w-[200px]">
                        <Image
                          src={p.logoUrl}
                          alt={`${p.name} Logo`}
                          fill
                          className="object-contain"
                          sizes="200px"
                        />
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-4 text-xs font-medium uppercase tracking-wide text-aqua-600">
                    {partnerTypeLabels[p.type]}
                    {p.city ? ` · ${p.city}` : ""}
                  </p>
                  <h3 className="mt-1 font-semibold text-aqua-900">{p.name}</h3>
                  {p.description && (
                    <p className="mt-2 flex-1 text-sm text-slate-600">{p.description}</p>
                  )}
                  {p.websiteUrl && (
                    <Link
                      href={p.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-aqua-700 hover:underline"
                    >
                      Website
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  )}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
