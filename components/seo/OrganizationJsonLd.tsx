import React from "react";

interface OrganizationJsonLdProps {
  siteUrl: string;
  name?: string;
  logoUrl?: string;
  sameAs?: string[];
}

/**
 * Renders Organization schema JSON-LD for better brand/entity recognition.
 * Place once at the root layout.
 */
export default function OrganizationJsonLd({
  siteUrl,
  name = "TECHRA LMS",
  logoUrl = "/logo.png",
  sameAs = [],
}: OrganizationJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: siteUrl,
    logo: new URL(logoUrl, siteUrl).toString(),
    sameAs,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
