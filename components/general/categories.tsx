"use client";

import { Category } from "@prisma/client";

import {
  FcAutomatic,
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
  FcCameraAddon,
  FcBiohazard,
  FcDatabase,
  FcCommandLine,
  FcLibrary,
  FcCalculator,
} from "react-icons/fc";
import { IconType } from "react-icons/lib";

import { CategoryItem } from "./category-item";

interface CategoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
  Music: FcMusic,
  Photography: FcOldTimeCamera,
  Fitness: FcSportsMode,
  Accounting: FcSalesPerformance,
  "Computer Science": FcCommandLine,
  Filming: FcFilmReel,
  Engineering: FcEngineering,
  "Electric and Electronics Engineering": FcEngineering,
  "Industrial and Production Engineering": FcEngineering,
  Mathematics: FcAutomatic,
  "Art & Design": FcCameraAddon,
  Astronomy: FcBiohazard,
  "Data Science": FcDatabase,
  "Computer Science & Engineering": FcMultipleDevices,
  Literature: FcLibrary,
  Physics: FcCalculator,
  English: FcLibrary,
};

export const Categories = ({ items }: CategoriesProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2  pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  );
};
