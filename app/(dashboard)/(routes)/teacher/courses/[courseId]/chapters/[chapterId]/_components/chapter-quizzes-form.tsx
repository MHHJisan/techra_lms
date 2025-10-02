"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, FileQuestion, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
interface ChapterQuizItem {
  id: string;
  name: string;
  url: string;
}

interface ChapterQuizzesFormProps {
  chapterId: string;
  courseId: string;
  items: ChapterQuizItem[];
}

export const ChapterQuizzesForm = ({ chapterId, courseId, items }: ChapterQuizzesFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((c) => !c);

  const onSubmit = async (values: { url: string; name?: string }) => {
    try {
      await axios.post(`/api/courses/${courseId}/chapters/${chapterId}/quizzes`, values);
      toast.success("Quiz added");
      toggleEdit();
      router.refresh();
    } catch (e) {
      console.error("[QUIZ_ADD_ERROR]", e);
      toast.error("Failed to add quiz");
    }
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}/quizzes/${id}`);
      toast.success("Quiz deleted");
      router.refresh();
    } catch (e) {
      console.error("[QUIZ_DELETE_ERROR]", e);
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border border-slate-100 rounded-md p-4 px-5">
      <div className="font-medium flex items-center justify-between">
        Quizzes (PDF)
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Quiz
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {(!items || items.length === 0) && (
            <p className="text-sm mt-2 text-slate-500">No quizzes yet ...</p>
          )}
          {items && items.length > 0 && (
            <div className="space-y-2">
              {items.map((q) => (
                <div key={q.id} className="flex items-center p-3 w-full bg-amber-50 border-amber-100 border text-amber-700 rounded-md">
                  <FileQuestion className="h-4 w-4 mr-2 flex-shrink-0" />
                  <a href={q.url} target="_blank" rel="noreferrer" className="text-xs line-clamp-1 underline">
                    {q.name}
                  </a>
                  {deletingId === q.id ? (
                    <Loader2 className="h-4 w-4 ml-auto animate-spin" />
                  ) : (
                    <button onClick={() => onDelete(q.id)} className="ml-auto hover:opacity-75 transition">
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
            endPoint="chapterQuiz"
            onChange={(url) => {
              if (url) onSubmit({ url, name: url.split("/").pop() || undefined });
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">Upload quiz PDFs for this chapter.</div>
        </div>
      )}
    </div>
  );
};
