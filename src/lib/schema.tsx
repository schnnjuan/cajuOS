type BreadcrumbItem = {
  name: string;
  href: string;
};

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CajuOS",
    url: "https://cajuos.dev",
    description:
      "Ferramentas úteis que rodam no navegador.",
    inLanguage: "pt-BR",
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `https://cajuos.dev${item.href}`,
    })),
  };
}

export function articleSchema({
  headline,
  description,
  datePublished,
  image,
}: {
  headline: string;
  description: string;
  datePublished?: string | null;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    ...(datePublished && { datePublished }),
    ...(image && { image }),
    author: {
      "@type": "Person",
      name: "schnnjuan",
    },
    publisher: {
      "@type": "Organization",
      name: "CajuOS",
    },
  };
}

export function softwareAppSchema({
  name,
  description,
  slug,
}: {
  name: string;
  description: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url: `https://cajuos.dev/tools/${slug}`,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BRL",
    },
  };
}

export function jsonLd(data: Record<string, unknown>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
