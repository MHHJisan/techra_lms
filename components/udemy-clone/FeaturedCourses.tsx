import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/fomat";
import { headers } from "next/headers";

interface FeaturedCoursesProps {
  categoryId?: string;
  q?: string;
  seed?: string; // optional external seed (e.g., from IP + query)
}

// Simple deterministic PRNG (Mulberry32) + string hash (xmur3)
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  const seedFn = xmur3(seedStr);
  const rand = mulberry32(seedFn());
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FeaturedCourses = async ({ categoryId, q, seed }: FeaturedCoursesProps) => {
  // Build filters
  const where: any = { isPublished: true };
  if (categoryId) where.categoryId = categoryId;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
    ];
  }

  // Pull a pool of courses and then deterministically shuffle to pick 3
  const pool = await db.course.findMany({
    where,
    select: { id: true, title: true, imageUrl: true, price: true },
    take: 30,
  });

  const hdrs = headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  const seedStr = seed || `${ip}|${categoryId || "*"}|${q || "*"}`;
  const shuffled = seededShuffle(pool, seedStr);
  const top3 = shuffled.slice(0, 3).map((c) => ({
    id: c.id,
    title: c.title,
    imageUrl: c.imageUrl ?? "/img/course1.jpg",
    priceNumber: c.price ? Number(c.price) : 0,
  }));

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-center text-3xl font-bold mb-8">Featured Courses</h2>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
        {top3.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition"
          >
            <Link href={`/courses/${course.id}`}>
              <Image
                src={course.imageUrl}
                alt={course.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <h3 className="text-lg font-bold line-clamp-2 min-h-[3rem]">{course.title}</h3>
              <p className="text-gray-600 mt-1">
                {course.priceNumber > 0 ? formatPrice(course.priceNumber) : "Free"}
              </p>
              <Link
                href={`/courses/${course.id}`}
                className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
              >
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCourses;
