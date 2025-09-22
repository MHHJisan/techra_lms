"use client";

import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLang } from "@/app/providers/LanguageProvider";

const i18n = {
  en: {
    title: "Title",
    price: "Price",
    colPublished: "Published",
    published: "Published",
    draft: "Draft",
    edit: "Edit",
    menu: "Open Menu",
  },
  bn: {
    title: "শিরোনাম",
    price: "মূল্য",
    colPublished: "প্রকাশনা অবস্থা",
    published: "প্রকাশিত",
    draft: "খসড়া",
    edit: "সম্পাদনা",
    menu: "মেনু খুলুন",
  },
};

export function useCourseColumns(): ColumnDef<Course>[] {
  const { lang } = useLang();
  const t = i18n[lang];

  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t.title}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
  accessorKey: "price",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {t.price}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => {
    const rawPrice = parseFloat(row.getValue("price") || "0");

    // Format digits according to language
    const formattedNumber = new Intl.NumberFormat(
      lang === "bn" ? "bn-BD" : "en-US",
      { minimumFractionDigits: 0 }
    ).format(rawPrice);

    // Add Taka sign + suffix
    const display =
      lang === "bn"
        ? `৳ ${formattedNumber} টাকা/-`
        : `৳ ${formattedNumber} Taka/-`;

    return <div>{display}</div>;
  },
},


    {
      accessorKey: "isPublished",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t.colPublished}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isPublished = row.getValue("isPublished") || false;
        return (
          <Badge className={cn("bg-slate-500", isPublished && "bg-slate-900")}>
            {isPublished ? t.published : t.draft}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const { id } = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-4 w-8 p-0">
                <span className="sr-only">{i18n[lang].menu}</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href={`/teacher/courses/${id}`}>
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  {i18n[lang].edit}
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
