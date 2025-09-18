/*
  Warnings:

  - You are about to drop the `MuxData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."MuxData" DROP CONSTRAINT "MuxData_chapterId_fkey";

-- DropTable
DROP TABLE "public"."MuxData";

-- CreateTable
CREATE TABLE "public"."VideoEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "courseId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "currentTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoEvent_courseId_idx" ON "public"."VideoEvent"("courseId");

-- CreateIndex
CREATE INDEX "VideoEvent_chapterId_idx" ON "public"."VideoEvent"("chapterId");

-- AddForeignKey
ALTER TABLE "public"."VideoEvent" ADD CONSTRAINT "VideoEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoEvent" ADD CONSTRAINT "VideoEvent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoEvent" ADD CONSTRAINT "VideoEvent_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
