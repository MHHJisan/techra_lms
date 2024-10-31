import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./_components/columns";
import { DataTable } from "./_components/data-table";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";




const CoursePage = async () => {

  const { userId } = auth();

  if(!userId) {
     return (redirect("/"))
  }

  const courses = await db.course.findMany({
      where: {
        userId,
      }, 
      orderBy: {
        createdAt: "desc"
      }
  })

  return (
    <div className="pl-4 pt-4">
      {/* <Link href="/teacher/create">
        <Button className="p-6">New Course</Button>
      </Link> */}
      <DataTable columns={columns} data={courses} />
    </div>
  );
};

export default CoursePage;
