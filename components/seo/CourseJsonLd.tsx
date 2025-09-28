import React from "react";

interface CourseJsonLdProps {
  url: string;
  courseId: string;
  courseTitle: string;
  courseDescription?: string | null;
  priceBDT?: number | null;
  providerName?: string;
  providerUrl?: string;
  breadcrumbs?: Array<{ name: string; item: string }>;
}

/**
 * Renders Course JSON-LD and optional BreadcrumbList JSON-LD
 */
export default function CourseJsonLd({
  url,
  courseId,
  courseTitle,
  courseDescription,
  priceBDT,
  providerName = "TECHRA LMS",
  providerUrl,
  breadcrumbs = [],
}: CourseJsonLdProps) {
  const courseData: any = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: courseTitle,
    description: courseDescription || undefined,
    url,
    courseCode: courseId,
    provider: {
      "@type": "Organization",
      name: providerName,
      url: providerUrl,
    },
  };

  if (priceBDT != null) {
    courseData.offers = {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: Number(priceBDT).toFixed(2),
      url,
      availability: "https://schema.org/InStock",
    };
  }

  const breadcrumbData = breadcrumbs.length
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.item,
        })),
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseData) }}
      />
      {breadcrumbData ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      ) : null}
    </>
  );
}
