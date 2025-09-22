"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
import Link from "next/link";
import toast from "react-hot-toast";
import { useLang } from "@/app/providers/LanguageProvider";

const i18n = {
  en: {
    pageTitle: "Name your course",
    pageSubtitle: "What would you like to name your course? You can change it later.",
    labelTitle: "Course Title",
    phTitle: "e.g. 'Advanced Web Development'",
    descTitle: "What will you teach in this course?",
    btnCancel: "Cancel",
    btnContinue: "Continue",
    toastSuccess: "Course created",
    toastError: "Something went wrong",
    zodRequired: "Title is required",
  },
  bn: {
    pageTitle: "আপনার কোর্সের নাম দিন",
    pageSubtitle: "কোর্সের নাম কী রাখতে চান? পরে চাইলে পরিবর্তন করা যাবে।",
    labelTitle: "কোর্সের শিরোনাম",
    phTitle: "যেমন: ‘অ্যাডভান্সড ওয়েব ডেভেলপমেন্ট’",
    descTitle: "এই কোর্সে আপনি কী শেখাবেন?",
    btnCancel: "বাতিল",
    btnContinue: "চালিয়ে যান",
    toastSuccess: "কোর্স তৈরি হয়েছে",
    toastError: "কিছু ভুল হয়েছে",
    zodRequired: "শিরোনাম প্রয়োজন",
  },
};

const CreatePage = () => {
  const { lang } = useLang();
  const t = i18n[lang];
  const router = useRouter();

  // Build schema with language-specific messages
  const formSchema = useMemo(
    () =>
      z.object({
        title: z.string().min(1, { message: t.zodRequired }),
      }),
    [t.zodRequired]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
    mode: "onChange",
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values, { withCredentials: true });
      router.push(`/teacher/courses/${response.data.id}`);
      toast.success(t.toastSuccess);
    } catch {
      toast.error(t.toastError);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {t.pageTitle}
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              {t.pageSubtitle}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.labelTitle}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isSubmitting}
                        placeholder={t.phTitle}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t.descTitle}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <Link href="/">
                  <Button type="button" variant="ghost">
                    {t.btnCancel}
                  </Button>
                </Link>
                <Button type="submit" disabled={!isValid || isSubmitting}>
                  {t.btnContinue}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
