"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil, XCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SubchapterItem = {
  id: string;
  title: string;
  isPublished?: boolean;
};

interface SubchaptersListProps {
  items: SubchapterItem[];
  onReorder: (updateData: { id: string; position: number }[]) => void;
  onEdit: (id: string) => void;
  onPublish: (id: string) => void;
  onUnpublish: (id: string) => void;
}

export const SubchaptersList = ({
  items,
  onReorder,
  onEdit,
  onPublish,
  onUnpublish,
}: SubchaptersListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [list, setList] = useState<SubchapterItem[]>(items || []);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => setList(items), [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const arr = Array.from(list);
    const [moved] = arr.splice(result.source.index, 1);
    arr.splice(result.destination.index, 0, moved);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);
    const updatedSlice = arr.slice(startIndex, endIndex + 1);

    setList(arr);

    const bulkUpdateData = updatedSlice.map((it) => ({
      id: it.id,
      position: arr.findIndex((v) => v.id === it.id),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="subchapters">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {list.map((sc, index) => (
              <Draggable key={sc.id} draggableId={sc.id} index={index}>
                {(provided) => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-md mb-3 text-sm",
                      sc.isPublished && "bg-emerald-50 border-emerald-200 text-emerald-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-200 rounded-l-md transition",
                        sc.isPublished && "border-r-emerald-200 hover:bg-emerald-100"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    <div className="px-2">{sc.title}</div>
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <button
                        type="button"
                        onClick={() => onEdit(sc.id)}
                        className="p-1 rounded hover:bg-slate-200"
                        title="Edit"
                        aria-label="Edit subchapter"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {sc.isPublished ? (
                        <Button size="sm" variant="secondary" onClick={() => onUnpublish(sc.id)}>
                          <XCircle className="h-4 w-4 mr-1" /> Unpublish
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => onPublish(sc.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Publish
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
