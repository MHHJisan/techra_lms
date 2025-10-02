"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, FileText, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/file-upload";
interface ChapterAssignmentItem {
  id: string;
  name: string;
  url: string;
}

interface ChapterAssignmentsFormProps {
  chapterId: string;
  courseId: string;
  items: ChapterAssignmentItem[];
}

export const ChapterAssignmentsForm = ({ chapterId, courseId, items }: ChapterAssignmentsFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((c) => !c);

  const onSubmit = async (values: { url: string; name?: string }) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/assignments`, values);
      toast.success("Assignment added");
      toggleEdit();
      router.refresh();
    } catch (e) {
      console.error("[ASSIGNMENT_ADD_ERROR]", e);
      toast.error("Failed to add assignment");
    }
  };

  const onSubmitText = async () => {
    try {
      if (!textContent.trim()) return;
      setIsSubmittingText(true);
      const name = (textTitle?.trim() || "assignment") + ".txt";
      const dataUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(textContent)}`;
      await onSubmit({ url: dataUrl, name });
      setTextTitle("");
      setTextContent("");
    } catch (e) {
      console.error("[ASSIGNMENT_TEXT_ADD_ERROR]", e);
      toast.error("Failed to add assignment text");
    } finally {
      setIsSubmittingText(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/assignments/${id}`);
      toast.success("Assignment deleted");
      router.refresh();
    } catch (e) {
      console.error("[ASSIGNMENT_DELETE_ERROR]", e);
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Assignments (PDF)
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Assignment
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {(!items || items.length === 0) && (
            <p className="text-sm mt-2 text-slate-500">No assignments yet ...</p>
          )}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((a) => (
                <div key={a.id} className="flex items-center p-3 w-full bg-indigo-50 border-indigo-100 border text-indigo-700 rounded-md">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <a href={a.url} target="_blank" rel="noreferrer" className="text-xs line-clamp-1 underline">
                    {a.name}
                  </a>
                  {deletingId === a.id ? (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  ) : (
                    <button onClick={() => onDelete(a.id)} className="ml-auto hover:opacity-75 transition">
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
        <div className="space-y-4">
          {/* Option A: Upload a file */}
          <div>
            <FileUpload
              endPoint="chapterAssignment"
              onChange={(url) => {
                if (url) onSubmit({ url, name: url.split("/").pop() || undefined });
              }}
            />
            <div className="text-xs text-muted-foreground mt-2">Upload assignment PDFs for this chapter.</div>
          </div>

          {/* Separator */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t" />
            <span className="px-2 text-xs text-muted-foreground bg-white">or</span>
            <div className="w-full border-t" />
          </div>

          {/* Option B: Enter text */}
          <div className="space-y-2">
            <Input
              placeholder="Title (optional)"
              value={textTitle}
              onChange={(e) => setTextTitle(e.target.value)}
            />
            <Textarea
              placeholder="Type assignment instructions or content here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={5}
            />
            <div className="flex gap-2">
              <Button onClick={onSubmitText} disabled={isSubmittingText || !textContent.trim()}>Save Text</Button>
              <Button variant="outline" onClick={() => { setTextTitle(""); setTextContent(""); }}>Clear</Button>
            </div>
            <div className="text-xs text-muted-foreground">Saves as a downloadable .txt file.</div>
          </div>
        </div>
      )}
    </div>
  );
};
