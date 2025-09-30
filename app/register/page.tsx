"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import UdemyStyleNavbar from "@/components/udemy-clone/UdemyStyleNavbar";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { NavbarRoutes } from "@/components/navbar-routes";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700", "800", "900"] });

const RegistrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  fatherName: z.string().min(1, "Father's Name is required"),
  motherName: z.string().min(1, "Mother's Name is required"),
  address: z.string().min(1, "Address is required"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  nidOrBirthCert: z.string().min(1, "NID or Birth Certificate number is required"),
  guardianName: z.string().min(1, "Guardian's Name is required"),
  occupation: z.enum(["Student", "Job Holder", "Housewife"], {
    required_error: "Occupation is required",
  }),
  studentInstitution: z.string().optional(),
  organizationName: z.string().optional(),
  email: z.string().email("Enter a valid email"),
  mobile: z
    .string()
    .regex(
      /^(\+?88)?01[3-9]\d{8}$/,
      "Enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX or +8801XXXXXXXXX)"
    ),
  courseName: z.string().min(1, "Course Name is required"),
}).superRefine((val, ctx) => {
  if (val.occupation === "Student") {
    if (!val.studentInstitution || !val.studentInstitution.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentInstitution"],
        message: "School/College/University is required",
      });
    }
  }
  if (val.occupation === "Job Holder") {
    if (!val.organizationName || !val.organizationName.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["organizationName"],
        message: "Organization's Name is required",
      });
    }
  }
});

