import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const backgroundVariants = cva(
  "rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-sky-100",
        success: "bg-emerald-100",
      },
      iconVariant: {
        default: "text-sky-700",
        success: "text-emerald-700",
      },
      size: {
        default: "p-2",
        sm: "p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariant = cva("", {
  variants: {
    variant: {
      default: "text-sku-700",
      success: "text-emerald-700",
    },
    iconSize: {
      default: "h-8 w-8",
      md: "h6 w-6",
      sm: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    iconSize: "default",
  },
});

type BackGroundVariantProps = VariantProps<typeof backgroundVariants>;
type IconVariantProps = VariantProps<typeof iconVariant>;

interface IconBadgeProps extends BackGroundVariantProps, IconVariantProps {
  icon: LucideIcon;
  iconSize?: keyof IconVariantProps["iconSize"]; // Optional iconSize
}

export const IconBadge = ({
  icon: Icon,
  variant,
  size = "default", // Declare 'size' with a default value
  iconSize = "default", // Declare 'iconSize' with a default value
}: IconBadgeProps) => {
  return (
    <div className={cn(backgroundVariants({ variant, size }))}>
      <Icon className={cn(iconVariant({ variant, iconSize }))}></Icon>
    </div>
  );
};
