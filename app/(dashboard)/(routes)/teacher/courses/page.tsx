import { Button } from "@/components/ui/button";
import Link from "next/link";

const CoursePage = () => {
  return (
    <div className="pl-4 pt-4">
      <Link href="/teacher/create">
        <Button className="p-6">New Course</Button>
      </Link>
    </div>
  );
};

export default CoursePage;
