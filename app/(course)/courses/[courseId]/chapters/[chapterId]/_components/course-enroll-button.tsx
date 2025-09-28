"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/fomat";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({ price }: CourseEnrollButtonProps) => {
  return (
    <Button size="sm" className="w-full md:w-auto">
      Enroll For {formatPrice(price)} টাকা/-
    </Button>
  );
};
