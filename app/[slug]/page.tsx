import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ServicePageTemplate,
  createServicePage,
} from "@/components/sections/service-page-template";
import { createPageMetadata } from "@/lib/seo";

const slugs = ["unterwasser", "kita", "baby", "familie", "aktionen"] as const;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = createServicePage(slug);
  if (!service) return {};

  return createPageMetadata({
    title: `${service.title} – AquaFotos Barntrup`,
    description: service.subline,
    path: `/${slug}`,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = createServicePage(slug);
  if (!service) notFound();

  return <ServicePageTemplate service={service} />;
}
