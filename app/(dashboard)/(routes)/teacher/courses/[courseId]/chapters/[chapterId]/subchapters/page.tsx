import Link from "next/link";
import { headers } from "next/headers";
import SubChapterAdd from "./_components/subChapter-add";

export default async function SubchapterListPage({ params 

}: { params: { chapterId: string, courseId: string } }) {
    
    const hdrs = headers();
    const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host");
    const proto = hdrs.get("x-forwarded-proto") ?? "http";
    const fallbackHost = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
    const origin = host ? `${proto}://${host}` : `http://${fallbackHost}`;
    const apiUrl = new URL(`/api/courses/${params.courseId}/chapters/${params.chapterId}/subchapters`, origin).toString();
    let items: any[] = [];
    try {
        const res = await fetch(apiUrl, { cache: "no-store" });
        if (!res.ok) {
            items = [];
        } else {
            const data = await res.json();
            items = Array.isArray(data) ? data : [];
        }
    } catch {
        items = [];
    }
    
    return (
        <div>
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Subchapters</h2>
                <SubChapterAdd courseId={params.courseId} chapterId={params.chapterId} />
            </div>
            <ul className="mt-4 space-y-2">
                {items.map((sc: any) => (
                    <li key={sc.id} className="border p-3 rounded flex items-center justify-between">
                        <div>
                            <h2 className="font-medium">{sc.title}</h2>
                            <p className="text-sm text-slate-500">{sc.type} {sc.isPublished}</p>
                        </div>
                        <div className="flex  gap-x-2">
                            <Link href={`./${sc.id}`}>View</Link>
              <Link href={`./${sc.id}/edit`}>Edit</Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}