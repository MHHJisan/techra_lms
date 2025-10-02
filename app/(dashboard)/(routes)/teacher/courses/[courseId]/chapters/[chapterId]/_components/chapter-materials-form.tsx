"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, File, ImageIcon, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
// Use local interface to avoid Prisma type mismatch before generate
interface ChapterMaterialItem {
  id: string;
  name: string;
  url: string;
  type: string | null;
}

interface ChapterMaterialsFormProps {
  chapterId: string;
  courseId: string;
  items: ChapterMaterialItem[];
}

export const ChapterMaterialsForm = ({ chapterId, courseId, items }: ChapterMaterialsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((c) => !c);

  const onSubmit = async (values: { url: string; name?: string }) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/materials`, values);
      toast.success("Material added");
      toggleEdit();
      router.refresh();
    } catch (e) {
      console.error("[MATERIAL_ADD_ERROR]", e);
      toast.error("Failed to add material");
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/materials/${id}`);
      toast.success("Material deleted");
      router.refresh();
    } catch (e) {
      console.error("[MATERIAL_DELETE_ERROR]", e);
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Chapter Materials
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Material
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {(!items || items.length === 0) && (
            <p className="text-sm mt-2 text-slate-500">No materials yet ...</p>
          )}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((m) => (
                <div key={m.id} className="flex items-center p-3 w-full bg-emerald-50 border-emerald-100 border text-emerald-700 rounded-md">
                  {m.type === "image" ? (
                    <ImageIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                  ) : (
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  )}
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-xs line-clamp-1 underline">
                    {m.name}
                  </a>
                  {deletingId === m.id ? (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  ) : (
                    <button onClick={() => onDelete(m.id)} className="ml-auto hover:opacity-75 transition">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div>
          <FileUpload
            endPoint="chapterMaterial"
            onChange={(url) => {
              if (url) onSubmit({ url, name: url.split("/").pop() || undefined });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">Upload images, PDFs, or slides for this chapter.</div>
        </div>
      )}
    </div>
  );
};
