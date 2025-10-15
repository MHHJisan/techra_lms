"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"

type Props = { courseId: string; chapterId: string }

export default function SubChapterAdd({ courseId, chapterId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    if (!title.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/subchapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() })
      })
      if (res.ok) {
        setTitle("")
        setOpen(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        className="btn btn-primary"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
      >
        Add Subchapter
      </button>

      {open && (
        <div className="mt-3 flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Subchapter title"
            className="input input-bordered w-full"
            disabled={loading}
          />
          <button
            onClick={onSubmit}
            disabled={loading || !title.trim()}
            title="Save subchapter"
            className="inline-flex items-center justify-center rounded-md px-3 py-2 text-white bg-gradient-to-r from-green-500 to-yellow-400 disabled:opacity-50"
          >
            <Check className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}