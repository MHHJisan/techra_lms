/* eslint-disable no-console */
// scripts/migrate-data.ts
import { PrismaClient as PgClient, Prisma as PgPrisma } from "@prisma/client";
// IMPORTANT: point to the actual file inside the generated MySQL client directory
import { PrismaClient as MySqlClient } from "../prisma/mysql-client/index.js";

const pg = new PgClient();
const mysql = new MySqlClient();

const BATCH = 300;

function toDecimal2(v: number | null): PgPrisma.Decimal | null {
  if (v == null) return null;
  return new PgPrisma.Decimal(Number(v).toFixed(2));
}

async function inBatches<T>(
  items: T[],
  size: number,
  worker: (batch: T[], idx: number) => Promise<void>
) {
  for (let i = 0; i < items.length; i += size) {
    const slice = items.slice(i, i + size);
    await worker(slice, Math.floor(i / size) + 1);
  }
}

async function main() {
  console.log("Reading source (MySQL)...");
  const [
    users,
    categories,
    courses,
    chapters,
    muxData,
    attachments,
    purchases,
    progress,
    stripe,
  ] = await Promise.all([
    mysql.user.findMany(),
    mysql.category.findMany(),
    mysql.course.findMany(),
    mysql.chapter.findMany(),
    mysql.muxData.findMany(),
    mysql.attachment.findMany(),
    mysql.purchase.findMany(),
    mysql.userProgress.findMany(),
    mysql.stripeCustomer.findMany(),
  ]);

  console.table({
    users: users.length,
    categories: categories.length,
    courses: courses.length,
    chapters: chapters.length,
    muxData: muxData.length,
    attachments: attachments.length,
    purchases: purchases.length,
    progress: progress.length,
    stripe: stripe.length,
  });

  // ── Insert parents first ─────────────────────────────────────────
  console.log("Inserting Users (from MySQL, if any)...");
  await inBatches(users, 500, async (batch, idx) => {
    await pg.user.createMany({
      data: batch.map((u) => ({
        id: u.id,
        clerkId: u.clerkId,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  Users batch ${idx} OK`);
  });

  console.log("Inserting Categories...");
  await inBatches(categories, 500, async (batch, idx) => {
    await pg.category.createMany({
      data: batch.map((c) => ({ id: c.id, name: c.name })),
      skipDuplicates: true,
    });
    console.log(`  Categories batch ${idx} OK`);
  });

  // ── Backfill Users required by FKs (synthetic if not in MySQL) ──
  // Build the set of required userIds from referenced tables
  const requiredUserIds = new Set<string>();
  for (const c of courses) if (c.userId) requiredUserIds.add(c.userId);
  // If you later need purchases/progress to also seed users, uncomment:
  // for (const p of purchases) if (p.userId) requiredUserIds.add(p.userId);
  // for (const up of progress) if (up.userId) requiredUserIds.add(up.userId);

  // Users that already exist in Postgres
  const existingUsers = await pg.user.findMany({ select: { id: true } });
  const existingUserSet = new Set(existingUsers.map((u) => u.id));

  // Determine missing userIds
  const missingUserIds = Array.from(requiredUserIds).filter(
    (id) => !existingUserSet.has(id)
  );

  if (missingUserIds.length) {
    console.log(
      `Backfilling ${missingUserIds.length} missing User(s) referenced by foreign keys...`
    );

    // Try to fetch real user rows from MySQL for those IDs (often 0 if your MySQL users table was empty)
    const realUsers = await mysql.user.findMany({
      where: { id: { in: missingUserIds } },
    });
    const realUserIds = new Set(realUsers.map((u) => u.id));

    // 1) Insert any real users we found
    if (realUsers.length) {
      await inBatches(realUsers, 500, async (batch, idx) => {
        await pg.user.createMany({
          data: batch.map((u) => ({
            id: u.id,
            clerkId: u.clerkId,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            imageUrl: u.imageUrl,
            role: u.role ?? "user",
            createdAt: u.createdAt ?? new Date(),
            updatedAt: u.updatedAt ?? new Date(),
          })),
          skipDuplicates: true,
        });
        console.log(`  Backfill real Users batch ${idx} OK`);
      });
    }

    // 2) For the remaining missing IDs, create synthetic User rows
    const stillMissing = missingUserIds.filter((id) => !realUserIds.has(id));
    if (stillMissing.length) {
      console.log(
        `Creating ${stillMissing.length} synthetic User(s) for missing IDs...`
      );
      const syntheticUsers = stillMissing.map((id) => ({
        id,
        clerkId: id,
        email: `unknown+${id}@local.invalid`, // unique placeholder to satisfy NOT NULL + UNIQUE
        firstName: null as string | null,
        lastName: null as string | null,
        imageUrl: null as string | null,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await inBatches(syntheticUsers, 500, async (batch, idx) => {
        await pg.user.createMany({ data: batch, skipDuplicates: true });
        console.log(`  Synthetic Users batch ${idx} OK`);
      });
    }
  }

  // ── Courses (with guarded batch insert and per-row fallback) ─────
  console.log("Inserting Courses...");
  try {
    await inBatches(courses, BATCH, async (batch, idx) => {
      await pg.course.createMany({
        data: batch.map((c) => ({
          id: c.id,
          userId: c.userId,
          title: c.title,
          description: c.description,
          imageUrl: c.imageUrl,
          price: toDecimal2((c as any).price ?? null),
          isPublished: c.isPublished,
          categoryId: c.categoryId,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        })),
        skipDuplicates: true,
      });
      console.log(`  Courses batch ${idx} OK`);
    });
  } catch (e: any) {
    console.error(
      "Batch insert for Courses failed, falling back to per-row inserts."
    );
    console.error("Batch error:", e?.message || e);
    let failCount = 0;
    for (const c of courses) {
      try {
        await pg.course.create({
          data: {
            id: c.id,
            userId: c.userId,
            title: c.title,
            description: c.description,
            imageUrl: c.imageUrl,
            price: toDecimal2((c as any).price ?? null),
            isPublished: c.isPublished,
            categoryId: c.categoryId,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          },
        });
      } catch (err: any) {
        failCount++;
        console.error(`  ❌ Course ${c.id} failed: ${err?.message || err}`);
        if (failCount >= 10) {
          console.error("  Stopping after 10 failures for brevity.");
          break;
        }
      }
    }
  }

  // ── Chapters ─────────────────────────────────────────────────────
  console.log("Inserting Chapters...");
  await inBatches(chapters, 500, async (batch, idx) => {
    await pg.chapter.createMany({
      data: batch.map((ch) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        videoUrl: ch.videoUrl,
        position: ch.position,
        isPublished: ch.isPublished,
        isFree: ch.isFree,
        courseId: ch.courseId,
        createdAt: ch.createdAt,
        updatedAt: ch.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  Chapters batch ${idx} OK`);
  });

  // ── MuxData ──────────────────────────────────────────────────────
  console.log("Inserting MuxData...");
  await inBatches(muxData, 500, async (batch, idx) => {
    await pg.muxData.createMany({
      data: batch.map((m) => ({
        id: m.id,
        assetId: m.assetId,
        playbackId: m.playbackId,
        chapterId: m.chapterId,
      })),
      skipDuplicates: true,
    });
    console.log(`  MuxData batch ${idx} OK`);
  });

  // ── Attachments ──────────────────────────────────────────────────
  console.log("Inserting Attachments...");
  await inBatches(attachments, 500, async (batch, idx) => {
    await pg.attachment.createMany({
      data: batch.map((a) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        courseId: a.courseId,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  Attachments batch ${idx} OK`);
  });

  // ── Purchases ────────────────────────────────────────────────────
  console.log("Inserting Purchases...");
  await inBatches(purchases, 500, async (batch, idx) => {
    await pg.purchase.createMany({
      data: batch.map((p) => ({
        id: p.id,
        userId: p.userId,
        courseId: p.courseId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  Purchases batch ${idx} OK`);
  });

  // ── UserProgress ─────────────────────────────────────────────────
  console.log("Inserting UserProgress...");
  await inBatches(progress, 500, async (batch, idx) => {
    await pg.userProgress.createMany({
      data: batch.map((up) => ({
        id: up.id,
        userId: up.userId,
        chapterId: up.chapterId,
        isCompleted: up.isCompleted,
        createdAt: up.createdAt,
        updatedAt: up.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  UserProgress batch ${idx} OK`);
  });

  // ── StripeCustomer ───────────────────────────────────────────────
  console.log("Inserting StripeCustomer...");
  await inBatches(stripe, 500, async (batch, idx) => {
    await pg.stripeCustomer.createMany({
      data: batch.map((s) => ({
        id: s.id,
        userId: s.userId,
        stripeCustomerId: s.stripeCustomerId,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      skipDuplicates: true,
    });
    console.log(`  StripeCustomer batch ${idx} OK`);
  });

  console.log("✅ Migration complete.");
}

main()
  .then(async () => {
    await Promise.all([pg.$disconnect(), mysql.$disconnect()]);
  })
  .catch(async (e) => {
    console.error("Fatal:", e);
    await Promise.all([pg.$disconnect(), mysql.$disconnect()]);
    process.exit(1);
  });
