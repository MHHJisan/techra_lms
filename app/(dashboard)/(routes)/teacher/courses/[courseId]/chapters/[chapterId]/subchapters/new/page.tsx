import Link from "next/link";

export default function NewSubchapterPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Create Subchapter</h1>
        <Link href="../" className="btn">Back</Link>
      </div>
      <div className="border rounded p-4">
        <p className="text-sm text-slate-600">This is a placeholder for the subchapter creation form.</p>
      </div>
    </div>
  );
}
