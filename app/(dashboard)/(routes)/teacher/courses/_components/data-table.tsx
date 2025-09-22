"use client";

import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useLang } from "@/app/providers/LanguageProvider";
// import { useCourseColumns } from "./columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Optional: override which column the search box filters (defaults to "title") */
  filterColumnId?: string;
}

const i18n = {
  en: {
    filterPh: "Filter your course",
    newCourse: "New Course",
    noResults: "No results.",
    prev: "Previous",
    next: "Next",
  },
  bn: {
    filterPh: "আপনার কোর্স ফিল্টার করুন",
    newCourse: "নতুন কোর্স",
    noResults: "কোন ফলাফল নেই।",
    prev: "পূর্ববর্তী",
    next: "পরবর্তী",
  },
};

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumnId = "title",
}: DataTableProps<TData, TValue>) {
  const { lang } = useLang();
  const t = i18n[lang];

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: { sorting, columnFilters },
  });

  const filterCol = table.getColumn(filterColumnId);

  return (
    <div>
      <div className="flex items-center py-4 justify-between">
        <Input
          placeholder={t.filterPh}
          value={(filterCol?.getFilterValue() as string) ?? ""}
          onChange={(e) => filterCol?.setFilterValue(e.target.value)}
          className="max-w-sm"
        />
        <Link href="/teacher/create">
          <Button className="mr-3">
            <PlusCircle className="h-4 w-4 mr-2" />
            {t.newCourse}
          </Button>
        </Link>
      </div>

      <div className="rounded-md border mr-3">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {t.prev}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {t.next}
        </Button>
      </div>
    </div>
  );
}
