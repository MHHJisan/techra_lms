"use client";

import { Controller } from "react-hook-form";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

// (unused inputs removed)
import { Button } from "@/components/ui/button";
// (unused title import removed)
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Course } from "@prisma/client";
import { Combobox } from "@/components/ui/combobox";

const formSchema = z.object({
  categoryId: z.string().optional(), // Allows null values but ensures non-null values are valid
});

interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  options: { label: string; value: string }[];
}

export const CategoryForm = ({
  initialData,
  courseId,
  options,
}: CategoryFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
    },
  });

  // no need to extract form state here
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Log the values being sent to the API for debugging
      console.log("Submitting values: ", values);

      // Make the API request
      const response = await axios.patch(`/api/courses/${courseId}`, values);

      // Check if the request was successful
      if (response.status === 200) {
        toast.success("Course Updated");
        toggleEdit();
        router.refresh(); // Refresh the page or router to reflect the changes
      } else {
        toast.error("Failed to update course");
      }
    } catch (error) {
      // Log the error details for debugging
      console.error("Error updating course: ", error);
      toast.error("Something went wrong");
    }
  };

  const selectedOption = options.find(
    (option) => option.value === initialData.categoryId
  );

  return (
    <div className="mt-6 mb-6 border border-slate-100 rounded-md p-4 ">
      <div className="font-medium flex items-center justify-between">
        Course Category
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Category
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2",
            !initialData.categoryId && "text-slate-500 italic"
          )}
        >
          {selectedOption?.label || "No Category "}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="categoryId"
              render={() => (
                <FormItem>
                  <FormControl>
                    {/* Use Controller to wrap the Combobox */}
                    <Controller
                      control={form.control}
                      name="categoryId"
                      render={({ field: { onChange, value } }) => (
                        <Combobox
                          options={options}
                          value={value} // Pass the field's value
                          onChange={onChange} // Pass the field's onChange handler
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
