"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
// Use a local type instead of Prisma Course to avoid type drift before client regeneration
type DeliveryModeValue = "ONLINE" | "IN_PERSON" | "HYBRID";

const formSchema = z.object({
  deliveryMode: z
    .enum(["ONLINE", "IN_PERSON", "HYBRID"]) // keep in sync with Prisma enum
    .nullable()
    .optional(),
});

interface DeliveryModeFormProps {
  initialData: { deliveryMode?: DeliveryModeValue | null };
  courseId: string;
}

const DELIVERY_MODE_OPTIONS: { label: string; value: DeliveryModeValue }[] = [
  { label: "Online", value: "ONLINE" },
  { label: "In-person", value: "IN_PERSON" },
  { label: "Hybrid", value: "HYBRID" },
];

export const DeliveryModeForm = ({ initialData, courseId }: DeliveryModeFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryMode: initialData.deliveryMode ?? undefined,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course updated");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      toast.error("Failed to update delivery mode");
    }
  };

  const selected = DELIVERY_MODE_OPTIONS.find(
    (o) => o.value === (initialData.deliveryMode ?? undefined)
  );

  return (
    <div className="mt-6 mb-6 border border-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Delivery Mode
        <Button type="button" onClick={() => setIsEditing((v) => !v)} variant="ghost">
          {isEditing ? "Cancel" : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p className="text-sm mt-2">
          {selected?.label ?? "Not set"}
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="deliveryMode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox
                      options={DELIVERY_MODE_OPTIONS}
                      value={field.value as string | undefined}
                      onChange={(val) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