type RegistrationValues = z.infer<typeof RegistrationSchema>;
export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = (searchParams.get("lang") || "en").toLowerCase();
  const nextLang = lang === "bn" ? "en" : "bn";
  const toggleLang = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", nextLang);
    router.push(`${pathname}?${params.toString()}`);
  };
  const [submitStatus, setSubmitStatus] = useState<"idle"|"success"|"warning"|"error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(RegistrationSchema),
    defaultValues: {
      name: "",
      fatherName: "",
      motherName: "",
      address: "",
      dateOfBirth: "",
      nidOrBirthCert: "",
      guardianName: "",
      occupation: "Student",
      studentInstitution: "",
      organizationName: "",
      email: "",
      mobile: "",
      courseName: "",
    },
  });

  const onSubmit = async (values: RegistrationValues) => {
    setSubmitStatus("idle");
    setSubmitMessage("");
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        note?: string;
      };
      if (res.status === 201) {
        setSubmitStatus("success");
        setSubmitMessage("Registration submitted successfully. We will contact you soon.");
        form.reset();
      } else if (res.status === 202) {
        setSubmitStatus("warning");
        setSubmitMessage(data?.note || "Submitted, but forwarding to Google Sheets may have failed. We'll follow up.");
      } else {
        setSubmitStatus("error");
        setSubmitMessage(data?.error || "Something went wrong. Please try again.");
      }
    } catch (e) {
      setSubmitStatus("error");
      setSubmitMessage("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="w-full">
      {/* Show role-aware navbar when logged in; otherwise show the public navbar */}
      <SignedIn>
        <div className="sticky top-0 z-40 p-3 md:p-4 border-b w-full flex items-center justify-between bg-white/95 backdrop-blur shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 ml-3 sm:ml-4 md:ml-8">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <Image
                className="transform-gpu scale-x-110 md:scale-x-115 w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
                src="/techra.png"
                alt="Techra Logo"
                width={48}
                height={48}
              />
              <span className={`${playfair.className} text-lg sm:text-xl md:text-2xl font-extrabold tracking-wide sm:tracking-wider md:tracking-[0.15em] text-indigo-900 drop-shadow-sm transform-gpu md:scale-x-105`}>Techra Learning Center</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={toggleLang}
              className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2 py-1 text-[10px] sm:text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
              aria-label={lang === "bn" ? "ইংরেজিতে পরিবর্তন করুন" : "Switch to Bangla"}
            >
              <span className={"rounded-full px-2 py-0.5 " + (lang === "bn" ? "bg-blue-600 text-white" : "text-gray-700")}>
                বাংলা
              </span>
              <span className={"rounded-full px-2 py-0.5 " + (lang === "en" ? "bg-blue-600 text-white" : "text-gray-700")}>
                ENG
              </span>
            </button>
            <NavbarRoutes />
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <UdemyStyleNavbar />
      </SignedOut>
      <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl items-center justify-center text-center font-semibold mb-2">Student Registration</h1>
      <p className="text-muted-foreground mb-8 text-center">Fill up the form to register for a course.</p>

      {submitStatus !== "idle" && (
        <div
          className={
            "mb-6 rounded-md p-4 border " +
            (submitStatus === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : submitStatus === "warning"
              ? "border-yellow-200 bg-yellow-50 text-yellow-800"
              : "border-red-200 bg-red-50 text-red-700")
          }
        >
          {submitMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Name</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fatherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Father&apos;s Name</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Father's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motherName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Mother&apos;s Name</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Mother's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Date of Birth</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">Address</FormLabel>
                <FormControl>
                  <Textarea className="min-h-[32px] text-sm px-2 py-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Your full address" {...field} />
                </FormControl>
                <FormDescription>House, street, city, district, etc.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nidOrBirthCert"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">NID/Birth Certificate</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="ID number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardianName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Guardian&apos;s Name</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="Guardian's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Occupation</FormLabel>
                  <FormControl>
                    <select
                      className="h-8 w-full rounded-md border px-2 text-sm bg-white border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <option value="Student">Student</option>
                      <option value="Job Holder">Job Holder</option>
                      <option value="Housewife">Housewife</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("occupation") === "Student" && (
              <FormField
                control={form.control}
                name="studentInstitution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">School/College/University</FormLabel>
                    <FormControl>
                      <Input className="h-6 text-sm px-2 py-1 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., Dhaka University" {...field} />
                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("occupation") === "Job Holder" && (
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-slate-700">Organization&apos;s Name</FormLabel>
                    <FormControl>
                      <Input className="h-6 text-sm px-2 py-1 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" placeholder="e.g., Techra Softwares" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="courseName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Course Name</FormLabel>
                  <FormControl>
                    <select
                      className="h-8 w-full rounded-md border px-2 text-xs bg-white border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    >
                      <option value="" disabled>
                        Select a course
                      </option>
                      <option value="Basic Computing">Basic Computing</option>
                      <option value="Spoken English">Spoken English</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Email</FormLabel>
                  <FormControl>
                    <Input className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500" type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700">Mobile</FormLabel>
                  <FormControl>
                    <Input
                      className="h-8 text-sm px-2 border-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      type="tel"
                      inputMode="tel"
                      placeholder="01XXXXXXXXX or +8801XXXXXXXXX"
                      pattern="^(\\+?88)?01[3-9]\\d{8}$"
                      {...field}
                      onChange={(e) => {
                        let v = e.target.value;
                        // allow only digits and plus
                        v = v.replace(/[^0-9+]/g, "");
                        // ensure only one '+' and only at the start
                        if (v.includes("+")) {
                          v = "+" + v.replace(/\+/g, "").replace(/^\+/, "");
                        }
                        // optional: trim to a reasonable max length
                        if (v.length > 14) v = v.slice(0, 14);
                        field.onChange(v);
                      }}
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Delete",
                          "ArrowLeft",
                          "ArrowRight",
                          "Tab",
                          "Home",
                          "End",
                        ];
                        const isNumber = e.key >= "0" && e.key <= "9";
                        const isPlus = e.key === "+";
                        if (allowedKeys.includes(e.key) || isNumber) return;
                        if (isPlus) {
                          // only allow '+' if at position 0 and not already present
                          const target = e.target as HTMLInputElement;
                          const hasPlus = target.value.includes("+");
                          const caretAtStart = target.selectionStart === 0;
                          if (!hasPlus && caretAtStart) return;
                        }
                        e.preventDefault();
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const text = e.clipboardData?.getData("text") || "";
                        let v = (text || "").replace(/[^0-9+]/g, "");
                        if (v.includes("+")) {
                          v = "+" + v.replace(/\+/g, "").replace(/^\+/, "");
                        }
                        if (v.length > 14) v = v.slice(0, 14);
                        field.onChange(v);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </Form>
      </div>
    </div>
  );
}
