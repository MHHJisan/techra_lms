import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const items: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/courses`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Fetch published courses and their first published chapter
  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: { id: true, updatedAt: true, createdAt: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  for (const c of courses) {
    const courseUrl = `${siteUrl}/courses/${c.id}`;
    const lastMod = c.updatedAt ?? c.createdAt ?? now;
    items.push({
      url: courseUrl,
      lastModified: lastMod,
      changeFrequency: "weekly",
      priority: 0.7,
    });

    const firstChapter = c.chapters[0];
    if (firstChapter) {
      items.push({
        url: `${courseUrl}/chapters/${firstChapter.id}`,
        lastModified: firstChapter.updatedAt ?? firstChapter.createdAt ?? lastMod,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return items;
}
