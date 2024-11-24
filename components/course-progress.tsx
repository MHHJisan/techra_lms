import { Progress } from "./ui/progress";

interface CourseProgressProps {
  value: number;
  variant?: "default" | "success";
  size?: "default" | "sm";
}

const colourVariant = {
  default: "text-sky-700",
  success: "text-emerald-700",
};

const sizeVariant = {
  default: "text-sm",
  sm: "text-xs",
};
export const CourseProgress = ({
  value,
  variant,
  size,
}: CourseProgressProps) => {
  return (
    <div>
      <Progress className="h-2" value={value} />
    </div>
  );
};
